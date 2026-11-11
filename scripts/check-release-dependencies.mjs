import { readFileSync } from 'node:fs'

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
const lock = readFileSync(new URL('../pnpm-lock.yaml', import.meta.url), 'utf8')
const required = {
  next: '16.4.5',
  'eslint-config-next': '16.4.5',
  react: '19.2.9',
  'react-dom': '19.2.9',
}

const errors = []
for (const [name, expected] of Object.entries(required)) {
  const actual = pkg.dependencies?.[name] ?? pkg.devDependencies?.[name]
  if (actual !== expected) {
    errors.push(`${name}: package.json has ${actual ?? 'no version'}; required ${expected}`)
  }
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const importer = new RegExp(`^\\s{6}${escaped}:\\n\\s{8}specifier: ${expected.replaceAll('.', '\\.') }\\n\\s{8}version: ${expected.replaceAll('.', '\\.') }(?:\\(|\\s|$)`, 'm')
  if (!importer.test(lock)) {
    errors.push(`${name}: pnpm-lock.yaml does not resolve the required ${expected} version`)
  }
}

if (errors.length) {
  console.error('RELEASE BLOCKED: vulnerable or unverified framework dependency versions remain.')
  for (const error of errors) console.error(`- ${error}`)
  console.error('\nUpdate package.json and regenerate pnpm-lock.yaml together with pnpm, then run pnpm audit.')
  process.exitCode = 1
} else {
  console.log('Framework dependency release gate passed.')
}
