import type { LuckScopeState } from '../judgment/core/luckScope'
import type { ActualStructuralFunction } from '../judgment/core/policies'
import type { StemRelationFact } from '../judgment/core/types'
import type { MoneyOutcomeFact, RelationshipOutcomeFact } from '../outcome'
import type { WorkStudyOutcomeFact } from '../outcome/workStudy'
import type { ReadingScope } from './types'
import { bounds, compare, uniqueIds, withinPeriod, type RoutedUnits } from './semanticUnit'
import type { CustomerChapterId } from './customer/types'
import { interpretationContent, interpretationContentEntries, type InterpretationContentId } from './interpretationContent'
import { calculateTenGod } from '../dayRelationships'
import { HIDDEN_STEM_ROLE_TABLE } from '../hiddenStemRoleTable'
import type { TwelveStage } from '../twelveStages'
import { TEN_GOD_PROFILES } from '../personality/knowledge/tenGodProfiles'
import { supportedConditionTrait } from '../personality/facts/personalityFacts'

type StructuralActor = { tenGod: string; position: string; axis: 'stem' | 'branch'; lifeMeaning?: string }
type StructuralReadingBody =
  | { kind: 'curated_content'; adjacentEvaluation?: 'next' }
  | { kind: 'pattern'; command: string; commandMeaning?: string; functions: readonly (StructuralActor & { reduced: boolean; rooted: boolean })[] }
  | { kind: 'support'; actor: StructuralActor; reduced: boolean; application?: 'select_evidence' | 'handoff_skill' }
  | { kind: 'generation'; source: StructuralActor; target: StructuralActor; reducedSource: boolean;
      application?: 'practiced_results' | 'adaptive_results' }
  | { kind: 'applied_mechanism'; mechanism: AppliedMechanism; reduced: boolean; adverse?: boolean; participantKey?: string;
      mappingId?: string }
  | { kind: 'damage'; source: StructuralActor; target: StructuralActor; reduced: boolean; feedsPressure: boolean;
      affectsOutput: boolean; reviewStyle?: 'alternatives' | 'standards'; remedy?: StructuralActor }
  | { kind: 'combination'; source: StructuralActor; target: StructuralActor; remainingExpression: boolean }
  | { kind: 'position_contrast'; contrast: 'demand_and_results' | 'steady_and_flexible' | 'expression_and_review' }
  | { kind: 'close_context'; other: StructuralActor; reduced: boolean }
  | { kind: 'shared_support'; other: StructuralActor; setting: 'close' | 'social' }
  | { kind: 'conditioned_tendency'; tendency: 'demands_compete_with_self_care' | 'review_crowds_out_practice'; reduced: boolean }
  | { kind: 'wealth_base'; actor: StructuralActor; strategy?: 'steadiness' | 'allocation' }
  | { kind: 'practical_focus' }
  | { kind: 'latent_goal'; outputPressured: boolean; mixedMethod: boolean }
  | { kind: 'linked_response'; path: 'knowledge_and_pressure' | 'production_and_pressure' | 'expression_and_review';
      residual: 'active' | 'weakened'; dayRoot?: string; capacity?: string; seasonalSupport: boolean;
      seasonalLimitNotStop?: boolean; monthStage?: TwelveStage; protected: boolean;
      links?: readonly { relationId: string; source: StructuralActor; target: StructuralActor;
        action: 'strengthen' | 'weaken' | 'drain'; reducesFunction: boolean }[]; distinguish?: boolean }
  | { kind: 'connected_functions'; source: StructuralActor; bridge: StructuralActor; target: StructuralActor;
      weakened: boolean }
  | { kind: 'coordination'; recurrence: boolean }
  | { kind: 'axis'; stem?: readonly string[]; branch?: readonly string[]; comparison?: 'previous' | 'next'; shift?: 'eased' | 'returned';
      shiftSubject?: 'output' | 'responsibility' | 'resources';
      reasons?: readonly string[]; evaluatedWindow?: boolean; changeIdentity?: string;
      incoming?: readonly { effect: 'support' | 'burden' | 'limited' | 'control' | 'limited_control';
        subject: string; affected: string }[];
      changes?: readonly { context: 'support' | 'pressure' | 'main'; from: string; to: string; subject?: string }[];
      rootChanges?: readonly { role: 'capacity' | 'main' | 'support' | 'pressure'; improves: boolean }[] }
export type StructuralReadingMeaning = StructuralReadingBody & { chapter: CustomerChapterId; contentId?: InterpretationContentId }

// Master 17, CL-P01, CL-M01/02/06 and PA-200/202. A subject can have
// several meanings; a choice attaches to the actor in this specific claim.
const functionalLabels: Record<string, string> = {
  day_master: 'capacity', 比肩: 'independent', 劫財: 'competition', 食神: 'craft', 傷官: 'expression',
  正財: 'management', 偏財: 'allocation', 正官: 'standards', 偏官: 'responsibility',
  印綬: 'knowledge', 偏印: 'review', 羊刃: 'initiative',
}
function chooseActorMeaning(meaning: StructuralReadingMeaning): StructuralReadingMeaning {
  const assign = <T extends StructuralActor>(actor: T, endpoint: 'source' | 'target' | 'role' = 'role'): T => {
    let lifeMeaning = functionalLabels[actor.tenGod]
    if (isWealth(actor.tenGod)) {
      if (meaning.kind === 'damage' && meaning.feedsPressure) lifeMeaning = 'goals'
      else if (meaning.kind === 'generation' && endpoint === 'target') lifeMeaning = 'deliverables'
      else if (meaning.kind === 'close_context') lifeMeaning = 'shared_resources'
      else if (meaning.kind === 'damage' && meaning.chapter === 'CR-07') lifeMeaning = 'resource_control'
    } else if (actor.tenGod === '比肩' && (meaning.kind === 'support' || endpoint === 'target' && actor.axis === 'branch')) {
      lifeMeaning = 'footing'
    } else if (['印綬', '偏印'].includes(actor.tenGod) && meaning.kind === 'damage' && meaning.affectsOutput) {
      lifeMeaning = actor.tenGod === '偏印' ? 'options_review' : 'prior_standards'
    }
    return { ...actor, lifeMeaning }
  }
  if (meaning.kind === 'pattern') return { ...meaning, commandMeaning: functionalLabels[meaning.command],
    functions: meaning.functions.map(actor => assign(actor)) }
  if (meaning.kind === 'linked_response') return { ...meaning, links: meaning.links?.map(link =>
    ({ ...link, source: assign(link.source, 'source'), target: assign(link.target, 'target') })) }
  if (meaning.kind === 'close_context' || meaning.kind === 'shared_support') return { ...meaning, other: assign(meaning.other) }
  if (meaning.kind === 'support') return { ...meaning, actor: assign(meaning.actor),
    application: meaning.actor.tenGod === '偏印' ? 'select_evidence' : meaning.actor.tenGod === '食神' ? 'handoff_skill' : undefined }
  if (meaning.kind === 'wealth_base') return { ...meaning, actor: assign(meaning.actor),
    strategy: meaning.actor.tenGod === '正財' ? 'steadiness' : 'allocation' }
  if (meaning.kind === 'connected_functions') return { ...meaning, source: assign(meaning.source, 'source'),
    bridge: assign(meaning.bridge), target: assign(meaning.target, 'target') }
  if (meaning.kind === 'damage') return { ...meaning, source: assign(meaning.source, 'source'),
    target: assign(meaning.target, 'target'), remedy: meaning.remedy && assign(meaning.remedy),
    reviewStyle: meaning.affectsOutput ? meaning.source.tenGod === '偏印' ? 'alternatives' : 'standards' : undefined }
  if (meaning.kind === 'generation') return { ...meaning, source: assign(meaning.source, 'source'), target: assign(meaning.target, 'target'),
    application: isWealth(meaning.target.tenGod) ? meaning.source.tenGod === '食神' ? 'practiced_results'
      : meaning.source.tenGod === '傷官' ? 'adaptive_results' : undefined : undefined }
  if ('source' in meaning) return { ...meaning, source: assign(meaning.source, 'source'), target: assign(meaning.target, 'target') }
  return meaning
}

