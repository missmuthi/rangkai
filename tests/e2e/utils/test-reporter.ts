/**
 * E2E Test Reporter Utility
 * 
 * Generates comprehensive JSON reports for E2E test runs.
 * Captures step results, API calls, console messages, and screenshots.
 */

import * as fs from 'fs'
import * as path from 'path'
import type { Page, TestInfo } from '@playwright/test'

export interface StepResult {
  name: string
  status: 'PASS' | 'FAIL' | 'SKIPPED'
  duration: number
  error?: string
  errorStack?: string
  screenshot?: string
  details?: Record<string, unknown>
}

export interface ApiCall {
  type: 'request' | 'response'
  url: string
  method?: string
  status?: number
  statusText?: string
  headers?: Record<string, string>
  body?: string
}

export interface TestReport {
  testName: string
  timestamp: string
  duration: number
  status: 'PASS' | 'FAIL'
  isbn: string
  expectedTitle: string
  expectedAuthor: string
  usedMocks: boolean
  finalUrl: string
  viewport: { width: number; height: number }
  userAgent: string
  steps: StepResult[]
  apiCalls: ApiCall[]
  consoleMessages: Array<{ timestamp: string; type: string; text: string }>
  networkErrors: string[]
  summary: {
    totalSteps: number
    passedSteps: number
    failedSteps: number
    skippedSteps: number
  }
}

export class TestReporter {
  private report: TestReport
  private startTime: number
  private page: Page | null = null
  private consoleMessages: TestReport['consoleMessages'] = []
  private apiCalls: ApiCall[] = []

  constructor(testName: string, isbn: string, expectedTitle: string, expectedAuthor: string, usedMocks: boolean) {
    this.startTime = Date.now()
    this.report = {
      testName,
      timestamp: new Date().toISOString(),
      duration: 0,
      status: 'PASS',
      isbn,
      expectedTitle,
      expectedAuthor,
      usedMocks,
      finalUrl: '',
      viewport: { width: 0, height: 0 },
      userAgent: '',
      steps: [],
      apiCalls: [],
      consoleMessages: [],
      networkErrors: [],
      summary: {
        totalSteps: 0,
        passedSteps: 0,
        failedSteps: 0,
        skippedSteps: 0
      }
    }
  }

  /**
   * Attach a page and start capturing console/network events
   */
  async attachPage(page: Page): Promise<void> {
    this.page = page
    
    // Capture console messages
    page.on('console', (msg) => {
      this.consoleMessages.push({
        timestamp: new Date().toISOString(),
        type: msg.type(),
        text: msg.text()
      })
    })

    // Capture API calls
    page.on('request', (request) => {
      if (request.url().includes('/api/')) {
        this.apiCalls.push({
          type: 'request',
          url: request.url(),
          method: request.method(),
          headers: request.headers(),
          body: request.postData()?.substring(0, 2048)
        })
      }
    })

    page.on('response', (response) => {
      if (response.url().includes('/api/')) {
        this.apiCalls.push({
          type: 'response',
          url: response.url(),
          status: response.status(),
          statusText: response.statusText()
        })
      }
    })

    // Capture network errors
    page.on('requestfailed', (request) => {
      this.report.networkErrors.push(`${request.method()} ${request.url()}: ${request.failure()?.errorText}`)
    })

    // Get viewport and user agent
    const viewport = page.viewportSize()
    if (viewport) {
      this.report.viewport = viewport
    }
    this.report.userAgent = await page.evaluate(() => navigator.userAgent)
  }

  /**
   * Record a test step result
   */
  async recordStep(
    stepNumber: number,
    name: string,
    status: 'PASS' | 'FAIL' | 'SKIPPED',
    duration: number,
    options?: {
      error?: Error
      screenshot?: boolean
      details?: Record<string, unknown>
      testInfo?: TestInfo
    }
  ): Promise<void> {
    const step: StepResult = {
      name: `${stepNumber}. ${name}`,
      status,
      duration
    }

    if (options?.error) {
      step.error = options.error.message
      step.errorStack = options.error.stack
    }

    if (options?.details) {
      step.details = options.details
    }

    // Take screenshot on failure
    if (status === 'FAIL' && options?.screenshot && this.page) {
      const screenshotName = `error-step-${stepNumber}-${Date.now()}.png`
      const screenshotPath = path.join('test-results/e2e-reports', screenshotName)
      await this.page.screenshot({ path: screenshotPath, fullPage: true })
      step.screenshot = screenshotPath
    }

    this.report.steps.push(step)

    if (status === 'FAIL') {
      this.report.status = 'FAIL'
    }
  }

  /**
   * Finalize and save the report
   */
  async finalize(): Promise<string> {
    this.report.duration = Date.now() - this.startTime
    this.report.finalUrl = this.page ? this.page.url() : ''
    this.report.apiCalls = this.apiCalls
    this.report.consoleMessages = this.consoleMessages

    // Calculate summary
    this.report.summary = {
      totalSteps: this.report.steps.length,
      passedSteps: this.report.steps.filter(s => s.status === 'PASS').length,
      failedSteps: this.report.steps.filter(s => s.status === 'FAIL').length,
      skippedSteps: this.report.steps.filter(s => s.status === 'SKIPPED').length
    }

    // Save report
    const reportDir = 'test-results/e2e-reports'
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true })
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const reportPath = path.join(reportDir, `e2e-report-${timestamp}.json`)
    fs.writeFileSync(reportPath, JSON.stringify(this.report, null, 2))

    // Print summary to console
    this.printSummary()

    return reportPath
  }

  /**
   * Print human-readable summary
   */
  private printSummary(): void {
    const divider = '='.repeat(80)
    console.log(`\n${divider}`)
    console.log('TEST REPORT SUMMARY')
    console.log(divider)
    console.log(`Status: ${this.report.status === 'PASS' ? '✅ PASS' : '❌ FAIL'}`)
    console.log(`Duration: ${(this.report.duration / 1000).toFixed(2)}s`)
    console.log(`ISBN: ${this.report.isbn}`)
    console.log(`Expected Title: ${this.report.expectedTitle}`)
    console.log(`Mocks Enabled: ${this.report.usedMocks}`)
    console.log(`\nSteps: ${this.report.summary.passedSteps}/${this.report.summary.totalSteps} passed\n`)
    
    console.log('Step Results:')
    for (const step of this.report.steps) {
      const icon = step.status === 'PASS' ? '✅' : step.status === 'FAIL' ? '❌' : '⏭️'
      console.log(`  ${icon} ${step.name} (${step.duration}ms)`)
      if (step.error) {
        console.log(`      Error: ${step.error}`)
      }
    }

    console.log(`\n📡 API Calls (${this.apiCalls.filter(c => c.type === 'response').length} responses):`)
    for (const call of this.apiCalls.filter(c => c.type === 'response')) {
      const icon = call.status && call.status < 400 ? '✅' : '❌'
      console.log(`  ${icon} ${call.status} ${call.url.split('/api/')[1] || call.url}`)
    }

    console.log(divider)
  }
}
