import { traitPhraseJa } from '../../personality/render/ja/wording'
import { traitPhraseEn } from '../../personality/render/en/wording'
import type { TemporalActivation, TemporalContribution } from './timingChapters'
import type { CustomerChapterTitleKey, CustomerFlowAxisComparison, CustomerReadingParagraphPlan, OutcomeVoice, PersonalityVoice } from './types'
import type { WorkStudySemantic } from '../../outcome/workStudy'
import type { MoneyContrast } from './moneyExplanation'

export type CustomerReadingLocale = 'ko' | 'ja' | 'en'
type OtherLocale = Exclude<CustomerReadingLocale, 'ko'>
type Copy = readonly [ja: string, en: string]
const choose = (copy: Copy, locale: OtherLocale) => copy[locale === 'ja' ? 0 : 1]

const titles: Record<CustomerChapterTitleKey, Copy> = {
  basic_temperament: ['基本的な気質', 'How you tend to think and act'],
  personal_strengths: ['強みと能力', 'Strengths and abilities'],
  situational_responses: ['状況によって変わる反応', 'How your responses change with the situation'],
  relationship_style: ['人間関係と親密な関係', 'Relationships and intimacy'],
  work_and_learning_environment: ['仕事と学びの環境', 'Work and learning environments'],
  earning_and_retention: ['収入のつくり方と残す力', 'Earning and keeping money'],
  current_life_changes: ['現在の変化', 'What is changing now'],
  long_term_transitions: ['長期の流れの変化', 'Long-term transitions'],
  opportunity_and_caution_windows: ['活かせる時期と慎重に見る時期', 'Windows of opportunity and caution'],
}
export const customerTitle = (key: CustomerChapterTitleKey, locale: OtherLocale) => choose(titles[key], locale)

const outcome: Record<OutcomeVoice, Copy> = {
  earning: ['手がけた成果を収入につなげられる経路があります。', 'There is a path from the work you produce to income.'],
  skill: ['身につけた技術を、他の人が使える成果物に仕上げると収入につながる余地があります。', 'A practiced skill can earn income when it produces something others can use.'],
  expression: ['着想や表現を、他の人が使える形にまとめると収入につながる余地があります。', 'An idea or a way of expressing it can earn income when it becomes something others can use.'],
  retention: ['手元に入った資金をそのまま残しにくいことがあります。', 'It may be hard to retain what has already come in.'],
  capacity: ['収益が入っても、それを確保し続ける余力が限られることがあります。', 'Income can come in while the capacity to keep it remains limited.'],
  divisionRetention: ['すでに得た取り分に圧力がかかり、そのまま維持しにくいことがあります。', 'Pressure on funds already secured can make them harder to retain.'],
  division: ['すでに確保した取り分の一部が分かれたり、流出したりする余地があります。', 'Some of what has already been secured may be divided or flow out.'],
  protection: ['確保した取り分を減らす圧力が和らぎ、手元に残せる余地が生まれます。', 'The pressure that would reduce what you have secured eases, giving you room to retain more of it.'],
  sustainability: ['一度残せた収益を、その後も積み重ねていくことには制約があります。', 'Keeping some income once can be easier than adding to it consistently over several cycles.'],
  pressure: ['収益を得る活動が、すでにある負担を強めることがあります。', 'Activity that earns income can also intensify an existing burden.'],
  supportPressure: ['収益を求める過程で、活動を調整するための土台が弱まることがあります。', 'Pursuing income can weaken the support you rely on to keep the activity manageable.'],
  contact: ['新たに話すきっかけが生まれたり、すでに続いている関係の形が動いたりする余地があります。', 'There may be an opening for a new conversation, or a shift in how an existing relationship works.'],
  change: ['これまでの関係の形と新しい動きが重なり、つき合い方や接点が変わることがあります。方向はまだ定まりません。', 'A new influence can press against an established relationship and change how you stay in touch. The direction remains open.'],
  formation: ['接点ができる条件に加え、親密な関係へ進むことを支える条件も働きます。', 'Alongside the conditions that create contact, there is support for a connection to become closer.'],
  relationshipPressure: ['自分の表現の仕方と、親しい関係の中で期待される役割がぶつかることがあります。', 'How you express yourself may come into tension with what is expected of you in a close relationship.'],
}
const criteria: Partial<Record<OutcomeVoice, Copy>> = {
  expression: ['判断の目安は、着想が具体的に何に仕上がったかです。', 'The practical question is what the idea has actually become.'],
  skill: ['技術を身につけた段階と、使える成果を渡せる段階を分けて見ます。', 'Separate knowing the technique from being able to deliver a usable result.'],
  sustainability: ['次の機会でも、すでに残した分に上積みできるかが目安です。', 'The test is whether the next cycle adds to what you already retained.'],
  pressure: ['得られる収益と、活動が増やす負担を別々に見ます。', 'Consider potential income and the demands it adds separately.'],
  supportPressure: ['収入につながる部分と、仕事量を調整できる余地を分けて見ます。', 'Look separately at what earns income and how much room remains to regulate the activity.'],
}