export function structuralLifeMapping(meaning: StructuralReadingMeaning): readonly string[] {
  if (meaning.contentId) return interpretationContent[meaning.contentId].source
  switch (meaning.kind) {
    case 'position_contrast': case 'close_context': case 'shared_support': case 'conditioned_tendency': return ['CL-P01']
    case 'linked_response': return meaning.path === 'knowledge_and_pressure' ? ['PA-202', 'R-085']
      : meaning.path === 'production_and_pressure' ? ['PA-301', 'PA-310', 'R-084', 'R-086'] : ['PA-504', 'R-021']
    case 'practical_focus': return ['07:3115-3117']
    case 'coordination': return [meaning.recurrence ? '07:3121-3129' : '07:3118-3120']
    case 'applied_mechanism': return meaning.mappingId ? [meaning.mappingId] : []
    default: return []
  }
}

export type AppliedMechanism = 'practiced_solution' | 'adaptive_solution' | 'knowledge_under_demand'
  | 'knowledge_shapes_expression' | 'results_build_trust' | 'independent_output' | 'knowledge_into_practice'
  | 'goals_displace_preparation' | 'expression_meets_rules' | 'competition_strains_resources'

// PA-200/202/207, PA-302, PA-401, PA-501, PA-601/603/310/312. These are
// functional applications, separate from any occupation, income or event assertion.
const appliedPolicies: Readonly<Record<string, AppliedMechanism>> = {
  'KILL-01': 'practiced_solution', 'FOOD-02': 'practiced_solution', 'WEALTH-07': 'practiced_solution',
  'KILL-08': 'adaptive_solution', 'HO-04': 'adaptive_solution', 'WEALTH-08': 'adaptive_solution',
  'KILL-03': 'knowledge_under_demand', 'RES-03': 'knowledge_under_demand', 'HO-07': 'knowledge_under_demand',
  'HO-02': 'knowledge_shapes_expression', 'OFF-01': 'results_build_trust', 'WEALTH-02': 'results_build_trust',
  'RES-01': 'knowledge_into_practice',
}
const isWealth = (god: string) => god === '正財' || god === '偏財'
export function storageTriples(snapshot: LuckScopeState) {
  const branches = new Map(snapshot.branchContexts.map(branch => [branch.id, branch.branch]))
  return snapshot.branchFacts.filter(fact => fact.kind === 'punishment' && fact.participants.length === 3
    && ['丑', '戌', '未'].every(branch => fact.participants.some(id => branches.get(id) === branch))
    && snapshot.branchRelationEffects.some(effect => effect.relationId === fact.id && effect.effect === 'active'))
}
const adverseApplications: Readonly<Record<string, AppliedMechanism>> = {
  'OFF-03': 'expression_meets_rules', 'HO-03': 'expression_meets_rules',
  'OFF-04': 'goals_displace_preparation', 'HO-06': 'goals_displace_preparation', 'RES-06': 'goals_displace_preparation',
  'WEALTH-05': 'competition_strains_resources', 'ROB-03': 'competition_strains_resources',
  'HO-supported-wealth-pressure': 'competition_strains_resources', 'PEER-06': 'competition_strains_resources',
}

