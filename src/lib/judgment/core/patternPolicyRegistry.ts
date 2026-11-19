import type { TenGod } from '../../dayRelationships'
import type { StemRelationFact } from './types'

export type PolicyFact = StemRelationFact | (Omit<StemRelationFact, 'action'> & { action: 'coexist' })
  | (StemRelationFact & { basis: 'month_blade' })

const gods = {
  wealth: ['正財', '偏財'], resource: ['印綬', '偏印'], peer: ['比肩', '劫財'],
  officer: ['正官'], killing: ['偏官'], food: ['食神'], hurting: ['傷官'],
  output: ['食神', '傷官'], peer_only: ['比肩'], rob: ['劫財'], officer_killing: ['正官', '偏官'], indirect_resource: ['偏印'], day_master: ['比肩'],
} as const
type Group = keyof typeof gods
export function isGod(god: TenGod, group: Group): boolean {
  return (gods[group] as readonly TenGod[]).includes(god)
}

export const relationTypes = {
  WealthControlsResource: ['control', 'wealth', 'resource'],
  WealthGeneratesOfficer: ['generate', 'wealth', 'officer'],
  ResourceControlsHurting: ['control', 'resource', 'hurting'],
  HurtingControlsOfficer: ['control', 'hurting', 'officer'],
  OfficerKilling: ['coexist', 'officer', 'killing'],
  HurtingCombinesKilling: ['combine', 'hurting', 'killing'],
  FoodControlsKilling: ['control', 'food', 'killing'],
  KillingGeneratesResource: ['generate', 'killing', 'resource'],
  ResourceControlsFood: ['control', 'resource', 'food'],
  WealthGeneratesKilling: ['generate', 'wealth', 'killing'],
  HurtingControlsKilling: ['control', 'hurting', 'killing'],
  FoodGeneratesWealth: ['generate', 'food', 'wealth'],
  WealthResource: ['coexist', 'wealth', 'resource'],
  ResourceGeneratesDay: ['generate', 'resource', 'day_master'],
  OfficerGeneratesResource: ['generate', 'officer', 'resource'],
  DayGeneratesOutput: ['generate', 'day_master', 'output'],
  DayGeneratesFood: ['generate', 'day_master', 'food'],
  ResourceControlsOutput: ['control', 'resource', 'output'],
  IndirectResourceControlsFood: ['control', 'indirect_resource', 'food'],
  HurtingGeneratesWealth: ['generate', 'hurting', 'wealth'],
  OfficerControlsPeer: ['control', 'officer', 'peer_only'],
  OfficerControlsRob: ['control', 'officer', 'rob'],
  KillingControlsRob: ['control', 'killing', 'rob'],
  PeerOnlyControlsWealth: ['control', 'peer_only', 'wealth'],
  RobControlsWealth: ['control', 'rob', 'wealth'],
  OutputGeneratesWealth: ['generate', 'output', 'wealth'],
  PeerGeneratesOutput: ['generate', 'peer', 'output'],
  KillingControlsBlade: ['control', 'killing', 'rob'],
  OfficerControlsBlade: ['control', 'officer', 'rob'],
  WealthFeedsController: ['generate', 'wealth', 'officer_killing'],
  PeerControlsWealth: ['control', 'peer', 'wealth'],
} as const
export type PolicyRelationType = keyof typeof relationTypes
export function matchesPolicyFact(fact: PolicyFact, type: PolicyRelationType) {
  const [action, source, target] = relationTypes[type]
  const blade = type === 'KillingControlsBlade' || type === 'OfficerControlsBlade'
  if (blade !== ('basis' in fact && fact.basis === 'month_blade')) return false
  return fact.action === action && fact.source.dayMaster === (source === 'day_master')
    && fact.target.dayMaster === (target === 'day_master')
    && isGod(fact.source.tenGod, source) && isGod(fact.target.tenGod, target)
}