const work: Record<WorkStudySemantic, Copy> = {
  work_capacity: ['確認された仕事では、考えを説明したり、実際に使える形にしたりする力を活かせます。', 'In the work identified here, you may put your abilities to use by explaining an idea or turning it into a usable result.'],
  work_difficulty: ['役割の基準と自分の進め方がぶつかると、仕事を続ける負担が増えることがあります。', 'If the role’s standards clash with how you work, carrying on in that role may become more demanding.'],
  work_resolution: ['同じ課題にかかっていた制約が和らぎ、その仕事に再び力を注げる余地が生まれます。', 'The constraint on that task eases, leaving room to put effort into it again.'],
  role_acquisition: ['確認済みの提案では、役割を果たすうえでの制約が和らぎ、条件を検討できる余地があります。', 'For an offer already identified, a barrier to performing the role eases, making its terms worth reviewing.'],
  organizational_pressure: ['確認された組織内の役割では、求められる基準と自分の進め方の間に負担が生まれることがあります。', 'In the organizational role identified here, tension can arise between required standards and your way of working.'],
  study_capacity: ['学んだことを自分で説明し直したり実践したりすると、理解を広げやすくなります。', 'Explaining material in your own words or trying it in practice may deepen your understanding.'],
  study_difficulty: ['学んだことを取り込み、積み重ねる過程でつまずくことがあります。', 'Absorbing material and building on it may encounter some friction.'],
  learning_accumulation: ['学んだことを確認し直し、少しずつ積み上げる力を使いやすい状態です。', 'Reviewing what you have learned can help you build knowledge step by step.'],
  distraction_pressure: ['周囲との競争が強い学習環境では、注意が散って自分のペースを保ちにくいことがあります。', 'In a competitive learning setting, distractions may make it harder to keep your own pace.'],
  expression_vs_formal_learning_conflict: ['試しながら答えを探すやり方と、決められた手順に従う学習との間に摩擦が生じることがあります。', 'Experimenting your way to an answer can come into tension with a prescribed learning process.'],
}

const scope: Record<TemporalActivation['scope'], Copy> = {
  natal: ['生まれ持つ傾向', 'baseline'], daewoon: ['長期周期', 'long-term cycle'],
  sewoon: ['年の周期', 'yearly cycle'], month: ['節月', 'solar-term month'], day: ['日', 'day'],
}
type Precision = 'day' | 'minute' | 'second'
const date = (value: string, locale: OtherLocale, precision: Precision = 'minute') => new Intl.DateTimeFormat(locale === 'ja' ? 'ja-JP' : 'en-GB', {
  timeZone: 'Asia/Seoul', dateStyle: 'long',
  ...(precision !== 'day' && { timeStyle: precision === 'minute' ? 'short' : 'medium', hourCycle: 'h23' }),
}).format(new Date(value))

function range(item: Pick<TemporalActivation, 'scope' | 'interval' | 'certainty'>, locale: OtherLocale, precision?: Precision) {
  if (!item.interval) return choose(scope[item.scope], locale)
  const [start, end] = item.interval.map(value => date(value, locale, precision))
  const certainty = item.certainty !== 'confirmed' ? choose(
    item.certainty === 'conditional' ? ['・条件付き', ', conditional'] : ['・限定的', ', limited'], locale) : ''
  const name = choose(scope[item.scope], locale) + certainty
  return locale === 'ja' ? `${name}（${start}から${end}の直前まで）` : `${name} (${start} to just before ${end})`
}

export function localizedPeriod(plan: CustomerReadingParagraphPlan, locale: OtherLocale) {
  const periods = new Map(plan.activations?.flatMap(item => item.startsAt && item.endsBefore
    ? [[JSON.stringify([item.scope, item.startsAt, item.endsBefore]), range({
      scope: item.scope, certainty: item.certainty, interval: [item.startsAt, item.endsBefore],
    }, locale, plan.chapterId === 'CR-05' ? 'day' : 'minute')] as const] : []))
  if (!periods.size) return ''
  const spans = [...periods.values()].join(locale === 'ja' ? '、その中の' : ', and within it, ')
  return locale === 'ja' ? ` 該当する期間は${spans}です（韓国時間）。` : ` This applies during the ${spans} (Korea time).`
}

const temporalExtra: Partial<Record<Exclude<TemporalActivation['voice'], OutcomeVoice>, Copy>> = {
  healthPressure: ['日々の生活リズムを丁寧に見たい負担', 'strain that calls for closer attention to your daily routine'],
  workSupport: ['確認された仕事を支える条件', 'support for the work identified'],
  workPressure: ['確認された役割にかかる負担', 'pressure on carrying out the role identified'],
  studySupport: ['確認された学習活動を助ける条件', 'support for the learning activity identified'],
  studyPressure: ['確認された学習活動を続けるうえでの負担', 'pressure on sustaining the learning activity identified'],
  contract_favorable: ['契約の進行を支える条件', 'support for advancing a contract'],
  contract_delay: ['契約日程が遅れる可能性', 'conditions that could delay contract timing'],
  contract_process_trouble: ['契約手続きの摩擦', 'possible friction in the contracting process'],
  contract_termination_or_restructure: ['契約を維持する条件の見直し', 'a possible need to review the terms for continuing a contract'],
  business_start_favorable: ['事業の開始を支える条件', 'support for starting a business'],
  business_start_delay: ['事業開始に時間がかかる可能性', 'conditions that could delay starting a business'],
  business_expansion_favorable: ['事業の拡張を支える条件', 'support for business expansion'],
  business_adjustment: ['事業運営の調整が必要になる可能性', 'a possible need to adjust operations'],
  business_restructure: ['事業の運営構造を見直す可能性', 'a possible need to review the operating structure'],
}

