import type { NatalPersonalityResult } from '../../personality/types'
import { isCustomerSafeKo } from '../../personality/render/ko/guardrails'
import { traitPhrase } from '../../personality/render/ko/wording'
import type { buildCustomerReadingPlan } from './buildCustomerReadingPlan'
import { chapterTargets, type CustomerChapterId, type CustomerReadingParagraphPlan, type OutcomeVoice } from './types'

const titles: Record<CustomerChapterId, string> = {
  'CR-01': '나의 기본 성향',
  'CR-02': '나의 강점',
  'CR-03': '반복되는 행동 패턴',
  'CR-05': '왜 관계에서 비슷한 일이 반복되는가',
  'CR-07': '돈을 만드는 방식과 돈을 지키는 힘',
}

// These entries express approved individual facts in context. Their keys are
// selected upstream by fact ID. The renderer never searches for an alternative.
const traitCopy = new Map<string, string>([
  ['core:자기 결과물에 엄격함', '스스로 해낸 일에 엄격한 기준을 적용하는 편입니다. 함께 만든 결과를 살필 때도, 자신의 몫을 돌아보며 무엇이 본인의 기준에 닿았고 무엇이 부족한지 세심하게 따져 보는 모습으로 읽힙니다.'],
  ['outward:차분하고 성실한 태도', '사람들과 어울리는 자리에서는 차분하고 꾸준한 태도가 먼저 전해질 수 있습니다. 첫인상에서 강하게 존재감을 드러내기보다는, 맡은 일을 같은 방식으로 이어 가는 모습이 더 잘 보이는 쪽입니다.'],
  ['outward:넓고 활발한 교류', '밖에서는 비교적 넓은 범위의 사람들과 활발히 어울리는 모습이 먼저 보일 수 있습니다. 이미 가까운 사람만 찾기보다 새로 말을 나눌 접점에도 열려 있는 모습입니다.'],
  ['decision:조언을 들어도 스스로 납득한 뒤 움직임', '조언을 받아도 결정은 한 번 더 자신의 기준을 통과해야 합니다. 예를 들어 두 가지 제안을 놓고 있다면 다른 사람이 골라 준 쪽을 곧바로 따르기보다, 어느 쪽이 자신의 판단 기준에 들어맞는지 따져 볼 수 있습니다.'],
  ['decision:타당성을 스스로 확인하고 움직임', '어떤 제안이 좋아 보여도 그 이유가 타당한지 스스로 확인한 뒤에 움직이는 편으로 읽힙니다. 판단 기준이 모호한 제안보다 무엇을 근거로 삼을지 분명한 제안을 검토하기 쉽습니다.'],
  ['information:정보를 비판적으로 선별함', '새로운 정보를 접하면 그 안에서 받아들일 것과 더 확인할 것을 가르는 편으로 읽힙니다. 설명이 길거나 자료가 많더라도 전부를 같은 무게로 받아들이기보다, 판단에 쓸 근거를 선별하는 과정에 힘이 실립니다.'],
  ['relationship:때와 장소를 가려 의견을 내고 공적인 일과 사적인 일을 구분함', '가까운 사이라도 의견을 꺼내는 때와 자리를 가려 보는 편입니다. 의견이 같아도 공개적으로 논의할 일과 따로 나눌 이야기를 구분할 수 있습니다. 관계의 친밀함과 그 자리에서 해야 할 말을 각각 판단하는 기질입니다.'],
  ['relationship:배려와 재능 나눔이 가까운 범위에 집중됨', '도움이나 배려는 가까운 사람에게 더 많이 돌아가는 쪽으로 읽힙니다. 친밀해진 뒤에는 두루 안부를 나누는 것보다, 익숙한 사람이 필요로 하는 일에 시간과 힘을 쓰는 방식에 가깝습니다.'],
  ['relationship:가까운 사람과 신뢰를 차곡차곡 쌓음', '가까운 사람과의 신뢰는 작은 접촉을 이어 가며 쌓는 편입니다. 한 차례의 강한 인상보다 말을 나눈 뒤의 태도가 꾸준한지, 주고받는 약속이 계속 이어지는지를 통해 관계가 자리 잡을 수 있습니다.'],
  ['relationship:수평적인 대화와 동등한 대우를 중시함', '관계에서 서로의 의견에 같은 무게가 실리는 대화를 중요하게 여기는 편입니다. 결정을 앞두고 한 사람이 일방적으로 정하는 상황보다, 각자가 따로 생각할 수 있는 여지가 있을 때 의견을 나누기 수월할 수 있습니다.'],
  ['relationship:교류의 폭이 넓지만 기준을 넘으면 단호하게 선을 그음', '사람을 폭넓게 받아들이는 모습과 관계의 경계를 분명히 하는 모습이 함께 읽힙니다. 편하게 어울리더라도 본인이 중요하게 보는 기준을 넘는 상황에서는 받아들일 수 있는 범위를 단호하게 정할 수 있습니다.'],
  ['problem:분석력', '여러 조건이 한꺼번에 들어온 문제를 살피고 세부를 나누는 데 힘을 쓸 수 있습니다. 예를 들어 자료마다 결론이 다르면 어느 부분에서 판단의 근거가 갈리는지 살피는 일에 분석력이 쓰입니다.'],
  ['problem:위기 돌파', '진행이 막혔을 때도 풀어야 할 문제를 붙들고 다음 수를 찾는 능력을 사용할 수 있습니다. 계획이 어긋난 자리라면 남은 선택지 중 실제로 시도할 수 있는 것이 무엇인지에 힘을 실을 수 있습니다.'],
  ['collaboration:협동', '함께 움직이는 힘은 공동으로 할 일이 분명할 때 쓰기 좋습니다. 각자 맡을 부분이 있는 과제에서 자기 몫을 챙기면서도, 서로의 움직임이 들어맞아야 결과가 나온다는 점을 살피는 방식입니다.'],
  ['collaboration:치열하게 경쟁하거나 동료와 강하게 연대함', '같은 목표를 가진 동료와는 강하게 뜻을 모을 수 있습니다. 각자의 목표가 갈리는 상황에서는 경쟁의식이 앞설 수 있으므로, 협업 장면에서는 무엇을 함께 이루려는지가 중요한 조건입니다.'],
  ['ability:기회 포착', '여러 선택지 가운데 지금 붙잡을 만한 가능성을 알아차리는 힘도 읽힙니다. 같은 선택지를 늘어놓고 비교할 때, 이미 정해진 것만 보지 않고 새로 열려 있는 자리가 있는지 살피는 데 쓰입니다.'],
  ['relationship:집단에 섞이기 위해 억지로 움직이지 않으며 혼자 있는 상태를 크게 불편해하지 않음', '사람을 만나는 자리에서도 모든 모임에 억지로 맞춰 들어가려 하지는 않는 편입니다. 함께할 기회가 있더라도 혼자 보내는 시간을 불편하게 여기지 않는 모습으로 읽힙니다.'],
  ['ability:완료한 작업도 다시 점검함', '한 번 끝낸 작업을 다시 열어 보는 힘이 있습니다. 표와 원자료를 대조하거나 전달 직전에 빠진 부분을 살피는 일처럼, 완료 이후에 별도의 점검이 필요한 상황에서 이 행동이 강점이 됩니다.'],
  ['stress:사회적 마찰이 커지면 반항이 강해짐', '밖에서 부딪히는 일이 커질수록, 그대로 맞춰 주기 어려워지는 반응이 읽힙니다. 평소보다 반대 의견을 더 분명하게 드러낼 수 있는 조건입니다.'],
  ['pattern:사회적 마찰이 커지면 반항이 강해짐', '주변과의 마찰이 커지는 상황에서는 반발이 강해져, 요구를 그대로 받아들이기보다 이의를 드러내는 쪽으로 반응할 수 있습니다. 이런 반응을 살필 단서는 의견 차이가 커지는 순간에 있습니다.'],
  ['pattern:기분이 상하면 표정에 바로 드러남', '기분이 상하는 순간에는 감정을 말로 정리하기 전에 표정에 반응이 먼저 나타날 수 있습니다. 무엇이 불편했는지 설명하는 시점과, 상대가 불편함을 알아차리는 시점이 어긋날 수 있는 장면입니다.'],
  ['pattern:속상한 일이 생기면 말을 아끼는 경향', '속상한 일이 생기면 말수가 줄어드는 쪽에 가깝습니다. 같은 질문을 받아도 평상시와 달리 바로 설명하기보다 대답을 줄이는 모습으로 읽힙니다.'],
  ['pattern:힘들 때도 자신의 어려움을 말하지 않음', '일이 힘들어지는 상황에서도 자신의 어려움을 먼저 말하지 않는 쪽에 가깝습니다. 어려움이 바깥으로 공유되는 정도와 실제로 감당하는 정도가 다를 수 있습니다.'],
  ['pattern:검토가 길어지면 시도하기 전에 스스로 포기할 수 있음', '검토가 길어지는 상황에서는 방법을 정하기 전에 시도를 접을 수 있습니다. 이 반응을 이해하려면 시작한 일이 중간에 끊기는 경우와, 확인에 시간이 걸려 시작 자체가 어려운 경우를 구분해서 볼 수 있습니다.'],
  ['pattern:자기 기준이 지나치게 확고해지면 다른 의견을 듣지 않으려 함', '판단 기준이 지나치게 굳어지는 상황에서는 다른 의견을 들으려는 여지가 줄어들 수 있습니다. 기준이 생기는 것과 새로운 근거를 받아들이기 어려워지는 지점을 함께 살펴볼 만합니다.'],
])

