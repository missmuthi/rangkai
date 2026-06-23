#!/usr/bin/env node

import net from 'node:net'
import { readFile, rm } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { spawn } from 'node:child_process'

const args = process.argv.slice(2)
const portFlagIndex = args.indexOf('--port')
const requestedPort = Number(
  portFlagIndex >= 0 && args[portFlagIndex + 1] ? args[portFlagIndex + 1] : process.env.NUXT_PORT || 3001
)

if (!Number.isInteger(requestedPort) || requestedPort <= 0) {
  console.error(`[nuxt-dev-safe] Invalid port: ${requestedPort}`)
  process.exit(1)
}

const lockPath = new URL('../.nuxt/nuxt.lock', import.meta.url)

async function isPortOpen(port) {
  return await new Promise((resolve) => {
    const socket = net.createConnection({ host: '127.0.0.1', port })
    const finish = (value) => {
      socket.removeAllListeners()
      socket.destroy()
      resolve(value)
    }

    socket.setTimeout(1000)
    socket.once('connect', () => finish(true))
    socket.once('timeout', () => finish(false))
    socket.once('error', () => finish(false))
  })
}

async function isProcessAlive(pid) {
  try {
    process.kill(pid, 0)
    return true
  } catch {
    return false
  }
}

let ignoreNuxtLock = false

if (existsSync(lockPath)) {
  try {
    const lock = JSON.parse(await readFile(lockPath, 'utf8'))
    if (lock?.port === requestedPort) {
      if (lock?.pid && (await isProcessAlive(lock.pid))) {
        console.error(
          `[nuxt-dev-safe] Another Nuxt dev server is already running on port ${requestedPort}:\n` +
            `  PID: ${lock.pid}\n` +
            `  URL: ${lock.url || 'unknown'}\n` +
            `  CWD: ${lock.cwd || process.cwd()}\n` +
            `  Started: ${lock.startedAt || 'unknown'}`
        )
        process.exit(1)
      }

      await rm(lockPath, { force: true })
      console.warn(`[nuxt-dev-safe] Removed stale Nuxt lock at ${lockPath.pathname}`)
    } else {
      ignoreNuxtLock = true
      console.warn(
        `[nuxt-dev-safe] Existing Nuxt lock targets port ${lock?.port}; bypassing it for requested port ${requestedPort}`
      )
    }
  } catch (error) {
    console.error(`[nuxt-dev-safe] Failed to inspect ${lockPath.pathname}:`, error)
    process.exit(1)
  }
}

if (await isPortOpen(requestedPort)) {
  console.error(`[nuxt-dev-safe] Port ${requestedPort} is already occupied`)
  process.exit(1)
}

const child = spawn('bunx', ['nuxt', 'dev', '--port', String(requestedPort)], {
  stdio: 'inherit',
  env: {
    ...process.env,
    ...(ignoreNuxtLock ? { NUXT_IGNORE_LOCK: '1' } : {}),
  },
})

process.on('SIGINT', () => child.kill('SIGINT'))
process.on('SIGTERM', () => child.kill('SIGTERM'))

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal)
    return
  }

  process.exit(code ?? 0)
})