function temporalText(value: TemporalContribution, locale: OtherLocale) {
  const first = value.activations[0]
  if (!first) return undefined
  const label = (voice: TemporalActivation['voice']) => {
    const entry = outcome[voice as OutcomeVoice] ?? temporalExtra[voice as keyof typeof temporalExtra]
    return entry && choose(entry, locale).replace(/[.。]$/u, '')
  }
  const prior = value.before && label(value.before.voice)
  const body = label(first.voice)
  if (!body || value.before && !prior) return undefined
  const changes: Record<NonNullable<TemporalContribution['change']>, Copy> = {
    new_activation: ['新たに働く可能性がある作用', 'An influence that may start operating'],
    strengthening: ['前の時期より強まりうる作用', 'An influence that may strengthen from the previous period'],
    weakening: ['前の時期より弱まりうる作用', 'An influence that may weaken from the previous period'],
    direction_change: ['同じ対象に働く方向の変化', 'A change in direction for the same subject'],
    protection_change: ['同じ対象を守る働きの変化', 'A change in what protects the same subject'],
    burden_change: ['負担に加わる新しい作用', 'An additional influence on an existing burden'],
    release: ['以前は抑えられていたものが再び働く可能性', 'An influence previously held back that may return'],
    suppression: ['これまでの作用が抑えられる可能性', 'An established influence that may be held back'],
    burden_ended: ['以前の負担が抑えられる可能性', 'An earlier burden that may let up'],
  }
  const headings: Record<TemporalContribution['role'], Copy> = {
    current_change: ['現在の作用', 'What is active now'],
    long_term_transition: ['長期周期の切り替わり', 'A transition in the long-term cycle'],
    opportunity_window: ['活かせる条件', 'An opportunity to use'],
    caution_window: ['慎重に見たい条件', 'A condition to watch'],
  }
  const heading = choose(value.change ? changes[value.change] : headings[value.role], locale)
  const previous = prior && prior !== body
    ? locale === 'ja' ? ` 以前は「${prior}」という働きがありました。` : ` The previous period concerned “${prior}”.`
    : ''
  const boundary = value.boundary ? locale === 'ja' ? ` 切り替わりは${date(value.boundary, locale)}です。`
    : ` The change of cycle occurs at ${date(value.boundary, locale)}.` : ''
  const spans = value.activations.map(item => range(item, locale)).join(locale === 'ja' ? '、その中の' : ', and within it, ')
  const earning = first.voice === 'earning' && (first.mechanism === 'skill_production' ? outcome.skill : outcome.expression)
  const careful = [first, ...value.activations.slice(1), ...(value.before ? [value.before] : [])]
    .some(item => item.certainty !== 'confirmed') ? choose([' 条件が成り立つ範囲で読める作用です。', ' This applies only where the supporting conditions hold.'], locale) : ''
  return (locale === 'ja' ? `${heading}は「${body}」です。${previous}${boundary} 該当期間は${spans}です（韓国時間）。`
    : `${heading} — ${body}.${previous}${boundary} The relevant period is the ${spans} (Korea time).`)
    + (earning ? ' ' + choose(earning, locale) : '') + careful
}

const patterns: Record<string, { response: Copy; result?: Copy }> = {
  outward_composure_limits_delegation: { response: ['気に障る言葉も、その場では笑って流すことがあります。その後で大事な仕事を誰に任せるかを考えるとき、先ほどの言葉が判断に影響することがあります。会話を続けるときと、責任を分け合うときで、重視することが変わります。', 'You may laugh off an uncomfortable remark in the moment. Later, when deciding whom to trust with important work, the same remark can carry weight. Different considerations can guide how you keep a conversation going and how you share responsibility.'] },
  intent_reconsideration_delays_start: { response: ['やってみたいことが浮かぶと進みたくなりますが、動く直前に今始めてよいかを見直すことがあります。', 'An idea can make you want to get started, then prompt one more check just as you are about to act.'], result: ['確認が長引くと、最初の一歩が遅れることがあります。', 'If that check takes time, the first step can be delayed.'] },
  extended_review_inhibits_action: { response: ['新しい試みを前に検討が長引くと、試す前からうまくいかない可能性を重く見がちです。', 'When review stretches out before a new undertaking, you may give more weight to what could go wrong before you have tried it.'], result: ['その判断が先に立つと、試さずに見送ることがあります。', 'If that judgment takes over, you may decide against trying.'] },
  haste_increases_errors: { response: ['考えから判断、実行へと素早く進みやすく、確認が足りないと急ぎすぎることがあります。', 'You can move quickly from idea to decision to action. Without enough review, that pace can turn into haste.'], result: ['その場合は実行中にミスが増えることがあります。', 'When it does, mistakes can become more frequent during execution.'] },
  rechecking_after_completion: { response: ['自分の仕事には厳しい基準を当て、終えた後も足りないところを見直すことがあります。', 'You hold your own work to an exacting standard and may revisit what still seems incomplete after finishing.'] },
}

