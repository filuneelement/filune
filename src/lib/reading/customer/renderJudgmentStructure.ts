import { bounds } from '../semanticUnit'
import type { ReadingSemanticUnit } from '../types'
import type { CustomerReadingLocale } from './customerLanguage'
import type { AppliedMechanism } from '../structuralExplanation'
import { interpretationContent } from '../interpretationContent'

type Copy = readonly [string, string, string]
const functions: Readonly<Record<string, Copy>> = {
  capacity: ['본인이 감당하는 힘', '本人が引き受けて持ちこたえる力', 'your capacity to carry what is demanded of you'],
  independent: ['자기 힘으로 버티는 기능', '自分の力で持ちこたえる働き', 'the ability to stand on your own resources'],
  competition: ['같은 자원을 두고 힘을 겨루는 기능', '同じものをめぐって力を競う働き', 'the drive to compete for the same resources'],
  craft: ['익힌 것을 꾸준히 만들어 내는 기능', '身につけた技術を着実に形にする働き', 'the ability to turn practiced skills into steady output'],
  expression: ['방식을 바꾸고 생각을 표현하는 기능', 'やり方を変え、考えを表す働き', 'the ability to revise an approach and express ideas'],
  management: ['결과와 자원을 일정하게 관리하는 기능', '成果と資源を着実に管理する働き', 'the ability to manage results and resources steadily'],
  allocation: ['여러 곳에 자원을 배치하고 활용하는 기능', '資源を配分し活かす働き', 'the ability to allocate resources across uses'],
  standards: ['역할과 기준을 지키는 기능', '役割や基準を守る働き', 'the ability to meet the standards of a role'],
  responsibility: ['강한 요구와 책임이 걸리는 작용', '強い要求や責任がかかる働き', 'pressure from demanding requirements and responsibilities'],
  knowledge: ['배운 지식과 지원을 받아들이는 기능', '知識や支えを受け入れる働き', 'the ability to draw on established knowledge and support'],
  review: ['정보를 골라 받아들이고 해법을 찾는 기능', '情報を選び取り、解き方を探す働き', 'the ability to select information and look for a way forward'],
  initiative: ['자기 힘을 강하게 밀어붙이는 기능', '自分の力を強く押し出す働き', 'the drive to exert your own force'],
  goals: ['원하는 결과를 좇는 힘', '目指す成果を追う力', 'the drive to pursue a desired result'],
  deliverables: ['실제 쓸 수 있는 성과', '実際に使える成果', 'a result someone can put to use'],
  shared_resources: ['함께 쓰는 시간과 자원을 조율하는 힘', '共に使う時間と資源を調整する力', 'coordinating shared time and resources'],
  resource_control: ['이미 확보한 자원을 관리하는 힘', '確保した資源を管理する力', 'managing resources already secured'],
  footing: ['자기 몫을 맡아 버틸 수 있는 기반', '自分の分を引き受けて持ちこたえる土台', 'the footing to carry your own share'],
  options_review: ['다른 선택지를 검토하는 힘', '別の選択肢を見直す力', 'the tendency to review alternatives'],
  prior_standards: ['이미 익힌 기준과 자료를 재확인하는 힘', '慣れた基準や資料を確認し直す力', 'the tendency to check familiar standards and material again'],
}

const applications: Readonly<Record<AppliedMechanism, Copy>> = {
  practiced_solution: [
    '어려운 요구를 받으면 익혀 온 기술로 문제의 범위를 좁히는 데 힘을 쓸 수 있습니다. 막힌 일을 한꺼번에 해결할 필요 없이, 먼저 재현할 수 있는 부분을 풀어 다음 단계가 가능해지는지 확인하는 방식이 맞습니다.',
    '難しい要望に対しては、身につけた技術で問題の範囲を絞る力を使えます。まず再現できる部分から手をつけ、次の作業に進めるかを確かめるやり方が合います。',
    'When demands are difficult, practiced skill can help narrow the problem. Start with the part you can reproduce and see whether resolving it makes the next step possible.',
  ],
  adaptive_solution: [
    '정해진 방법이 통하지 않을 때도 다른 설명이나 절차를 시험해 난제를 풀 실마리를 찾을 수 있습니다. 요구 자체는 분명하지만 해결 방법을 고를 수 있는 환경에서 이 힘이 살아납니다.',
    '決まった手順で解けないときも、別の説明や方法を試して難題を解く手がかりを探せます。要件は明確で、解き方を選べる場面で活かしやすい力です。',
    'When a prescribed method stalls, testing a different explanation or procedure can give you a way into a difficult problem. This works best where the requirement is clear and there is latitude in how to meet it.',
  ],
  knowledge_under_demand: [
    '까다로운 요구를 다룰 때는 쌓아 둔 지식과 경험이 판단의 기준이 됩니다. 무엇을 요구하는지부터 정리하고 비슷한 상황에서 통했던 근거를 찾아보면, 막연한 압박을 순서대로 처리할 과제로 바꿀 수 있습니다.',
    '難しい要望に対処するとき、蓄えた知識と経験が判断の基準になります。何を求められているかを整理し、似た場面で役立った根拠を引き出すと、漠然とした負担を順に扱える課題に変えられます。',
    'Knowledge and experience give you a basis for handling demanding requests. Define what is being asked, then bring in evidence from comparable situations. That can turn diffuse pressure into tasks you can deal with in sequence.',
  ],
  knowledge_shapes_expression: [
    '생각을 곧바로 내놓을 때보다, 알고 있는 사실과 근거를 고른 뒤 설명할 때 표현이 힘을 얻습니다. 새로운 제안을 하더라도 듣는 사람이 검토할 수 있는 예나 자료를 함께 제시하는 것이 이 능력을 살리는 조건입니다.',
    '思いついたことは、知っている事実や根拠を選んでから説明すると伝える力が増します。新しい提案にも、聞き手が検討できる例や資料を添えるとこの力を活かせます。',
    'Your expression gains force when you first select relevant facts and evidence. Pairing a new proposal with an example or material the listener can examine gives this ability something to work with.',
  ],
  results_build_trust: [
    '책임을 맡을 만하다는 점이 구체적인 결과에서 드러나는 흐름입니다. 결과물만 내놓기보다 어떤 기준을 충족했고 어디까지 맡을 수 있는지 함께 보여 주면, 다른 사람이 그 결과를 근거로 신뢰를 판단할 수 있습니다.',
    '責任を任せられるかどうかが、具体的な成果から伝わる流れです。何を仕上げ、どの基準を満たし、どこまで引き受けられるかを示すと、相手はその成果をもとに信頼を判断できます。',
    'Concrete results can give others a basis for trusting you with responsibility. Show what was delivered, which criteria it met, and where your responsibility can extend.',
  ],
  independent_output: [
    '작업에 쓸 시간과 순서를 스스로 조정할 수 있을 때 익힌 능력이 결과로 이어지기 쉽습니다. 주변의 지원도 그 기반을 마련해 줄 때 도움이 됩니다. 어떤 방식으로 만들지는 직접 결정할 수 있는 여지가 중요합니다.',
    '作業に使う時間や順序を自分で整えられると、身につけた力を成果につなげやすくなります。周囲の支えもその土台を作るときに役立ち、作り方を自分で選べる余地が大切です。',
    'Practiced skills are easier to use when you can organize the time and sequence of the work yourself. Support from others is useful when it helps secure that footing and still leaves room to decide how to make the result.',
  ],
  knowledge_into_practice: [
    '배워 둔 것은 실제 판단에서 쓸 때 든든한 기반이 됩니다. 예시를 따라 보는 데서 한 걸음 더 나아가, 어느 조건이 맞았기에 그 풀이가 성립했는지 직접 확인하면 새 과제에도 가져갈 수 있습니다.',
    '身につけた知識は、実際の判断に使うときに支えになります。例をなぞるだけでなく、どの条件がそろって解き方が成り立ったかを確かめると、新しい課題にも応用できます。',
    'What you have learned can support decisions in practice. Go beyond copying an example and identify the conditions that made its approach work. That gives you a way to carry it into a new task.',
  ],
  goals_displace_preparation: [
    '눈앞의 결과를 빨리 만들려는 힘이 강해질 때 이미 확보한 지식이나 준비를 충분히 쓰지 못하는 제약이 있습니다. 마감이나 목표를 정할 때, 앞당겨도 되는 단계와 건너뛰면 전체 판단이 흔들리는 확인 절차를 나눠 두는 편이 좋습니다.',
    '目の前の成果を急ぐ力が強まると、身につけた知識や準備を十分に使えない制約があります。期限や目標を決める際は、前倒しできる段階と、省くと判断全体が揺らぐ確認を分けておくと役立ちます。',
    'The push for immediate results can interfere with using knowledge and preparation you already have. When setting a deadline or goal, distinguish steps you can bring forward from checks the whole decision depends on.',
  ],
  expression_meets_rules: [
    '방법을 바꾸려는 의견이 정해진 역할이나 기준과 부딪힐 수 있습니다. 공동의 목표나 책임 범위를 먼저 맞춘 뒤 해결 방법을 제안하면, 기준 자체에 이의를 제기하는 것과 그 기준에 도달하는 방법을 바꾸는 것을 구분할 수 있습니다.',
    '方法を変える意見が、決まっている役割や基準とぶつかることがあります。共通の目的や責任の範囲を先にそろえれば、基準への異議と、その基準に達する方法を変える提案を区別できます。',
    'A proposal to change the method may run against established roles or standards. Agreeing on the shared goal and scope of responsibility first helps distinguish a challenge to the standard from a proposal about how to meet it.',
  ],
  competition_strains_resources: [
    '함께 쓰는 자원을 두고 서로 다른 목표를 밀어붙이면, 결과를 만드는 데 쓸 몫이 줄거나 확보한 성과를 정리하기 어려워질 수 있습니다. 누가 어떤 결과와 자원에 책임을 지는지 시작 전에 맞춰 두는 것이 도움이 됩니다.',
    '共に使う資源をめぐって別々の目的を押し通すと、成果を出すための余力が減ったり、得た成果を整理しにくくなったりします。誰がどの成果と資源に責任を持つか、始める前に合わせておくと役立ちます。',
    'When people pursue different goals with shared resources, less may be available for producing the result, or the result may be harder to account for. Agree in advance who is responsible for which resources and deliverables.',
  ],
}

