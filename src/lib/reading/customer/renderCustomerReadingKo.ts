import { renderTimingContribution, validTimingContribution } from './renderTimingChaptersKo'
import type { NatalPersonalityResult } from '../../personality/types'
import { isCustomerSafeKo } from '../../personality/render/ko/guardrails'
import { isCustomerSafeJa } from '../../personality/render/ja/guardrails'
import { isCustomerSafeEn } from '../../personality/render/en/guardrails'
import { traitPhrase } from '../../personality/render/ko/wording'
import { bounds } from '../semanticUnit'
import { moneyContrastAxes } from './moneyExplanation'
import { moneyContrastCopy, renderMoneyExplanation } from './renderMoneyExplanationKo'
import type { buildCustomerReadingPlan } from './buildCustomerReadingPlan'
import { chapterTargets, type CustomerChapterTitleKey, type CustomerChapterQuality, type PublicationReadiness, type RelationshipTimingAvailability, type CustomerReadingParagraphPlan, type OutcomeVoice } from './types'
import { customerTitle, localizedContrast, localizedIndependentPersonality, localizedMoney, localizedParagraph, localizedPeriod, localizedPersonalityPosition, localizedWorkApplication, type CustomerReadingLocale } from './customerLanguage'
import { describeCustomerCause } from './describeCustomerCause'
import { renderJudgmentStructure } from './renderJudgmentStructure'
import { personalityContent } from '../interpretationContent'

const relationshipOutcomeMappings = new Set(['CL-R01', 'CL-R02', 'CL-R03'])

const titles: Record<CustomerChapterTitleKey, string> = {
  basic_temperament: '나의 기본 성향',
  personal_strengths: '나의 강점',
  situational_responses: '상황에 따라 달라지는 나의 반응',
  current_life_changes: '지금 내 삶에서 무엇이 달라지고 있는가',
  long_term_transitions: '앞으로 삶의 흐름이 크게 바뀌는 때',
  opportunity_and_caution_windows: '기회를 활용할 때와 신중하게 판단할 때',
  relationship_style: '관계에서 드러나는 나의 방식',
  work_and_learning_environment: '일과 배움에서 힘을 쓰는 방식',
  earning_and_retention: '돈을 만드는 방식과 돈을 지키는 힘',
}

