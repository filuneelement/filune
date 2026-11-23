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
      '무엇을 믿고 어디까지 받아들일지 스스로 정하는 편입니다. 들어온 정보는 한 번 걸러 보고, 자신의 결과를 평가할 때는 다른 사람에게 요구하는 것보다 높은 기준을 적용합니다.',
      '何を信じ、どこまで受け入れるかは自分で決める方です。入ってきた情報を吟味し、自分の成果を見るときは人に求める以上の基準を使います。',
      'You tend to decide for yourself what to trust and how much weight to give it. You sift through incoming information and hold your own work to a higher standard than you ask of others.',
      ['judgment', 'observation']),
    part(['연구·탐구', '응용성', '혁신성'],
      '낯선 방법도 궁금한 점이 생기면 파고들어 볼 수 있습니다. 원리를 이해하고 나면, 배운 방식을 그대로 가져오기보다 지금 상황에 맞게 바꿔 쓸 길을 찾는 쪽에 가깝습니다.',
      '慣れない方法でも疑問がわけば、掘り下げてみようとします。仕組みがわかると、習った通りに使うより、目の前の状況に合う形を探しやすくなります。',
      'An unfamiliar method can draw you in once it raises a question you want to explore. After you understand how it works, you may look for ways to adapt it to the task at hand.',
      ['observation', 'adaptation']),
    part(['혼자만의 탐색', '때와 장소를 가려 의견을 내고 공적인 일과 사적인 일을 구분함'],
      '생각을 발전시키는 시간과 의견을 밖으로 내놓는 순간은 구분하는 편입니다. 혼자서는 궁금한 것을 더 파고들 수 있지만, 여럿이 있는 자리에서는 누구 앞에서 언제 이야기할지도 살핍니다.',
      '考えを深める時間と、それを人に伝える場面を分ける方です。一人なら関心を掘り下げやすく、人が集まる場では誰の前でいつ話すかも見ています。',
      'You tend to separate time spent developing an idea from the moment you share it. On your own you can follow a line of inquiry further; around others you pay attention to when, and in front of whom, to speak.',
      ['observation', 'relationship', 'expression']),
    part(['대의명분과 공동 목표를 기준으로 판단함', '실리를 따져 신속하게 판단함'],
      '함께 하는 일에서는 무엇을 이루려는지에 비춰 판단하기도 합니다. 실제로 얻는 것과 감수할 것이 분명하다면, 모든 선택지를 오래 붙들기보다 결론을 빠르게 낼 때도 있습니다.',
      '一緒に進める仕事では、共通の目標に照らして考えることがあります。実際に得られるものと負うものが見えれば、すべての選択肢を長く抱えずに判断できることもあります。',
      'When you are working with others, the shared goal can help you decide what makes sense. Once the practical tradeoffs are clear, you may be able to make the call without keeping every option open.',
      ['judgment', 'action']),
    part(['자기 결과물에 엄격함', '완료한 결과에도 부족한 점을 먼저 돌아봄', '잘한 결과에도 만족하기 어려움'],
      '부담은 이 기준을 자기 일에 돌릴 때 생깁니다. 일을 마쳐도 잘된 부분보다 부족한 곳이 먼저 보이기 때문에, 결과가 충분히 좋아도 마쳤다는 안도감은 늦게 따라올 수 있습니다.',
      'その基準を自分の仕事に向けると、負担にもなります。終えた仕事のよかったところより手直しできるところが先に見え、十分な出来でもほっとするまでに時間がかかることがあります。',
      'The pressure can build when that scrutiny turns toward your own work. What still needs fixing comes to mind before what went well, so even a good result may take time to feel finished.',
      ['judgment', 'emotion']),
  ],
  strengths: [
    part(['완료한 작업도 다시 점검함', '완료한 결과에도 부족한 점을 먼저 돌아봄', '정확성'],
      '첫 번째 강점은 결과를 넘기기 전에 놓친 부분을 다시 발견하는 힘입니다. 일단 끝냈다는 데 만족하기보다 부족한 곳을 먼저 보기 때문에, 틀린 숫자나 빠진 절차처럼 뒤에서 문제가 될 세부를 바로잡는 데 이 힘을 쓸 수 있습니다.',
      '一つ目の強みは、仕事を渡す前に見落としを探し直せることです。終わったことに安心するより足りないところが先に見えるので、数字のずれや抜けた手順など、後で問題になりそうな細部の確認に力を使えます。',
      'A first strength is catching what was missed before handing work over. What is incomplete tends to stand out even after a task is finished, which can help you spot a figure that does not match or a step that was left out.',
      ['observation', 'persistence']),
    part(['분석력', '논리적 사고', '정보를 비판적으로 선별함'],
      '두 번째 강점은 자료가 많을 때 중요한 정보와 아직 확인할 정보를 가려 보는 힘입니다. 여러 설명이 섞여 있어도 무엇을 근거로 삼을 수 있는지 따져 보면, 판단해야 할 문제가 조금 더 선명해질 수 있습니다.',
      '二つ目の強みは、資料が多いときに、判断に使える情報と確認が必要な情報を分ける力です。説明が入り交じっていても、何を根拠にできるかを見れば、考えるべき問題が整理されやすくなります。',
      'A second strength is separating what matters from what still needs checking when information piles up. Testing which evidence holds up can make the actual decision clearer when several explanations compete.',
      ['judgment', 'observation']),
    part(['임기응변', '순발력', '실리를 따져 신속하게 판단함'],
      '계획이 틀어졌을 때는 빠르게 대안을 생각해 내는 능력도 쓰일 수 있습니다. 원래 방법에 매달리기보다 그 자리에서 실제로 가능한 선택지를 추리면, 세부를 다 맞추기 어려운 상황에서도 일을 이어갈 길이 보입니다.',
      '計画が崩れたときには、その場で別の手を考える力も使えます。元のやり方に固執せず、今できる選択肢を絞ると、細部までは整えられなくても仕事を続ける道が見えやすくなります。',
      'When a plan falls through, you may also be quick at finding a workable alternative. Narrowing the choice to what can actually be done gives you a way forward even when not every detail can be resolved.',
      ['adaptation', 'action']),
    part(['완료한 작업도 다시 점검함', '분석력', '임기응변'],
      '예를 들어 마감을 앞두고 자료에 오류를 발견하면, 먼저 어떤 결과에 영향이 있는지 가려낸 뒤 가능한 수정과 나중에 확인할 일을 나눌 수 있습니다. 점검력과 판단력, 대처력이 한꺼번에 쓰이는 장면입니다.',
      'たとえば締め切り前に資料の誤りを見つけたら、何に影響するかを見極めてから、今直せることと後で確かめることを分けるという使い方ができます。見直す力と判断する力、その場で対応する力が重なる場面です。',
      'For example, if you find an error close to a deadline, you can use these strengths together: work out what it affects, then separate the fix you can make now from what needs checking later.',
      ['observation', 'judgment', 'adaptation']),
    part(['자신의 결과물에 타인의 결과물보다 높은 기준을 적용함', '잘한 결과에도 만족하기 어려움'],
      '다만 자기 결과에만 기준을 계속 높이면, 중요한 오류를 잡는 일과 이미 잘된 부분을 다시 만지는 일이 구분되지 않을 수 있습니다. 이때는 점검 자체보다 결과를 넘기는 데 부담이 커집니다.',
      'ただ、自分の仕事にだけ基準を上げ続けると、大きな誤りを直すことと、すでに十分にできたところに手を入れることの区別が曖昧になることがあります。見直すことより、手を離すことが難しくなります。',
      'If you keep raising the bar only for your own work, catching a consequential error can start to feel no different from revisiting something that was already good enough. At that point the strain is in letting the work go.',
      ['judgment', 'persistence']),
  ],
  patterns: [
    part(['조언을 들어도 스스로 납득한 뒤 움직임', '타당성을 스스로 확인하고 움직임'],
      '새 제안을 받으면 곧바로 따르기보다, 스스로 납득할 근거가 있는지 먼저 확인하는 흐름이 반복되기 쉽습니다. 아직 의견을 말하지 않았어도, 그 제안이 상황에 맞는지 살피고 있을 때가 있습니다.',
      '新しい提案を受けてもすぐに従うより、自分が納得できる根拠があるかを先に確かめる流れが繰り返されやすくなります。意見を口にしていなくても、提案が状況に合うか考えていることがあります。',
      'A recurring pattern when you receive a new suggestion is to look for reasoning you can verify before acting. Even before you voice an opinion, you may already be testing whether the proposal fits the situation.',
      ['judgment', 'independence']),
    part(['타당성을 스스로 확인하고 움직임', '자기 판단을 유일한 기준으로 삼기 쉬움'],
      '이 과정은 제안의 허점을 찾는 데 도움이 됩니다. 다만 검토가 자신의 기준 안에서만 이어지면, 상대가 다른 근거를 제시해도 이미 결론이 난 문제처럼 다루게 될 수 있습니다. 상대에게는 의견을 낼 여지가 줄어든 것처럼 느껴질 수 있습니다.',
      'この過程は提案の弱いところを見つける助けになります。ただ、自分の基準の中だけで検討を続けると、相手が別の根拠を出しても、もう結論が出たことのように扱ってしまう場合があります。',
      'That can help you spot a weak point in a proposal. If the review stays entirely within your own criteria, though, new evidence from someone else may come in after you already consider the matter settled.',
      ['observation', 'judgment', 'relationship']),
    part(['때와 장소를 가려 의견을 내고 공적인 일과 사적인 일을 구분함', '말과 행동으로 감정과 의견을 발산함'],
      '또 하나는 의견을 표현할 자리를 고르는 방식입니다. 공적인 일과 개인적인 감정을 구분해 말을 아끼는 자리가 있는 반면, 이야기해도 된다고 판단한 자리에서는 느낀 점이나 의견을 말과 행동으로 분명히 나타낼 수 있습니다.',
      'もう一つは、意見を出す場を選ぶことです。公の仕事と個人的な気持ちを分けて言葉を控える場がある一方、話してよいと判断した場では、思いや意見を言葉や行動ではっきり示すことがあります。',
      'Another pattern is choosing where to say what you think. You may hold back where you want to keep work and private feelings separate, then express a view more plainly once you decide the setting is right.',
      ['emotion', 'expression', 'relationship']),
    part(['사회적 마찰이 커지면 반항이 강해짐', '기존 체계에 도전함'],
      '마찰이 커지면 표현의 초점이 달라질 수 있습니다. 처음에는 의견 하나를 조율하던 일이, 시간이 지나면서 그 결정을 내리는 방식 자체에 문제를 제기하는 쪽으로 옮겨갈 수 있습니다. 내용에 대한 이견과 절차에 대한 이견이 섞이면 대화가 길어지기 쉽습니다.',
      '摩擦が大きくなると、何に異議を唱えるかが変わることがあります。初めは一つの意見をすり合わせていても、次第に決め方そのものを問い直す方へ移ることがあります。内容と手続きへの異議が重なると、話し合いが長引きやすくなります。',
      'As friction builds, the focus of your objection can shift. A discussion that began with one proposal may turn into a challenge to how the decision is being made. When those two disagreements become entangled, the conversation can take longer to resolve.',
      ['adaptation', 'expression', 'relationship']),
    part(['타당성을 스스로 확인하고 움직임', '기존 체계에 도전함'],
      '비슷한 논의가 되풀이된다면, 제안의 근거를 더 확인하고 싶은 것인지 결정 방식에 이의를 제기하는 것인지를 먼저 나눠 말해 보세요.',
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
