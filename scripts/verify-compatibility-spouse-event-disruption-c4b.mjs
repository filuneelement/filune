// Use the C4 fixture suite's targeted mode so both verifiers exercise the same charts.
process.argv.push('--c4b')
await import('./verify-compatibility-lifecycle-timing-c4.mjs')