// These entries express approved individual facts in context. Their keys are
// selected upstream by fact ID. The renderer never searches for an alternative.
const traitCopy = new Map<string, string>([
  ['core:자기 결과물에 엄격함', '스스로 해낸 일에 엄격한 기준을 적용하는 편입니다. 함께 만든 결과를 살필 때도, 자신의 몫을 돌아보며 무엇이 본인의 기준에 닿았고 무엇이 부족한지 세심하게 따져 보는 모습으로 읽힙니다.'],
  ['outward:차분하고 성실한 태도', '사람들과 어울리는 자리에서는 차분하고 꾸준한 태도가 먼저 전해질 수 있습니다. 첫인상에서 강하게 존재감을 드러내기보다는, 맡은 일을 같은 방식으로 이어 가는 모습이 더 잘 보이는 쪽입니다.'],
  ['outward:넓고 활발한 교류', '밖에서는 비교적 넓은 범위의 사람들과 활발히 어울리는 모습이 먼저 보일 수 있습니다. 이미 가까운 사람만 찾기보다 새로 말을 나눌 접점에도 열려 있는 모습입니다.'],
  ['decision:조언을 들어도 스스로 납득한 뒤 움직임', '조언을 받아도 결정은 한 번 더 자신의 기준을 통과해야 합니다. 예를 들어 두 가지 제안을 놓고 있다면 다른 사람이 골라 준 쪽을 곧바로 따르기보다, 어느 쪽이 자신의 판단 기준에 들어맞는지 따져 볼 수 있습니다.'],
  ['decision:타당성을 스스로 확인하고 움직임', '어떤 제안이 좋아 보여도 그 이유가 타당한지 스스로 확인한 뒤에 움직이는 편으로 읽힙니다. 판단 기준이 모호한 제안보다 무엇을 근거로 삼을지 분명한 제안을 검토하기 쉽습니다.'],
  ['decision:실리를 따져 신속하게 판단함', '당장 무엇을 얻고 무엇을 감수해야 할지가 뚜렷한 선택에서는 판단이 빨라질 수 있습니다. 예를 들어 여러 방법이 모두 가능해 보이더라도 시간과 수고의 차이가 분명하다면, 실익을 기준으로 필요한 선택지를 빠르게 좁히는 방식입니다.'],
  ['stress:자기 판단을 유일한 기준으로 삼기 쉬움', '자기 판단에 확신이 커질 때는 그 판단만으로 충분하다고 여기기 쉽습니다. 여러 사람이 다른 기준을 들고 오는 상황에서는 스스로 납득한 이유가 있다는 것과 그 이유를 모두에게 적용할 수 있는지를 나눠 볼 만합니다.'],
  ['stress:자기 기준이 지나치게 확고해지면 다른 의견을 듣지 않으려 함', '내 기준이 단단히 굳은 상황에서는 다른 의견을 들을 여지가 줄어들 수 있습니다. 기준을 세워 선택하는 힘이 새 근거를 검토하는 데까지 그대로 적용되면 받아들이는 범위가 좁아질 수 있습니다.'],
  ['information:정보를 비판적으로 선별함', '새로운 정보를 접하면 그 안에서 받아들일 것과 더 확인할 것을 가르는 편으로 읽힙니다. 설명이 길거나 자료가 많더라도 전부를 같은 무게로 받아들이기보다, 판단에 쓸 근거를 선별하는 과정에 힘이 실립니다.'],
  ['outward:넓은 교류', '여러 사람과 어울릴 접점을 두루 만드는 편입니다. 익숙한 사람끼리만 이야기하기 쉬운 자리에서도 새로 말을 나누는 쪽에 열려 있습니다.'],
  ['relationship:때와 장소를 가려 의견을 내고 공적인 일과 사적인 일을 구분함', '가까운 사이라도 의견을 꺼내는 때와 자리를 가려 보는 편입니다. 의견이 같아도 공개적으로 논의할 일과 따로 나눌 이야기를 구분할 수 있습니다. 관계의 친밀함과 그 자리에서 해야 할 말을 각각 판단하는 기질입니다.'],
  ['relationship:배려와 재능 나눔이 가까운 범위에 집중됨', '도움이나 배려는 가까운 사람에게 더 많이 돌아가는 쪽으로 읽힙니다. 친밀해진 뒤에는 두루 안부를 나누는 것보다, 익숙한 사람이 필요로 하는 일에 시간과 힘을 쓰는 방식에 가깝습니다.'],
  ['relationship:가까운 사람과 신뢰를 차곡차곡 쌓음', '가까운 사람과의 신뢰는 작은 접촉을 이어 가며 쌓는 편입니다. 한 차례의 강한 인상보다 말을 나눈 뒤의 태도가 꾸준한지, 주고받는 약속이 계속 이어지는지를 통해 관계가 자리 잡을 수 있습니다.'],
  ['relationship:수평적인 대화와 동등한 대우를 중시함', '관계에서 서로의 의견에 같은 무게가 실리는 대화를 중요하게 여기는 편입니다. 결정을 앞두고 한 사람이 일방적으로 정하는 상황보다, 각자가 따로 생각할 수 있는 여지가 있을 때 의견을 나누기 수월할 수 있습니다.'],
  ['relationship:교류의 폭이 넓지만 기준을 넘으면 단호하게 선을 그음', '사람을 폭넓게 받아들이는 모습과 관계의 경계를 분명히 하는 모습이 함께 읽힙니다. 편하게 어울리더라도 본인이 중요하게 보는 기준을 넘는 상황에서는 받아들일 수 있는 범위를 단호하게 정할 수 있습니다.'],
  ['problem:분석력', '복잡한 문제에서 조건을 나누어 어느 지점이 판단을 바꾸는지 짚어 내는 능력이 있습니다. 자료마다 결론이 다를 때는 각 자료가 출발점으로 삼은 조건을 비교하면 의견이 갈라진 이유를 짚을 수 있습니다.'],
  ['problem:위기 돌파', '진행이 막혔을 때도 풀어야 할 문제를 붙들고 다음 수를 찾는 능력을 사용할 수 있습니다. 계획이 어긋난 자리라면 남은 선택지 중 실제로 시도할 수 있는 것이 무엇인지에 힘을 실을 수 있습니다.'],
  ['collaboration:협동', '함께 움직이는 힘은 공동으로 할 일이 분명할 때 쓰기 좋습니다. 각자 맡을 부분이 있는 과제에서 자기 몫을 챙기면서도, 서로의 움직임이 들어맞아야 결과가 나온다는 점을 살피는 방식입니다.'],
  ['collaboration:치열하게 경쟁하거나 동료와 강하게 연대함', '같은 목표를 가진 동료와는 강하게 뜻을 모을 수 있습니다. 각자의 목표가 갈리는 상황에서는 경쟁의식이 앞설 수 있으므로, 협업 장면에서는 무엇을 함께 이루려는지가 중요한 조건입니다.'],
  ['ability:빠른 판단', '한정된 시간 안에 선택해야 할 때 판단을 빠르게 내릴 수 있습니다. 여러 갈래의 선택이 열려 있어도 결정을 미루기 어려운 상황에서 이 속도를 쓸 수 있습니다.'],
  ['ability:신속한 판단', '한정된 시간 안에 선택해야 할 때 판단을 빠르게 내릴 수 있습니다. 여러 갈래의 선택이 열려 있어도 결정을 미루기 어려운 상황에서 이 속도를 쓸 수 있습니다.'],
  ['ability:기회 포착', '기존 선택지 밖에서 새로 열린 가능성을 알아차리는 힘도 있습니다. 주어진 대안만 비교하기 쉬운 상황에서 무엇을 선택할 수 있는지부터 다시 살필 수 있습니다.'],
  ['relationship:정인 성향이 과할 때 겉으로 원만해 보여도 주위 사람들과 거리감을 느낄 수 있음', '겉에서 관계를 원만하게 유지하려는 면이 지나치게 앞서면, 주위 사람들과 편하게 말을 주고받으면서도 속으로는 거리를 느낄 수 있습니다. 대화가 매끄러웠다는 인상과 실제로 마음이 가까워졌다는 감각이 서로 다를 수 있는 때입니다.'],
  ['relationship:갈등을 우회하기보다 자기 뜻을 지키며 부딪히는 편', '의견 차이가 선명해지면 자기 뜻을 직접 밝히는 쪽에 가깝습니다. 상대와 다른 지점이 분명할 때도 그 차이를 덮어 두고 넘어가기보다, 무엇을 받아들이기 어려운지 드러낼 수 있습니다.'],
  ['relationship:가까운 사람을 포용하되 자신이 돌볼 범위를 주도적으로 정하려 함', '가까운 사람을 챙기는 한편, 어디까지 맡을지는 스스로 정하려는 편입니다. 도움을 주는 것과 앞으로도 같은 몫을 맡겠다고 정하는 데에는 다른 기준이 작동할 수 있습니다.'],
  ['relationship:집단에 섞이기 위해 억지로 움직이지 않으며 혼자 있는 상태를 크게 불편해하지 않음', '사람을 만나는 자리에서도 모든 모임에 억지로 맞춰 들어가려 하지는 않는 편입니다. 함께할 기회가 있더라도 혼자 보내는 시간을 불편하게 여기지 않는 모습으로 읽힙니다.'],
  ['ability:완료한 작업도 다시 점검함', '작업을 마친 뒤에도 전달 전에 다시 확인하는 데 강점이 있습니다. 작성에 집중할 때 지나친 부분을 별도의 검토 단계에서 발견하는 방식입니다.'],
  ['stress:사회적 마찰이 커지면 반항이 강해짐', '밖에서 부딪히는 일이 커질수록, 그대로 맞춰 주기 어려워지는 반응이 읽힙니다. 평소보다 반대 의견을 더 분명하게 드러낼 수 있는 조건입니다.'],
  ['pattern:실수가 없어야 한다는 기준 때문에 시작이나 경로 변경을 주저함', '실수가 없어야 한다는 기준이 강해질 때는 첫 시도를 정하거나 이미 택한 방향을 바꾸는 데 머뭇거릴 수 있습니다. 시작이나 전환을 앞둔 순간에 이 기준이 드러납니다.'],
  ['pattern:결과를 중시한 나머지 목표에 집착하거나 결과가 마음에 들지 않을 일은 시작하지 않기 쉬움', '원하는 결과를 우선해 판단하면, 그 결과를 기대하기 어려운 일은 시작을 접거나 이미 정한 목표를 계속 붙드는 쪽으로 움직일 수 있습니다. 새 선택을 할 때와 기존 선택을 유지할 때, 같은 결과 기준이 행동을 다르게 이끕니다.'],
  ['pattern:사회적 마찰이 커지면 반항이 강해짐', '주변과의 마찰이 커지는 상황에서는 반발이 강해져, 요구를 그대로 받아들이기보다 이의를 드러내는 쪽으로 반응할 수 있습니다. 이런 반응을 살필 단서는 의견 차이가 커지는 순간에 있습니다.'],
  ['pattern:기분이 상하면 표정에 바로 드러남', '기분이 상하면 말로 설명하기 전에 표정으로 감정이 드러날 수 있습니다.'],
  ['pattern:속상한 일이 생기면 말을 아끼는 경향', '속상한 일이 생기면 말수가 줄어드는 쪽에 가깝습니다. 같은 질문을 받아도 평상시와 달리 바로 설명하기보다 대답을 줄이는 모습으로 읽힙니다.'],
  ['pattern:힘들 때도 자신의 어려움을 말하지 않음', '일이 힘들어지는 상황에서도 자신의 어려움을 먼저 말하지 않는 쪽에 가깝습니다. 어려움이 바깥으로 공유되는 정도와 실제로 감당하는 정도가 다를 수 있습니다.'],
  ['pattern:자기 기준이 지나치게 확고해지면 다른 의견을 듣지 않으려 함', '판단 기준이 지나치게 굳어지는 상황에서는 다른 의견을 들으려는 여지가 줄어들 수 있습니다. 기준이 생기는 것과 새로운 근거를 받아들이기 어려워지는 지점을 함께 살펴볼 만합니다.'],
  ['ability:계획대로 꼼꼼하게 완성함', '마무리의 기준이 분명한 과제에서는 계획을 따라 세부를 챙기는 방식이 잘 드러납니다. 여러 단계로 나뉜 일이라면, 처음 맞춘 조건이 마지막 결과물에도 반영됐는지 확인하는 장면에서 이 기질을 활용할 수 있습니다.'],
  ['ability:관심 분야에 깊게 몰입함', '관심이 생긴 주제는 한 번 훑고 지나가기보다 더 깊이 파고드는 편입니다. 한 가지 문제에 시간을 들일 수 있는 환경이라면, 자료를 좁혀 가며 세부 차이를 알아보는 데 이 몰입을 쓰기 좋습니다.'],
  ['ability:기존 방식에 얽매이지 않고 새로운 방식을 적용함', '기존 절차로 문제를 풀기 어려울 때 다른 방법을 실제로 써 보는 쪽에 열려 있습니다. 진행이 막힌 과제라면 목표 자체를 바꾸기 전에, 같은 목표로 갈 수 있는 다른 작업 방식을 적용해 보는 장면에서 이 강점이 드러날 수 있습니다.'],
])