const traitApplications: Readonly<Record<string, Copy>> = {
  'ability:계획대로 꼼꼼하게 완성함': [
    '仕上がりの基準がはっきりしている課題では、計画に沿って細部を整える力を使いやすくなります。段階が分かれている仕事なら、最初に合わせた条件が最後の成果物にも反映されているかを確かめる場面で活かせます。',
    'When a task has clear standards for completion, you can use your ability to follow a plan and attend to detail. On work with several stages, that can mean checking that the final result still meets the requirements agreed at the beginning.',
  ],
  'ability:관심 분야에 깊게 몰입함': [
    '関心のある題材は、ひと通り眺めるだけで済ませず、掘り下げる傾向があります。一つの問題に時間をかけられる環境なら、資料を絞って細かな違いを見分けることにその集中力を活かせます。',
    'When a subject catches your interest, you tend to look beyond an initial survey and go deeper. Where you have time to stay with one problem, that concentration can help you narrow the material and notice distinctions that would be easy to miss.',
  ],
  'ability:기존 방식에 얽매이지 않고 새로운 방식을 적용함': [
    'これまでの手順で問題を解きにくいときは、別の方法を実際に試すことに前向きです。課題が止まったとき、目標を変える前に、同じ目標に届く別の手順を試す場面でこの強みを活かせます。',
    'When the usual procedure stops working, you are open to trying a different method in practice. On a stalled task, this can show up in testing another way to reach the same goal before deciding to change the goal itself.',
  ],
  'problem:분석력': [
    '複雑な問題では、条件を分けて、どこが判断を変えるのかを見つける力があります。会議で意見が割れたら、前提が違うのか、同じ前提から別の結論に達したのかを分けると、次に調べることを絞れます。',
    'You can break a complicated problem into its conditions and identify which one changes the answer. In a meeting with competing views, first distinguish different assumptions from different conclusions drawn from the same assumption. That gives you a more precise question to investigate.',
  ],
  'problem:위기 돌파': [
    '行き詰まったときも、手を離さず次にできることを探す力があります。計画が崩れたなら、残った選択肢のうち実際に試せるものに手をつけやすいでしょう。',
    'When a plan stalls, you can stay with the problem and look for a way through. If the original plan falls apart, this can mean identifying which of the remaining options you can actually test.',
  ],
  'collaboration:협동': [
    '共同の目的がはっきりしている場面では、協力する力を使いやすくなります。前の工程が終わってから次に進む仕事なら、自分の担当を済ませたかに加え、次の人がすぐに動くために何を渡すべきかも見ておけます。',
    'Cooperation comes more readily when everyone is clear about the shared task. Where one step depends on another, you can contribute by checking both whether your own work is complete and what the next person needs in order to pick it up.',
  ],
  'collaboration:치열하게 경쟁하거나 동료와 강하게 연대함': [
    '目標を共有する仲間とは、強く足並みをそろえられます。各自の目標が違うと競争心が前に出ることがあるため、何を一緒に成し遂げたいかで協力の形が変わります。',
    'You can stand firmly with colleagues who share a goal. When you are pursuing different goals, competitive energy may come to the fore. What you are trying to achieve together can change how that energy shows up.',
  ],
  'ability:완료한 작업도 다시 점검함': [
    '仕事が終わった後、渡す前の確認に力を使えます。何度も直した資料なら、本文の数字だけでなく、表や要約にも同じ修正が入っているかを確かめると、受け取る人が迷いにくくなります。',
    'You can bring particular care to the final check before handing over work. On a document that has gone through several revisions, for example, you can check that the same change reached the table and the summary as well as the main text.',
  ],
  'information:정보를 비판적으로 선별함': [
    '新しい情報の中から、判断に使えるものともう一度確かめたいものを分ける傾向があります。説明の断言の強さより、何が実際に選択を変えるかを見ると、この力が活きます。',
    'You tend to sort new information into what you can use and what you still need to check. When accounts disagree, the useful distinction is between information that would actually change the decision and background you can keep in view.',
  ],
}