// Customer interpretation of adjudicated paths. These units carry no domain outcome,
// and relationship, money and event publication continue to use their own routes.
export function collectStructuralInterpretation(natal: LuckScopeState, current: readonly LuckScopeState[],
  adjacent: readonly LuckScopeState[], windows: readonly LuckScopeState[], referenceTime: string | undefined, out: RoutedUnits,
  scopeIndex?: ReadonlyMap<string, LuckScopeState>) {
  if (natal.runtimeStatus !== 'resolved') return
  const actors = new Map<string, StructuralActor>()
  for (const fact of natal.stemFacts) for (const item of [fact.source, fact.target]) {
    if (item.position !== 'luck') actors.set(item.id, { position: item.position,
      tenGod: item.dayMaster ? 'day_master' : item.tenGod, axis: 'stem' })
  }
  for (const item of natal.branchContexts) if (item.position && item.tenGod) {
    actors.set(item.id, { position: item.position, tenGod: item.tenGod, axis: 'branch' })
  }
  const scopeMap = { natal: 'natal', greatLuck: 'daewoon', yearlyLuck: 'sewoon', monthlyLuck: 'month', dailyLuck: 'day' } as const
  const emittedContent = new Set<string>()
  function add(snapshot: LuckScopeState, key: string, structuralInterpretation: StructuralReadingMeaning,
    evidence: readonly string[], roleIds: readonly string[] = []) {
    if (!evidence.length) return
    const applicable = interpretationContentEntries.filter(([, entry]) => entry.when(structuralInterpretation))
    const replacement = applicable.find(([, entry]) => entry.replaces)
    emit(key, replacement ? { ...structuralInterpretation, contentId: replacement[0] } : structuralInterpretation,
      replacement ? [...evidence, ...replacement[1].source] : evidence)
    for (const [contentId, entry] of applicable) {
      const reference = JSON.stringify([snapshot.id, contentId])
      if (entry.replaces || emittedContent.has(reference)) continue
      emittedContent.add(reference)
      emit(`interpretation:${contentId}`, { kind: 'curated_content', chapter: entry.chapter, contentId,
        adjacentEvaluation: structuralInterpretation.kind === 'axis' && structuralInterpretation.comparison === 'next' ? 'next' : undefined },
        [...evidence, ...entry.source])
    }
    function emit(key: string, meaning: StructuralReadingMeaning, evidence: readonly string[]) {
    out.add({
      topic: 'structure', scope: scopeMap[snapshot.scope], certainty: 'confirmed', sourceStatus: 'evaluated_structure',
      meaningRef: { producer: 'judgment', kind: 'structural_function', recordId: `structural-interpretation:${key}`, scopeId: snapshot.id },
      ...(snapshot.scope !== 'natal' && { period: snapshot.validity }),
      sourceFactIds: [snapshot.id, ...evidence], sourceRoleIds: roleIds, evidenceIds: evidence,
      structuralInterpretation: chooseActorMeaning(meaning),
    }, {
      chapterId: snapshot.scope === 'monthlyLuck' ? 'CH-10' : snapshot.scope === 'yearlyLuck' ? 'CH-09' : 'CH-01',
      role: 'context', contextIds: evidence,
    })
    }
  }
  const { patternContext, roleEngine } = natal
  const strengthens = natal.stemFunctionEffects.filter(effect => effect.kind === 'strengthen')
  function describeLinks(effects: readonly (typeof natal.stemFunctionEffects[number] | undefined)[]) {
    return effects.flatMap(effect => {
      const source = effect && actors.get(effect.sourceEntityId), target = effect && actors.get(effect.targetEntityId)
      return effect && source && target ? [{ relationId: effect.relationFactId, source, target,
        action: effect.kind, reducesFunction: effect.reducesFunction }] : []
    })
  }
  const dayActor = natal.stemFacts.flatMap(fact => [fact.source, fact.target]).find(item => item.dayMaster)
  const dayRoot = dayActor && natal.rootStates.find(item => item.entityId === dayActor.id)
  const rootSupport = (effect?: typeof strengthens[number]) => Boolean(effect?.sourceRoot?.factIds.length
    && ['present', 'strengthened'].includes(effect.sourceRoot.state)
    && ['建禄', '帝旺', '長生'].includes(effect.sourceRoot.monthStage ?? ''))
  const residuals = roleEngine.damagePaths.filter(path => dayActor && path.targetEntityId === dayActor.id
    && path.damagedFunction === 'day_master' && ['active', 'weakened'].includes(path.state)
    && actors.get(path.sourceEntityId)?.tenGod === '偏官')
  const linkedStems = new Set<string>()
  for (const residual of residuals) {
    const feeds = strengthens.filter(effect => effect.targetEntityId === residual.sourceEntityId
      && isWealth(actors.get(effect.sourceEntityId)?.tenGod ?? ''))
    const knowledgePaths = strengthens.filter(effect => effect.sourceEntityId === residual.sourceEntityId
      && ['印綬', '偏印'].includes(actors.get(effect.targetEntityId)?.tenGod ?? ''))
      .flatMap(knowledge => strengthens.filter(back => back.sourceEntityId === knowledge.targetEntityId
        && back.targetEntityId === dayActor?.id).map(back => ({ knowledge, back })))
    for (const feed of feeds) {
      const productionPaths = strengthens.filter(effect => effect.targetEntityId === feed.sourceEntityId
        && ['食神', '傷官'].includes(actors.get(effect.sourceEntityId)?.tenGod ?? ''))
        .flatMap(production => natal.stemFunctionEffects.filter(control => control.kind === 'weaken'
          && control.reducesFunction && control.sourceEntityId === production.sourceEntityId
          && control.targetEntityId === residual.sourceEntityId).flatMap(control => roleEngine.resolutionPaths
          .filter(guard => guard.remedyEntityId === control.sourceEntityId && guard.relationRefs.includes(control.relationFactId))
          .map(protection => ({ production, control, protection }))))
      const joined: { knowledge?: typeof feed; back?: typeof feed; production?: typeof feed; control?: typeof feed;
        protection?: typeof roleEngine.resolutionPaths[number] }[] = [...knowledgePaths, ...productionPaths]
      for (const { knowledge, back, production, control, protection } of joined) {
        const path = knowledge && back ? 'knowledge_and_pressure' : 'production_and_pressure'
        const authorizedProtection = natal.branchDamage.protectivePaths.filter(guard => natal.branchDamage.paths.some(item =>
          item.damagedFunction === 'branch_killing_protection' && item.state === 'weakened' && item.protection?.entityId === guard.entityId))
        const links = [feed, knowledge, back, production, control].flatMap(effect =>
          effect ? [effect.relationFactId, ...(effect.sourceRoot?.factIds ?? [])] : [])
        for (const effect of [back, production]) if (effect) linkedStems.add(effect.relationFactId)
        add(natal, `${JSON.stringify(uniqueIds([...residual.relationRefs, feed.relationFactId,
          knowledge?.relationFactId ?? '', production?.relationFactId ?? '', control?.relationFactId ?? '']))}:linked-response`, {
          kind: 'linked_response', chapter: 'CR-06', path, residual: residual.state === 'weakened' ? 'weakened' : 'active',
          dayRoot: dayRoot?.state, capacity: natal.capacity?.state, seasonalSupport: rootSupport(back ?? production),
          monthStage: (back ?? production)?.sourceRoot?.monthStage ?? feed.sourceRoot?.monthStage,
          seasonalLimitNotStop: Boolean(feed.sourceRoot?.factIds.length && ['present', 'strengthened'].includes(feed.sourceRoot.state)
            && ['墓', '絶', '衰'].includes(feed.sourceRoot.monthStage ?? '')),
          protected: Boolean(protection || authorizedProtection.length),
          distinguish: feeds.length > 1 || joined.length > 1 || residuals.length > 1,
          links: describeLinks([feed, knowledge, back, production, control]),
        }, [...residual.relationRefs, ...links, ...(dayRoot?.factIds ?? []), ...(natal.capacity?.evidenceIds ?? []),
          ...(protection?.relationRefs ?? []), ...authorizedProtection.flatMap(guard => guard.relationRefs),
          'R-020', 'R-021', 'R-023', 'R-084', 'R-085', 'R-086'])
      }
    }
  }
  for (const first of strengthens) for (const second of strengthens) {
    if (first.targetEntityId !== second.sourceEntityId || first.sourceEntityId === second.targetEntityId
      || linkedStems.has(second.relationFactId)) continue
    const source = actors.get(first.sourceEntityId), bridge = actors.get(first.targetEntityId), target = actors.get(second.targetEntityId)
    if (!source || !bridge || !target || !['印綬', '偏印', '比肩', '劫財'].includes(source.tenGod)
      || !['day_master', '比肩', '劫財'].includes(bridge.tenGod) || !['食神', '傷官'].includes(target.tenGod)) continue
    add(natal, JSON.stringify([first.relationFactId, second.relationFactId]), {
      kind: 'connected_functions', chapter: 'CR-02', source, bridge, target,
      weakened: natal.stemEffectiveness.some(item => item.entityId === second.sourceEntityId && item.currentFunction === 'reduced'),
    }, [first.relationFactId, second.relationFactId, ...(first.sourceRoot?.factIds ?? []), 'R-023'])
  }
  const effective = patternContext.effectiveManifestedYongShen.flatMap(item => {
    const actor = actors.get(item.entityId)
    if (!actor) return []
    const root = natal.rootStates.find(root => root.entityId === item.entityId)
    return [{ actor: { ...actor, reduced: item.effectiveness === 'weakened',
      rooted: Boolean(root?.factIds.length && (root.state === 'present' || root.state === 'strengthened')) },
      ids: [item.entityId, ...(root?.factIds ?? [])] }]
  })
  if (patternContext.branchPattern && effective.length) add(natal, patternContext.id,
    { kind: 'pattern', chapter: 'CR-02', command: patternContext.branchPattern, functions: effective.map(item => item.actor) },
    [patternContext.id, ...effective.flatMap(item => item.ids)])
  const daily = natal.branchContexts.find(item => item.position === 'day')
  const dailyRuntime = daily && natal.branchRuntimeStates.find(item => item.entityId === daily.id)
  if (daily && dailyRuntime?.state === 'active') {
    const outward = effective.find(({ actor }) => actor.reduced === false && (
      actor.tenGod === '偏官' && daily.tenGod === '正財'
      || actor.tenGod === '正財' && daily.tenGod === '偏財'
      || actor.tenGod === '傷官' && daily.tenGod === '偏印'))
    if (outward) add(natal, `${patternContext.id}:position-contrast`, {
      kind: 'position_contrast', chapter: 'CR-01',
      contrast: outward.actor.tenGod === '偏官' ? 'demand_and_results'
        : outward.actor.tenGod === '正財' ? 'steady_and_flexible' : 'expression_and_review',
    }, [patternContext.id, daily.id, ...dailyRuntime.relationRefs, ...outward.ids])
  }
  const currentRoles = new Map(roleEngine.currentRoles.map(role => [role.roleId, role]))
  for (const role of roleEngine.roleHistory) {
    const state = currentRoles.get(role.roleId)
    const actor = actors.get(role.entityId)
    if (role.role !== 'SangShen' || !actor || !state || !['active', 'weakened'].includes(state.currentState)
      || (state.currentFunction !== 'operating' && state.currentFunction !== 'reduced')) continue
    add(natal, role.roleId, { kind: 'support', chapter: 'CR-06', actor, reduced: state.currentFunction === 'reduced' },
      state.pathRefs, [role.roleId])
  }
  for (const path of roleEngine.damagePaths) {
    const source = actors.get(path.sourceEntityId), target = actors.get(path.targetEntityId)
    if (!source || !target || !['active', 'weakened'].includes(path.state)) continue
    const related = roleEngine.roleHistory.filter(role => role.role === 'Byeong' && role.entityId === path.sourceEntityId
      && role.pathRefs.some(ref => path.relationRefs.includes(ref)))
    const resolution = roleEngine.resolutionPaths.find(item => related.some(role => role.roleId === item.targetByeongId))
    const branchProtection = natal.branchDamage.paths.find(item => item.sourceEntityId === path.sourceEntityId
      && item.targetEntityId === path.targetEntityId && item.damagedFunction === path.damagedFunction)?.protection
    const remedyId = branchProtection?.entityId ?? resolution?.remedyEntityId
    const remedy = remedyId ? actors.get(remedyId) : undefined
    const caution = source.tenGod === '偏官' && path.damagedFunction === 'day_master'
      ? supportedConditionTrait(TEN_GOD_PROFILES.偏官, 'caution', '외부 상황에 몰두해 자신을 돌보지 못함')
      : []
    if (caution.length && target.tenGod === 'day_master') add(natal,
      `${JSON.stringify(path.relationRefs)}:conditional-focus`, { kind: 'conditioned_tendency',
        chapter: 'CR-03', tendency: 'demands_compete_with_self_care', reduced: path.state === 'weakened' },
      [...path.relationRefs, ...caution])
    const review = path.damagedFunction === 'branch_food' && source.tenGod === '偏印'
      ? supportedConditionTrait(TEN_GOD_PROFILES.偏印, 'excessive', '생각과 이유가 늘어나 일을 미룸') : []
    if (review.length) add(natal, `${JSON.stringify(path.relationRefs)}:conditional-review`, {
      kind: 'conditioned_tendency', chapter: 'CR-03', tendency: 'review_crowds_out_practice', reduced: path.state === 'weakened',
    }, [...path.relationRefs, ...review])
    add(natal, JSON.stringify([path.sourceEntityId, path.targetEntityId, path.damagedFunction]), {
      kind: 'damage', chapter: ['branch_wealth', 'branch_wealth_capacity'].includes(path.damagedFunction) ? 'CR-07'
        : path.damagedFunction === 'branch_food' && source.tenGod === '印綬' ? 'CR-06' : 'CR-03',
      source, target, reduced: path.state === 'weakened',
      affectsOutput: path.damagedFunction === 'branch_food',
      feedsPressure: path.action === 'generate' && ['偏財', '正財'].includes(source.tenGod) && target.tenGod === '偏官', remedy,
    }, [...path.relationRefs, ...(remedy ? branchProtection?.relationRefs ?? resolution?.relationRefs ?? [] : [])],
      related.map(role => role.roleId))
    if (source.axis === 'branch' && target.axis === 'branch' && [source.position, target.position].includes('day')) {
      const contact = natal.branchFacts.find(relation => relation.participants.length === 2
        && relation.participants.includes(path.sourceEntityId) && relation.participants.includes(path.targetEntityId)
        && ['clash', 'punishment', 'harm', 'break'].includes(relation.kind)
        && natal.branchRelationEffects.some(effect => effect.relationId === relation.id))
      if (contact) add(natal, contact.id, { kind: 'close_context', chapter: 'CR-05',
        other: source.position === 'day' ? target : source, reduced: path.state === 'weakened',
      }, [contact.id, ...path.relationRefs])
    }
  }
  for (const relation of natal.branchDamage.relations) {
    if (!relation.confirmed || relation.action !== 'generate' || relation.target.id !== daily?.id
      || !['比肩', '劫財', '印綬', '偏印'].includes(relation.source.god)) continue
    const other = actors.get(relation.source.id)
    if (other) add(natal, `${relation.id}:shared-support`, { kind: 'shared_support', chapter: 'CR-05', other, setting: 'close' },
      [relation.id, ...relation.evidenceRefs, 'CL-P01'])
  }
  for (const role of roleEngine.roleHistory) {
    if (role.role !== 'SangShen' || !role.protectedFunction) continue
    const actor = actors.get(role.entityId)
    const protectedActor = actors.get(role.protectedFunction.entityId)
    const state = currentRoles.get(role.roleId)
    if (actor?.axis !== 'stem' || protectedActor?.tenGod !== '正官' || state?.currentFunction !== 'operating'
      || !state.pathRefs.length) continue
    add(natal, `${role.roleId}:shared-support`, { kind: 'shared_support', chapter: 'CR-05', other: actor, setting: 'social' },
      [...state.pathRefs, 'CL-P01'], [role.roleId])
  }
  for (const relation of natal.stemFacts) {
    if (relation.action !== 'combine' || !natal.combinations.some(event => event.participants.includes(relation.source.id)
      && event.participants.includes(relation.target.id))
      || ![relation.source.id, relation.target.id].every(id => natal.runtime.some(runtime => runtime.entityId === id && runtime.state === 'stopped'))) continue
    const source = actors.get(relation.source.id), target = actors.get(relation.target.id)
    if (source && target) {
      const stoppedOutput = [source, target].find(actor => ['食神', '傷官'].includes(actor.tenGod))
      const remaining = stoppedOutput && patternContext.effectiveManifestedYongShen.find(item =>
        item.entityId !== relation.source.id && item.entityId !== relation.target.id && item.tenGod === stoppedOutput.tenGod)
      add(natal, relation.id, { kind: 'combination', chapter: 'CR-01', source, target,
        remainingExpression: Boolean(remaining) }, [relation.id, ...(remaining ? [remaining.entityId, patternContext.id] : [])])
    }
  }
  const outputDamage = roleEngine.damagePaths.filter(path => path.damagedFunction === 'branch_food'
    && ['active', 'weakened'].includes(path.state))
  const outputFlow = dayActor && strengthens.find(effect => effect.sourceEntityId === dayActor.id
    && actors.get(effect.targetEntityId)?.tenGod === '傷官')
  const mixedStop = outputFlow && natal.stemFacts.find(relation => relation.action === 'combine'
    && [relation.source, relation.target].some(actor => actor.tenGod === '傷官')
    && [relation.source, relation.target].some(actor => actor.tenGod === '偏官')
    && natal.combinations.some(event => event.participants.includes(relation.source.id) && event.participants.includes(relation.target.id))
    && [relation.source, relation.target].every(actor => natal.runtime.some(runtime => runtime.entityId === actor.id && runtime.state === 'stopped')))
  if (outputFlow && mixedStop && outputDamage.length && dayRoot?.factIds.length
    && ['present', 'strengthened'].includes(dayRoot.state)) {
    add(natal, `${mixedStop.id}:linked-response`, {
      kind: 'linked_response', chapter: 'CR-06', path: 'expression_and_review',
      residual: outputDamage.some(path => path.state === 'active') ? 'active' : 'weakened', dayRoot: dayRoot.state,
      protected: false, seasonalSupport: rootSupport(outputFlow), monthStage: outputFlow.sourceRoot?.monthStage,
      links: describeLinks([outputFlow]),
    }, [mixedStop.id, outputFlow.relationFactId, ...dayRoot.factIds, ...outputDamage.flatMap(path => path.relationRefs), 'R-020', 'R-021'])
  }
  for (const effect of natal.stemFunctionEffects) {
    if (effect.kind !== 'strengthen') continue
    const source = actors.get(effect.sourceEntityId), target = actors.get(effect.targetEntityId)
    const drain = natal.stemFunctionEffects.find(item => item.kind === 'drain' && item.relationFactId === effect.relationFactId
      && item.sourceEntityId === effect.sourceEntityId)
    if (source && target && ['比肩', '劫財'].includes(source.tenGod) && ['食神', '傷官'].includes(target.tenGod)) {
      add(natal, `${effect.relationFactId}:application`, {
        kind: 'applied_mechanism', chapter: 'CR-02', mechanism: 'independent_output', reduced: Boolean(drain?.reducesFunction),
      }, [effect.relationFactId, ...(effect.sourceRoot?.factIds ?? [])])
    }
    if (!source || !target || !drain || linkedStems.has(effect.relationFactId)
      || !['食神', '傷官', '印綬', '偏印'].includes(source.tenGod)) continue
    add(natal, effect.relationFactId, { kind: 'generation', chapter: 'CR-06', source, target,
      reducedSource: drain.reducesFunction }, [effect.relationFactId, ...(effect.sourceRoot?.factIds ?? [])])
  }
  const emitted = new Set<string>()
  for (const actual of natal.actualFunctions) {
    const policy = actual.policyId
    const favorable = ['favorable', 'favorable_priority', 'favorable_auxiliary'].includes(actual.direction)
    const adverse = actual.direction === 'unfavorable' && actual.byeongCandidate
    const mechanism = policy && (favorable ? appliedPolicies[policy] : adverse ? adverseApplications[policy] : undefined)
    const relation = [...natal.stemFacts, ...natal.patternFacts].find(item => item.id === actual.relationFactId)
    const participantKey = relation && JSON.stringify([relation.source.id, relation.action, relation.target.id,
      actual.function, actual.structuralEffect?.blockedBy?.kind])
    const key = JSON.stringify([mechanism, participantKey, actual.direction])
    if (!mechanism || !participantKey || emitted.has(key) || !actual.structuralEffect?.currentlyEffective
      || !['operating', 'reduced'].includes(actual.function)) continue
    emitted.add(key)
    add(natal, `${actual.relationFactId}:application`, {
      kind: 'applied_mechanism', chapter: favorable ? 'CR-02' : 'CR-06', mechanism,
      reduced: actual.function === 'reduced', adverse, participantKey, mappingId: policy!,
    }, [actual.relationFactId, policy!, ...(actual.conditionEvidence ?? []), ...(actual.resolutionEvidence ?? [])])
  }
  const command = natal.branchContexts.find(item => item.position === 'month')
  const wealth = command && actors.get(command.id)
  if (wealth && isWealth(wealth.tenGod) && patternContext.branchPattern === wealth.tenGod) {
    add(natal, command!.id, { kind: 'wealth_base', chapter: 'CR-07', actor: wealth }, [command!.id, patternContext.id])
    const operating = effective.find(item => item.actor.tenGod === wealth.tenGod && !item.actor.reduced && item.actor.rooted)
    if (operating) add(natal, `${patternContext.id}:practical-focus`, { kind: 'practical_focus', chapter: 'CR-01' },
      [command!.id, patternContext.id, ...operating.ids, '07:3115-3117'])
  }
  // Authority 25-7 §⑤ distinguishes hidden wealth from an operating remedy.
  // The approved output-led reading can discuss completion and goals without a Money Fact.
  const day = natal.stemFacts.flatMap(fact => [fact.source, fact.target]).find(item => item.dayMaster)
  if (day && (patternContext.branchPattern === '食神' || patternContext.branchPattern === '傷官')
    && effective.some(item => ['食神', '傷官'].includes(item.actor.tenGod))
    && ![...actors.values()].some(actor => isWealth(actor.tenGod))) {
    const latent = natal.branchContexts.filter(item => item.position && item.tenGod
      && HIDDEN_STEM_ROLE_TABLE[item.branch].some(hidden => hidden.role !== 'main' && isWealth(calculateTenGod(day.stem, hidden.stem))))
    if (latent.length) {
      const damage = roleEngine.damagePaths.filter(path => path.damagedFunction === 'branch_food'
        && (path.state === 'active' || path.state === 'weakened'))
      add(natal, `${patternContext.id}:latent-goal`, { kind: 'latent_goal', chapter: 'CR-07',
        outputPressured: Boolean(damage.length), mixedMethod: patternContext.branchPattern === '食神'
          && effective.some(item => item.actor.tenGod === '傷官'),
      }, [patternContext.id, day.id, ...latent.map(item => item.id), ...damage.flatMap(path => path.relationRefs)])
    }
  }
  const currentDecade = current.find(snapshot => snapshot.scope === 'greatLuck' && withinPeriod(referenceTime, snapshot.validity))
  const decadeBounds = bounds(currentDecade?.validity)
  const natalTriple = storageTriples(natal)[0]
  if (natalTriple) add(natal, `${natalTriple.id}:learning`, { kind: 'coordination', chapter: 'CR-02', recurrence: false },
    [natalTriple.id, '07:3118-3120'])
  let explainedCoordination = false
  const seenScopes = new Set<string>()
  for (const snapshot of [...current, ...adjacent, ...windows]) {
    if (seenScopes.has(snapshot.id)) continue
    seenScopes.add(snapshot.id)
    const period = bounds(snapshot.validity)
    const evaluatedWindow = (snapshot.scope === 'monthlyLuck' && windows.includes(snapshot)
      || snapshot.scope === 'yearlyLuck' && adjacent.includes(snapshot)) && !!period
      && !!referenceTime && Date.parse(period[0]) > Date.parse(referenceTime)
    const comparison = snapshot.scope === 'greatLuck' && period && decadeBounds && snapshot.id !== currentDecade?.id
      ? period[1] === decadeBounds[0] ? 'previous' : period[0] === decadeBounds[1] ? 'next' : undefined : undefined
    const repeated = natalTriple && storageTriples(snapshot).find(relation => relation.participants.some(id =>
      !natal.directEntityIds.includes(id) && snapshot.directEntityIds.includes(id)))
    if (!explainedCoordination && repeated && period && snapshot.runtimeStatus === 'resolved'
      && withinPeriod(referenceTime, snapshot.validity) && snapshot.scope !== 'dailyLuck') {
      explainedCoordination = true
      add(snapshot, `${repeated.id}:coordination`,
        { kind: 'coordination', chapter: 'CR-04', recurrence: true }, [natalTriple.id, repeated.id, '07:3121-3129'])
    }
    if (snapshot.runtimeStatus !== 'resolved' || snapshot.scope === 'natal' || snapshot.scope === 'dailyLuck'
      || (!withinPeriod(referenceTime, snapshot.validity) && !comparison && !evaluatedWindow)) continue
    const { stem, branch, evidenceRefs } = snapshot.structuralSuccess
    const stemReason = stem.grade ? stem.reasonCodes : undefined
    const branchReason = branch.grade ? branch.reasonCodes : undefined
    const parent = (snapshot.parentScopeId ? scopeIndex?.get(snapshot.parentScopeId) : undefined)
      ?? [...current, ...adjacent, ...windows].find(item => item.id === snapshot.parentScopeId)
      ?? (comparison === 'next' ? currentDecade : undefined) ?? natal
    const roleChanges = snapshot.rootStates.flatMap<{
      role: 'capacity' | 'main' | 'support' | 'pressure'; improves: boolean; refs: string[]
    }>(root => {
      const prior = parent.rootStates.find(item => item.entityId === root.entityId)
      if (!prior || prior.state === root.state || !root.factIds.length || !prior.factIds.length) return []
      const improves = root.state === 'strengthened' && prior.state !== 'strengthened'
      if (!improves && root.state !== 'weakened') return []
      if (root.entityId === dayActor?.id && snapshot.capacity && parent.capacity
        && snapshot.capacity.state !== parent.capacity.state
        && snapshot.capacity.state.endsWith(improves ? '_adequate' : '_insufficient')) {
        return [{ role: 'capacity' as const, improves, refs: [...prior.factIds, ...root.factIds, ...snapshot.capacity.evidenceIds] }]
      }
      const roles = snapshot.roleEngine.roleHistory.filter(role => role.entityId === root.entityId)
      if (roles.some(role => role.role === 'Byeong') && roles.some(role => role.role === 'YongShen')) return []
      for (const role of roles) {
        const latest = snapshot.roleEngine.currentRoles.find(item => item.roleId === role.roleId)
        const previous = parent.roleEngine.currentRoles.find(item => item.roleId === role.roleId)
        if (!latest || !previous || !(improves ? latest.currentFunction === 'operating' && previous.currentFunction === 'reduced'
          : latest.currentFunction === 'reduced' && previous.currentFunction === 'operating')) continue
        const kind = role.role === 'YongShen' ? 'main' : role.role === 'SangShen' ? 'support' : role.role === 'Byeong' ? 'pressure' : undefined
        if (kind) return [{ role: kind, improves, refs: [...prior.factIds, ...root.factIds, ...previous.pathRefs, ...latest.pathRefs] }]
      }
      return []
    })
    const roleDeltas = snapshot.roleEngine.roleHistory.flatMap(role => {
      const to = snapshot.roleEngine.currentRoles.find(item => item.roleId === role.roleId)
      const priorRoles = parent.roleEngine.roleHistory.filter(item => item.entityId === role.entityId && item.role === role.role)
      const exact = parent.roleEngine.currentRoles.find(item => item.roleId === role.roleId)
      const from = exact ?? (priorRoles.length === 1
        ? parent.roleEngine.currentRoles.find(item => item.roleId === priorRoles[0].roleId) : undefined)
      const context = role.role === 'SangShen' || role.role === 'GuEung' ? 'support'
        : role.role === 'Byeong' ? 'pressure' : role.role === 'YongShen' ? 'main' : undefined
      if (!context || !from || !to || from.currentFunction === to.currentFunction
        || !['operating', 'reduced', 'inactive'].includes(from.currentFunction)
        || !['operating', 'reduced', 'inactive'].includes(to.currentFunction)
        || !from.pathRefs.length || !to.pathRefs.length) return []
      const branch = snapshot.branchContexts.find(item => item.id === role.entityId)
      const participant = snapshot.stemFacts.flatMap(item => [item.source, item.target]).find(item => item.id === role.entityId)
      const god = actors.get(role.entityId)?.tenGod ?? branch?.tenGod ?? participant?.tenGod
      return [{ context, from: from.currentFunction, to: to.currentFunction, entity: role.entityId, subject: god && functionalLabels[god],
        refs: [...from.pathRefs, ...to.pathRefs] }] as const
    })
    const incoming = snapshot.actualFunctions.flatMap(actual => {
      const relation = [...snapshot.stemFacts, ...snapshot.patternFacts].find(item => item.id === actual.relationFactId)
      if (!relation || !actual.structuralEffect?.currentlyEffective || actual.structuralEffect.inherited
        || actual.structuralEffect.originScope !== snapshot.scope
        || !['operating', 'reduced'].includes(actual.function)) return []
      const sourceIsNew = relation.source.scope === snapshot.scope && relation.target.scope !== snapshot.scope
      if (!sourceIsNew) return []
      const subject = functionalLabels[relation.source.dayMaster ? 'day_master' : relation.source.tenGod]
      const affected = functionalLabels[relation.target.dayMaster ? 'day_master' : relation.target.tenGod]
      const effect = actual.direction === 'unfavorable' && actual.byeongCandidate ? 'burden'
        : ['favorable', 'favorable_auxiliary', 'favorable_priority'].includes(actual.direction)
          ? relation.action === 'control' ? actual.function === 'reduced' ? 'limited_control' : 'control'
            : relation.action === 'generate' ? actual.function === 'reduced' ? 'limited' : 'support' : undefined
          : undefined
      return effect && subject && affected ? [{ effect, subject, affected,
        refs: [relation.id, ...(actual.conditionEvidence ?? []), ...(actual.resolutionEvidence ?? [])] }] as const : []
    })
    const changes = snapshot.roleEngine.damagePaths.flatMap(path => {
      const prior = parent.roleEngine.damagePaths.find(item => item.sourceEntityId === path.sourceEntityId
        && item.targetEntityId === path.targetEntityId && item.damagedFunction === path.damagedFunction)
      return prior && ((prior.state === 'active' && path.state === 'weakened')
        || (prior.state === 'weakened' && path.state === 'active')) ? [{ prior, path }] : []
    })
    const shift = !comparison && changes.length && changes.every(item => item.path.state === changes[0].path.state)
      ? changes[0].path.state === 'weakened' ? 'eased' : 'returned' : undefined
    const damage = shift && changes.every(item => item.path.damagedFunction === changes[0].path.damagedFunction)
      ? changes[0].path.damagedFunction : undefined
    const shiftSubject = damage === 'branch_food' ? 'output'
      : damage === 'day_master' || damage === 'branch_killing_protection' ? 'responsibility'
        : damage === 'branch_wealth' || damage === 'branch_wealth_capacity' ? 'resources' : undefined
    if (stemReason || branchReason || shift || roleChanges.length || roleDeltas.length || incoming.length) add(snapshot, snapshot.id,
      { kind: 'axis', chapter: comparison === 'next' ? 'CR-08' : evaluatedWindow ? 'CR-09' : 'CR-04', stem: stemReason, branch: branchReason,
        comparison, shift, shiftSubject, evaluatedWindow,
        reasons: uniqueIds([...(stem.grade ? stem.reasonCodes : []), ...(branch.grade ? branch.reasonCodes : [])]),
        changeIdentity: JSON.stringify([
          snapshot.roleEngine.damagePaths.filter(path => path.state === 'active' || path.state === 'weakened')
            .map(path => [path.sourceEntityId, path.targetEntityId, path.damagedFunction, path.state].join(':')).sort(),
          roleDeltas.map(delta => [delta.entity, delta.context, delta.from, delta.to].join(':')).sort(),
          incoming.map(item => [item.effect, item.subject, item.affected].join(':')).sort(),
          snapshot.roleEngine.resolutionPaths.map(path => path.remedyEntityId).sort(),
        ]),
        changes: roleDeltas.map(({ context, from, to, subject }) => ({ context, from, to, subject })),
        incoming: incoming.map(({ effect, subject, affected }) => ({ effect, subject, affected })),
        rootChanges: roleChanges.map(({ role, improves }) => ({ role, improves })) },
      [...evidenceRefs, ...roleChanges.flatMap(change => change.refs), ...roleDeltas.flatMap(change => change.refs),
        ...incoming.flatMap(item => item.refs),
        ...(shift ? changes.flatMap(({ prior, path }) => [parent.id, ...prior.relationRefs, ...path.relationRefs]) : [])])
  }
}