const outcomeCopy: Record<OutcomeVoice, string> = {
  earning: '수익을 만드는 힘이 읽힙니다. 수익을 남기는 조건은 이 판단과 별도로 봅니다.',
  skill: '익힌 기술을 실제로 쓸 수 있는 결과물로 만들 때 수익과 연결될 가능성이 있습니다. 하는 일에서 기술을 익히는 과정과 그 기술이 고객이나 거래 상대에게 전달할 만큼 구체적인 산출물이 되는 과정을 나누어 보면, 수익화의 근거는 후자에 있습니다.',
  expression: '새로운 아이디어나 표현을 사람들이 쓸 수 있는 결과로 바꿀 때 수익 활동에 힘이 실립니다. 표현 자체보다 아이디어가 구체적인 작업물이나 방식으로 정리되는 지점에서 가치가 만들어진다는 흐름입니다.',
  retention: '들어온 수익을 그대로 남겨 두기에는 제약이 읽힙니다.',
  capacity: '수익을 만드는 흐름이 있어도 그 재원을 감당하며 남겨 두는 힘에는 제약이 읽힙니다. 수입이 생기는 것과, 그 흐름을 관리해 유지할 여지가 생기는 것은 별도의 조건입니다.',
  divisionRetention: '들어온 수익을 그대로 유지하기 어려울 수 있습니다. 벌어들이는 단계와 달리, 이미 확보한 몫을 지키는 흐름에 직접 제약이 닿는 구조입니다.',
  division: '확보한 수익 일부가 나뉘거나 빠져나갈 여지가 있습니다. 수익의 규모보다 각 단계가 끝난 뒤 실제로 남는 몫을 함께 살펴볼 만합니다.',
  protection: '돈을 남기는 흐름의 제약을 덜어 주는 보호가 일부 작동합니다. 확보한 몫에 영향을 주는 작용이 완화될 여지가 있다는 의미입니다.',
  sustainability: '한 번 남긴 수익을 여러 차례 이어서 축적하는 과정에도 부담이 남습니다. 한 번의 수익이 장기적인 기반으로 이어지는지는 축적이 지속되는 조건을 따로 봐야 합니다.',
  pressure: '재물과 관련된 활동을 이어 가는 과정에서 감당해야 할 압박도 함께 살아날 수 있습니다. 기회가 생기는지와 그 기회를 감당하는 데 얼마나 부담이 따르는지를 각각 따져볼 부분입니다.',
  contact: '가까운 관계를 나타내는 구조에 다른 요소가 맞물리며 접점이 열리거나 관계 구도가 조정될 가능성이 읽힙니다. 접촉과 변화 중 어느 쪽으로 전개되는지는 열려 있습니다.',
  change: '가까운 관계의 기존 구도와 새 흐름이 맞부딪치는 작용이 있어, 관계를 이어 가는 방식이나 접점이 바뀔 가능성이 읽힙니다. 변화의 방향은 열려 있습니다.',
  formation: '관계의 접점을 만드는 작용에 가까운 관계를 지지하는 조건까지 함께 작동합니다. 새로운 접점이 생길 가능성과 별도로, 접점이 친밀한 관계로 이어질 기회도 읽을 수 있습니다.',
  relationshipPressure: '자기 방식으로 표현하는 힘이 관계 안에서 기대되는 역할과 부딪힐 수 있습니다. 관계 자체의 결과보다, 서로 받아들인 기대와 실제로 표현하는 방식 사이의 간격을 살펴볼 만한 흐름입니다.',
}