const workApplications: Readonly<Record<string, Record<CustomerReadingLocale, string>>> = {
  '다른 분야의 아이디어를 결합함': {
    ko: '익숙한 방법으로 진전이 없을 때는 다른 분야에서 쓴 방법을 가져와 과제에 맞게 바꿀 수 있습니다. 예를 들어 자료 정리에 쓰던 분류법으로 어느 일부터 처리할지 가리는 식입니다. 방법을 고를 여지가 있고 적용 결과를 직접 확인할 수 있는 역할에서 이 능력을 쓰기 좋습니다.',
    ja: '慣れた方法で進まないときには、別の分野で使った方法を課題に合わせて応用できます。例えば資料を整理する分類法を、仕事の優先順位を決めるために使うことです。方法を選び、その結果を自分で確かめられる役割で活かしやすい力です。',
    en: 'When a familiar method stops working, you can adapt one from a different field. For example, a way of classifying material might help you sort competing priorities. This ability has room to work when you can choose an approach and inspect what it produces.',
  },
  '완료한 작업도 다시 점검함': {
    ko: '결과물을 넘기기 직전에는 작업의 앞뒤가 맞는지 살피는 힘을 활용할 수 있습니다. 여러 번 고친 자료라면 본문의 수정이 표나 요약에도 들어갔는지 확인하는 역할이 한 예입니다.',
    ja: '成果物を渡す前には、全体のつじつまを確かめる力を使えます。何度も修正した資料なら、本文の変更が表や要約にも反映されているかを見る役割が一例です。',
    en: 'You can use your care for checking finished work just before handover. When a document has been revised several times, one example is checking that changes reached the tables and summary as well as the main text.',
  },
  '조언을 들어도 스스로 납득한 뒤 움직임': {
    ko: '조언을 듣고도 자신이 납득할 근거를 확인한 뒤 움직이는 편입니다. 다른 사람이 정한 절차를 맡을 때도 그 절차의 목적을 알면, 지시가 닿지 않는 세부 판단을 스스로 내리는 데 이 성향을 활용할 수 있습니다.',
    ja: '助言を聞いても、自分で理由に納得してから動く傾向があります。人が決めた手順を任されたときも、目的が分かると、指示の及ばない細かな判断を自分で下す場面にこの傾向を活かせます。',
    en: 'You tend to act on advice once its reasoning makes sense to you. When working with a procedure someone else set, knowing its purpose helps you use that independent judgment on details the instructions do not cover.',
  },
  '대의명분과 공동 목표를 기준으로 판단함': {
    ko: '요구가 서로 엇갈리는 협업에서는 각자의 선호보다 공동으로 이루려는 목표를 기준으로 판단하기 쉽습니다. 요청이 여럿일 때 어떤 변경이 전체 결과에 필요한지 짚는 역할에서 이 판단 방식이 도움이 됩니다.',
    ja: '要望が食い違う共同作業では、個々の好みより共通の目標を判断の基準にしやすい傾向があります。要望がいくつもあるとき、どの変更が全体の成果に必要かを見極める役割に向いています。',
    en: 'When requests pull a team in different directions, you tend to weigh them against the common aim. That is useful when someone needs to decide which changes are necessary for the overall result.',
  },
  '치열하게 경쟁하거나 동료와 강하게 연대함': {
    ko: '함께 이룰 결과가 뚜렷하면 동료와 힘을 모으고, 각자 같은 자리를 두고 다투는 환경에서는 경쟁심이 앞설 수 있습니다. 같은 추진력이라도 공동 목표와 개인별 평가가 어떻게 정해져 있는지에 따라 협업에서 다르게 드러날 수 있습니다.',
    ja: '目指す成果が明確なら仲間と力を合わせやすく、同じ立場を争う環境では競争心が前に出ることがあります。共通の目標と個人の評価がどう定まっているかによって、同じ推進力でも現れ方が変わります。',
    en: 'You can work closely with colleagues when the shared result is clear. In an environment where people compete for the same place, your competitive side may come forward. The same drive can take a different form depending on how shared goals and individual evaluation are set.',
  },
  '정보를 비판적으로 선별함': {
    ko: '새로 배운 내용은 그대로 받아들이기보다 판단에 쓸 근거와 다시 확인할 부분을 나누는 편입니다. 설명이 서로 다를 때는 어느 차이가 결론을 바꾸는지 먼저 비교하는 방식으로 배운 것을 과제에 적용할 수 있습니다.',
    ja: '新しく学んだ内容はそのまま受け取るよりも、判断に使える根拠と確かめ直したい部分に分ける傾向があります。説明が食い違う場合は、どの違いが結論を変えるかを比べることで、学んだことを課題に応用できます。',
    en: 'You tend to separate what you can use from what you still need to verify. When explanations disagree, compare which difference changes the answer. That gives you a way to apply new knowledge to a task.',
  },
  '지식과 검토에 근거해 신중하게 결정함': {
    ko: '익힌 내용을 실제 결정에 쓰기 전에는 이미 아는 사실과 과제에서 확인해야 할 조건을 대조하는 편입니다. 판단의 근거를 남겨야 하는 일이나, 새로 배운 방법을 적용하기 전에 사례를 검토할 수 있는 환경에서 이 접근을 활용하기 좋습니다.',
    ja: '学んだことを判断に使う前に、知っている事実と課題で確かめるべき条件を照らし合わせる傾向があります。判断の根拠を残す仕事や、新しい方法を使う前に事例を検討できる環境で活かせます。',
    en: 'Before relying on what you have learned, you tend to compare what you know with the conditions the task calls on you to verify. This approach is useful when decisions need a record of their reasoning or when you can review a case before trying a new method.',
  },
}

export function localizedWorkApplication(plan: CustomerReadingParagraphPlan, trait: string | undefined,
  locale: CustomerReadingLocale) {
  if (plan.chapterId !== 'CR-06' || plan.purpose !== 'application' || !trait) return undefined
  return workApplications[trait]?.[locale]
}