const behaviorCopy = new Map<string, { response: string; result?: string }>([
  ['outward_composure_limits_delegation', {
    response: '불편한 말을 들어도 그 자리에서는 웃어넘길 수 있습니다. 이후 중요한 일을 맡길 사람을 고를 때는 앞서 들은 말이 판단 기준에 들어갈 수 있습니다. 대화를 이어 가는 태도와 책임을 나눌 때의 판단에 서로 다른 기준이 작동하는 모습입니다.',
  }],
  ['intent_reconsideration_delays_start', {
    response: '하고 싶은 일이 생기면 먼저 나서고 싶은 마음이 들다가도, 실제로 움직이려는 순간에는 지금 시작해도 되는지 다시 살펴볼 수 있습니다.',
    result: '이 확인에 시간이 걸리면 첫 행동이 늦어질 수 있습니다.',
  }],
  ['extended_review_inhibits_action', {
    response: '새로운 시도를 앞두고 검토가 길어지면, 해보기도 전에 잘 풀리지 않을 가능성에 무게를 둘 수 있습니다.',
    result: '그 판단이 앞서면 시도하기 전에 접을 수 있습니다.',
  }],
  ['haste_increases_errors', {
    response: '생각에서 판단과 실행으로 빠르게 옮겨가는 편입니다. 충분히 살피기 전에 결정하면 속도가 성급함으로 이어질 수 있습니다.',
    result: '그때는 실행 과정의 실수가 늘 수 있습니다.',
  }],
  ['rechecking_after_completion', {
    response: '스스로 마친 작업에는 다른 사람의 결과물을 볼 때보다 엄격한 기준을 적용하는 편입니다. 일이 끝난 뒤에도 본인이 부족하다고 보는 부분을 다시 확인할 수 있습니다.',
  }],
])

const outcomeCopy: Partial<Record<OutcomeVoice, string>> = {
  contact: '가까운 관계에 맞물리는 작용이 있어, 상대와 새로 이야기를 나눌 접점이 생기거나 이미 이어진 관계의 구도가 움직일 수 있습니다. 어느 쪽으로 전개될지는 열려 있습니다.',
  change: '가까운 관계의 기존 구도와 새 흐름이 맞부딪치는 작용이 있어, 관계를 이어 가는 방식이나 접점이 바뀔 가능성이 읽힙니다. 변화의 방향은 열려 있습니다.',
  formation: '관계의 접점을 만드는 작용에 가까운 관계를 지지하는 조건까지 함께 작동합니다. 새로운 접점이 생길 가능성과 별도로, 접점이 친밀한 관계로 이어질 기회도 읽을 수 있습니다.',
  relationshipPressure: '자기 방식으로 표현하는 힘이 관계 안에서 기대되는 역할과 부딪힐 수 있습니다. 관계 자체의 결과보다, 서로 받아들인 기대와 실제로 표현하는 방식 사이의 간격을 살펴볼 만한 흐름입니다.',
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

// Each entry supplies a role absent from the conclusion copy. These are
// hypothetical applications of the selected fact, with no inferred biography.
const applicationCopy = new Map([
  ['problem:분석력', '쟁점이 뒤섞인 회의라면 의견이 다른 부분과 자료가 부족한 부분을 따로 정리해, 다음에 확인할 질문을 좁히는 데 이 힘을 쓸 수 있습니다. 전제가 서로 다르면 전제부터 맞추고, 전제가 같은데 결론이 다르면 결론에 이르는 과정을 확인하는 식입니다.'],
  ['collaboration:협동', '앞 사람의 작업이 끝나야 다음 단계가 시작되는 과제라면, 각자 얼마나 했는지에 더해 무엇을 넘겨줘야 동료가 바로 이어받을 수 있는지를 챙기는 것이 협동의 구체적인 역할입니다.'],
  ['ability:완료한 작업도 다시 점검함', '여러 번 수정한 문서라면 본문의 숫자만 살피는 데 그치지 않고 표나 요약에도 같은 수정이 반영됐는지 확인할 수 있습니다. 서로 다른 부분에 남은 수치가 맞으면, 자료를 받아 보는 사람도 어느 값을 기준으로 삼을지 다시 묻는 수고를 덜 수 있습니다.'],
  ['ability:기회 포착', '처음 고려하던 선택지가 막혔을 때도 새로 열린 선택지가 있는지 살피면, 검토할 대상 자체를 넓힐 수 있습니다. 이전에는 일정 때문에 고려할 수 없었던 선택지가 기한이 바뀌면서 가능해지는 것처럼, 조건이 달라졌을 때 이 힘이 쓰입니다.'],
  ['information:정보를 비판적으로 선별함', '엇갈리는 의견을 들을 때는 결론이 얼마나 단호한지보다 어떤 내용이 실제 선택을 바꿀 근거인지가 중요해집니다. 같은 설명 안에서도 참고할 배경과 추가로 확인할 주장을 구분하는 방식입니다.'],
  ['relationship:때와 장소를 가려 의견을 내고 공적인 일과 사적인 일을 구분함', '함께 결정할 안건이라면 그 자리에서 의견을 내되, 개인적으로 전할 이야기는 자리를 옮겨 말할 수 있습니다. 중요한 것은 어느 범위의 사람이 그 이야기를 함께 들어야 하는지입니다.'],
])

const relationDate = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul', year: 'numeric', month: 'numeric', day: 'numeric',
})