const timingSubjects: Record<OutcomeVoice, string> = {
  earning: '수익을 만드는 흐름', skill: '기술과 산출물이 수익으로 이어지는 흐름',
  expression: '아이디어와 표현이 수익으로 이어지는 흐름', retention: '수익의 유지 제약', capacity: '수익을 감당하고 유지하는 데 따르는 제약',
  divisionRetention: '확보한 수익을 유지하는 데 따르는 제약', division: '남는 몫이 나뉘거나 빠져나갈 가능성',
  protection: '확보한 몫을 지키는 보호', sustainability: '수익을 꾸준히 축적하는 데 따르는 제약', pressure: '재물 활동과 함께 살아나는 부담',
  contact: '관계의 접점이나 구도가 움직이는 신호', change: '가까운 관계가 이어지는 방식에 변화가 생길 가능성',
  formation: '가까운 관계를 형성할 기회', relationshipPressure: '표현과 역할 기대가 부딪힐 가능성',
}

const scopeWording = { natal: '원국', daewoon: '장기 흐름', sewoon: '해당 절기년', month: '해당 절기월', day: '해당일' }

const settings = {
  single: '관계를 시작하는 자리라면 어느 속도로 상대를 받아들일지 생각해 보는 장면으로 읽을 수 있습니다.',
  dating: '교제 중이라면 가까워진 뒤 어떤 기대를 말로 나누는지가 이 이야기가 적용될 수 있는 장면입니다.',
  married: '함께 생활하는 사이라면 각자 기대하는 역할과 생활 리듬을 두고 이야기하는 자리가 이 흐름과 닿을 수 있습니다.',
}