const positionContexts: Readonly<Record<string, Record<CustomerReadingLocale, string>>> = {
  stem: {
    ko: '사람을 처음 만날 때 말과 태도에서 먼저 알아보기 쉬운 면입니다.',
    ja: '初対面でも、話し方や態度に表れやすい面です。',
    en: 'This is a side of you that people may notice early in your words and manner.',
  },
  month_branch: {
    ko: '새로운 환경에 적응할 때도 판단의 바탕으로 삼기 쉬운 면입니다.',
    ja: '新しい環境に慣れるときにも、判断の土台になりやすい面です。',
    en: 'This tendency can guide your judgment as you adapt to a new setting.',
  },
  day_branch: {
    ko: '가까운 사람과 일상적인 결정을 함께 내릴 때 특히 드러나기 쉬운 면입니다.',
    ja: '親しい人と日々のことを決める場面で、特に表れやすい面です。',
    en: 'This may be easier to see when you make everyday decisions with someone close.',
  },
  hour_branch: {
    ko: '혼자 생각을 정리하거나 앞으로의 계획을 세울 때 이 면이 드러나기 쉽습니다.',
    ja: '一人で考えを整理したり今後の計画を立てたりするときに、表れやすい面です。',
    en: 'This side can show up when you gather your thoughts alone or make plans for the longer term.',
  },
}

export function localizedPersonalityPosition(plan: CustomerReadingParagraphPlan,
  fact: import('../../personality/types').PersonalityFact | undefined, locale: CustomerReadingLocale) {
  if (!fact || fact.status === 'deferred' || plan.chapterId !== 'CR-01') return undefined
  const part = plan.slots.includes('externalExpression') && fact.sourcePosition?.endsWith('_stem') ? 'stem'
    : plan.slots.some(slot => ['internalDecisionStyle', 'informationAdaptationStyle', 'positionalJudgment'].includes(slot))
      ? fact.sourcePosition : undefined
  if (!part || part === 'stem' && !plan.slots.includes('externalExpression')) return undefined
  if (!fact.provenanceIds.includes(`knowledge:position:${part}:expressionDomain`)) return undefined
  return positionContexts[part]?.[locale]
}

function personality(voice: PersonalityVoice, phrase: string, locale: OtherLocale) {
  const framing: Record<PersonalityVoice, Copy> = {
    core: ['{trait}傾向があります。', 'You tend to {trait}.'],
    outward: ['人と接する場では、{trait}姿がまず伝わりやすいでしょう。', 'When you meet people, one of the first things they may notice is how you {trait}.'],
    decision: ['何かを決める場面では、{trait}傾向があります。', 'When a decision is in front of you, you tend to {trait}.'],
    information: ['新しい情報を受け取るときは、{trait}傾向があります。', 'When new information comes in, you tend to {trait}.'],
    relationship: ['人との関係では、{trait}ことがあります。', 'In relationships, you may {trait}.'],
    stress: ['負担が増えると、{trait}ことがあります。', 'When pressure rises, you may {trait}.'],
    problem: ['問題を解く場面では、{trait}力を活かせます。', 'When a problem needs solving, it can help that you {trait}.'],
    collaboration: ['誰かと一緒に進める場面では、{trait}ことが力になります。', 'When working with others, it can be an asset that you {trait}.'],
    ability: ['{trait}ことも、状況に応じて活かせる強みです。', 'Being able to {trait} can also be a strength in the right situation.'],
    pattern: ['その状況では、{trait}ことがあります。', 'In that situation, you may {trait}.'],
    duality: ['{trait}面があります。', 'There is also a side of you that tends to {trait}.'],
  }
  return choose(framing[voice], locale).replace('{trait}', phrase)
}

