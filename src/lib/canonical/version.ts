import type { CalculationVersion } from './types'

/** Bump when adapter semantics or the underlying calculation implementation change.
 * Exact dependency versions must match the deployed lockfile.
 * US timezone/DST also depends on host ICU/tzdata; this release does not pin it.
 * No A/B/C/D/㉕-7 interpretation manifest has been applied by this service.
 */
export const CURRENT_CALCULATION_VERSION: Readonly<CalculationVersion> = Object.freeze({
  id: 'filune-canonical-1.0.0',
  implementationRevision: 'legacy-427e242-canonical-1',
  timePolicyId: 'legacy-filune-jst-v1',
  dependencies: Object.freeze({ lunarTypescript: '1.8.6', astronomyEngine: '2.1.19' }),
  temporalEnvironmentId: 'host-intl-unpinned',
})

export function assertSupportedVersion(version: CalculationVersion): void {
  const current = CURRENT_CALCULATION_VERSION
  if (version.id !== current.id
    || version.implementationRevision !== current.implementationRevision
    || version.timePolicyId !== current.timePolicyId
    || version.dependencies.lunarTypescript !== current.dependencies.lunarTypescript
    || version.dependencies.astronomyEngine !== current.dependencies.astronomyEngine
    || version.temporalEnvironmentId !== current.temporalEnvironmentId) {
    throw new RangeError('Unsupported calculation version.')
  }
}