const timingFormat = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
})

function renderParagraph(plan: CustomerReadingParagraphPlan, facts: ReadonlyMap<string, string>): string | undefined {
  const expression = plan.expression
  if (expression.kind === 'outcome') {
    const copy = expression.timingOnly
      ? `${scopeWording[plan.scope]}에서도 보는 주제는 ‘${timingSubjects[expression.voice]}’입니다.`
      : expression.voice === 'formation' && plan.lifeMechanismIds.includes('three_formation_with_active_stem')
        ? '관계에 관련된 여러 조건이 한 방향으로 모이고, 그 흐름을 실제로 돕는 별도 조건도 작동합니다. 접점이 가까운 관계로 이어질 수 있는 조건이 해당 기간에 함께 갖춰진다는 의미입니다.'
        : outcomeCopy[expression.voice]
    const scene = expression.scene ? ' ' + settings[expression.scene] : ''
    const timing = expression.startsAt && expression.endsBefore
      ? ` 이 해석은 한국 시간 ${timingFormat.format(new Date(expression.startsAt))}부터 ${timingFormat.format(new Date(expression.endsBefore))} 직전까지의 흐름에 해당합니다.` : ''
    const qualification = plan.certainty === 'contextual' ? '이 작용은 제한적으로 읽힙니다. ' : ''
    return qualification + copy + scene + timing
  }

  const traits = expression.traitFactIds.map(id => facts.get(id))
  if (traits.some(trait => !trait)) return undefined
  const trait = traits[0]!
  const authored = traitCopy.get(`${expression.voice}:${trait}`)
  const phrase = traitPhrase(trait)
  if (!authored && !phrase) return undefined
  const scene = expression.scene && expression.voice === 'relationship' ? ' ' + settings[expression.scene] : ''
  if (authored) return authored + scene
  const contextual = plan.certainty !== 'confirmed'
  switch (expression.voice) {
    case 'core': return `${phrase} 쪽에 가깝습니다.`
    case 'outward': return contextual ? `사람들과 어울리는 자리에서는 ${phrase} 모습이 먼저 전해질 수 있습니다.` : `바깥으로는 ${phrase} 태도가 먼저 보입니다.`
    case 'decision': return `결정을 앞두면 ${phrase} 방식으로 판단하는 편입니다.`
    case 'information': return `새로운 정보나 상황을 마주할 때는 ${phrase} 쪽에 힘이 실립니다.`
    case 'relationship': return `사람을 대할 때는 ${phrase} 태도를 보일 수 있습니다.` + scene
    case 'stress': return `부담이 있는 상황에서는 ${phrase} 반응을 보일 수 있습니다.`
    case 'problem': return `문제를 풀 때는 ${phrase} 힘을 쓰기 좋습니다.`
    case 'collaboration': return `함께 일하는 상황에서 ${phrase} 태도가 도움이 될 수 있습니다.`
    case 'ability': return `${phrase} 방식도 강점으로 활용할 수 있습니다.`
    case 'duality': {
      const other = traits[1] && traitPhrase(traits[1])
      return other ? `바깥에서는 ${phrase} 모습이 보일 수 있고, 결정을 내릴 때는 ${other} 쪽으로 무게가 옮겨갈 수 있습니다.`
        : `서로 다른 두 성향이 맞물릴 때는 ${phrase} 모습으로 이어질 수 있습니다.`
    }
    default: return undefined
  }
}