export type StructuralExplanationOutcome = MoneyOutcomeFact | RelationshipOutcomeFact | WorkStudyOutcomeFact
export type StructuralExplanationDomain = StructuralExplanationOutcome['domain']
export type StructuralCausePathRole = 'primary' | 'supporting' | 'competing'

export interface StructuralFunctionalChange {
  readonly id: string
  readonly actorId: string | null
  readonly relationId: string
  readonly relation: string
  readonly targetId: string | null
  readonly participantIds: readonly string[]
  readonly actorTenGod?: string
  readonly targetTenGod?: string
  readonly actorPosition?: StemRelationFact['source']['position']
  readonly targetPosition?: StemRelationFact['target']['position']
  readonly rootRefs?: readonly string[]
  readonly actorRootState?: ActualStructuralFunction['rootEvidence'][number]['state']
  readonly branchRelationRefs?: readonly string[]
  readonly branchParticipants?: readonly { readonly id: string; readonly branch: string; readonly position?: string; readonly tenGod?: string }[]
  readonly actualEffect: ActualStructuralFunction['function'] | 'not_evaluated'
  readonly direction: ActualStructuralFunction['direction']
  readonly policyId: string | null
  readonly roleStateIds: readonly string[]
  readonly effectIds: readonly string[]
  readonly protectionRefs: readonly string[]
  readonly damageRefs: readonly string[]
  readonly provenanceIds: readonly string[]
}