function relationDateLabel(instant: string) {
  return relationDate.format(new Date(instant)).replace(/\s+/gu, '').replace(/\.$/u, '')
}

function renderTiming(plan: CustomerReadingParagraphPlan) {
  const certaintyOrder = ['confirmed', 'contextual', 'conditional']
  const periods = new Map(plan.activations?.filter(item => item.startsAt && item.endsBefore)
    .sort((a, b) => certaintyOrder.indexOf(a.certainty) - certaintyOrder.indexOf(b.certainty))
    .map(item => [JSON.stringify([item.scope, item.periodRef, item.startsAt, item.endsBefore]), item]))
  // Render from broad to narrow even when the broader interval has lower certainty.
  const scopeOrder = ['daewoon', 'sewoon', 'month', 'day']
  const intervals = [...periods.values()].sort((a, b) => scopeOrder.indexOf(a.scope) - scopeOrder.indexOf(b.scope))
  if (plan.chapterId === 'CR-05' && intervals.length) {
    const short = intervals.map(({ scope, startsAt, endsBefore }) =>
      `${scopeWording[scope]} ${relationDateLabel(startsAt!)}~${relationDateLabel(endsBefore!)}`)
    return ` 적용 구간(한국 날짜)은 ${short.join(', 그 안의 ')}입니다.`
  }
  const labels = intervals.map(({ scope, startsAt, endsBefore, certainty }) => {
    const from = timingFormat.format(new Date(startsAt!))
    const to = timingFormat.format(new Date(endsBefore!))
    const qualification = certainty === 'conditional' ? ' · 조건부' : certainty === 'contextual' ? ' · 제한적' : ''
    return `${scopeWording[scope]}${qualification} ${from}부터 ${to} 직전까지`
  })
  if (!labels.length) return ''
  const lead = plan.scope === 'natal' ? ' 이 조건이 다시 확인된 기간은 ' : ' 이 판단이 적용되는 기간은 '
  return lead + labels.join(', 그 안에서는 ') + '입니다(한국 시간).'
}

function relationshipSequence(traits: readonly (string | undefined)[], scene: string) {
  const [style, communication, conflict] = traits.map(trait => trait && traitPhrase(trait))
  if (!style || !communication || !conflict) return undefined
  if (traits[1] === '수평적인 대화와 동등한 대우를 중시함'
    && traits[2] === '교류의 폭이 넓지만 기준을 넘으면 단호하게 선을 그음') {
    return '가까워진 뒤 함께 정할 일이 생기면, 서로 의견을 낼 수 있는지가 중요해집니다. 본인이 중요하게 보는 기준을 넘었다고 느끼면, 받아들일 수 있는 범위를 분명히 하는 쪽으로 반응이 달라질 수 있습니다.' + scene
  }
  const [, conversation, boundary] = traits.map(trait => trait && traitCopy.get(`relationship:${trait}`))
  return [
    conversation ?? `가까워져 서로의 생각을 나눌 때는 ${communication} 태도가 드러날 수 있습니다.`,
    boundary ?? `기대나 기준이 어긋날 때는 ${conflict} 쪽으로 반응할 수 있습니다.`,
  ].join(' ') + scene
}

const workStudyCopy: Record<import('../../outcome/workStudy').WorkStudySemantic, string> = {
  work_capacity: '확인된 업무에서는 생각을 설명하거나 직접 결과물로 만드는 방식에 힘을 쓸 여지가 있습니다.',
  work_difficulty: '맡은 역할의 기준과 자신의 일 처리 방식이 충돌하면 역할을 이어가는 데 부담이 생길 수 있습니다.',
  work_resolution: '같은 난제를 막던 경로가 완화되어, 그 일에 다시 힘을 쓸 여지가 생깁니다.',
  role_acquisition: '이미 확인된 제안에서는 역할을 수행하는 데 걸리던 제약이 완화되어 조건을 검토할 여지가 생깁니다.',
  organizational_pressure: '확인된 조직 역할에서는 요구되는 기준과 자신의 처리 방식이 맞물릴 때 부담이 커질 수 있습니다.',
  study_capacity: '배울 내용을 직접 설명하거나 실습으로 다시 만들어 볼 때 이해를 넓히는 데 도움이 될 수 있습니다.',
  study_difficulty: '배운 내용을 흡수하고 쌓아 가는 과정에 마찰이 생길 수 있습니다.',
  learning_accumulation: '배운 내용을 다시 확인하고 차곡차곡 쌓는 과정에 힘을 쓰기 좋습니다.',
  distraction_pressure: '또래와의 경쟁이 두드러지는 학습 환경에서는 주의가 분산되어 자기 속도를 지키기 어려울 수 있습니다.',
  expression_vs_formal_learning_conflict: '스스로 실험해서 답을 찾는 방식과 정해진 절차에 맞춰야 하는 학습 사이에 마찰이 생길 수 있습니다.',
}

