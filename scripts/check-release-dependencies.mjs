import { readFileSync } from 'node:fs'

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
const lock = readFileSync(new URL('../pnpm-lock.yaml', import.meta.url), 'utf8')
const required = {
  next: '16.4.5',
  'eslint-config-next': '16.4.5',
  react: '19.2.9',
  'react-dom': '19.2.9',
  vitest: '4.1.12',
  vite: '8.1.6',
}

const errors = []
for (const [name, expected] of Object.entries(required)) {
  const actual = pkg.dependencies?.[name] ?? pkg.devDependencies?.[name]
  if (actual !== expected) {
    errors.push(`${name}: package.json has ${actual ?? 'no version'}; required ${expected}`)
  }

  // Validate both the requested importer specifier and the resolved version.
  // Parenthesized peer suffixes are allowed after the exact package version.
  const escapedName = name.replaceAll('.', '\\.')
  const escapedVersion = expected.replaceAll('.', '\\.')
  const importer = new RegExp(
    `^\\s{6}${escapedName}:\\n\\s{8}specifier: ${escapedVersion}\\n\\s{8}version: ${escapedVersion}(?:\\(|\\s|$)`,
    'm',
  )
  if (!importer.test(lock)) {
    errors.push(`${name}: pnpm-lock.yaml does not resolve the required ${expected} version`)
  }
}

if (errors.length) {
  console.error('RELEASE BLOCKED: dependency manifest and lockfile are not in sync with patched versions.')
  for (const error of errors) console.error(`- ${error}`)
  console.error('\nRun `pnpm install --no-frozen-lockfile`, then `pnpm audit --audit-level high`, and commit the regenerated pnpm-lock.yaml.')
  process.exitCode = 1
} else {
  console.log('Framework and test-tool dependency release gate passed.')
}
