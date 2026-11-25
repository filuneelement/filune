import type { StructuralExplanationUnit } from '../structuralExplanation'
import type { CustomerReadingLocale } from './customerLanguage'
import type { CustomerReadingParagraphPlan } from './types'

type Copy = Record<CustomerReadingLocale, string>
const positions: Record<string, Copy> = {
  year: { ko: '태어난 해를 나타내는 윗자리', ja: '生まれ年を示す上の位置', en: 'the upper position assigned to the birth year' },
  month: { ko: '태어난 달을 나타내는 윗자리', ja: '生まれ月を示す上の位置', en: 'the upper position assigned to the birth month' },
  time: { ko: '태어난 시각을 나타내는 윗자리', ja: '生まれた時刻を示す上の位置', en: 'the upper position assigned to the birth hour' },
  day: { ko: '본인을 나타내는 자리', ja: '本人を表す位置', en: 'the position that represents you' },
}
const producer: Record<string, Copy> = {
  食神: { ko: '익힌 기술을 구체화하는 힘', ja: '身につけた技術を形にする力', en: 'the ability to turn practiced skills into output' },
  傷官: { ko: '착상과 표현을 구체화하는 힘', ja: '着想や表現を形にする力', en: 'the ability to turn ideas and expression into output' },
}
const wealth = new Set(['偏財', '正財'])

