await import('./verify-health-relationship-reaudit-p4k2.mjs')
if (process.exitCode) throw new Error('The unchanged P4-K.2 fixture must pass after identity/provenance rebasing.')
console.log('P4-K.2A Health month-window identity/provenance: PASS')