export interface StructuralCausePath {
  readonly id: string
  readonly role: StructuralCausePathRole
  readonly relationIds: readonly string[]
  readonly participantIds: readonly string[]
  readonly functionalChangeIds: readonly string[]
  readonly sourceIds: readonly string[]
}

export interface StructuralExplanationUnit {
  readonly id: string
  readonly outcomeFactId: string
  readonly domain: StructuralExplanationDomain
  readonly target: { readonly id: string; readonly referent: string }
  readonly direction: 'favorable' | 'unfavorable' | 'unknown'
  readonly certainty: StructuralExplanationOutcome['certainty']
  readonly primaryCauseRefs: readonly string[]
  readonly unresolvedCauseRefs: readonly string[]
  readonly supportingCauseRefs: readonly string[]
  readonly competingCauseRefs: readonly string[]
  readonly causePaths: readonly StructuralCausePath[]
  readonly functionalChanges: readonly StructuralFunctionalChange[]
  readonly palaceAttribution?: { readonly referent: 'partner'; readonly palaceEntityId: string; readonly sourceIds: readonly string[] }
  readonly experiencedProcess?: { readonly result: string; readonly sourceIds: readonly string[] }
  readonly recommendedDirection?: { readonly value: string; readonly sourceIds: readonly string[] }
  readonly scope: ReadingScope
  readonly scopeId: string
  readonly period?: StructuralExplanationOutcome['period']
  readonly provenanceIds: readonly string[]
}

