# COMMANDS.md

Verified commands from `package.json`, repo docs, and workflow files.

## Install
```bash
bun install
```

## Development Server
```bash
bun run dev
```

## Build
```bash
bun run build
```

## Test
```bash
bun run test
```

```bash
bun run test:integration
```

```bash
bun run test:watch
```

```bash
bun run test:coverage
```

```bash
bun run test:e2e
```

```bash
bun run test:e2e:ui
```

```bash
bun run test:all
```

## Lint
```bash
bun run lint
```

```bash
bun run lint:fix
```

## Typecheck
```bash
bun run typecheck
```

## Formatting
- No dedicated formatting script is defined in `package.json`.
- Use the existing code style and lint rules instead of introducing a repo-wide formatter command.

## Deployment
```bash
bun run deploy
```

```bash
bun run preview
```

```bash
bunx nuxthub preview
```

```bash
bunx wrangler pages deploy dist --project-name rangkai
```

## Database Migration
```bash
bun run migrate:prod
```

```bash
bun run migrate:preview
```

```bash
bun run db:verify:fresh
```

```bash
bun run db:verify:upgrade
```

## Release
```bash
bun run release
```

## Other Repo Scripts
```bash
bun run patch:ms
```

```bash
bun run record:demo
```

## Notes
- `postinstall` runs `nuxt prepare` and `patch:ms` automatically.
- The repo docs also reference `bunx nuxthub deploy` for production deploys.