export function localizedParagraph(plan: CustomerReadingParagraphPlan, facts: ReadonlyMap<string, string>, locale: OtherLocale) {
  const expression = plan.expression
  const relationshipScene = (scene: 'single' | 'dating' | 'married' | undefined) => {
    const examples: Record<NonNullable<typeof scene>, Copy> = {
      single: [' 関係が始まる場面なら、どのくらいの速さで相手を受け入れられるかが関わります。', ' At the start of a relationship, this can show up in the pace at which you feel ready to let someone in.'],
      dating: [' 交際中なら、距離が縮まった後にどんな期待を言葉にできるかが関わります。', ' If you are dating, this can show up in which expectations you put into words once you are closer.'],
      married: [' 一緒に暮らしているなら、互いに期待する役割や生活のリズムを話し合う場面に関わります。', ' If you share a household, this can show up when you discuss the roles you expect of each other and your daily routines.'],
    }
    return scene ? choose(examples[scene], locale) : ''
  }
  if (expression.kind === 'judgment_structure') return undefined
  if (expression.kind === 'temporal') return temporalText(expression.contribution, locale)
  if (expression.kind === 'work_study') {
    const copy = expression.cause === 'output_to_wealth' ? outcome.expression
      : expression.cause === 'output_controls_pressure'
        ? ['例をまねてから、自分の説明や実習で組み直すと、難しい課題に取り組みやすくなります。', 'Recreating an example, then explaining or applying it yourself, can make a difficult task easier to tackle.'] as const
        : expression.mappingId === 'Master 21:study_difficulty'
          ? ['難しい課題を解く力があっても、負担が続くと同じ学習ペースを保ちにくいことがあります。', 'Even if you can solve difficult problems, continuing under strain can make it hard to keep the same study pace.'] as const
          : expression.mappingId === 'CL-S04'
            ? ['目先の結果を優先すると、復習して知識を積み重ねる時間が減ることがあります。', 'Prioritizing immediate results may leave less time to review and consolidate what you have learned.'] as const
            : work[expression.semantic]
    const scene = expression.semantic === 'work_capacity' && expression.scene === 'employed'
      ? choose([' 担当する課題を説明したり、成果物を見せたりする場面が一例です。', ' Explaining an assigned task or demonstrating a result is one example.'], locale) : ''
    return choose(copy, locale) + (expression.reduced ? choose([' 作用が現れる範囲は限られます。', ' The effect is limited.'], locale) : '') + scene
      + localizedPeriod(plan, locale)
  }
  if (expression.kind === 'outcome') return (plan.certainty === 'contextual'
    ? choose([' この働きが現れる範囲は限られます。', ' The effect is limited in scope.'], locale) : '')
    + choose(expression.voice === 'formation' && plan.lifeMechanismIds.includes('three_formation_with_active_stem') ? [
      '関係に関わる条件が同じ方向にまとまり、その流れを支える別の条件も働きます。出会う接点が身近な関係につながる余地を支えます。',
      'Several conditions affecting relationships converge, with a separate influence supporting that same direction. Together they make it easier for an opening to develop into a closer connection.',
    ] : outcome[expression.voice], locale) + relationshipScene(expression.scene) + localizedPeriod(plan, locale)
  const traits = expression.traitFactIds.map(id => facts.get(id))
  const independent = traits.length === 1 && localizedIndependentPersonality(traits[0], locale)
  if (independent) return independent
  const workApplication = localizedWorkApplication(plan, traits[0], locale)
  if (workApplication) return workApplication
  const phrases = traits.map(trait => trait && (locale === 'ja' ? traitPhraseJa : traitPhraseEn)(trait))
  if (phrases.some(phrase => !phrase)) return undefined
  const reaction = expression.pattern && patterns[expression.pattern.mechanism]
  if (reaction) return choose(reaction.response, locale)
    + (expression.pattern?.resultCoverage === 'supported' && reaction.result ? ' ' + choose(reaction.result, locale) : '')
  if (expression.composite === 'outward_decision') return personality('outward', phrases[0]!, locale) + ' ' + personality('decision', phrases[1]!, locale)
  if (expression.composite === 'relation_sequence') return [
    personality('relationship', phrases[1]!, locale),
    personality('stress', phrases[2]!, locale),
    relationshipScene(expression.scene),
  ].filter(Boolean).join(' ')
  const authored = traitApplications[`${expression.voice}:${traits[0]}`]
  if (authored && !expression.limitationFactId) return choose(authored, locale)
  const text = phrases.map(phrase => personality(expression.voice, phrase!, locale)).join(' ')
  return text + (expression.limitationFactId ? choose([' 急ぎすぎると、確認漏れが増えることがあります。', ' If a decision is rushed, more details can slip through.'], locale) : '')
    + (expression.voice === 'relationship' ? relationshipScene(expression.scene) : '')
}

export function localizedMoney(voice: OutcomeVoice, plan: CustomerReadingParagraphPlan, locale: OtherLocale, criterion: boolean) {
  const method = voice === 'skill' || voice === 'expression'
  if (plan.reasonStatus !== 'complete' && !method) {
    const conclusion: Partial<Record<OutcomeVoice, Copy>> = {
      capacity: outcome.retention, divisionRetention: outcome.retention,
      protection: ['確保した取り分を守る働きがあります。', 'There is some support for retaining what has been secured.'],
      pressure: ['収入に関わる部分で負担が強まることがあります。', 'Pressure can build along the path involving income.'],
      supportPressure: ['収入に関わる部分で、必要な土台が弱まることがあります。', 'Necessary support can weaken along the path involving income.'],
    }
    return choose(conclusion[voice] ?? outcome[voice], locale)
  }
  const hasMethod = plan.reasonStatus === 'complete' && plan.moneyAxes?.includes('earning_method')
  const lines = method ? [
    ...(plan.moneyAxes?.includes('earning') ? [choose(outcome.earning, locale)] : []),
    ...(hasMethod ? [choose(outcome[voice], locale)] : []),
  ] : [choose(outcome[voice], locale)]
  if (voice === 'division' && plan.reasonStatus === 'complete' && plan.moneyAxes?.includes('retention')) lines.push(choose(outcome.retention, locale))
  const test = criterion && criteria[voice]
  if (test) lines.push(choose(test, locale))
  return lines.join(' ')
}