const sourceDirection = (fact: StructuralExplanationOutcome): StructuralExplanationUnit['direction'] => {
  if ('direction' in fact) return fact.direction === 'deferred' ? 'unknown' : fact.direction
  if (fact.semanticType === 'relationship_formation') return 'favorable'
  if (fact.semanticType === 'relationship_pressure') return 'unfavorable'
  return 'unknown'
}

const relationRecords = (snapshot: LuckScopeState) => [
  ...snapshot.stemFacts,
  ...snapshot.patternFacts.filter((item): item is StemRelationFact => item.action !== 'coexist'),
  ...(snapshot.inheritedRoleFunctions ?? []).map(({ fact }) => fact),
] as const

function resolveSnapshot(outcome: StructuralExplanationOutcome, snapshots: readonly LuckScopeState[]) {
  return snapshots.find(snapshot => snapshot.id === outcome.scopeId
    && outcome.sourceJudgmentIds.includes(snapshot.id))
}

function toFunctionalChange(snapshot: LuckScopeState, relation: StemRelationFact,
  actual: ActualStructuralFunction): StructuralFunctionalChange {
  const ids = new Set([relation.id, ...(actual.conditionEvidence ?? []), ...(actual.resolutionEvidence ?? [])])
  const roles = snapshot.roleEngine.currentRoles.filter(role => role.pathRefs.some(ref => ids.has(ref)))
  const historyIds = snapshot.roleEngine.roleHistory.filter(role => roles.some(current => current.roleId === role.roleId))
    .map(role => role.roleId)
  const effects = snapshot.luckEffectStates.filter(state => state.event.evidenceRefs.some(ref => ids.has(ref)))
    .map(state => state.event.id)
  const protectedRefs = actual.structuralEffect?.blockedBy?.kind === 'active_protection'
    ? actual.structuralEffect.blockedBy.evidenceRefs : []
  const damageRefs = snapshot.policyRoles.byeong.filter(role => role.relationFactIds.includes(relation.id))
    .flatMap(role => [role.id, ...role.relationFactIds])
  const localDamage = (snapshot.roleEngine.damagePaths ?? []).filter(path => path.relationRefs.includes(relation.id) && path.state !== 'conditional')
  const resolutions = (snapshot.roleEngine.resolutionPaths ?? []).filter(path => path.relationRefs.includes(relation.id))
  const linkedRoots = (snapshot.rootFacts ?? []).filter(({ stemEntityId }) => stemEntityId === relation.source.id || stemEntityId === relation.target.id)
  const rootBranches = new Set(linkedRoots.map(({ branchEntityId }) => branchEntityId))
  const branchRefs = snapshot.branchFacts.filter(({ participants }) => participants.every(id => rootBranches.has(id)))
    .map(({ id }) => id)
  const rootRefs = uniqueIds([...linkedRoots.map(({ id }) => id), ...actual.formationEvidence])
  const protectionRefs = uniqueIds([...protectedRefs, ...resolutions.flatMap(({ relationRefs }) => relationRefs)])
  const allDamageRefs = uniqueIds([...damageRefs, ...localDamage.flatMap(({ relationRefs }) => relationRefs)])
  const provenanceIds = uniqueIds([relation.id, actual.relationFactId, actual.patternContextId,
    ...(actual.ruleId ? [actual.ruleId] : []), ...(actual.conditionEvidence ?? []),
    ...(actual.resolutionEvidence ?? []), ...historyIds, ...effects, ...protectionRefs, ...allDamageRefs, ...rootRefs, ...branchRefs])
  return {
    id: `structural-function:${JSON.stringify([snapshot.id, relation.id, actual.policyId, actual.function])}`,
    actorId: relation.source.id, relationId: relation.id, relation: relation.action,
    targetId: relation.target.id, participantIds: uniqueIds([relation.source.id, relation.target.id]),
    actorTenGod: relation.source.tenGod, targetTenGod: relation.target.tenGod,
    actorPosition: relation.source.position, targetPosition: relation.target.position, rootRefs, branchRelationRefs: uniqueIds(branchRefs),
    actorRootState: actual.rootEvidence.find(({ entityId }) => entityId === relation.source.id)?.state,
    actualEffect: actual.function, direction: actual.direction, policyId: actual.policyId,
    roleStateIds: uniqueIds(historyIds), effectIds: uniqueIds(effects),
    protectionRefs, damageRefs: allDamageRefs, provenanceIds,
  }
}

