import type { ValueStatus } from '../src/lib/canonical/types'
import type {
  EvidenceRecord, HiddenStemSystemContract, RelationFactContract,
  RoleStateContract, RuntimeStateContract, LuckCarryStateContract, Infer,
} from '../src/lib/judgment/contracts'
import { runtimeStateSchema } from '../src/lib/judgment/contracts'

type Assert<T extends true> = T
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false
export type ContractTypeChecks = [
  Assert<Equal<HiddenStemSystemContract['assessment'], ValueStatus>>,
  Assert<Equal<RelationFactContract['existence'], 'present' | 'absent' | 'unknown'>>,
  Assert<Equal<RuntimeStateContract['functionalState'], 'active' | 'weakened' | 'stopped' | 'unknown'>>,
  Assert<Equal<RuntimeStateContract['originMode'], 'local' | 'inherited'>>,
  Assert<Equal<RuntimeStateContract['transition'], 'established' | 'unchanged' | 'restored' | 'unresolved'>>,
  Assert<Equal<Infer<typeof runtimeStateSchema>, RuntimeStateContract>>,
  Assert<Equal<RoleStateContract['applicationRef'] extends null ? true : false, false>>,
  Assert<Equal<LuckCarryStateContract['entries'][number]['sourceStage'], 'great' | 'year'>>,
]
// @ts-expect-error provenance is not a functional state
const wrongFunction: RuntimeStateContract['functionalState'] = 'inherited'
// @ts-expect-error transition is not an origin
const wrongOrigin: RuntimeStateContract['originMode'] = 'restored'
// @ts-expect-error arbitrary numeric confidence is not a contract field
const wrongConfidence: Pick<EvidenceRecord, 'confidence'> = { confidence: 90 }
// @ts-expect-error incomplete relation cannot be a complete contract
const incompleteRelation: RelationFactContract = { relationFactId: 'type-test-only' }
// @ts-expect-error document operation states are outside the contract
const wrongRoleStatus: RoleStateContract['status'] = 'auto-approved'
void [wrongFunction, wrongOrigin, wrongConfidence, incompleteRelation, wrongRoleStatus]