const contrasts: Record<MoneyContrast['kind'], Copy> = {
  earning_retention: ['収入を得る条件を確かめたら、実際に手元に残る分を別に見ます。', 'After identifying what earns income, assess separately how much actually remains.'],
  retention_accumulation: ['一度残せたことと、続けて積み上げられることは別々に確かめます。', 'Keeping something once and accumulating it over time call for separate evidence.'],
  damage_protection: ['守りが働く範囲と、取り分が減る圧力が働く範囲を分けて確かめます。', 'Check where the protection applies and where pressure still threatens what has been secured.'],
  retention_protection: ['残しにくい条件と、制約を和らげる条件を分けて見ます。', 'Separate what makes funds hard to retain from what eases that constraint.'],
  earning_protection: ['新たに収入を得る経路と、すでに得た分を守る働きは別々に確認できます。', 'The path to new income and the protection of income already received can be checked separately.'],
  earning_burden: ['収益につながる条件があっても、この負担が同時に働くことがあります。', 'The burden can be present even while the conditions for earning are in place.'],
}
export const localizedContrast = (kind: MoneyContrast['kind'], locale: OtherLocale) => choose(contrasts[kind], locale)

export function renderFlowAxes(comparisons: readonly CustomerFlowAxisComparison[], locale: CustomerReadingLocale) {
  const outward = comparisons[0].favorableAxis === 'stem'
  if (locale === 'ko') {
    const format = new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', dateStyle: 'long', timeStyle: 'short', hourCycle: 'h23' })
    const labels = { greatLuck: '장기 흐름', yearlyLuck: '절기년', monthlyLuck: '절기월' }
    const periods = comparisons.map(({ scope, period: [start, end] }) =>
      `${labels[scope]} ${format.format(new Date(start))}부터 ${format.format(new Date(end))} 직전까지`)
    return (outward
      ? '이 구간에는 바깥으로 활동을 이어갈 조건에 힘이 실리는 한편, 그 활동을 받치는 실제 기반에는 부담이 남습니다. 대외적으로 일이 진전돼도 일상을 유지할 여력이 함께 생겼는지 따로 살펴볼 만합니다.'
      : '이 구간에는 일상을 받쳐 주는 기반에 힘이 실리는 한편, 바깥으로 일을 추진하는 과정에는 부담이 남습니다. 기반이 안정되는지와 외부에서 일이 진전되는지는 따로 살펴볼 만합니다.')
      + ` 적용 구간은 ${periods.join(', ')}입니다(한국 시간).`
  }
  const timingScope = { greatLuck: 'daewoon', yearlyLuck: 'sewoon', monthlyLuck: 'month' } as const
  const period = comparisons.map(comparison => range({
    scope: timingScope[comparison.scope], certainty: 'confirmed', interval: comparison.period,
  }, locale, 'minute')).join(locale === 'ja' ? '、' : ', ')
  return (outward ? choose([
    'この時期は外に向けて活動を進める条件が整いやすい一方、それを支える日々の基盤には負担が残ります。対外的に進展があったときも、生活を維持する余力まで伴っているかは別に見ておけます。',
    'In this period, conditions favor moving forward externally, while the foundations that support that activity remain under strain. If things advance outwardly, check separately whether day-to-day life has the capacity to sustain that progress.',
  ], locale) : choose([
    'この時期は生活を支える基盤が整いやすい一方、外に向けて物事を進める過程では負担が残ります。基盤が安定するかと、外で進展するかは別に見ておけます。',
    'In this period, the foundations of everyday life have support, while pushing things forward externally remains demanding. Assess stability at home or in daily life separately from outward progress.',
  ], locale)) + (locale === 'ja' ? ` ${period}です（韓国時間）。` : ` Applies during the ${period} (Korea time).`)
}
const independentPersonality: Readonly<Record<string, Record<CustomerReadingLocale, string>>> = {
  '속도가 더뎌도 목표를 쉽게 포기하지 않음': {
    ko: '하고자 하는 일이 정해지면 진전이 느리다는 이유만으로 그만두지는 않는 편입니다. 눈에 띄는 변화가 없어도 필요한 준비를 이어 가는 데 쓰이는 끈기입니다. 계속할 이유가 분명한 일에서는 이 힘을 쓸 곳이 생깁니다.',
    ja: '取り組みたいことが定まると、進み方が遅いだけでは簡単に手放さない傾向があります。目に見える変化が少なくても、必要な準備を続ける粘り強さです。続ける理由がはっきりしたことに活かせます。',
    en: 'Once you have an aim, slow progress alone is rarely a reason to abandon it. Your persistence can carry the necessary preparation through periods with little visible change, particularly when you are clear about why the effort still matters.',
  },
  '인내하며 자기 의사를 바로 드러내지 않는 편': {
    ko: '자기 의견이 생겨도 곧바로 꺼내기보다는 시간을 두는 편입니다. 가까운 사람과 함께 결정해야 할 때는 상대의 말을 듣고 있다는 표현과 자신의 동의 여부를 구분해 전하면, 말이 적어도 어느 부분에 생각이 다른지 알릴 수 있습니다.',
    ja: '意見があっても、その場ですぐに出すより時間を置く傾向があります。身近な人と決める必要があるときは、話を聞いていることと同意しているかどうかを分けて伝えると、言葉が少なくても考えの違いを伝えられます。',
    en: 'You tend to give an opinion time before putting it into words. When a decision involves someone close, you can say that you have heard them and separately say which parts you agree with. That makes differences clear without requiring you to speak at length.',
  },
}

export const localizedIndependentPersonality = (trait: string | undefined, locale: CustomerReadingLocale) =>
  trait && independentPersonality[trait]?.[locale]
