import type { Locale } from '../../i18n'

export type PersonalityAxis = 'judgment' | 'observation' | 'emotion' | 'action' | 'relationship'
  | 'adaptation' | 'persistence' | 'independence' | 'expression'

export type NarrativePart = {
  requires: readonly (readonly string[])[]
  copy: Record<Locale, string>
  axes?: readonly PersonalityAxis[]
}

const part = (requires: readonly string[], ko: string, ja: string, en: string, axes?: readonly PersonalityAxis[]): NarrativePart =>
  ({ requires: requires.map(trait => [trait]), copy: { ko, ja, en }, axes })

// Editorial recipes require the named facts. They do not infer a trait or change its status.
export const natalNarratives = {
  temperament: [
    part(['자신의 결과물에 타인의 결과물보다 높은 기준을 적용함', '정보를 비판적으로 선별함'],
      '판단의 출발점은 무엇을 근거로 삼을지 스스로 정하는 데 있습니다. 여러 사람이 같은 말을 해도 그 설명이 실제로 맞는지 먼저 살펴보고, 걸러 낸 정보를 토대로 판단을 세우는 편입니다. 이 기준은 자기 일에도 적용됩니다. 다른 사람의 결과를 볼 때보다 자신의 결과를 볼 때 더 엄격해서, 남이 괜찮다고 보는 지점에서도 본인이 보완할 부분을 따로 짚어 볼 수 있습니다.',
      '何を信じ、どこまで受け入れるかは自分で決める方です。入ってきた情報を吟味し、自分の成果を見るときは人に求める以上の基準を使います。',
      'You tend to decide for yourself what to trust and how much weight to give it. You sift through incoming information and hold your own work to a higher standard than you ask of others.',
      ['judgment', 'observation']),
    part(['연구·탐구', '응용성', '혁신성'],
      '낯선 방법을 받아들일 때는 그대로 익히는 것과 그 방법을 이해하는 것을 구분합니다. 궁금한 점이 생기면 왜 그런 순서로 진행하는지 살펴보고, 원리를 이해한 뒤에는 지금 하는 일에도 적용할 수 있는 부분을 찾아봅니다. 예를 들어 다른 팀의 방식을 배웠다면 절차를 통째로 가져오기보다, 그중 도움이 되는 부분을 지금의 업무에 맞춰 바꾸어 보는 쪽에 가깝습니다.',
      '慣れない方法でも疑問がわけば、掘り下げてみようとします。仕組みがわかると、習った通りに使うより、目の前の状況に合う形を探しやすくなります。',
      'An unfamiliar method can draw you in once it raises a question you want to explore. After you understand how it works, you may look for ways to adapt it to the task at hand.',
      ['observation', 'adaptation']),
    part(['혼자만의 탐색', '때와 장소를 가려 의견을 내고 공적인 일과 사적인 일을 구분함'],
      '혼자 생각할 때와 여럿이 있는 자리에서는 관심을 다루는 방식이 다릅니다. 혼자서는 흥미가 생긴 질문을 원하는 만큼 깊게 따라가지만, 여럿이 모인 자리에서는 그 생각을 말할 때와 장소부터 가립니다. 업무에 필요한 의견은 공적인 문제로 다루고, 개인적으로 느낀 점은 그 자리에서 모두 말하지 않는 식입니다. 생각을 깊게 하는 시간과 그것을 꺼내 놓는 순간이 꼭 같지는 않습니다.',
      '考えを深める時間と、それを人に伝える場面を分ける方です。一人なら関心を掘り下げやすく、人が集まる場では誰の前でいつ話すかも見ています。',
      'You tend to separate time spent developing an idea from the moment you share it. On your own you can follow a line of inquiry further; around others you pay attention to when, and in front of whom, to speak.',
      ['observation', 'relationship', 'expression']),
    part(['가까운 사람과 신뢰를 차곡차곡 쌓음', '수평적인 대화와 동등한 대우를 중시함'],
      '사람을 가까이 대할 때는 처음부터 큰 믿음을 두기보다 교류 속에서 신뢰를 쌓아 가는 편에 가깝습니다. 친해질수록 한 사람이 정한 기준에 다른 사람이 맞추는 관계보다, 서로 의견을 주고받고 동등하게 대하는 관계를 중요하게 볼 수 있습니다. 그래서 누가 먼저 말하는지보다 상대가 그 말을 어떻게 받아 주는지가 관계를 판단하는 데 더 의미 있는 단서가 됩니다.',
      '身近な関係では、最初から信頼を預けるより、やり取りを通じて少しずつ積み重ねる方です。近くなるほど、一方の基準に合わせるより、対等に意見を交わせることを大切にする場合があります。',
      'In close relationships, trust can build gradually through repeated exchanges. As you get closer, the chance to speak on equal terms can matter more than whose opinion comes first.',
      ['relationship', 'observation']),
    part(['대의명분과 공동 목표를 기준으로 판단함', '실리를 따져 신속하게 판단함'],
      '함께 맡은 일의 방향을 정할 때는 각자의 방법 가운데 어느 쪽이 공동의 목표에 더 맞는지 따져 볼 때가 있습니다. 이때 실제로 얻는 것과 감수할 것이 분명하면 판단은 생각보다 빠릅니다. 예를 들어 두 방법이 모두 가능해 보여도 하나가 비용이나 수고를 줄이면서 같은 목표에 닿는다면, 처음부터 선택지를 다시 펼치기보다 실질적인 차이를 기준으로 결론을 낼 수 있습니다.',
      '一緒に進める仕事では、共通の目標に照らして考えることがあります。実際に得られるものと負うものが見えれば、すべての選択肢を長く抱えずに判断できることもあります。',
      'When you are working with others, the shared goal can help you decide what makes sense. Once the practical tradeoffs are clear, you may be able to make the call without keeping every option open.',
      ['judgment', 'action']),
    part(['자기 결과물에 엄격함', '완료한 결과에도 부족한 점을 먼저 돌아봄', '잘한 결과에도 만족하기 어려움'],
      '정보를 가려 보는 습관은 근거가 약한 설명에 곧바로 흔들리지 않게 해 줍니다. 같은 기준이 자기 일에 향하면 부담의 모양이 달라집니다. 끝난 결과에서도 잘된 점보다 부족한 곳이 먼저 보여, 외부에서 좋은 평가를 받는 것과 스스로 만족하는 일이 따로 갈 수 있습니다. 결과가 실제로 좋아졌는지 판단하는 기준이, 일을 마쳤다는 안도감까지 늦추는 셈입니다.',
      'その基準を自分の仕事に向けると、負担にもなります。終えた仕事のよかったところより手直しできるところが先に見え、十分な出来でもほっとするまでに時間がかかることがあります。',
      'The pressure can build when that scrutiny turns toward your own work. What still needs fixing comes to mind before what went well, so even a good result may take time to feel finished.',
      ['judgment', 'emotion']),
  ],
  strengths: [
    part(['완료한 작업도 다시 점검함', '완료한 결과에도 부족한 점을 먼저 돌아봄', '정확성'],
      '결과를 넘기기 전에 놓친 부분을 다시 발견하는 힘이 있습니다. 작업을 끝낸 직후에도 부족한 곳이 먼저 눈에 들어와, 한 번 훑고 넘기기보다 숫자가 서로 맞는지, 필요한 절차가 빠지지 않았는지 구체적으로 대조하는 데 집중할 수 있습니다. 여러 사람의 작업을 모아 결과물 하나로 넘겨야 할 때는, 이처럼 마지막 단계에서 세부를 비교하는 역할에 강점이 있습니다.',
      '一つ目の強みは、仕事を渡す前に見落としを探し直せることです。終わったことに安心するより足りないところが先に見えるので、数字のずれや抜けた手順など、後で問題になりそうな細部の確認に力を使えます。',
      'A first strength is catching what was missed before handing work over. What is incomplete tends to stand out even after a task is finished, which can help you spot a figure that does not match or a step that was left out.',
      ['observation', 'persistence']),
    part(['분석력', '논리적 사고', '정보를 비판적으로 선별함'],
      '자료가 많고 설명이 엇갈릴 때는 무엇을 근거로 삼을 수 있는지 가려 보는 힘도 쓰입니다. 같은 결론을 지지하는 자료끼리 묶어 보고, 전제가 다른 설명은 따로 떼어 살펴볼 수 있습니다. 보고서 두 개가 서로 다른 답을 내놓은 상황이라면 어느 설명이 더 그럴듯한지부터 보기보다, 각각 무엇을 근거로 말하는지를 비교해 판단의 범위를 좁히는 방식입니다.',
      '二つ目の強みは、資料が多いときに、判断に使える情報と確認が必要な情報を分ける力です。説明が入り交じっていても、何を根拠にできるかを見れば、考えるべき問題が整理されやすくなります。',
      'A second strength is separating what matters from what still needs checking when information piles up. Testing which evidence holds up can make the actual decision clearer when several explanations compete.',
      ['judgment', 'observation']),
    part(['임기응변', '순발력', '실리를 따져 신속하게 판단함'],
      '계획이 틀어졌을 때는 검토하는 힘과는 다른 능력이 쓰입니다. 처음 계획을 그대로 살리기 어려워도, 지금 가진 수단으로 무엇을 할 수 있는지 빠르게 살펴 대안을 좁힐 수 있습니다. 약속한 방법을 쓸 수 없게 된 순간이라면 원래 방식의 흠을 계속 따지기보다, 목표를 유지하면서 바꿀 수 있는 절차를 찾아 실행을 이어가는 쪽에 힘이 실립니다.',
      '計画が崩れたときには、その場で別の手を考える力も使えます。元のやり方に固執せず、今できる選択肢を絞ると、細部までは整えられなくても仕事を続ける道が見えやすくなります。',
      'When a plan falls through, you may also be quick at finding a workable alternative. Narrowing the choice to what can actually be done gives you a way forward even when not every detail can be resolved.',
      ['adaptation', 'action']),
    part(['계획대로 꼼꼼하게 완성함', '지구력', '책임감'],
      '반대로 급한 대응이 필요 없는 일에서는 계획을 따라 끝까지 가져가는 힘도 있습니다. 일의 진행이 여러 단계로 나뉘어 처음의 의욕만으로 끝내기 어려울 때, 맡은 부분을 이어 가면서 마지막까지 남은 일에 주의를 기울이는 방식입니다. 정해진 절차가 제 기능을 하고 있다면 굳이 새 방식을 만드는 것보다 그 절차를 빠뜨리지 않고 완성하는 쪽에서 강점이 살아날 수 있습니다.',
      '急な対応が要らない仕事では、計画に沿って最後まで仕上げる力もあります。工程がいくつもある仕事で、担当した作業を続けながら、残っていることにも注意を向けられます。',
      'When the work does not call for a quick change of plan, you can also draw on persistence. In a task with several stages, following the plan through and paying attention to what remains can be a strength in itself.',
      ['persistence', 'action']),
    part(['완료한 작업도 다시 점검함', '분석력', '임기응변'],
      '예를 들어 마감을 앞두고 자료에 오류가 보인다면, 먼저 어디까지 영향을 주는지 확인하고 당장 수정해야 할 부분과 나중에 살펴도 되는 부분을 구분하는 식입니다. 오류를 알아채는 데는 점검력이, 영향 범위를 구분하는 데는 분석이, 남은 시간 안에 다른 방법을 고르는 데는 대처력이 쓰입니다. 세 능력이 서로 다른 역할을 맡아 하나의 문제를 푸는 장면입니다.',
      'たとえば締め切り前に資料の誤りを見つけたら、何に影響するかを見極めてから、今直せることと後で確かめることを分けるという使い方ができます。見直す力と判断する力、その場で対応する力が重なる場面です。',
      'For example, if you find an error close to a deadline, you can use these strengths together: work out what it affects, then separate the fix you can make now from what needs checking later.',
      ['observation', 'judgment', 'adaptation']),
    part(['자신의 결과물에 타인의 결과물보다 높은 기준을 적용함', '잘한 결과에도 만족하기 어려움'],
      '이런 강점이 일을 마무리하는 데 그대로 도움이 되려면 점검의 목적이 분명해야 합니다. 자기 결과에만 기준을 계속 높이면, 중요한 오류를 바로잡는 일과 이미 충분히 잘된 부분의 표현을 다시 다듬는 일이 비슷하게 중요해 보일 수 있습니다. 이때 문제가 되는 것은 확인하는 능력보다, 확인이 언제 충분한지를 판단하기 어렵다는 점입니다.',
      'ただ、自分の仕事にだけ基準を上げ続けると、大きな誤りを直すことと、すでに十分にできたところに手を入れることの区別が曖昧になることがあります。見直すことより、手を離すことが難しくなります。',
      'If you keep raising the bar only for your own work, catching a consequential error can start to feel no different from revisiting something that was already good enough. At that point the strain is in letting the work go.',
      ['judgment', 'persistence']),
  ],
  patterns: [
    part(['조언을 들어도 스스로 납득한 뒤 움직임', '타당성을 스스로 확인하고 움직임'],
      '새로운 제안을 받았을 때는 찬성인지 반대인지부터 답하기보다, 제안이 기대는 근거부터 확인하려는 흐름이 반복되기 쉽습니다. 상대가 좋은 방법이라고 말해도 무엇이 좋아지는지, 현재 조건에도 맞는지 스스로 납득하는 과정이 먼저입니다. 아직 의견을 말하지 않았더라도 결정을 미뤄 둔 채 아무 생각을 하지 않는 상태와는 다릅니다. 판단해서 움직이기 위한 재료를 모으는 시간에 가깝습니다.',
      '新しい提案を受けてもすぐに従うより、自分が納得できる根拠があるかを先に確かめる流れが繰り返されやすくなります。意見を口にしていなくても、提案が状況に合うか考えていることがあります。',
      'A recurring pattern when you receive a new suggestion is to look for reasoning you can verify before acting. Even before you voice an opinion, you may already be testing whether the proposal fits the situation.',
      ['judgment', 'independence']),
    part(['타당성을 스스로 확인하고 움직임', '자기 판단을 유일한 기준으로 삼기 쉬움'],
      '이 과정은 제안의 허점을 일찍 보는 데 도움이 됩니다. 하지만 처음 정한 기준 안에서만 계속 자료를 비교하면, 상대가 새로운 근거를 제시한 뒤에도 본인은 이미 답이 난 문제처럼 느낄 수 있습니다. 예를 들어 상대는 새로운 조건을 논의하는 중인데, 본인은 처음 세운 기준으로 이미 제안을 판단한 뒤인 식입니다. 이 차이가 반복되면 서로 같은 이야기를 하면서도 논의가 어디까지 왔는지 다르게 느끼기 쉽습니다.',
      'この過程は提案の弱いところを見つける助けになります。ただ、自分の基準の中だけで検討を続けると、相手が別の根拠を出しても、もう結論が出たことのように扱ってしまう場合があります。',
      'That can help you spot a weak point in a proposal. If the review stays entirely within your own criteria, though, new evidence from someone else may come in after you already consider the matter settled.',
      ['observation', 'judgment', 'relationship']),
    part(['때와 장소를 가려 의견을 내고 공적인 일과 사적인 일을 구분함', '말과 행동으로 감정과 의견을 발산함'],
      '두 번째로 반복될 수 있는 것은 의견을 표현할 자리를 고르는 방식입니다. 업무를 정리하는 자리에서는 개인적인 감정과 공식적으로 다룰 일을 구분해 말을 아끼다가, 의견을 다루기 적절하다고 판단하면 무엇이 불편했고 어떤 점이 달라져야 하는지를 분명히 표현할 수 있습니다. 반응이 적었던 자리만 본 사람과 이후에 직접 의견을 들은 사람이 같은 일을 다르게 받아들일 여지가 생깁니다.',
      'もう一つは、意見を出す場を選ぶことです。公の仕事と個人的な気持ちを分けて言葉を控える場がある一方、話してよいと判断した場では、思いや意見を言葉や行動ではっきり示すことがあります。',
      'Another pattern is choosing where to say what you think. You may hold back where you want to keep work and private feelings separate, then express a view more plainly once you decide the setting is right.',
      ['emotion', 'expression', 'relationship']),
    part(['사회적 마찰이 커지면 반항이 강해짐', '기존 체계에 도전함'],
      '마찰이 계속되면 이 두 번째 흐름의 초점도 달라질 수 있습니다. 처음에는 제안의 내용 하나를 두고 의견을 조율하더라도, 같은 방식으로 이견이 반복되면 무엇을 결정했는지보다 어떻게 결정했는지를 문제 삼기 쉬워집니다. 절차를 바꾸자는 의견과 당장 어떤 선택을 할지에 대한 이견이 한 대화에 섞이면, 각자가 해결하려는 문제가 달라져 논의가 길어질 수 있습니다.',
      '摩擦が大きくなると、何に異議を唱えるかが変わることがあります。初めは一つの意見をすり合わせていても、次第に決め方そのものを問い直す方へ移ることがあります。内容と手続きへの異議が重なると、話し合いが長引きやすくなります。',
      'As friction builds, the focus of your objection can shift. A discussion that began with one proposal may turn into a challenge to how the decision is being made. When those two disagreements become entangled, the conversation can take longer to resolve.',
      ['adaptation', 'expression', 'relationship']),
    part(['타당성을 스스로 확인하고 움직임', '기존 체계에 도전함'],
      '두 흐름이 만나는 지점은 납득할 근거를 찾던 대화가 결정 방식에 대한 이견으로 옮겨갈 때입니다. 내용이 충분히 설명되지 않아서 남은 문제와, 설명은 이해했지만 절차가 납득되지 않아 남은 문제는 다른 답을 필요로 합니다. 비슷한 논의가 되풀이된다면 어느 쪽인지 구분해 말하는 것만으로도 상대가 무엇에 답해야 하는지 분명해집니다.',
      '似た話し合いを繰り返すなら、提案の根拠を確かめたいのか、決め方に異議があるのかを分けて伝えてみてください。',
      'If a discussion keeps circling, try saying whether you want stronger evidence for the proposal or are questioning how the decision is being made.',
      ['judgment', 'expression']),
  ],
} satisfies Record<string, readonly NarrativePart[]>