export const conditions = [
  'resource_excessive', 'resource_attacks_food_god',
  'protects_officer', 'necessary_protector', 'mixed', 'killing_removed', 'officer_removed', 'mixed_killing_combined',
  'excessive_food_control', 'unresolved_food_control', 'required_harmful_food_control', 'needed_resource_chain', 'key_food_control', 'harmful_killing', 'needed_insufficient_killing',
  'controls_wealth_generated_killing', 'combines_wealth_generated_killing',
  'weak_resource_strong_wealth', 'excessive_resource_and_day', 'necessary_output', 'disrupts_resource_chain',
  'controlled_killing', 'food_coexisting_paths', 'core_food', 'excessive_food', 'insufficient_output_capacity',
  'necessary_hurting_regulation', 'necessary_officer_damage', 'valid_harmful_combine', 'valid_necessary_combine',
  'valid_combine', 'necessary_hurting_resource', 'hurting_resource_killing_chain',
  'peer_needs_control', 'rob_needs_control', 'safe_killing_control', 'output_bridge',
  'material_harmful_feed', 'feeds_needed_rob_killing', 'safe_needed_blade_killing', 'feeds_blade_controller',
  'attacks_needed_blade_killing', 'combines_needed_blade_killing', 'wealth_is_harmful', 'protected_peer_wealth',
] as const
export type Condition = typeof conditions[number]
export const directions = ['favorable', 'unfavorable', 'favorable_candidate', 'unfavorable_candidate', 'context_dependent', 'favorable_auxiliary', 'favorable_priority'] as const
export type Family = 'officer' | 'killing' | 'wealth' | 'resource' | 'food_god' | 'hurting' | 'peer' | 'rob' | 'blade'
export type PolicyEntry = {
  policyId: string
  branchPattern: Family
  relationType: PolicyRelationType
  defaultDirection: typeof directions[number]
  requiredConditions: readonly Condition[]
  ruleId: string
  evidenceStatus: 'SOURCE_EXPLICIT' | 'SOURCE_INFERENCE' | 'FILUNE_APPROVED_OVERRIDE'
}
const entry = (policyId: string, branchPattern: Family, relationType: PolicyRelationType,
  defaultDirection: PolicyEntry['defaultDirection'], ruleId: string, ...requiredConditions: Condition[]): PolicyEntry =>
  ({ policyId, branchPattern, relationType, defaultDirection, requiredConditions, ruleId, evidenceStatus: 'SOURCE_EXPLICIT' })