const axes: Readonly<Record<string, Copy>> = {
  ACTIVE_STEM_FUNCTION_DAMAGE: ['겉으로 작동하는 핵심 기능에 실제 제약이 남습니다.', '外に現れる中心の働きには、実際の制約が残ります。', 'A real constraint remains on a key outward function.'],
  OPERATING_STEM_PATH_WITH_ACTIVE_DAMAGE_OR_BURDEN: ['겉으로 발휘되는 힘은 작동하지만, 손상이나 감당 부담도 남습니다.', '外に発揮される力は働くものの、制約や負担も残ります。', 'Outward activity remains possible, with limits or demands that still have to be carried.'],
  ADVERSE_STEM_FUNCTION_RELIEVED: ['겉으로 부담을 더하던 작용이 제어됩니다.', '外に負担を加えていた働きが抑えられます。', 'An outward influence that was adding strain is held back.'],
  REQUIRED_STEM_PATH_LOST: ['겉으로 드러나는 기능에 필요한 작용이 멈춰 있습니다.', '外に現れる機能を支えるために必要な働きが止まっています。', 'A function needed to support outward activity has stopped.'],
  OPERATING_STEM_PATH_WITH_LIMITATIONS: ['겉으로 드러나는 핵심 기능이 제약 속에서도 이어집니다.', '制約はありますが、外に現れる中心の働きは続きます。', 'A key outward function continues within limits.'],
  STEM_PATH_REQUIREMENTS_SATISFIED: ['겉으로 드러나는 핵심 기능을 발휘할 조건이 갖춰져 있습니다.', '外に現れる中心の働きを発揮する条件が整っています。', 'The conditions for a key outward function are in place.'],
  ACTIVE_BRANCH_FUNCTION_DAMAGE: ['생활의 바탕을 받치는 기능에는 실제 손상이 남습니다.', '生活の土台を支える働きには、実際の制約が残ります。', 'A real constraint remains on the functions supporting day-to-day life.'],
  BRANCH_COMMAND_RECOVERED_WITH_RESIDUAL_DAMAGE: ['생활의 중심 기능은 회복되지만 일부 손상은 이어집니다.', '暮らしを支える中心の働きは回復しますが、一部の制約は残ります。', 'The main supporting function recovers, with some impairment still present.'],
  BRANCH_FUNCTION_PROTECTED_WITH_RESIDUAL_DAMAGE: ['생활의 바탕을 지키는 작용이 이어지고, 그 바탕을 약하게 하는 작용도 일부 남습니다.', '生活の土台を守る働きが続き、それを弱める作用も一部残ります。', 'The foundations of daily life retain protection, with some weakening still present.'],
  ROOT_FUNCTION_SURVIVES_BRANCH_DISRUPTION: ['생활 기반에 흔들림이 있어도 핵심 기능을 받치는 바탕은 유지됩니다.', '生活の土台に揺れがあっても、中心の働きを支える力は保たれます。', 'Even with disruption in daily life, the support for the main function remains available.'],
  MONTH_COMMAND_CLASH: ['태어난 달에서 이어지던 생활의 중심 작용이 서로 부딪히는 힘을 받습니다.', '生まれ月から続く暮らしの中心の働きに、ぶつかり合う力が加わります。', 'A clash bears on the main supporting function associated with the birth month.'],
  CORE_ROOT_WEAKENED: ['핵심 기능이 의지하던 바탕의 힘이 줄어듭니다.', '中心の働きを支えてきた土台の力が弱まります。', 'The underlying support for a key function weakens.'],
  CAPACITY_LIMITS_BRANCH_FUNCTION: ['생활 기반의 힘이 있어도 이를 감당할 여력이 제약으로 작용합니다.', '暮らしを支える力があっても、それを引き受ける余力に制約があります。', 'Support is available, but the capacity to carry it limits what it can do.'],
  BRANCH_FUNCTION_SUPPORTED: ['생활의 중심 기능을 받치는 조건이 갖춰져 있습니다.', '暮らしの中心の働きを支える条件が整っています。', 'The conditions that support a key day-to-day function are in place.'],
}

const patternLead: Readonly<Record<string, Copy>> = {
  responsibility: [
    '힘을 쓰는 핵심 장면은 요구가 뚜렷하고 해결해야 할 문제가 있을 때입니다. 무엇이 어려운지, 어디까지 맡아야 하는지, 어떤 기준을 충족해야 하는지가 분명할수록 능력을 집중할 방향이 생깁니다.',
    '力を使う中心の場面は、要望がはっきりしていて解くべき問題があるときです。難しい部分、引き受ける範囲、満たすべき基準が明確なほど、どこに力を注ぐかが定まります。',
    'Your strengths come into play when there is a clear demand and a problem to solve. The clearer the difficulty, scope of responsibility and required standard, the easier it is to direct your effort.',
  ],
  management: [
    '강점을 발휘하려면 일이 끝났을 때 무엇이 남아야 하는지가 보여야 합니다. 여러 방법을 시도할 때도 완성 기준이 있으면, 어느 시도가 목표에 가까워졌는지 비교하고 다음 행동을 정하기 쉽습니다.',
    '強みを活かすには、終えたときに何が残るべきかが見えることが大切です。方法をいくつか試す場合も、完成の基準があると、どの試みが目標に近づいたかを比べて次の行動を決めやすくなります。',
    'Your strengths have a clearer direction when you can see what should remain at the end. With a standard for completion, you can compare several approaches and decide which move brings the work closer to its goal.',
  ],
  craft: [
    '익힌 것을 일정한 품질의 결과로 만들어 내는 데 강점이 있습니다. 한 번 좋은 발상을 얻는 것과 그 발상을 손에 잡히는 결과로 마치는 과정은 다릅니다. 직접 해 보고 결과를 확인할 수 있는 과제에서 이 강점이 쓰입니다.',
    '身につけたことを一定の質の成果に仕上げる力があります。良い発想を得ることと、それを手に取れる成果にすることには、別の過程があります。実際に試し、結果を確かめられる課題で活かせます。',
    'A strength lies in making what you have learned into a result of consistent quality. Having a good idea and bringing it to a tangible finish are different processes. This strength has room to work when you can try something and inspect what it produces.',
  ],
}