export function renderCustomerReadingKo(plan: ReturnType<typeof buildCustomerReadingPlan>, natal?: NatalPersonalityResult) {
  const facts = new Map(natal?.facts.map(fact => [fact.id, fact.trait]))
  const units = new Map(plan.semanticUnits.map(unit => [unit.id, unit]))
  return plan.chapters.map(chapter => {
    let unsupportedClaimCount = 0
    let duplicateMeaningCount = 0
    const keys = new Set<string>()
    const texts = new Set<string>()
    const paragraphs = chapter.paragraphPlans.flatMap(paragraph => {
      const text = renderParagraph(paragraph, facts)
      const outcome = paragraph.expression.kind === 'outcome'
      const references = paragraph.semanticUnitIds.map(id => units.get(id))
      const permitted = text && (outcome || isCustomerSafeKo(text))
        && references.length > 0 && references.every(unit => unit && unit.scope === paragraph.scope
          && unit.period?.periodId === paragraph.periodRef)
        && (paragraph.expression.kind === 'personality'
          ? paragraph.expression.traitFactIds.every(id => references.some(unit => unit?.sourcePersonalityFactIds.includes(id)))
          : paragraph.sourceOutcomeIds.length > 0 && paragraph.sourceOutcomeIds.every(id =>
            references.some(unit => unit?.meaningRef.kind === 'outcome_fact' && unit.meaningRef.recordId === id)))
      if (!permitted) {
        unsupportedClaimCount++
        return []
      }
      if (texts.has(text) || paragraph.contributionKeys.some(key => keys.has(key))) {
        duplicateMeaningCount++
        return []
      }
      texts.add(text)
      paragraph.contributionKeys.forEach(key => keys.add(key))
      return [{ text, plan: paragraph }]
    })

    const distinct = (select: (paragraph: CustomerReadingParagraphPlan) => readonly string[]) =>
      new Set(paragraphs.flatMap(({ plan: paragraph }) => select(paragraph))).size
    const quality = {
      characterCount: paragraphs.reduce((sum, { text }) => sum + [...text.normalize('NFC')].length, 0),
      paragraphCount: paragraphs.length,
      distinctSemanticCount: distinct(paragraph => paragraph.semanticUnitIds),
      distinctCauseCount: distinct(paragraph => paragraph.causeAvailable
        ? paragraph.lifeMechanismIds : []),
      distinctLifeMechanismCount: distinct(paragraph => paragraph.lifeMechanismIds),
      paragraphRoleCoverage: [...new Set(paragraphs.map(item => item.plan.purpose))],
      duplicateMeaningCount, unsupportedClaimCount,
      reasonCoverage: { complete: paragraphs.filter(item => item.plan.reasonStatus === 'complete').length,
        partial: paragraphs.filter(item => item.plan.reasonStatus === 'partial').length },
    }
    const targets = chapterTargets[chapter.chapterId]
    const meetsTargets = quality.characterCount >= targets.characters[0] && quality.characterCount <= targets.characters[1]
      && quality.paragraphCount >= targets.paragraphs[0] && quality.paragraphCount <= targets.paragraphs[1]
    const canPublish = chapter.readiness === 'ready' && meetsTargets && !unsupportedClaimCount && !duplicateMeaningCount
    return {
      chapterId: chapter.chapterId, title: titles[chapter.titleKey], paragraphs, quality,
      readiness: paragraphs.length ? canPublish ? 'ready' as const : 'partial' as const : 'deferred' as const,
      qualityStatus: unsupportedClaimCount || duplicateMeaningCount ? 'FAIL' as const : canPublish ? 'PASS' as const : 'GAP' as const,
      gaps: [...chapter.gaps, ...(!meetsTargets ? [{ type: 'RENDERER_GAP' as const, slot: 'density_target' }] : []),
        ...(unsupportedClaimCount ? [{ type: 'RENDERER_GAP' as const, slot: 'unexpressed_plan' }] : [])],
    }
  })
}