function branchFunctionalChanges(snapshot: LuckScopeState, relationIds: readonly string[], outcome: StructuralExplanationOutcome) {
  return snapshot.branchFacts.filter(relation => relationIds.includes(relation.id)).map(relation => {
    const participants = uniqueIds(relation.participants)
    const effects = snapshot.luckEffectStates.filter(state => state.event.sourceRelationFactId === relation.id)
      .map(state => state.event.id)
    const provenanceIds = uniqueIds([relation.id, ...participants, ...effects, ...outcome.provenance])
    const relationEffect = snapshot.branchRelationEffects?.find(effect => effect.relationId === relation.id)
    const branchParticipants = (snapshot.branchContexts ?? snapshot.formationBranchPool).filter(({ id }) => participants.includes(id))
    return {
      id: `structural-function:${JSON.stringify([snapshot.id, relation.id, outcome.lifecycle])}`,
      actorId: null, relationId: relation.id, relation: relation.kind, targetId: null,
      participantIds: participants, branchParticipants,
      actualEffect: relationEffect?.effect === 'mitigated' ? 'reduced' as const
        : relationEffect?.effect === 'active' ? 'operating' as const : 'not_evaluated' as const, direction: 'deferred' as const,
      policyId: null, roleStateIds: [], effectIds: uniqueIds(effects), protectionRefs: [], damageRefs: [], provenanceIds,
    }
  })
}

function connectedRelationIds(primaryIds: readonly string[], records: readonly StemRelationFact[]) {
  const selected = new Set(primaryIds)
  const participants = new Set(records.filter(item => selected.has(item.id)).flatMap(item => [item.source.id, item.target.id]))
  let changed = true
  while (changed) {
    changed = false
    for (const relation of records) {
      if (!selected.has(relation.id) && (participants.has(relation.source.id) || participants.has(relation.target.id))) {
        selected.add(relation.id)
        participants.add(relation.source.id)
        participants.add(relation.target.id)
        changed = true
      }
    }
  }
  return { relationIds: [...selected].sort(compare), participantIds: [...participants].sort(compare) }
}

function supportedPalaceAttribution(fact: RelationshipOutcomeFact, snapshot: LuckScopeState,
  changes: readonly StructuralFunctionalChange[]) {
  if (fact.semanticType !== 'relationship_formation'
    || !fact.provenance.includes('A:I-22') || !fact.provenance.includes('A:OP-R03')) return undefined
  const favorablePathIds = new Set(changes.filter(change => change.participantIds.some(id => fact.sourceParticipantIds.includes(id))
    && change.direction === 'favorable' && ['operating', 'reduced'].includes(change.actualEffect)
    && change.provenanceIds.some(id => id.startsWith('structural-role:'))).flatMap(change => [change.relationId, ...change.provenanceIds]))
  // Actual StructuralFunction records are also accepted when the product projector's
  // role history is linked through source IDs on the same participant path.
  const participantPath = [...snapshot.stemFacts, ...snapshot.patternFacts].filter(relation =>
    fact.sourceParticipantIds.includes(relation.source.id) || fact.sourceParticipantIds.includes(relation.target.id))
    .filter(relation => {
      const actual = snapshot.actualFunctions.find(item => item.relationFactId === relation.id)
      return actual && actual.direction === 'favorable' && ['operating', 'reduced'].includes(actual.function)
        && actual.structuralEffect?.currentlyEffective
    })
  participantPath.forEach(relation => {
    favorablePathIds.add(relation.id)
    const actual = snapshot.actualFunctions.find(item => item.relationFactId === relation.id)
    if (actual?.ruleId) favorablePathIds.add(actual.ruleId)
    if (actual?.policyId) favorablePathIds.add(actual.policyId)
    snapshot.roleEngine.currentRoles.filter(role => role.pathRefs.includes(relation.id)
      && ['operating', 'favorable'].includes(role.currentFunction) && ['active', 'weakened'].includes(role.currentState))
      .forEach(role => favorablePathIds.add(role.roleId))
  })
  if (!participantPath.length || !favorablePathIds.size) return undefined
  const palace = snapshot.formationBranchPool.find(item => fact.sourceParticipantIds.includes(item.id)
    && item.scope === 'natal' && snapshot.branchFacts.some(relation => relation.participants.includes(item.id)
      && fact.sourceRelationIds.includes(relation.id)))
  return palace ? {
    referent: 'partner' as const, palaceEntityId: palace.id,
    sourceIds: uniqueIds([fact.id, ...fact.sourceParticipantIds, ...fact.sourceRelationIds,
      ...fact.provenance.filter(id => id === 'A:I-22' || id === 'A:OP-R03'), ...favorablePathIds]),
  } : undefined
}