export function describeCustomerCause(plan: CustomerReadingParagraphPlan,
  explanations: ReadonlyMap<string, StructuralExplanationUnit>, locale: CustomerReadingLocale) {
  const expression = plan.expression
  if (plan.reasonStatus !== 'complete' || (expression.kind !== 'outcome' && expression.kind !== 'work_study')) return undefined
  const sources = (expression.structuralExplanationUnitIds ?? []).flatMap(id => {
    const unit = explanations.get(id)
    return unit && plan.sourceOutcomeIds.includes(unit.outcomeFactId) && unit.scope === plan.scope
      && (!unit.period || unit.period.periodId === plan.periodRef) ? [unit] : []
  })
  const primary = sources.flatMap(unit => unit.functionalChanges.filter(change =>
    unit.primaryCauseRefs.includes(change.relationId) && (change.actualEffect === 'operating' || change.actualEffect === 'reduced')))

  if ((expression.kind === 'outcome' && ['skill', 'expression'].includes(expression.voice))
    || (expression.kind === 'work_study' && expression.cause === 'output_to_wealth')) {
    const path = primary.find(change => change.relation === 'generate'
      && ['favorable', 'favorable_auxiliary', 'favorable_candidate'].includes(change.direction)
      && producer[change.actorTenGod ?? ''] && wealth.has(change.targetTenGod ?? '')
      && positions[change.actorPosition ?? ''] && positions[change.targetPosition ?? ''])
    if (path) {
      const support = plan.scope === 'natal' && path.rootRefs?.length && ['present', 'strengthened'].includes(path.actorRootState ?? '')
        ? {
          ko: ' 만드는 기능에는 태어날 때부터 받쳐 주는 근거가 있습니다. 이 바탕과 시기에 따라 새로 생기는 기회는 따로 볼 수 있습니다.',
          ja: ' 形にする力には、生まれ持った支えがあります。その土台と、時期によって新しく生まれる機会は分けて見られます。',
          en: ' The ability to produce has support in your birth chart. That underlying capacity and opportunities arising in a particular period can be assessed separately.',
        }[locale] : ''
      return support.trim() || undefined
    }
  }
  if (expression.kind === 'outcome' && expression.voice === 'pressure') {
    const feed = primary.find(change => change.relation === 'generate' && wealth.has(change.actorTenGod ?? '')
      && change.targetTenGod === '偏官' && positions[change.actorPosition ?? ''] && positions[change.targetPosition ?? ''])
    if (feed) {
      const reduced = primary.some(change => change.relation === 'control' && change.actorId === feed.targetId
        && change.actualEffect === 'reduced' && change.protectionRefs.length > 0 && change.damageRefs.length > 0)
      const residual = reduced ? {
        ko: ' 부담을 덜어 주는 기능은 작동하지만, 제약도 일부 남습니다. 일이 커질 때는 부담을 줄이는 방식이 계속 작동하는지도 함께 확인할 만합니다.',
        ja: ' 負担を和らげる働きはありますが、制約も一部残ります。活動が広がるときには、負担を抑える方法がそのまま働くかも確かめられます。',
        en: ' A protective influence eases some of the pressure, and some remains. If the activity expands, check whether the same means of limiting the strain still works.',
      }[locale] : ''
      return {
        ko: '수익에 대한 기대만큼 실제로 맡을 책임도 늘어나는 경로입니다. 들어오는 몫을 검토할 때는 그 일을 끝까지 책임질 범위도 함께 정하는 편이 좋습니다.',
        ja: '収益への期待とともに、実際に引き受ける責任も増える経路です。入ってくる分を検討するときは、最後まで責任を負える範囲も決めておくと役立ちます。',
        en: 'The prospect of earnings can also increase the responsibility you take on. When considering what could come in, decide how much of the work you can carry through to the end.',
      }[locale] + residual
    }
  }
  if (expression.kind === 'outcome' && ['contact', 'change', 'formation'].includes(expression.voice)) {
    const path = sources.flatMap(unit => unit.palaceAttribution ? unit.functionalChanges.filter(change =>
      unit.primaryCauseRefs.includes(change.relationId) && change.branchParticipants?.length
      && change.branchParticipants.some(item => item.id === unit.palaceAttribution?.palaceEntityId)
      && ['operating', 'reduced'].includes(change.actualEffect)) : []).find(change =>
      change.branchParticipants!.every(item => /^[子丑寅卯辰巳午未申酉戌亥]$/u.test(item.branch)))
    if (path) {
      if (path.relation === 'clash') {
        if (path.actualEffect === 'reduced') return {
          ko: '이 시기의 변화 압력이 가까운 관계를 보는 출생일의 아랫자리에 닿지만, 그 작용은 약해져 있습니다. 함께 정해 두었던 일정이나 역할에 조정이 생기더라도, 어느 부분까지 바뀌는지에 따라 관계에 닿는 범위가 달라집니다.',
          ja: 'この時期の変化は、親しい関係を見る生まれ日の下の位置に届きますが、その作用は和らいでいます。一緒に決めた予定や役割を調整する場面でも、どこまで変わるかによって関係への影響は異なります。',
          en: 'The pressure for change reaches the lower position assigned to the birth day, which concerns close relationships, and its effect is reduced. If shared plans or roles need adjustment, the extent of that adjustment matters for how much of the relationship it touches.',
        }[locale]
        return {
          ko: '이 시기의 변화 압력이 가까운 관계를 보는 출생일의 아랫자리에 직접 닿습니다. 함께 정해 둔 일정이나 역할을 다시 맞춰야 하는 경우처럼, 기존 관계에서 무엇을 다시 조율해야 하는지를 살필 수 있는 구간입니다.',
          ja: 'この時期の変化は、親しい関係を見る生まれ日の下の位置に直接届きます。一緒に決めた予定や役割を調整するときのように、今の関係で何をすり合わせる必要があるかを見られる時期です。',
          en: 'The pressure for change reaches the lower position assigned to the birth day, which concerns close relationships. If shared plans or roles need review, this period can help show what the existing relationship needs to renegotiate.',
        }[locale]
      }
      if (path.relation === 'six_combination' && path.actualEffect === 'operating') return {
        ko: '이 시기에 들어오는 작용이 가까운 관계를 보는 출생일의 아랫자리와 이어집니다. 같은 자리에 참여하거나 함께 할 일이 생기는 것처럼 접점이 구체화되는지를 먼저 살필 수 있습니다.',
        ja: 'この時期に加わる働きが、親しい関係を見る生まれ日の下の位置とつながります。同じ場に参加したり一緒に取り組むことが生まれたりするなど、接点が具体的になるかを先に見られます。',
        en: 'An influence arriving in this period links with the lower position assigned to the birth day, which concerns close relationships. The first thing to look for is a concrete point of contact, such as taking part in the same setting or having something to do together.',
      }[locale]
      return {
        ko: '이 기간에 들어온 작용이 태어난 날의 아랫자리, 곧 가까운 관계를 살피는 자리에 직접 닿습니다. 상대와 실제로 접점이 생기는지부터 살펴볼 만합니다.',
        ja: 'この時期に加わる働きは、親しい関係を見る生まれ日の下の位置に直接届きます。相手との接点が実際に生まれるかを確かめられます。',
        en: 'The influence arriving in this period reaches the lower position assigned to the birth day, where this reading examines close relationships. The first thing to check is whether actual contact takes shape.',
      }[locale]
    }
  }
  return undefined
}