export function renderJudgmentStructure(unit: ReadingSemanticUnit, locale: CustomerReadingLocale,
  groupedPeriods?: readonly (readonly [string, string])[]) {
  const value = unit.structuralInterpretation
  if (!value) return undefined
  const i = { ko: 0, ja: 1, en: 2 }[locale]
  const pick = (copy: Copy) => copy[i]
  const actor = (value: { lifeMeaning?: string }) => value.lifeMeaning && functions[value.lifeMeaning]?.[i]
  if (value.contentId) {
    const copy = interpretationContent[value.contentId].copy[locale]
    if (unit.scope === 'natal') return copy
    const dates = bounds(unit.period)
    if (!dates) return undefined
    const format = new Intl.DateTimeFormat({ ko: 'ko-KR', ja: 'ja-JP', en: 'en-GB' }[locale], {
      timeZone: 'Asia/Seoul', dateStyle: 'long', timeStyle: 'short', hourCycle: 'h23',
    })
    const [from, to] = dates.map(value => format.format(new Date(value)))
    return copy + pick([` 적용 구간은 ${from}부터 ${to} 직전까지입니다(한국 시간).`,
      ` 期間は${from}から${to}の直前までです（韓国時間）。`,
      ` This applies from ${from} to just before ${to} (Korea time).`])
  }
  if (value.kind === 'curated_content') return undefined
  if (value.kind === 'practical_focus') return pick([
    '새 환경에 들어서면 무엇을 해내야 하고 실제로 무엇을 쓸 수 있는지부터 파악하는 편입니다. 조건이 달라지면 예전 방식을 그대로 따르기보다, 그대로 둘 기준과 바꿔야 할 세부를 나눠 적응할 수 있습니다. 결과를 분명히 하려는 태도와 세부를 꼼꼼히 확인하는 태도가 이때 함께 쓰입니다.',
    '新しい環境では、何を成し遂げる必要があり、何を実際に使えるかを先に把握する傾向があります。条件が変わったら、以前の方法をそのまま続けるより、維持する基準と変える細部を分けて対応できます。成果を明確にする姿勢と細部を確認する姿勢がともに活きます。',
    'In an unfamiliar setting, you tend to start by finding out what needs to be achieved and what is actually available. When conditions change, you can adapt by separating the standards to keep from the details that need to change. Your concern for a clear result and your attention to detail work together here.',
  ])
  if (value.kind === 'conditioned_tendency') return value.tendency === 'demands_compete_with_self_care' ? value.reduced ? pick([
    '요구를 처리할 방법이 있어도 맡을 일이 한꺼번에 늘면 자신의 일정에 쓸 여유가 줄 수 있습니다. 익숙한 방식으로 바로 해결할 수 있는 요청과, 시간을 따로 내야 하는 요청을 나눠 받아들이는 편이 좋습니다.',
    '要望に対処する方法があっても、引き受けることが一度に増えると、自分の予定に使う余裕が減ることがあります。慣れた方法で対応できることと、別に時間を取る必要があることを分けて引き受けると役立ちます。',
    'Even when you have a way to handle demands, taking on several at once can leave less room in your own schedule. Distinguish requests you can handle with a familiar method from those that need time set aside.',
  ]) : pick([
    '다른 사람의 요구를 처리하는 데 집중할수록 자신의 일정과 여유를 뒤로 밀기 쉽습니다. 요청이 겹친다면 필요한 답을 주는 일과 새 책임을 맡는 일을 구분해, 어디까지 대응할지 먼저 정하는 편이 좋습니다.',
    '人の要望への対応に集中するほど、自分の予定や余裕を後回しにしやすくなります。要望が重なるなら、必要な返答をすることと新たな責任を負うことを分け、どこまで応じるかを先に決めると役立ちます。',
    'The more attention other people’s demands take, the easier it is to put your own schedule and available time aside. When requests pile up, distinguish answering a question from taking on responsibility for the work.',
  ]) : pick([
    '검토할 이유가 계속 늘어나는 상황에서는 한 번 더 알아보는 것이 실제로 판단을 바꾸는지 확인해 보세요. 판단이 바뀌지 않는다면 작은 범위에서 시험해 보는 편이 유용할 수 있습니다.',
    '検討する理由が増え続ける場面では、さらに調べることで判断が変わるかを確かめられます。判断が変わらないなら、小さな範囲で試してみる方法が役立つことがあります。',
    'When reasons for further review keep accumulating, ask whether another check would change the decision. If it would leave the decision the same, a small trial may be more useful.',
  ])
  if (value.kind === 'shared_support') {
    const support = actor(value.other)
    if (!support) return undefined
    return value.setting === 'close' ? pick([
      `가까운 사이에서 함께 결정을 내릴 때는 ${support}이 도움이 됩니다. 같이 정해야 할 기준을 먼저 맞추고 각자가 정할 몫을 남겨 두면, 도움을 받으면서도 자기 판단을 유지할 수 있습니다.`,
      `身近な人と一緒に決めるときは、${support}が役立ちます。共に決める基準をそろえ、それぞれが判断する部分を残すと、助けを受けながら自分の判断も保てます。`,
      `In decisions with someone close, ${support} can help. Agree on what needs a shared standard and leave room for each person’s own decisions.`,
    ]) : pick([
      `사회적 관계에서는 ${support}이 역할을 유지하는 데 도움이 됩니다. 서로 기대하는 기준이 분명하면 어디까지 도울 수 있고 누가 결정해야 하는지 말로 맞추기 쉽습니다.`,
      `社会的な関係では、${support}が役割を保つ助けになります。互いの基準がはっきりしていれば、どこまで手伝い、誰が決めるかを言葉にしやすくなります。`,
      `In social relationships, ${support} helps sustain a role. Clear expectations make it easier to discuss where you can help and who makes the decision.`,
    ])
  }
  if (value.kind === 'connected_functions') return pick([
    `${actor(value.source)}을 바탕으로 직접 판단한 내용을 ${actor(value.target)}에 쓸 수 있습니다. 배운 사례를 새 과제에 적용할 때 어떤 전제가 달라졌는지 직접 확인하면, 익힌 내용을 실제 작업에 옮기기 쉽습니다.`,
    `${actor(value.source)}を土台に、自分で判断した内容を${actor(value.target)}に活かせます。学んだ事例を新しい課題に使うとき、前提がどこで変わったかを確かめると、実際の仕事に移しやすくなります。`,
    `You can draw on ${actor(value.source)} to make an independent judgment and apply it through ${actor(value.target)}. When adapting a familiar example, identify which assumptions changed before putting it into practice.`,
  ]) + (value.weakened ? pick([
    ' 그 과정에 쓸 여력에는 제약이 있습니다.', ' その過程に使える余力には制約があります。', ' The capacity available for this process is limited.',
  ]) : '')
  if (value.kind === 'linked_response') {
    const lead = value.path === 'knowledge_and_pressure' ? pick([
      '까다로운 요구에는 이미 배운 것을 꺼내어 쓸 때 대응할 길이 생깁니다. 요구가 무엇인지 구체화하고 비슷한 문제를 풀었던 지식이나 절차를 대입해 볼 수 있습니다. 다만 목표를 키우거나 자원을 더 쓰기로 하면, 지식으로 다루던 어려움에 새 책임이 얹힙니다. 해결 방법이 있다는 판단과 이번에 얼마나 더 맡을 수 있는지는 따로 해야 합니다.',
      '難しい要望には、すでに学んだことを使うと対処する道が開けます。要望を具体的にし、似た問題を解いた知識や手順を当てはめられます。ただし、目標を広げたり資源を追加したりすると、対処していた難しさに新しい責任が加わります。解き方があることと、どこまで追加で引き受けられるかは別に判断できます。',
      'What you have already learned gives you a way to handle demanding requests. Define the request, then apply knowledge or a procedure that solved a similar problem. Expanding the goal or committing more resources can add new responsibility. Having a way to solve the problem and having room to take on more are separate decisions.',
    ]) : value.path === 'production_and_pressure' ? pick([
      '배우거나 연구한 것을 실제로 써 볼 수 있는 형태로 바꾸면 원하는 결과에 가까워집니다. 같은 기술로 일이 까다로워졌을 때 해결할 부분을 좁힐 수도 있습니다. 다만 결과를 더 내기 위해 범위를 넓히는 과정에서 맡을 책임이 커집니다. 처리할 기술이 있다고 해서 새로 늘어난 일까지 같은 속도로 이어 갈 수 있는 것은 아닙니다.',
      '学んだことや研究したことを、実際に使える形にすると、求める成果に近づきます。同じ技術で、難しくなった仕事のうち何を解くかを絞ることもできます。ただし、成果を増やすために範囲を広げると、引き受ける責任も増えます。対処する技術があっても、増えた仕事まで同じペースで続けられるとは限りません。',
      'Turning what you have studied or researched into something usable moves you toward the intended result. The same skill can help narrow a difficult problem. Expanding the work to produce more also increases what you take on. Having the technique to solve a problem does not ensure you can keep up the same pace with added work.',
    ]) : pick([
      '자기 힘으로 작업의 순서를 정할 수 있으면 새로운 방법을 찾고 설명하는 힘을 계속 쓸 수 있습니다. 동시에 검토를 더 하려는 힘이 커지면 제작과 마무리에 쓸 몫이 줄어듭니다. 부담이 큰 요구에 바로 반응하는 작용과 그에 맞물린 표현은 제한되지만, 본인이 선택한 방법을 정리해 전달하는 힘은 다른 경로에 남습니다. 직접 써 보고 결과를 확인할 수 있는 단계와 설명을 더 다듬어야 할 단계를 나누는 것이 도움이 됩니다.',
      '自分で作業の順序を決められると、新しい方法を探し説明する力を使い続けられます。同時に、確認を増やす力が強まると、制作と仕上げの余力が減ります。重い要望にすぐ反応する働きと、それに結びつく表現には制約がありますが、自分で選んだ方法を整理して伝える力は別の働きとして残ります。実際に試して結果を見られる段階と、説明をさらに整える段階を分けると役立ちます。',
      'When you can choose the sequence of the work yourself, you can keep looking for new approaches and explain them. More review, however, leaves less room for making and finishing. The immediate response to demanding requests and the expression tied to it are constrained. The ability to explain a method you chose still has a separate route. Distinguish the stage when you can try the method and inspect the result from the stage when an explanation needs more work.',
    ])
    const capacityLimited = value.dayRoot === 'weakened' || value.capacity?.endsWith('_insufficient')
    const limit = capacityLimited ? pick([
      ' 버틸 기반이 약해진 상태에서는 한 번 해낼 수 있는 양과 계속 유지할 수 있는 양에 차이가 생깁니다. 맡는 범위를 먼저 정하고, 결과를 내기 위해 써야 할 시간과 그 뒤에도 남는 책임을 각각 확인하는 편이 좋습니다.',
      '持ちこたえる土台が弱まると、一度にできる量と続けて維持できる量に差が出ます。最初に引き受ける範囲を決め、仕上げに必要な時間と、その後も残る責任を分けて確かめると役立ちます。',
      'With weaker underlying support, what you can complete once can differ from what you can sustain. Set the scope first, then check the time the result will take and the responsibility that remains afterward.',
    ]) : ''
    const guard = value.protected ? value.residual === 'weakened' ? pick([
      ' 기술이 부담을 일부 덜어 주지만, 해결 후에도 직접 맡아야 하는 일이 남습니다.',
      ' 技術が負担を一部軽くしますが、解決した後も自分で引き受ける部分は残ります。',
      ' Skill eases some of the pressure, with responsibilities still left to carry.',
    ]) : pick([
      ' 생활을 받치는 쪽에는 부담을 줄이는 힘이 있지만, 바깥에서 들어오는 요구까지 모두 사라지지는 않습니다.',
      ' 暮らしを支える側には負担を軽くする力がありますが、外からの要望まですべてなくなるわけではありません。',
      ' Your day-to-day footing eases some pressure, while demands coming from outside remain active.',
    ]) : ''
    const support = value.seasonalSupport ? pick([
      ' 이 힘은 그때그때 생기는 계기에만 의지하지 않습니다. 원래 갖춘 기반이 받치므로, 익힌 방법을 다시 꺼내 쓸 여지가 있습니다.',
      ' この力はその場のきっかけだけに頼るものではありません。もともとの土台があるため、身につけた方法を取り出してもう一度使う余地があります。',
      ' This ability has established support beyond any immediate opportunity. What you have learned remains available to put to use again.',
    ]) : value.seasonalLimitNotStop ? pick([
      ' 목표가 겉으로 크게 드러나지 않는 조건에서도, 결과를 추구하는 힘은 실제 기반이 있어 작동합니다.',
      ' 目標が表に大きく見えない条件でも、成果を追う力には実際の土台があり、働いています。',
      ' Even when the goal is less visible, the drive for results has support and remains active.',
    ]) : ''
    const link = value.distinguish && value.links?.find(item => item.action === 'strengthen')
    const positions: Readonly<Record<string, Copy>> = {
      year: ['출생 연도 쪽', '生まれ年に対応する側', 'the birth-year side'],
      month: ['출생 월 쪽', '生まれ月に対応する側', 'the birth-month side'],
      time: ['출생 시각 쪽', '生まれた時間に対応する側', 'the birth-time side'],
      day: ['본인 쪽', '本人に対応する側', 'your own side'],
    }
    const source = link && positions[link.source.position], target = link && positions[link.target.position]
    const distinction = link && source && target && pick([
      `여기서는 ${pick(source)}의 ${actor(link.source)}이 ${pick(target)}의 ${actor(link.target)}에 닿는 과정이 중요합니다.`,
      `ここでは、${pick(source)}の${actor(link.source)}が${pick(target)}の${actor(link.target)}に届く過程が重要になります。`,
      `Here the link runs from ${actor(link.source)} on ${pick(source)} to ${actor(link.target)} on ${pick(target)}.`,
    ])
    return [lead, distinction, limit.trim(), guard.trim(), support.trim()].filter(Boolean).join(' ')
  }
  if (value.kind === 'coordination') {
    if (!value.recurrence) return pick([
      '여러 조건이 맞물린 과제에서는 세부를 익히고 나중에 다시 써먹을 수 있도록 정리하는 능력이 도움이 됩니다. 작업을 직접 해 보면서 어느 단계에서 결과가 달라지는지 비교할 수 있는 환경이라면, 차이를 놓치지 않는 집중력을 쓰기 좋습니다.',
      '条件がいくつも絡む課題では、細かい違いを身につけ、後で使えるよう整理する力が役立ちます。実際に作業しながらどの段階で結果が変わるかを比べられる環境で、違いを見落とさない集中力を活かせます。',
      'When a task has several interlocking conditions, it can help to learn the details and organize them for later use. Working through the task and comparing where the result changes gives your attention to detail somewhere useful to go.',
    ])
    const dates = bounds(unit.period)
    if (!dates) return undefined
    const date = new Intl.DateTimeFormat({ ko: 'ko-KR', ja: 'ja-JP', en: 'en-GB' }[locale], {
      timeZone: 'Asia/Seoul', dateStyle: 'long', timeStyle: 'short', hourCycle: 'h23',
    })
    const [from, to] = dates.map(value => date.format(new Date(value)))
    return pick([
      `서로 맞춰야 할 조건이 다시 많아지는 구간입니다. 원하는 결과를 향해 일을 진행할 때 무엇을 먼저 결정할지와 나중에 바꿔도 되는 부분을 나누면 도움이 됩니다. 세부를 직접 챙길 힘이 있어도, 조율할 일을 전부 본인이 떠맡아야 한다는 뜻은 아닙니다. ${from}부터 ${to} 직전까지입니다(한국 시간).`,
      `すり合わせる条件が再び増える時期です。目指す成果に向けて進めるときは、先に決めることと後から変えられることを分けると役立ちます。細部を自分で見られても、調整を全部一人で引き受ける必要はありません。${from}から${to}の直前までです（韓国時間）。`,
      `More conditions need to be coordinated again during this period. As you work toward a goal, separate decisions that need to be made first from those you can revisit. Your ability to handle details does not mean taking on every adjustment yourself. From ${from} to just before ${to} (Korea time).`,
    ])
  }
  // Master 11 §§ stem/branch and day position: a contrast of contexts,
  // without implying there is a chronological sequence or a resulting event.
  if (value.kind === 'position_contrast') return pick(({
    demand_and_results: [
      '바깥일에서는 어떤 요구가 걸려 있고 어디까지 책임져야 하는지가 판단을 이끕니다. 자기 생활에서 선택을 내릴 때는 실제로 갖게 될 결과와 유지할 수 있는 범위에 더 무게를 둘 수 있습니다. 다른 사람이 무엇을 기대하는지 파악한 뒤에도 그 기대에 응하는 것이 자신에게 필요한 선택인지는 따로 생각하는 면이 있습니다.',
      '外の用事では、何を求められ、どこまで責任を負うかが判断を導きます。自分の暮らしで選ぶときは、何が手元に残り、どこまで維持できるかを重く見やすくなります。周囲の期待が分かっても、それに応じることが自分に必要かどうかは別に考える面があります。',
      'Outside demands and the limits of your responsibility can guide your public decisions. In your own life, what you gain and can continue to maintain may weigh more heavily. Once you understand what other people expect, you can still consider whether meeting it is the choice you need.',
    ],
    steady_and_flexible: [
      '밖에서 맡은 일을 판단할 때는 무엇을 남겨야 하는지와 정해진 몫을 어떻게 관리할지가 기준이 됩니다. 가까운 사람과 생활 속 선택을 할 때는 지금 가진 것을 어디에 쓰면 가장 실질적인지 여러 쓰임을 놓고 비교할 수 있습니다. 기준에 맞춰 정리하는 면과 상황에 맞춰 쓰임을 바꾸는 면은 서로 다른 자리에서 힘을 씁니다.',
      '外で引き受けたことを判断するときは、何を残すか、決まった分をどう管理するかが基準になります。身近な人と暮らしの選択をする場合は、手持ちのものをどこに使うと実際に役立つか、使い道をいくつか比べられます。基準に沿って整える面と、状況に応じて使い道を変える面は、別々の場面で活きます。',
      'In work you take on publicly, what must be delivered and how to manage an allotted share can guide you. In everyday decisions with people close to you, you may instead compare several practical uses for what you have. Keeping to a standard and changing how resources are used can serve you in different settings.',
    ],
    expression_and_review: [
      '사람들과 의견을 주고받을 때는 다른 방법을 찾아 말로 풀어내는 면이 드러납니다. 자신에게 중요한 생활 결정을 내릴 때는 무엇을 믿고 판단할 수 있는지 정보를 먼저 고르는 쪽으로 무게가 옮겨갑니다. 생각을 분명히 표현하는 것과 마음속으로 결정을 굳히는 것은 서로 다른 과정입니다.',
      '人と意見を交わすときには、別の方法を探し、言葉で説明する面が表れます。自分にとって大切な暮らしの判断では、何を根拠にできるかを先に選ぶ方に重みが移ります。考えをはっきり伝えることと、自分の中で決断を固めることは別の過程です。',
      'In discussion, you may show a willingness to find another approach and put it into words. In personal decisions that matter to you, the emphasis shifts to selecting the information you can rely on. Expressing a view clearly and settling on a choice privately are different processes.',
    ],
  } as const)[value.contrast])
  if (value.kind === 'applied_mechanism') return pick(applications[value.mechanism]) + (value.reduced ? value.adverse ? pick([
    ' 이 제약은 일부 완화됐으므로 어떤 조건에서 남는지를 확인하는 편이 좋습니다.',
    ' この制約は一部和らいでいるため、どんな条件で残るかを確かめると役立ちます。',
    ' The constraint is partly eased, so check the conditions under which it still matters.',
  ]) : pick([
    ' 이 방법이 부담을 모두 덜어 주는 것은 아니므로, 처리한 부분과 여전히 남은 요구를 구분하는 편이 좋습니다.',
    ' この方法で軽くなる負担には範囲があるため、処理できた部分と残る要求を分けておくと役立ちます。',
    ' Its reach is limited, so distinguish what the approach has dealt with from the demands that remain.',
  ]) : '')
  if (value.kind === 'latent_goal') return pick([
    '성과를 생각할 때 출발점은 무엇을 만들고 개선할 수 있느냐에 있습니다. 기대하는 결과는 있어도 그것이 생산 활동을 이끌고 실질적인 결실로 이어지는 흐름까지 확인되지는 않습니다. 결과의 목표를 세울 때는 먼저 손에 남길 결과물이 무엇이고 어느 단계면 완성인지 정하는 편이 맞습니다.',
    '成果を考えるとき、出発点は何を作り、何を改善できるかです。期待する結果はあっても、それが制作を主導して実質的な成果に結びつく流れまでは確認できません。目標を立てる場合は、何を仕上げて手元に残すか、どの段階を完成とするかを先に決めると役立ちます。',
    'When considering results, start with what you can make or improve. A desired result can be present without a clear path by which it drives production and turns into a tangible return. In setting a goal, define what you intend to finish and what counts as complete.',
  ]) + (value.mixedMethod ? pick([
    ' 만들던 것을 더 잘되게 고치는 힘과 한 가지 결과를 끝까지 완성하는 힘은 서로 다른 때에 필요합니다. 개선할 부분을 찾았을 때도 현재 결과를 마치기 전에 꼭 바꿔야 하는지 구분할 수 있습니다.',
    ' 作り方をもっと良くする力と、一つの成果を最後まで仕上げる力は、必要になる場面が異なります。改善が見つかっても、今の成果を完成させる前に直す必要があるかを区別できます。',
    ' Improving the method and seeing one result through to completion call on different abilities. When you spot an improvement, ask whether it needs to be made before the current result can be finished.',
  ]) : '') + (value.outputPressured ? pick([
    ' 검토나 자료를 더 보태느라 완성에 쓸 힘이 줄어드는 경우에는 추가 검토가 결과를 바꾸는지 확인하고, 제작에 쓸 몫을 따로 남겨 두는 것이 기준이 됩니다.',
    ' 調べ物や確認を増やして仕上げる力が削がれる場合は、追加の確認で結果が変わるかを見て、制作に使う余力を残すことが判断の基準になります。',
    ' If further research or review leaves less room to finish, check whether the additional work would change the result and reserve capacity for making it.',
  ]) : '')
  if (value.kind === 'pattern') {
    const main = value.commandMeaning && functions[value.commandMeaning]?.[i]
    const rooted = value.functions.filter(item => item.rooted).length
    const functionsInUse = value.functions.map(item => {
      const label = actor(item)
      if (!label) return undefined
      return pick([
        `${item.reduced ? '제한된 범위에서 발휘되는 ' : ''}${label}`,
        `${item.reduced ? '限られた範囲で働く' : ''}${label}`,
        `${label}${item.reduced ? ' within limits' : ''}`,
      ])
    })
    if (!main || functionsInUse.some(text => !text)) return undefined
    const lead = value.commandMeaning && patternLead[value.commandMeaning]
    return (lead ? pick(lead) : pick([`타고난 강점을 살릴 때는 ${main}이 중심이 됩니다.`,
      `もともとの強みを活かすうえでは、${main}が中心になります。`,
      `The underlying strengths are organized around ${main}.`]))
      + ' ' + pick([
        `이 바탕에는 ${functionsInUse.join(', ')}이 함께 작동합니다.`,
        `その背景では、${functionsInUse.join('、')}が働きます。`,
        `This draws on ${functionsInUse.join(', ')}.`,
      ]) + (rooted === value.functions.length ? pick([
        ' 이 작용은 특정 시기에만 생기는 것이 아니라 원래 갖춘 기반에도 기대고 있습니다.',
        ' これらの働きは特定の時期だけに現れるものではなく、もともと備わっている土台にも支えられています。',
        ' These functions have underlying support in the birth chart, beyond what is present in any one period.',
      ]) : rooted ? pick([
        ' 이 가운데 일부 기능은 원래 갖춘 기반에서도 힘을 얻습니다.',
        ' このうち一部の働きは、もともと備わっている土台にも支えられています。',
        ' Some of these functions also have underlying support in the birth chart.',
      ]) : '')
  }
  if (value.kind === 'axis') {
    const period = bounds(unit.period)
    const notes = [...new Set([...(value.stem ?? []), ...(value.branch ?? []), ...(value.reasons ?? [])])]
      .flatMap(reason => axes[reason] ? [pick(axes[reason])] : [])
    if (!period) return undefined
    const formatter = new Intl.DateTimeFormat({ ko: 'ko-KR', ja: 'ja-JP', en: 'en-GB' }[locale], {
      timeZone: 'Asia/Seoul', dateStyle: 'long', timeStyle: 'short', hourCycle: 'h23',
    })
    const clean = (date: string) => locale === 'ja' ? date.replace(',', '') : date
    const scope = value.comparison === 'previous' ? pick(['이전 장기 흐름에서는', '前の長期周期では', 'In the previous long-term cycle,'])
      : value.comparison === 'next' ? pick(['다음 장기 흐름에서는', '次の長期周期では', 'In the next long-term cycle,'])
        : value.evaluatedWindow && unit.scope === 'sewoon'
          ? pick(['다음 해 흐름에서는', '次の年の流れでは', 'In the next yearly cycle,']) : ''
    const subject = value.shiftSubject && pick(({
      output: ['익힌 것을 결과물로 만드는 데 걸리던 제약', '身につけたことを形にする際の制約', 'the constraint on turning practiced skills into finished work'],
      responsibility: ['요구와 책임을 감당하는 데 걸리던 제약', '要求や責任を引き受ける際の制約', 'the constraint on carrying demands and responsibility'],
      resources: ['자원을 배분하고 쓰는 데 걸리던 제약', '資源を配分して使う際の制約', 'the constraint on allocating and using resources'],
    } as const)[value.shiftSubject])
    const adjustment = value.shift === 'eased' ? pick([
      ' 이전 범위에서 온전히 부담이던 작용이 여기서는 줄어듭니다. 그동안 멈췄던 일을 다시 맡을지 정할 때는 줄어든 부담과 아직 감당해야 할 몫을 나눠 확인하면 좋습니다.',
      ' それまで負担として働いていた作用はこの期間に弱まります。保留していたことに取り組む場合は、軽くなった部分とまだ引き受ける必要のある部分を分けて確かめられます。',
      ' A pressure that was fully active eases here. Before resuming anything you had put aside, distinguish what has eased from what still needs to be carried.',
    ]) : value.shift === 'returned' ? pick([
      ' 이전 범위에서 줄었던 부담이 다시 작동합니다. 예전과 같은 방식으로 일을 늘리기 전에 그때 부담을 줄였던 조건이 지금도 있는지 확인하는 편이 좋습니다.',
      ' それまで弱まっていた負担が再び働きます。以前と同じように取り組みを増やす前に、負担を軽くしていた条件が今もあるか確かめられます。',
      ' A pressure that had eased is active again. Before expanding an activity as you did before, check whether the conditions that reduced the strain still apply.',
    ]) : ''
    const namedAdjustment = subject && value.shift && pick([
      ` ${subject}이 ${value.shift === 'eased' ? '줄어듭니다.' : '다시 작동합니다.'}`,
      ` ${subject}が${value.shift === 'eased' ? '和らぎます。' : '再び働きます。'}`,
      ` Here, ${subject} ${value.shift === 'eased' ? 'eases' : 'returns'}.`,
    ])
    const outputCriterion = value.shiftSubject === 'output' && (value.shift === 'returned' ? pick([
      ' 마무리를 늦추는 검토가 다시 늘어난다면, 새 일을 보태기 전에 무엇을 확인해야 지금 맡은 결과를 넘길 수 있는지부터 분명히 해 두는 편이 좋습니다.',
      ' 仕上げを遅らせる確認がまた増えるなら、新しい作業を足す前に、今の成果を渡すために何を確かめる必要があるかを明確にできます。',
      ' If review starts delaying completion again, clarify what must be checked before the current work can be handed over, before adding anything new.',
    ]) : pick([
      ' 더 준비할 수 있는지보다 정해 둔 범위에서 실제로 하나를 완성할 수 있는지 확인하는 것이 기준입니다.',
      ' さらに準備できるかより、決めた範囲で実際に一つ仕上げられるかが判断の基準になります。',
      ' The useful test is whether you can finish one thing within the scope you set, beyond how much more preparation is possible.',
    ]))
    const rootNotes = (value.rootChanges ?? []).flatMap(rootChange => {
    const changedFunction = pick(({
      capacity: ['책임을 감당할 여력', '責任を担う余力', 'The capacity to carry responsibility'],
      main: ['핵심 능력을 발휘할 힘', '中心となる力を発揮する余力', 'The capacity to apply a key ability'],
      support: ['어려움을 덜어 주는 지원', '難しさを和らげる支え', 'Support that eases difficulty'],
      pressure: ['부담을 가하는 힘', '負担を加える力', 'The force adding to the pressure'],
    } as const)[rootChange.role])
    return [pick([
      ` 기반이 달라지면서 ${changedFunction}도 ${rootChange.improves ? '커집니다.' : '줄어듭니다.'}`,
      ` 土台が変わり、${changedFunction}も${rootChange.improves ? '増します。' : '減ります。'}`,
      ` ${changedFunction} also ${rootChange.improves ? 'increases' : 'decreases'} as its footing changes.`,
    ])]
    })
    const functionNotes = (value.changes ?? []).map(change => {
      const subject = change.subject && functions[change.subject]?.[i] || pick(({
        support: ['부담을 줄이는 지원', '負担を軽くする支え', 'The support that eases strain'],
        pressure: ['부담을 주는 작용', '負担を加える働き', 'The influence adding strain'],
        main: ['이전에 쓸 수 있던 방법', '前の期間に使えた方法', 'An approach available in the earlier period'],
      } as const)[change.context])
      return pick([
        ` ${subject}은 ${change.to === 'inactive' ? '이 구간에는 이전처럼 기대하기 어렵습니다.' : change.to === 'reduced' ? '전보다 쓰이는 범위가 줄어듭니다.' : '이번 구간에 다시 힘을 얻습니다.'}`,
        ` ${subject}は${change.to === 'inactive' ? 'この期間に止まります。' : change.to === 'reduced' ? '前の範囲より弱まります。' : 'この期間に再び働きます。'}`,
        ` ${subject} ${change.to === 'inactive' ? 'stops during this period.' : change.to === 'reduced' ? 'is more limited here.' : 'comes into operation again here.'}`,
      ])
    })
    const incomingNotes = (value.incoming ?? []).flatMap(item => {
      if (item.effect === 'burden' && item.subject === 'responsibility' && item.affected === 'capacity') return [pick([
        ' 이 기간에는 요구가 늘면서 혼자 감당할 몫도 커집니다. 이미 맡은 일과 새로 돌아오는 책임을 함께 두고 여유가 있는지 판단할 때입니다.',
        ' この期間は要求が増え、一人で引き受ける分も重くなります。すでに担っていることと新たに加わる責任をあわせて、余力を見極める時期です。',
        ' Demands increase in this period, leaving more for you to carry on your own. Consider existing commitments alongside the new responsibilities when judging how much room you have.',
      ])]
      const subject = functions[item.subject]?.[i], affected = functions[item.affected]?.[i]
      if (!subject || !affected) return []
      return [item.effect === 'burden' ? pick([
        ` 이 기간에 새롭게 힘을 얻는 ${subject}이 기존의 ${affected}에 부담을 줍니다.`,
        ` この期間に加わる${subject}が、もともとの${affected}に負担をかけます。`,
        ` An arriving influence involving ${subject} places a strain on ${affected}.`,
      ]) : item.effect === 'control' || item.effect === 'limited_control' ? pick([
        ` 이 기간에 더해지는 ${subject}으로 기존의 ${affected}을 ${item.effect === 'limited_control' ? '일부 조절할 수 있습니다.' : '조절할 여지가 생깁니다.'}`,
        ` この期間に加わる${subject}により、もともとの${affected}を${item.effect === 'limited_control' ? '一部' : ''}抑えやすくなります。`,
        ` An arriving influence involving ${subject} helps limit ${affected}${item.effect === 'limited_control' ? ' in part' : ''}.`,
      ]) : pick([
        ` 이 기간에 더해지는 ${subject}이 기존의 ${affected}을 ${item.effect === 'limited' ? '일부 돕습니다.' : '돕습니다.'}`,
        ` この期間に加わる${subject}が、もともとの${affected}を${item.effect === 'limited' ? '一部' : ''}支えます。`,
        ` An arriving influence involving ${subject} supports ${affected}${item.effect === 'limited' ? ' within limits' : ''}.`,
      ])]
    })
    const detail = [notes.join(' '), namedAdjustment || adjustment, outputCriterion || '',
      ...new Set([...rootNotes, ...functionNotes, ...incomingNotes])].filter(Boolean).join('').trim()
    if (!detail) return undefined
    const first = scope && locale === 'en' ? scope + ' ' + detail[0].toLowerCase() + detail.slice(1)
      : [scope, detail].filter(Boolean).join(locale === 'ja' ? '' : ' ')
    const ranges = (groupedPeriods ?? [period]).map(pair => {
      const [from, to] = pair.map(date => clean(formatter.format(new Date(date))))
      return pick([`${from}부터 ${to} 직전까지`, `${from}から${to}の直前まで`, `from ${from} to just before ${to}`])
    }).join(pick([' 및 ', '、', ' and ']))
    return first + ' ' + pick([
      `적용 구간은 ${ranges}입니다(한국 시간).`,
      `期間は${ranges}です（韓国時間）。`,
      `This applies ${ranges} (Korea time).`,
    ])
  }
  if (value.kind === 'support' || value.kind === 'wealth_base') {
    const label = actor(value.actor)
    if (!label) return undefined
    if (value.kind === 'wealth_base') return value.strategy === 'steadiness' ? pick([
      '성과를 추구할 때는 결과를 분명하게 정하고 손에 들어온 자원을 일정하게 관리하는 힘이 중심이 됩니다. 새로 하고 싶은 일의 범위를 정할 때, 무엇을 얻으려는지와 이후 계속 관리해야 할 몫을 나눠 보면 목표가 현실적인지 판단하기 쉽습니다.',
      '成果を追うときは、得たい結果を明確にし、手にした資源を着実に管理する力が中心になります。新しい取り組みの範囲を決めるなら、得たいものと、その後も管理を続ける部分を分けると、目標の現実性を見極めやすくなります。',
      'When pursuing results, your focus is on defining what you want and managing the resources you obtain steadily. When sizing up a new undertaking, separate what you want to gain from what you will have to keep managing.',
    ]) : pick([
      '성과를 추구할 때는 한곳에 모아 두기보다 여러 활용처를 비교하고 자원을 옮겨 쓰는 힘이 중심이 됩니다. 선택지가 늘어날수록 어떤 곳에 자원을 옮길 때 원하는 결과에 가까워지는지 분명히 해 두는 것이 중요합니다.',
      '成果を追うときは、一か所に集めるよりも、複数の使い道を比べて資源を配分する力が中心になります。選択肢が増えるほど、どこに資源を移せば目的に近づけるかを明確にしておくことが大切です。',
      'When pursuing results, your focus is on comparing uses and allocating resources across them. As options multiply, make clear which allocation would bring you closer to the result you want.',
    ])
    const scene = value.application === 'select_evidence' ? pick([
      '정보가 많고 요구가 엇갈리는 일에서는 먼저 결정을 바꿀 만한 자료를 골라 내는 과정이 도움이 됩니다. 정리한 근거를 갖고 책임 범위를 협의하면, 모든 요구에 곧바로 대응하느라 힘을 흩뜨리는 일을 줄일 수 있습니다.',
      '情報が多く要望も食い違う仕事では、先に判断を変えうる資料を選ぶことが助けになります。整理した根拠をもとに責任の範囲を話し合えば、すべての要望にその場で応じて力を分散させることを抑えられます。',
      'When information is plentiful and demands conflict, first identify the material that could change the decision. Use it to discuss the scope of responsibility, so your effort does not scatter across every demand at once.',
    ]) : value.application === 'handoff_skill' ? pick([
      '부담이 큰 요구를 받았을 때는 알고 있는 절차를 실제로 재현해 보는 것이 도움이 됩니다. 다른 사람과 맡은 일이 이어져 있다면, 자신이 해결한 부분과 다음 사람이 바로 이어받을 부분을 나눠 전달할 때 이 기술이 지원으로 이어집니다.',
      '負担の大きい要望には、知っている手順を実際に再現してみることが役立ちます。誰かの作業とつながっているなら、済ませた部分と次に引き継げる部分を分けて渡すことで、技術が支えになります。',
      'When demands are heavy, putting a familiar procedure into practice can help. Where work passes between people, distinguishing what you resolved from what the next person can pick up makes your skill useful as support.',
    ]) : ''
    return pick([
      `핵심 기능을 뒷받침하는 쪽에는 ${label}이 있습니다. 이 지원은 ${value.reduced ? '제한된 범위에서 남아 있습니다.' : '실제로 작동하고 있습니다.'}`,
      `中心の働きを支えるものに、${label}があります。その支えは${value.reduced ? '限られた範囲で' : ''}働いています。`,
      `The main function receives support from ${label}. That support is active${value.reduced ? ' within limits' : ''}.`,
    ]) + (scene ? ' ' + scene : '')
  }
  if (value.kind === 'close_context') {
    const label = actor(value.other)
    if (!label) return undefined
    return pick([
      `가까운 사람과 생활 결정을 함께 내릴 때는 자신의 판단과 두 사람이 정한 기준이 어긋나는 순간이 중요합니다. ${label}과 맞물리는 부분에 제약이 ${value.reduced ? '일부 남아 있습니다.' : '있습니다.'} 함께 쓰는 시간이나 역할을 정할 때 각자 중요하게 보는 기준을 먼저 말로 확인하면, 어떤 문제를 함께 풀어야 하는지가 분명해집니다.`,
      `身近な人と生活のことを決めるときは、自分の判断と二人で決めた基準が食い違う場面が大切です。${label}との関わりに制約が${value.reduced ? '一部残ります。' : 'あります。'} 一緒に使う時間や役割を決めるなら、互いに重視する基準を先に言葉にすると、どの問題に取り組むべきかが明確になります。`,
      `When making daily decisions with someone close, notice where your judgment differs from what you agreed together. The interaction with ${label} leaves ${value.reduced ? 'some' : 'a'} constraint. When arranging shared time or roles, starting with what each of you considers important can clarify which problem to solve together.`,
    ])
  }
  const source = actor(value.source), target = actor(value.target)
  if (!source || !target) return undefined
  if (value.kind === 'generation' && value.application) {
    const practiced = value.application === 'practiced_results'
    const body = practiced ? pick([
      '익힌 기술은 다른 사람이 받아 쓸 수 있는 결과물로 정리할 때 실질적인 성과에 닿습니다. 작업의 난도가 높았는지보다, 무엇이 완성됐고 어떤 기준으로 넘길 수 있는지가 이 연결을 분명하게 해 줍니다.',
      '身につけた技術は、他の人が使える成果物にまとめると、具体的な成果に結びつきます。作業の難しさよりも、何が完成し、どの基準で渡せるかを明確にすると、このつながりが見えます。',
      'Practiced skill comes to fruition when it is made into something others can use. Make clear what is complete and what makes it ready to hand over, regardless of how difficult the work was.',
    ]) : pick([
      '아이디어와 설명 능력은 해결책의 모양을 바꿔 원하는 결과에 닿게 할 때 힘을 냅니다. 새로운 설명을 내놓는 데서 끝내기보다, 그 설명으로 실제 선택이나 작업 결과가 어떻게 바뀌는지 보여 주는 방식이 맞습니다.',
      '発想や説明する力は、解決策の形を変えて求める結果につなげる場面で活きます。新しい説明だけで終えず、それによって選択や成果がどう変わるかを示す方法が合います。',
      'Ideas and expression help when they reshape a solution and move it toward a desired result. Go beyond offering a new explanation and show how it changes a decision or what the work produces.',
    ])
    return body + (value.reducedSource ? pick([
      ' 다만 이 결과에 힘을 쓸수록 같은 품질과 속도를 이어 갈 여력이 줄어드는 경로도 있습니다.',
      ' ただし、そこに力を使うほど、同じ質とペースを保つ余力が減る面もあります。',
      ' Bringing the result about can also reduce the capacity to sustain the same pace and quality.',
    ]) : '')
  }
  if (value.kind === 'generation') return pick([
    `${source}에서 나온 힘이 ${target}에 보태집니다. ${value.reducedSource ? '힘을 건네는 과정에서 처음 기능은 약해집니다. 결과를 만드는 힘과 그 방식을 계속 이어 갈 여력은 따로 살펴볼 만합니다.' : '힘을 건네는 작용은 확인되지만, 그 작용 때문에 처음 기능이 약해지는 변화는 확인되지 않습니다.'}`,
    `${source}から力が出て、${target}を支えます。${value.reducedSource ? '力を渡す過程で、元の働きは弱まります。成果を形にする力と、そのやり方を続ける余力は分けて見られます。' : '力が渡る作用はありますが、それによって元の働きが弱まる変化は確認されていません。'}`,
    `${source} lends force to ${target}. ${value.reducedSource ? 'The originating function weakens in the transfer. Separate the ability to produce a result from the capacity to keep using the same approach.' : 'The transfer is active, with no established weakening of the originating function through this path.'}`,
  ])
  if (value.kind === 'combination') return pick([
    `태어날 때부터 ${source}과 ${target}이 서로 묶여 두 기능이 독립적으로 작동하지 않습니다. 각각의 기능이 자리에 있다는 사실과 실제로 발휘되는 힘이 여기서 갈립니다.`,
    `生まれ持った配置では、${source}と${target}が結び合い、二つの働きは個別には表れません。`,
    `In the birth chart, ${source} and ${target} are tied together. Neither functions independently in that pairing.`,
  ]) + (value.remainingExpression ? pick([
    ' 다만 자신의 방식으로 설명하고 바꾸려는 힘은 다른 경로로 남아 있습니다. 생각이 있어도 바로 드러내지 않는 장면과, 방법을 직접 고를 수 있을 때 의견이 선명해지는 장면을 구분해 볼 수 있습니다.',
    ' 一方、自分のやり方で説明し変えていく力は、別の働きとして残っています。考えがあってもすぐには出さない場面と、方法を選べるときに意見がはっきりする場面を分けて見られます。',
    ' The drive to explain and change things in your own way remains through a separate path. Distinguish situations where you hold a view back from those where being able to choose a method brings your view forward.',
  ]) : '')
  const remedy = value.remedy && actor(value.remedy)
  const path = value.feedsPressure ? pick([
    '원하는 결과가 뚜렷할수록 자원을 더 써서 일의 범위를 넓히기 쉽고, 그만큼 받아들여야 할 요구와 책임도 커지는 경로가 있습니다. 결과를 더 얻을 수 있는지와 늘어난 책임을 맡을 수 있는지는 결정 전에 나눠 판단하는 편이 좋습니다.',
    '欲しい結果がはっきりするほど、資源を追加して取り組みを広げやすくなり、それに伴う要求や責任も増える流れがあります。得られるものが増えるかと、増えた責任を引き受けられるかは、決める前に分けて考えられます。',
    'A clear goal can make it tempting to commit more resources and expand the undertaking. This can also increase the demands and responsibility that come with it. Before agreeing, assess what the expansion offers and what you can carry as separate questions.',
  ]) : value.reviewStyle === 'alternatives' ? pick([
    '다른 해법을 계속 찾아볼 여지는 있지만, 검토할 선택지가 늘어나면 익힌 기술을 실행에 옮기거나 결과를 마치는 힘이 줄어듭니다. 지금 확인한 방법으로 작은 결과를 먼저 만들어 볼 수 있는지 판단하면, 더 알아보는 단계와 실행할 단계를 구분하는 데 도움이 됩니다.',
    '別の解き方を探す余地はありますが、検討する選択肢が増えると、技術を試し、成果を仕上げる余力が減ります。今の方法で小さな成果を先に作れるかを判断すると、さらに調べる段階と実行に移る段階を区別できます。',
    'There is room to keep looking for an alternative, but more options to evaluate can mean less capacity to try the technique or finish the work. Seeing whether the current approach can produce a small result helps separate further investigation from execution.',
  ]) : value.affectsOutput ? pick([
    '기존 자료나 익숙한 기준을 다시 확인하는 데 힘을 많이 쓰면, 배운 기술을 써서 끝까지 만들어 볼 여지가 줄어듭니다. 확인이 필수인 기준과 실제 작업을 해 봐야 알 수 있는 기준을 나누면, 지식을 준비에만 쓰지 않고 결과를 만드는 데 활용할 수 있습니다.',
    '既存の資料や慣れた基準を確かめ直すことに力を使いすぎると、技術を使って最後まで仕上げる余地が減ります。先に確かめるべき基準と、実際に作ってみて分かる条件を分けると、知識を準備から制作につなげられます。',
    'Spending too much effort rechecking existing material or familiar standards leaves less room to use your skill and finish the work. Separate what has to be checked beforehand from what you can only discover by making it.',
  ]) : pick([
    `${source}이 강해지면 ${target}에 부담이 생깁니다.`,
    `${source}から生じる作用が、${target}に負担をかけます。`,
    `An influence originating in ${source} places a strain on ${target}.`,
  ])
  return path + (value.reduced ? pick([
    ' 그 영향은 줄어들었지만 일부 남아 있습니다.', '影響は和らいでいますが、一部残ります。',
    ' That influence is reduced, with some effect remaining.',
  ]) : '') + (remedy ? pick([
    ` 이 경로에 맞서 실제로 작동하는 보호는 ${remedy}에서 옵니다.`,
    ` この作用を抑える支えは、${remedy}から来ています。`,
    ` The protection acting against this path comes from ${remedy}.`,
  ]) : '')
}