// Conditions determine specificity. Unknown conditions leave the rule unapplied.
export const p11Policies = [
  entry('OFF-01', 'officer', 'WealthGeneratesOfficer', 'favorable', 'PA-100'),
  entry('OFF-02', 'officer', 'ResourceControlsHurting', 'favorable', 'PA-101', 'protects_officer'),
  entry('OFF-03', 'officer', 'HurtingControlsOfficer', 'unfavorable', 'PA-102'),
  entry('OFF-04', 'officer', 'WealthControlsResource', 'unfavorable', 'PA-103', 'necessary_protector'),
  entry('OFF-06', 'officer', 'OfficerKilling', 'favorable', 'PA-105', 'killing_removed'),
  entry('OFF-05', 'officer', 'OfficerKilling', 'unfavorable_candidate', 'PA-104', 'mixed'),
  entry('OFF-07', 'officer', 'HurtingCombinesKilling', 'favorable', 'PA-106', 'mixed_killing_combined'),
  entry('KILL-02', 'killing', 'FoodControlsKilling', 'context_dependent', 'PA-201', 'excessive_food_control'),
  entry('KILL-01', 'killing', 'FoodControlsKilling', 'favorable', 'PA-200'),
  entry('KILL-03', 'killing', 'KillingGeneratesResource', 'favorable_candidate', 'PA-202', 'needed_resource_chain'),
  entry('KILL-04', 'killing', 'ResourceControlsFood', 'favorable_candidate', 'PA-203', 'excessive_food_control'),
  entry('KILL-04-required-food', 'killing', 'ResourceControlsFood', 'unfavorable', 'PA-203', 'key_food_control'),
  entry('KILL-05', 'killing', 'WealthGeneratesKilling', 'unfavorable', 'PA-204', 'harmful_killing'),
  entry('KILL-05-needed-killing', 'killing', 'WealthGeneratesKilling', 'favorable_candidate', 'PA-204', 'needed_insufficient_killing'),
  entry('KILL-07', 'killing', 'OfficerKilling', 'favorable', 'PA-206', 'officer_removed'),
  entry('KILL-06', 'killing', 'OfficerKilling', 'unfavorable_candidate', 'PA-205', 'mixed'),
  entry('KILL-08', 'killing', 'HurtingControlsKilling', 'favorable_candidate', 'PA-207', 'harmful_killing'),
  entry('WEALTH-01', 'wealth', 'FoodGeneratesWealth', 'favorable', 'PA-301'),
  entry('WEALTH-02', 'wealth', 'WealthGeneratesOfficer', 'favorable', 'PA-302'),
  entry('WEALTH-03', 'wealth', 'WealthResource', 'favorable', 'PA-303'),
  { ...entry('WEALTH-04', 'wealth', 'WealthControlsResource', 'favorable', 'EX-043'), evidenceStatus: 'FILUNE_APPROVED_OVERRIDE' },
  entry('WEALTH-05', 'wealth', 'PeerControlsWealth', 'unfavorable_candidate', 'PA-308'),
  entry('WEALTH-06', 'wealth', 'WealthGeneratesKilling', 'unfavorable_candidate', 'PA-309', 'harmful_killing'),
  entry('WEALTH-07', 'wealth', 'FoodControlsKilling', 'favorable', 'PA-310', 'controls_wealth_generated_killing'),
  entry('WEALTH-08', 'wealth', 'HurtingControlsKilling', 'favorable', 'PA-312', 'controls_wealth_generated_killing'),
  entry('WEALTH-09', 'wealth', 'HurtingCombinesKilling', 'favorable', 'PA-311', 'combines_wealth_generated_killing'),
] as const satisfies readonly PolicyEntry[]

// The three P0 entries keep their IDs and provenance as RES-04, RES-05 and FOOD-06.
export const p12Policies = [
  entry('RES-01', 'resource', 'ResourceGeneratesDay', 'favorable', 'PA-401'),
  entry('RES-02', 'resource', 'OfficerGeneratesResource', 'favorable', 'PA-402'),
  entry('RES-03', 'resource', 'KillingGeneratesResource', 'favorable_candidate', 'PA-403', 'needed_resource_chain'),
  entry('RES-06', 'resource', 'WealthControlsResource', 'unfavorable', 'PA-407', 'weak_resource_strong_wealth'),
  entry('RES-07', 'resource', 'DayGeneratesOutput', 'favorable_candidate', 'PA-408', 'excessive_resource_and_day'),
  entry('RES-08', 'resource', 'ResourceControlsOutput', 'unfavorable', 'PP-406', 'necessary_output'),
  entry('RES-09', 'resource', 'WealthGeneratesKilling', 'unfavorable_candidate', 'PA-410', 'disrupts_resource_chain'),
  entry('FOOD-04', 'food_god', 'FoodGeneratesWealth', 'favorable', 'PA-503', 'food_coexisting_paths'),
  entry('FOOD-01', 'food_god', 'FoodGeneratesWealth', 'favorable', 'PA-500'),
  entry('FOOD-02', 'food_god', 'FoodControlsKilling', 'favorable', 'PA-501'),
  entry('FOOD-03', 'food_god', 'WealthGeneratesKilling', 'unfavorable_candidate', 'PA-502', 'controlled_killing'),
  entry('FOOD-07', 'food_god', 'ResourceControlsFood', 'favorable_candidate', 'PA-506', 'excessive_food'),
  entry('FOOD-05', 'food_god', 'IndirectResourceControlsFood', 'unfavorable', 'PA-504', 'core_food'),
  entry('FOOD-08', 'food_god', 'DayGeneratesFood', 'unfavorable_candidate', 'PP-507', 'insufficient_output_capacity'),
  entry('HO-01', 'hurting', 'HurtingGeneratesWealth', 'favorable', 'PA-600'),
  entry('HO-02', 'hurting', 'ResourceControlsHurting', 'favorable_candidate', 'PA-601', 'necessary_hurting_regulation'),
  entry('HO-03', 'hurting', 'HurtingControlsOfficer', 'unfavorable_candidate', 'PA-602'),
  entry('HO-04', 'hurting', 'HurtingControlsKilling', 'favorable_candidate', 'PA-603', 'harmful_killing'),
  entry('HO-05-harmful', 'hurting', 'HurtingCombinesKilling', 'favorable', 'PA-604', 'valid_combine', 'valid_harmful_combine'),
  entry('HO-05-needed', 'hurting', 'HurtingCombinesKilling', 'unfavorable', 'PA-604', 'valid_combine', 'valid_necessary_combine'),
  entry('HO-05', 'hurting', 'HurtingCombinesKilling', 'context_dependent', 'PA-604', 'valid_combine'),
  entry('HO-06', 'hurting', 'WealthControlsResource', 'unfavorable', 'PA-605', 'necessary_hurting_resource'),
  entry('HO-07', 'hurting', 'KillingGeneratesResource', 'favorable_candidate', 'PP-607', 'hurting_resource_killing_chain'),
] as const satisfies readonly PolicyEntry[]

