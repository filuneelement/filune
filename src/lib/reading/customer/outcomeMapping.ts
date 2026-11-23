import type { MoneyOutcomeFact, RelationshipOutcomeFact } from '../../outcome'
import type { OutcomeVoice } from './types'

export type CustomerOutcome = MoneyOutcomeFact | RelationshipOutcomeFact
type Mapping = { readonly id: string; readonly mechanism: string; readonly voice: OutcomeVoice; readonly slots: readonly string[] }
const rule = (id: string, mechanism: string, voice: OutcomeVoice, ...slots: string[]): Mapping =>
  ({ id, mechanism, voice, slots })

const skill = rule('CL-M01', 'skill_production', 'skill', 'earning_method')
const expression = rule('CL-M02', 'inventive_output', 'expression', 'earning_method')

export function mapMoney(fact: MoneyOutcomeFact): Mapping | undefined {
  const refs = fact.provenance
  switch (fact.result) {
    case 'can_earn': {
      const cause = refs.includes('07:L1256') ? skill : refs.includes('07:L764,L984') ? expression : undefined
      return cause && refs.includes('OUT-MONEY-01') ? { ...cause, slots: ['earning'] } : undefined
    }
    case 'skill_and_output': return refs.includes('OUT-MONEY-01') && refs.includes('07:L1256') ? skill : undefined
    case 'ingenuity_and_expression': return refs.includes('OUT-MONEY-01') && refs.includes('07:L764,L984') ? expression : undefined
    case 'harder_to_retain':
      if (refs.includes('OUT-MONEY-04') && refs.includes('07:L140-L144,L1250-L1251')) {
        return rule('CL-M04', 'wealth_damage', 'divisionRetention', 'retention')
      }
      if (refs.includes('OUT-MONEY-02') && refs.includes('07:L140-L144,L1117')) {
        return rule('CL-M03', 'capacity_constraint', 'capacity', 'retention')
      }
      return undefined
    case 'harder_to_sustain_accumulation':
      return refs.includes('OUT-MONEY-02') && refs.includes('07:L140-L144,L1117')
        ? rule('CL-M03', 'capacity_constraint', 'sustainability', 'accumulation', 'sustainability') : undefined
    case 'wealth_can_be_divided_or_flow_out':
      return refs.includes('OUT-MONEY-04') && refs.includes('07:L140-L144,L1250-L1251')
        ? rule('CL-M04', 'wealth_damage', 'division', 'combined_loss_or_division') : undefined
    case 'retention_supported_by_protection':
      return refs.includes('OUT-MONEY-02') && refs.includes('07:L1067,L2322')
        ? rule('CL-M05', 'wealth_protection', 'protection', 'retention', 'protection') : undefined
    case 'wealth_path_can_bring_difficulty':
      // The existing producer emits this result only for the qualified Wealth → Killing → Day Master path.
      return refs.includes('OUT-MONEY-04') && refs.includes('07:L162,L1262,L1273')
        ? rule('CL-M06', 'wealth_feeds_pressure', 'pressure', 'money_related_pressure') : undefined
    default: return undefined
  }
}

export function mapRelationship(fact: RelationshipOutcomeFact): Mapping | undefined {
  switch (fact.semanticType) {
    case 'relationship_contact_signal':
      return rule('CL-R01', 'palace_combination', 'contact', 'contact_or_change')
    case 'relationship_change_signal':
      return rule('CL-R01', 'palace_clash', 'change', 'change')
    case 'relationship_formation':
      return fact.provenance.includes('A:I-22') && fact.provenance.includes('A:OP-R03')
        ? rule('CL-R02', fact.relationKind === 'three' ? 'three_formation_with_active_stem' : 'combination_with_active_stem',
          'formation', 'formation') : undefined
    case 'relationship_pressure':
      return fact.provenance.includes('A:OP-R03') && fact.provenance.includes('07:L762-L765')
        ? rule('CL-R03', 'expression_pressures_role', 'relationshipPressure', 'relationship_pressure') : undefined
    default: return undefined
  }
}

export function outcomeSlots(fact: CustomerOutcome): readonly string[] {
  switch (fact.semanticType) {
    case 'money_acquisition': return ['earning']
    case 'money_generation_method': return ['earning_method']
    case 'money_retention': return ['retention']
    case 'money_duration': return ['accumulation', 'sustainability']
    case 'money_loss_or_division': return ['combined_loss_or_division']
    case 'money_related_problem': return ['money_related_pressure']
    case 'relationship_contact_signal': return ['contact_or_change']
    case 'relationship_change_signal': return ['change']
    case 'relationship_formation': return ['formation']
    case 'relationship_pressure': return ['relationship_pressure']
    default: return []
  }
}