function renderParagraph(plan: CustomerReadingParagraphPlan, facts: ReadonlyMap<string, string>): string | undefined {
  const expression = plan.expression
  if (expression.kind === 'judgment_structure') return undefined
  if (expression.kind === 'work_study') {
    const copy = expression.cause === 'output_to_wealth'
      ? '확인된 업무에서는 아이디어를 실제로 쓰이는 결과물로 만들어 수익으로 이어 갈 여지가 있습니다.'
      : expression.cause === 'output_controls_pressure'
        ? '예시를 따라 해 보고 배운 내용을 자신의 말이나 실습으로 다시 풀어내는 방식이 어려운 과제를 다루는 데 도움이 될 수 있습니다.'
        : expression.mappingId === 'Master 21:study_difficulty'
          ? '어려운 과제를 풀어내는 힘이 있어도, 부담이 이어지면 같은 속도로 공부를 계속하기 어려울 수 있습니다.'
          : expression.mappingId === 'CL-S04'
            ? '눈앞의 결과에 힘이 실리면 배운 내용을 다시 살피고 쌓을 시간이 줄어들 수 있습니다.'
            : workStudyCopy[expression.semantic]
    const scene = expression.semantic === 'work_capacity' && expression.scene === 'employed'
      ? ' 맡은 과제를 설명하거나 결과물을 보여 주는 상황이 한 예입니다.' : ''
    const limited = expression.reduced ? ' 이 작용은 제한적으로 나타날 수 있습니다.' : ''
    return copy + limited + scene + renderTiming(plan)
  }
  if (expression.kind === 'temporal') return renderTimingContribution(expression.contribution)
  if (expression.kind === 'outcome') {
    const copy = expression.voice === 'formation' && plan.lifeMechanismIds.includes('three_formation_with_active_stem')
      ? '관계에 관련된 여러 조건이 한 방향으로 모이고, 그 흐름을 돕는 별도 조건도 작동합니다. 접점이 가까운 관계로 이어지는 데 힘을 보태는 구조입니다.'
      : outcomeCopy[expression.voice]
    const scene = expression.scene ? ' ' + settings[expression.scene] : ''
    const timing = renderTiming(plan)
    const qualification = plan.certainty === 'contextual' ? '이 작용은 제한적으로 읽힙니다. ' : ''
    return copy ? qualification + copy + scene + timing : undefined
  }

  const traits = expression.traitFactIds.map(id => facts.get(id))
  if (traits.some(trait => !trait)) return undefined
  const trait = traits[0]!
  const independent = traits.length === 1 && localizedIndependentPersonality(trait, 'ko')
  if (independent) return independent
  const workApplication = localizedWorkApplication(plan, trait, 'ko')
  if (workApplication) return workApplication
  const scene = expression.scene && expression.voice === 'relationship' ? ' ' + settings[expression.scene] : ''
  if (expression.composite === 'relation_sequence') return relationshipSequence(traits, scene)
  if (expression.composite === 'outward_decision') {
    const outward = '폭넓게 사람을 만나는'
    const inward = traits[1] && traitPhrase(traits[1])
    if (!inward) return undefined
    return `사람들과 어울릴 때는 ${outward} 모습이 먼저 전해질 수 있습니다. 중요한 선택을 앞두면 ${inward} 쪽에 무게를 둡니다. 새로 만난 사람에게도 이야기를 들을 수 있지만, 이야기를 나누기 편한지와 그 제안을 받아들일 근거가 있는지는 서로 다른 기준으로 판단하는 편입니다.`
  }
  const key = `${expression.voice}:${trait}`
  const pattern = expression.pattern
  if (pattern) {
    const reaction = behaviorCopy.get(pattern.mechanism)
    if (reaction) return reaction.response + (pattern.resultCoverage === 'supported' && reaction.result ? ' ' + reaction.result : '')
  }
  const authored = traitCopy.get(key)
  const phrase = traitPhrase(trait)
  if (!authored && !phrase) return undefined
  if (authored) {
    const application = applicationCopy.get(key)
    const limitation = expression.limitationFactId && facts.get(expression.limitationFactId) === '빠른 결단이 성급해지면 실수가 늘어날 수 있음'
      ? ' 다만 결정이 성급해질 때는 실수가 늘 수 있습니다.' : ''
    return authored + (application ? ' ' + application : '') + limitation + scene
  }
  const contextual = plan.certainty !== 'confirmed'
  switch (expression.voice) {
    case 'core': return `${phrase} 쪽에 가깝습니다.`
    case 'outward': return contextual ? `사람들과 어울리는 자리에서는 ${phrase} 모습이 먼저 전해질 수 있습니다.` : `바깥으로는 ${phrase} 태도가 먼저 보입니다.`
    case 'decision': return `결정을 앞두면 ${phrase} 편입니다.`
    case 'information': return `새로운 정보나 상황을 마주할 때는 ${phrase} 쪽에 힘이 실립니다.`
    case 'relationship': return `사람을 대할 때는 ${phrase} 태도를 보일 수 있습니다.` + scene
    case 'stress': return `부담이 있는 상황에서는 ${phrase} 반응을 보일 수 있습니다.`
    case 'problem': return `문제를 풀 때는 ${phrase} 힘을 쓰기 좋습니다.`
    case 'collaboration': return `함께 일하는 상황에서 ${phrase} 태도가 도움이 될 수 있습니다.`
    case 'ability': return `${phrase} 방식도 강점으로 활용할 수 있습니다.`
    case 'pattern': return expression.pattern ? `${phrase} 쪽으로 반응할 수 있습니다.` : undefined
    case 'duality': {
      const other = traits[1] && traitPhrase(traits[1])
      return other ? `바깥에서는 ${phrase} 모습이 보일 수 있고, 결정을 내릴 때는 ${other} 쪽으로 무게가 옮겨갈 수 있습니다.`
        : undefined
    }
    default: return undefined
  }
}

const unsupportedRecurrenceKo = /늘 반복|계속 같은 선택|비슷한 일이 되풀이|항상 이런 결과|반복됩니다|되풀이됩니다|반복되기 쉽/u

// Current Money authority identifies structural participants only.
const moneyActorKo = /가족|배우자|동업자|직원|거래처|경쟁사|친구|형제|부모|자녀|세금|광고비|인건비|병원비/u
const unsupportedMoneySlots = new Set(['loss', 'division', 'competition', 'cost', 'sustainability'])

export function renderCustomerReadingKo(plan: ReturnType<typeof buildCustomerReadingPlan>, natal?: NatalPersonalityResult) {
  return renderCustomerReading(plan, natal, 'ko')
}