export const p13Policies = [
  entry('PEER-01', 'peer', 'OfficerControlsPeer', 'favorable', 'PP-701', 'peer_needs_control'),
  entry('PEER-03', 'peer', 'OutputGeneratesWealth', 'favorable_auxiliary', 'PA-701', 'output_bridge'),
  entry('PEER-05', 'peer', 'WealthGeneratesKilling', 'unfavorable', 'PA-702', 'material_harmful_feed'),
  entry('PEER-06', 'peer', 'PeerOnlyControlsWealth', 'unfavorable_candidate', 'BG-034'),
  entry('ROB-01', 'rob', 'OfficerControlsRob', 'favorable', 'PP-801', 'rob_needs_control'),
  { ...entry('ROB-02', 'rob', 'KillingControlsRob', 'favorable_candidate', 'PA-801', 'rob_needs_control', 'safe_killing_control'),
    evidenceStatus: 'FILUNE_APPROVED_OVERRIDE' },
  entry('ROB-03', 'rob', 'RobControlsWealth', 'unfavorable_candidate', 'PA-802'),
  entry('ROB-04', 'rob', 'OutputGeneratesWealth', 'favorable_auxiliary', 'PP-803', 'output_bridge'),
  entry('ROB-05', 'rob', 'WealthGeneratesKilling', 'favorable_candidate', 'BG-044', 'feeds_needed_rob_killing'),
  entry('ROB-05-harmful', 'rob', 'WealthGeneratesKilling', 'unfavorable_candidate', 'BG-044', 'material_harmful_feed'),
  entry('BLADE-01', 'blade', 'KillingControlsBlade', 'favorable_priority', 'PA-900', 'safe_needed_blade_killing'),
  entry('BLADE-02', 'blade', 'OfficerControlsBlade', 'favorable', 'PA-901'),
  entry('BLADE-03', 'blade', 'WealthFeedsController', 'favorable_candidate', 'PP-903', 'feeds_blade_controller'),
  entry('BLADE-04', 'blade', 'FoodControlsKilling', 'unfavorable_candidate', 'PA-903', 'attacks_needed_blade_killing'),
  entry('BLADE-05', 'blade', 'HurtingControlsKilling', 'unfavorable_candidate', 'BG-084', 'attacks_needed_blade_killing'),
  { ...entry('BLADE-06', 'blade', 'HurtingCombinesKilling', 'unfavorable', 'PA-904', 'combines_needed_blade_killing'),
    evidenceStatus: 'SOURCE_INFERENCE' },
] as const satisfies readonly PolicyEntry[]