export const employedNarrative = [
  part(['계획대로 꼼꼼하게 완성함', '관심 분야를 꾸준히 파고듦'],
    '재직 중이라면 지금 맡은 일에서 계획을 따라 끝까지 완성할 여지가 있는지, 관심 있는 분야를 더 깊게 맡을 수 있는지부터 살펴보세요.',
    '在職中なら、今の役割で計画に沿って仕事を仕上げる余地があるか、関心のある分野をさらに深く担当できるかを見てみましょう。',
    'If you are employed, start by asking whether your role lets you follow a plan through and spend more time on work you want to explore in depth.'),
  part(['계획대로 꼼꼼하게 완성함', '관심 분야를 꾸준히 파고듦'],
    '지금 자리를 유지할지 변화를 알아볼지 고민된다면, 원하는 일이 부족한 것인지 지금의 역할에 그 일을 맡을 여지가 적은 것인지 나눠 보는 것이 첫 판단 기준입니다.',
    '今の役割を続けるか変化を探すか迷うなら、取り組みたい仕事そのものが少ないのか、今の役割ではそれを任せてもらいにくいのかを分けて考えてみてください。',
    'If you are weighing a change, distinguish between a shortage of work you want to do and limited room to take on that work in your current role. That is a useful first question before weighing your options.'),
] satisfies readonly NarrativePart[]

export const currentFlowNarrative = [
  part(['연구·탐구', '창조성'],
    '지금의 큰 흐름에서는 마음이 가는 문제를 깊이 살피는 일과, 살펴본 내용을 새로운 방식으로 풀어내는 일이 함께 중요해질 수 있습니다.',
    '今の大きな流れでは、関心のある問いを掘り下げることと、調べたことを新しい形にすることが重なりやすくなります。',
    'In the current long-term period, looking deeply into a question that interests you and finding a new way to use what you learn can go together.'),
  part(['연구·탐구', '말과 행동으로 감정과 의견을 발산함'],
    '혼자 답을 찾는 데서 끝내기보다, 생각이 정리되면 무엇을 확인했고 왜 그렇게 보는지 말이나 행동으로 보여주는 것도 이 흐름을 써 볼 방법입니다.',
    '一人で答えを探すだけで終えず、考えがまとまったら、何を確かめてどう考えたかを言葉や行動で示すという活かし方もあります。',
    'One way to use that combination is to show your reasoning once it takes shape: what you checked and why you see it that way.'),
] satisfies readonly NarrativePart[]