/** Projects existing outcome and Judgment IDs; it does not evaluate or alter either engine. */
export function buildStructuralExplanationUnits(
  outcomes: readonly StructuralExplanationOutcome[], snapshots: readonly LuckScopeState[],
): readonly StructuralExplanationUnit[] {
  const units: StructuralExplanationUnit[] = []
  for (const outcome of [...outcomes].sort((a, b) => compare(a.id, b.id))) {
    const snapshot = resolveSnapshot(outcome, snapshots)
    const records = snapshot ? relationRecords(snapshot) : []
    const branchRecords = snapshot?.branchFacts ?? []
    const branchActionRecords = snapshot?.branchDamage?.relations ?? []
    const primaryIds = uniqueIds(outcome.sourceRelationIds)
    const unresolvedCauseRefs = primaryIds.filter(id =>
      !records.some(relation => relation.id === id) && !branchRecords.some(relation => relation.id === id)
      && !branchActionRecords.some(relation => relation.id === id))
    const connected = 'target' in outcome ? { relationIds: primaryIds }
      : connectedRelationIds(primaryIds.filter(id => records.some(relation => relation.id === id)), records)
    const actualById = new Map([...(snapshot?.actualFunctions ?? []), ...(snapshot?.inheritedRoleFunctions ?? []).map(({ actual }) => actual)]
      .map(actual => [actual.relationFactId, actual]))
    const stemChanges = snapshot ? records.filter(relation => connected.relationIds.includes(relation.id))
      .flatMap(relation => {
        const actual = actualById.get(relation.id)
        return actual ? [toFunctionalChange(snapshot, relation, actual)] : []
      }).sort((a, b) => compare(a.id, b.id)) : []
    const branchActionChanges: StructuralFunctionalChange[] = branchActionRecords.filter(relation => primaryIds.includes(relation.id)).map(relation => {
      const damage = snapshot?.branchDamage.paths.find(path => path.relationRefs[0] === relation.id)
      const protection = snapshot?.branchDamage.protectivePaths.find(path => path.relationRefs.includes(relation.id))
      const participantIds = [relation.source.id, relation.target.id]
      return {
        id: `structural-function:${JSON.stringify([snapshot?.id, relation.id])}`, relationId: relation.id, relation: relation.action,
        actorId: relation.source.id, targetId: relation.target.id, participantIds,
        actorTenGod: relation.source.god, targetTenGod: relation.target.god,
        branchParticipants: snapshot?.branchContexts.filter(({ id }) => participantIds.includes(id)),
        actualEffect: damage?.state === 'weakened' ? 'reduced' : relation.confirmed ? 'operating' : 'deferred',
        direction: damage ? 'unfavorable' : 'deferred', policyId: null, roleStateIds: [], effectIds: [],
        protectionRefs: protection?.relationRefs ?? damage?.protection?.relationRefs ?? [],
        damageRefs: damage?.relationRefs ?? [], provenanceIds: uniqueIds([relation.id, ...relation.evidenceRefs]),
      }
    })
    let changes = [...stemChanges, ...branchActionChanges, ...(snapshot ? branchFunctionalChanges(snapshot,
      primaryIds.filter(id => branchRecords.some(relation => relation.id === id)), outcome) : [])]
      .sort((a, b) => compare(a.id, b.id))
    if (snapshot && 'semanticType' in outcome && outcome.semanticType === 'relationship_formation') {
      const qualifying = records.filter(relation => outcome.sourceParticipantIds.includes(relation.source.id)
        || outcome.sourceParticipantIds.includes(relation.target.id)).flatMap(relation => {
        const actual = actualById.get(relation.id)
        return actual?.structuralEffect?.currentlyEffective && actual.direction === 'favorable'
          && ['operating', 'reduced'].includes(actual.function) ? [toFunctionalChange(snapshot, relation, actual)] : []
      })
      changes = [...new Map([...changes, ...qualifying].map(change => [change.id, change])).values()]
        .sort((a, b) => compare(a.id, b.id))
    }
    const primaryDirection = sourceDirection(outcome)
    const supporting = changes.filter(change => !primaryIds.includes(change.relationId)
      && change.direction === primaryDirection).map(change => change.relationId)
    const competing = changes.filter(change => !primaryIds.includes(change.relationId)
      && change.direction !== primaryDirection && change.direction !== 'deferred').map(change => change.relationId)
    const pathIds = uniqueIds([...primaryIds, ...supporting, ...competing])
    const causePaths = pathIds.map(relationId => {
      const change = changes.find(item => item.relationId === relationId)
      const role: StructuralCausePathRole = primaryIds.includes(relationId) ? 'primary'
        : competing.includes(relationId) ? 'competing' : 'supporting'
      const refs = uniqueIds([relationId, ...(change?.provenanceIds ?? [])])
      return { id: `cause-path:${JSON.stringify([outcome.id, role, relationId])}`, role,
        relationIds: [relationId], participantIds: change?.participantIds ?? [],
        functionalChangeIds: change ? [change.id] : [], sourceIds: refs }
    }).sort((a, b) => compare(a.role, b.role) || compare(a.id, b.id))
    const palaceAttribution = snapshot && 'semanticType' in outcome && outcome.domain === 'relationship'
      ? supportedPalaceAttribution(outcome as RelationshipOutcomeFact, snapshot, changes) : undefined
    const targetId = 'target' in outcome ? outcome.target.targetId : 'wealthEntityId' in outcome ? outcome.wealthEntityId : 'close_relationship'
    const targetReferent = 'target' in outcome ? outcome.target.kind : outcome.domain === 'money' ? 'money' : 'close_relationship'
    const direction = primaryDirection
    const processType = 'semanticType' in outcome ? String(outcome.semanticType) : ''
    const experiencedProcess = processType === 'relationship_pressure' || processType === 'money_related_problem'
      ? { result: 'result' in outcome ? String(outcome.result) : processType,
        sourceIds: uniqueIds([outcome.id, ...outcome.sourceJudgmentIds, ...outcome.sourceRelationIds, ...outcome.provenance]) }
      : undefined
    const provenanceIds = uniqueIds([outcome.id, ...outcome.sourceJudgmentIds, ...outcome.sourceRelationIds,
      ...outcome.sourceRoleIds, ...outcome.sourceLuckEffectIds, ...outcome.sourceParticipantIds,
      ...outcome.provenance, ...changes.flatMap(item => item.provenanceIds),
      ...(palaceAttribution?.sourceIds ?? [])])
    units.push({
      id: `explanation:${JSON.stringify([outcome.id, outcome.domain, outcome.scopeId, outcome.period?.periodId ?? null])}`,
      outcomeFactId: outcome.id, domain: outcome.domain, target: { id: targetId, referent: targetReferent },
      direction, certainty: outcome.certainty, primaryCauseRefs: primaryIds,
      unresolvedCauseRefs,
      supportingCauseRefs: uniqueIds(supporting), competingCauseRefs: uniqueIds(competing),
      causePaths, functionalChanges: changes,
      ...(palaceAttribution && { palaceAttribution }),
      ...(experiencedProcess && { experiencedProcess }),
      scope: outcome.scope, scopeId: outcome.scopeId, ...(outcome.period && { period: outcome.period }), provenanceIds,
    })
  }
  const dedup = new Map<string, StructuralExplanationUnit>()
  for (const unit of units) {
    const key = JSON.stringify([unit.outcomeFactId, unit.target.id, unit.primaryCauseRefs,
      unit.scope, bounds(unit.period)])
    const previous = dedup.get(key)
    if (previous && JSON.stringify(previous) !== JSON.stringify(unit)) throw new TypeError(`Conflicting StructuralExplanationUnit: ${unit.id}`)
    dedup.set(key, unit)
  }
  return [...dedup.values()].sort((a, b) => compare(a.id, b.id))
}