export function renderCustomerReading(plan: ReturnType<typeof buildCustomerReadingPlan>, natal: NatalPersonalityResult | undefined,
  locale: CustomerReadingLocale) {
  const facts = new Map(natal?.facts.map(fact => [fact.id, fact.trait]))
  const personalityFacts = new Map(natal?.facts.map(fact => [fact.id, fact]))
  const units = new Map(plan.semanticUnits.map(unit => [unit.id, unit]))
  const explanations = new Map(plan.structuralExplanationUnits.map(unit => [unit.id, unit]))
  const customerSafe = { ko: isCustomerSafeKo, ja: isCustomerSafeJa, en: isCustomerSafeEn }[locale]
  const timing = (paragraph: CustomerReadingParagraphPlan) => locale === 'ko' ? renderTiming(paragraph) : localizedPeriod(paragraph, locale)
  const title = (key: CustomerChapterTitleKey) => locale === 'ko' ? titles[key] : customerTitle(key, locale)
  const moneyActor = locale === 'ko' ? moneyActorKo : locale === 'ja'
    ? /家族|配偶者|従業員|取引先|競合他社|兄弟|税金|広告費|人件費/u
    : /\b(?:spouse|employee|business partner|competitor|sibling|tax|payroll)\b/iu
  return plan.chapters.map(chapter => {
    let unsupportedClaimCount = 0
    let excludedCandidateCount = 0
    let rejectedPlannedClaimCount = 0
    let unsupportedChangeCount = 0
    let unsupportedTransitionCount = 0
    let unsupportedOpportunityCount = 0
    let unsupportedCautionCount = 0
    let duplicateMeaningCount = 0
    let moneyActorInferenceCount = 0
    let unsupportedContrastCount = 0
    let unsupportedMoneySubdivisionCount = 0
    let unsupportedRecurrenceCount = Number(Boolean(chapter.relationshipRecurrence?.length))
    let personalityOutcomeCausalLeakCount = 0
    const keys = new Set<string>()
    const texts = new Set<string>()
    const expressed = chapter.paragraphPlans.flatMap(paragraph => {
      const references = paragraph.semanticUnitIds.map(id => units.get(id))
      const expression = paragraph.expression
      if (expression.kind === 'judgment_structure') {
        const unit = units.get(expression.unitId)
        const text = unit && unit.structuralInterpretation?.chapter === chapter.chapterId
          && unit.meaningRef.producer === 'judgment' && unit.status === 'ready'
          && references.length === 1 && references[0] === unit && unit.evidenceIds.length
          && unit.scope === paragraph.scope && unit.period?.periodId === paragraph.periodRef
          && (unit.scope === 'natal' || bounds(unit.period))
          ? renderJudgmentStructure(unit, locale) : undefined
        if (!text || !customerSafe(text)) { unsupportedClaimCount++; rejectedPlannedClaimCount++; return [] }
        if (texts.has(text)) { duplicateMeaningCount++; return [] }
        texts.add(text)
        return [{ text, plan: paragraph, money: undefined, moneyBody: undefined }]
      }
      const money = chapter.chapterId === 'CR-07' && expression.kind === 'outcome'
        ? renderMoneyExplanation(expression.voice, paragraph) : undefined
      const moneyBody = money && expression.kind === 'outcome' && (locale === 'ko'
        ? [money.text, money.criterion].filter(Boolean).join(' ')
        : localizedMoney(expression.voice, paragraph, locale, Boolean(money.criterion)))
      const body = chapter.chapterId === 'CR-07'
        ? moneyBody && moneyBody + timing(paragraph)
        : locale === 'ko' ? renderParagraph(paragraph, facts) : localizedParagraph(paragraph, facts, locale)
      const position = expression.kind === 'personality'
        && localizedPersonalityPosition(paragraph, personalityFacts.get(expression.traitFactIds[0]), locale)
      const editorial = expression.kind === 'personality' && expression.contentId
        && expression.traitFactIds.length === 1 && references.length === 1
        && personalityContent[expression.contentId].trait.some(trait => facts.get(expression.traitFactIds[0]) === trait)
        ? personalityContent[expression.contentId].copy[locale] : undefined
      const copy = editorial ?? body
      const text = copy && position ? `${copy} ${position}` : copy
      const pattern = expression.kind === 'personality' ? expression.pattern : undefined
      const recurrence = paragraph.slots.includes('recurrence') || paragraph.slots.includes('relationshipRecurrence')
        || paragraph.sourceMappingIds.includes('CL-P05') || Boolean(pattern?.recurrence.length)
      // There is no approved recurrence utterance in this contract version.
      if (recurrence || (chapter.chapterId === 'CR-03' && text && unsupportedRecurrenceKo.test(text))) {
        unsupportedRecurrenceCount++
        return []
      }
      if (chapter.chapterId === 'CR-05') {
        const natalSection = paragraph.section === 'natal_relationship'
          && paragraph.layer === 'personality' && expression.kind === 'personality' && paragraph.scope === 'natal'
          && !paragraph.sourceOutcomeIds.length && !paragraph.activations?.length
          && paragraph.sourceMappingIds.every(id => !relationshipOutcomeMappings.has(id))
          && references.every(unit => unit?.meaningRef.producer === 'personality')
        const outcomeSection = paragraph.section === 'relationship_outcome'
          && paragraph.layer === 'outcome' && expression.kind === 'outcome'
          && !paragraph.sourcePersonalityFactIds.length && !paragraph.sourceConflictIds.length
          && paragraph.sourceMappingIds.every(id => relationshipOutcomeMappings.has(id))
          && references.every(unit => unit?.meaningRef.producer === 'outcome' && unit.topic === 'relationship'
            && !unit.sourcePersonalityFactIds.length)
        if (!natalSection && !outcomeSection) {
          personalityOutcomeCausalLeakCount++
          return []
        }
      }
      if (chapter.chapterId === 'CR-07') {
        const axes = new Set(references.flatMap(unit => unit?.moneyAxis ?? []))
        const claimed = new Set(paragraph.moneyAxes ?? [])
        const invalidSubdivision = paragraph.slots.some(slot => unsupportedMoneySlots.has(slot))
          || axes.size !== claimed.size || [...claimed].some(axis => !axes.has(axis))
        const actorInference = Boolean(text && moneyActor.test(text))
        if (invalidSubdivision) unsupportedMoneySubdivisionCount++
        if (actorInference) moneyActorInferenceCount++
        if (invalidSubdivision || actorInference) return []
      }
      const independentResponse = expression.kind === 'personality' && paragraph.slots.includes('independentResponse')
        && !pattern && expression.traitFactIds.length === 1 && expression.voice === 'stress'
        && paragraph.sourceMappingIds.includes('CL-P01') && !paragraph.sourceOutcomeIds.length
        && references.every(unit => unit?.meaningRef.producer === 'personality' && unit.evidenceIds.length)
      const patternEvidenceValid = chapter.chapterId !== 'CR-03' || independentResponse || (pattern?.status === 'ready'
        && pattern.context.length && (pattern.response.length || pattern.judgment.length) && pattern.behavior.length
        && (pattern.resultCoverage === 'supported') === Boolean(pattern.result.length)
        && paragraph.sourceMappingIds.includes('CL-P04') === Boolean(pattern.result.length)
        && (!pattern.conflictId || paragraph.sourceConflictIds.includes(pattern.conflictId))
        && [pattern.context, pattern.trigger, pattern.response, pattern.judgment, pattern.behavior, pattern.result]
          .flat().every(id => references.some(unit => unit?.sourcePersonalityFactIds.includes(id))))
      const moneyEvidenceValid = chapter.chapterId !== 'CR-07' || (expression.kind === 'outcome'
        && references.every(unit => unit?.meaningRef.kind === 'outcome_fact' && unit.topic === 'money' && unit.moneyAxis))
      const temporalIds = expression.kind === 'temporal'
        ? [...expression.contribution.activations, ...(expression.contribution.before ? [expression.contribution.before] : [])]
          .map(item => item.semanticUnitId) : []
      const permitted = moneyEvidenceValid && patternEvidenceValid && text && customerSafe(text)
        && references.length > 0 && references.every(unit => unit !== undefined)
        && (paragraph.expression.kind === 'personality'
          ? references.every(unit => unit?.scope === 'natal')
            && paragraph.expression.traitFactIds.every(id => references.some(unit => unit?.sourcePersonalityFactIds.includes(id)))
          : expression.kind === 'temporal' ? validTimingContribution(expression.contribution, units, chapter.chapterId)
            && references.length === new Set(temporalIds).size
            && paragraph.semanticUnitIds.every(id => temporalIds.includes(id))
          : paragraph.sourceOutcomeIds.length > 0
            && paragraph.activations?.length === references.length
            && paragraph.sourceOutcomeIds.every(id => paragraph.activations?.some(item => item.sourceOutcomeId === id))
            && references.every(unit => unit && paragraph.activations?.some(activation =>
              activation.semanticUnitId === unit.id && activation.sourceOutcomeId === unit.meaningRef.recordId
              && paragraph.sourceOutcomeIds.includes(activation.sourceOutcomeId)
              && unit.meaningRef.kind === 'outcome_fact' && unit.scope === activation.scope
              && unit.certainty === activation.certainty && unit.period?.periodId === activation.periodRef
              && bounds(unit.period)?.[0] === activation.startsAt && bounds(unit.period)?.[1] === activation.endsBefore)))
      if (!permitted) {
        if (expression.kind === 'temporal') {
          switch (expression.contribution.role) {
            case 'current_change': unsupportedChangeCount++; break
            case 'long_term_transition': unsupportedTransitionCount++; break
            case 'opportunity_window': unsupportedOpportunityCount++; break
            case 'caution_window': unsupportedCautionCount++; break
          }
        }
        unsupportedClaimCount++
        if (!text || !patternEvidenceValid) excludedCandidateCount++
        else rejectedPlannedClaimCount++
        return []
      }
      if (texts.has(text) || paragraph.contributionKeys.some(key => keys.has(key))) {
        duplicateMeaningCount++
        return []
      }
      texts.add(text)
      paragraph.contributionKeys.forEach(key => keys.add(key))
      return [{ text, plan: paragraph, moneyBody, money }]
    })

    const expressedUnits = new Set(expressed.filter(item => item.plan.reasonStatus === 'complete')
      .flatMap(item => item.plan.semanticUnitIds))
    const moneyContrasts = new Set<keyof typeof moneyContrastAxes>()
    const paragraphs = expressed.map(({ text, plan, moneyBody, money }) => {
      const contrasts = (plan.moneyContrasts ?? []).flatMap(contrast => {
        const [first, second] = contrast.semanticUnitIds
        const pair = moneyContrastAxes[contrast.kind]
        const left = units.get(first)
        const right = units.get(second)
        if (!moneyBody || !pair || moneyContrasts.has(contrast.kind) || first === second
          || left?.moneyAxis !== pair[0] || right?.moneyAxis !== pair[1]
          || !left.moneyTargetId || left.moneyTargetId !== right.moneyTargetId
          || !expressedUnits.has(first) || !expressedUnits.has(second) || !plan.semanticUnitIds.includes(second)
          || [first, second].some(id => units.get(id)?.sourceStatus === 'future')) {
          unsupportedContrastCount++
          return []
        }
        const copy = locale !== 'ko' ? localizedContrast(contrast.kind, locale)
          : contrast.kind === 'earning_burden' && plan.expression.kind === 'outcome'
          && plan.expression.voice === 'supportPressure'
          ? '수익화에 필요한 결과를 만들 수 있더라도, 그 활동을 조절하는 기반에는 별도의 제약이 남을 수 있습니다.'
          : moneyContrastCopy[contrast.kind]
        if (!customerSafe(copy) || moneyActor.test(copy)) {
          unsupportedContrastCount++
          return []
        }
        moneyContrasts.add(contrast.kind)
        return [copy]
      })
      const cause = describeCustomerCause(plan, explanations, locale)
      const permittedCause = cause && customerSafe(cause) && (plan.chapterId !== 'CR-07' || !moneyActor.test(cause)) ? cause : undefined
      return {
        text: moneyBody ? [moneyBody, permittedCause, ...contrasts].filter(Boolean).join(' ') + timing(plan)
          : permittedCause ? text + ' ' + permittedCause : text,
        plan,
        ...((permittedCause || plan.expression.kind === 'judgment_structure') && { renderedCause: true as const }),
        ...(money && { explainedMoneyAxes: money.axes, hasMoneyCriterion: Boolean(money.criterion) }),
      }
    })

    const distinct = (select: (paragraph: CustomerReadingParagraphPlan) => readonly string[]) =>
      new Set(paragraphs.flatMap(({ plan: paragraph }) => select(paragraph))).size
    const renderedPatterns = paragraphs.flatMap(({ plan }) =>
      plan.expression.kind === 'personality' && plan.expression.pattern ? [plan.expression.pattern] : [])
    const responsePatternCount = new Set(renderedPatterns.map(pattern => pattern.mechanism)).size
    const isRelationship = chapter.chapterId === 'CR-05'
    const natal = paragraphs.filter(p => p.plan.section === 'natal_relationship')
    const outcomes = paragraphs.filter(p => p.plan.section === 'relationship_outcome')
    const axes = new Set(natal.flatMap(p => p.plan.relationshipAxes ?? []))
    const internalOnly = isRelationship && chapter.semanticReadiness === 'deferred'
    const sections = isRelationship ? [
      { id: 'natal_relationship' as const, title: title('relationship_style'), paragraphs: natal, visibility: 'customer' as const },
      { id: 'relationship_outcome' as const, title: locale === 'ko' ? '관계의 흐름이 움직이는 시기'
        : locale === 'ja' ? '関係が動きやすい時期' : 'When relationships may shift', paragraphs: outcomes,
        visibility: internalOnly ? 'internal' as const : 'customer' as const },
    ].filter(section => section.paragraphs.length) : undefined
    const plannedOutcomeCount = chapter.paragraphPlans.filter(p => p.section === 'relationship_outcome').length
    const timedOutcome = outcomes.some(({ plan }) => plan.activations?.some(item =>
      item.scope !== 'natal' && item.periodRef && item.startsAt && item.endsBefore))
    const relationshipTimingAvailability: RelationshipTimingAvailability =
      timedOutcome && outcomes.length === plannedOutcomeCount && outcomes.every(p => p.plan.reasonStatus === 'complete')
        && !chapter.gaps.some(gap => gap.slot === 'relationshipTiming')
        ? 'available' : plannedOutcomeCount || chapter.gaps.some(gap => gap.slot === 'relationshipTiming') ? 'partial' : 'none'
    const customerParagraphs = internalOnly ? [] : paragraphs
    const moneyAxes = new Set(paragraphs.flatMap(({ plan }) => plan.moneyAxes ?? []))
    const explainedAxes = new Set(paragraphs.flatMap(paragraph => paragraph.explainedMoneyAxes ?? []))
    const supportedAxes = new Set(chapter.paragraphPlans.flatMap(paragraph => paragraph.moneyAxes ?? []))
    const unexplainedSupportedAxisCount = [...supportedAxes].filter(axis => !explainedAxes.has(axis)).length
    const earningAxisCount = Number(moneyAxes.has('earning')) + Number(moneyAxes.has('earning_method'))
    const quality = {
      characterCount: customerParagraphs.reduce((sum, { text }) => sum + [...text.normalize('NFC')].length, 0),
      paragraphCount: customerParagraphs.length,
      ...(chapter.temporalQuality && {
        ...chapter.temporalQuality,
        supportedSemanticCount: new Set(chapter.paragraphPlans.flatMap(item => item.semanticUnitIds)).size,
        explainedSemanticCount: distinct(paragraph => paragraph.semanticUnitIds),
        unsupportedChangeCount, unsupportedTransitionCount, unsupportedOpportunityCount, unsupportedCautionCount,
        ...plan.temporalOverlapQuality,
      }),
      distinctSemanticCount: distinct(paragraph => paragraph.semanticUnitIds),
      distinctCauseCount: distinct(paragraph => paragraph.causeAvailable
        ? paragraph.lifeMechanismIds : []),
      distinctMechanismCount: distinct(paragraph => paragraph.lifeMechanismIds),
      distinctContextCount: distinct(paragraph => paragraph.contextKeys),
      ...(chapter.chapterId === 'CR-03' && {
        responsePatternCount,
        resultSupportedCount: renderedPatterns.filter(pattern => pattern.resultCoverage === 'supported').length,
        recurrenceSupportedCount: renderedPatterns.filter(pattern => pattern.recurrenceCoverage === 'supported').length,
        unsupportedRecurrenceCount,
      }),
      ...(sections && {
        relationshipSequenceCoverage: paragraphs.some(p => p.plan.slots.includes('relationshipSequence')) ? 'supported' as const : 'gap' as const,
        relationshipRecurrenceCoverage: paragraphs.some(p => p.plan.slots.includes('relationshipRecurrence')) ? 'supported' as const : 'gap' as const,
        natalParagraphCount: natal.length,
        outcomeParagraphCount: outcomes.length,
        relationshipAxisCount: axes.size,
        relationshipTimingAvailability,
        personalityOutcomeCausalLeakCount, unsupportedRecurrenceCount,
      }),
      ...(chapter.chapterId === 'CR-07' && {
        moneyAxes: [...moneyAxes].sort(),
        moneyAxisCount: moneyAxes.size, earningAxisCount,
        retentionAxisCount: Number(moneyAxes.has('retention')) + Number(moneyAxes.has('accumulation_continuity')),
        outflowAxisCount: Number(moneyAxes.has('combined_outflow_or_division')),
        protectionAxisCount: Number(moneyAxes.has('protection')),
        burdenAxisCount: Number(moneyAxes.has('burden')),
        moneyActorInferenceCount, unsupportedMoneySubdivisionCount, unsupportedContrastCount,
        majorAxisCount: supportedAxes.size, explainedMajorAxisCount: explainedAxes.size, unexplainedSupportedAxisCount,
        contrastCount: moneyContrasts.size,
        customerCriterionCount: paragraphs.filter(paragraph => paragraph.hasMoneyCriterion).length,
        moneyExplanationCoverage: {
          earningExplained: explainedAxes.has('earning'), earningMethodExplained: explainedAxes.has('earning_method'),
          retentionExplained: explainedAxes.has('retention'), accumulationExplained: explainedAxes.has('accumulation_continuity'),
          outflowExplained: explainedAxes.has('combined_outflow_or_division'), protectionExplained: explainedAxes.has('protection'),
          burdenExplained: explainedAxes.has('burden'), earningRetentionContrast: moneyContrasts.has('earning_retention'),
          retentionAccumulationContrast: moneyContrasts.has('retention_accumulation'),
          damageProtectionContrast: moneyContrasts.has('damage_protection'),
        },
      }),
      repeatedScopeMeaningCount: paragraphs.reduce((sum, { plan }) =>
        sum + Math.max(0, new Set(plan.activations?.map(item => item.scope)).size - 1), 0),
      compositeParagraphCount: paragraphs.filter(({ plan }) =>
        plan.expression.kind === 'personality' && (plan.expression.composite || plan.expression.traitFactIds.length > 1)).length,
      distinctLifeMechanismCount: distinct(paragraph => paragraph.lifeMechanismIds),
      paragraphRoleCoverage: [...new Set(paragraphs.map(item => item.plan.purpose))],
      duplicateMeaningCount, unsupportedClaimCount, excludedCandidateCount, rejectedPlannedClaimCount,
      reasonCoverage: { complete: paragraphs.filter(item => item.plan.reasonStatus === 'complete').length,
        partial: paragraphs.filter(item => item.plan.reasonStatus === 'partial').length },
    }
    const band = chapter.chapterId === 'CR-05'
      ? { characters: outcomes.length ? [1200, 2200] : [800, 1500] }
      : chapterTargets[chapter.chapterId]
    const inBand = (count: number, range: readonly number[]) => count >= range[0] && count <= range[1]
    const semanticReadiness = chapter.semanticReadiness
    const densityGap = semanticReadiness !== 'deferred' && (!chapter.temporalQuality || chapter.paragraphPlans.length > 0)
      && (!inBand(quality.characterCount, band.characters)
      || ('paragraphs' in band && !inBand(quality.paragraphCount, band.paragraphs)))
    const failed = unsupportedClaimCount || duplicateMeaningCount || unsupportedRecurrenceCount || personalityOutcomeCausalLeakCount
      || moneyActorInferenceCount || unsupportedMoneySubdivisionCount || unsupportedContrastCount
    const rendererComplete = !failed && paragraphs.length === chapter.paragraphPlans.length
    const questionCovered = chapter.chapterId === 'CR-03'
      ? responsePatternCount >= 2
      : isRelationship ? axes.size >= 3 && (axes.has('communication') || axes.has('boundary') || axes.has('conflict'))
        : chapter.chapterId === 'CR-07' ? earningAxisCount > 0 && moneyAxes.size > earningAxisCount
          : semanticReadiness === 'ready'
    const publicationReadiness: PublicationReadiness = semanticReadiness === 'deferred' ? 'deferred'
      : semanticReadiness === 'ready' && rendererComplete && questionCovered && !densityGap && !quality.reasonCoverage.partial && !unexplainedSupportedAxisCount
        ? 'ready' : 'partial'
    const qualityWithReadiness = {
      ...quality, semanticReadiness, publicationReadiness, densityGap,
    } satisfies CustomerChapterQuality
    return {
      chapterId: chapter.chapterId, titleKey: chapter.titleKey, title: title(chapter.titleKey),
      paragraphs: customerParagraphs, sections, timingCards: chapter.timingCards, quality: qualityWithReadiness,
      semanticReadiness, publicationReadiness,
      // Existing consumers use readiness as the publication state.
      readiness: publicationReadiness,
      qualityStatus: failed ? 'FAIL' as const : publicationReadiness === 'ready' ? 'PASS' as const : 'GAP' as const,
      gaps: [...chapter.gaps, ...(densityGap ? [{ type: 'RENDERER_GAP' as const, slot: 'density_target' }] : []),
        ...(unexplainedSupportedAxisCount ? [{ type: 'RENDERER_GAP' as const, slot: 'money_explanation' }] : []),
        ...(!rendererComplete ? [{ type: 'RENDERER_GAP' as const, slot: 'unexpressed_plan' }] : [])],
    } as const
  })
}
