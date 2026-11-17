import type { RuleRegistry } from '../registry/types'
import type { RuleVersionManifest } from '../types'

/** Targets only: source contents and actual rules have not been mapped or certified. */
export const PRODUCTION_MANIFEST: RuleVersionManifest = {
  id: 'filune-unmapped-skeleton-1', engineVersion: 'judgment-skeleton-1', scope: 'production',
  documents: {
    A: { revision: 179, contentHash: null }, B: { revision: 38, contentHash: null },
    C: { revision: 215, contentHash: null }, D: { revision: 152, contentHash: null },
    '㉕-7': { revision: 16, contentHash: null },
  },
  rules: [],
}
/** No production astrology rules or test evaluators are registered. */
export const PRODUCTION_REGISTRY: RuleRegistry = { rules: [], outputSchemas: [] }
