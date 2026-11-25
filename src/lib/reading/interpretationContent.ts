import type { CustomerChapterId } from './customer/types'
import type { StructuralReadingMeaning } from './structuralExplanation'

type Locale = 'ko' | 'ja' | 'en'
type Content = {
  chapter: CustomerChapterId
  source: readonly string[]
  excludes: string
  replaces?: boolean
  when: (meaning: StructuralReadingMeaning) => boolean
  copy: Record<Locale, string>
}

// Editorial content for independently supported meanings. The predicates can
// narrow an adjudicated claim but cannot infer an Outcome or alter Judgment.
export const interpretationContent = {
  practical_adaptation: {
    chapter: 'CR-01', source: ['07:3114-3117', 'CL-P01'], replaces: true,
    excludes: 'Unverified history of success or a claim about the speed of adaptation.',
    when: m => m.kind === 'practical_focus',
    copy: {
      ko: '상황이 달라져도 바로 기준부터 바꾸기보다, 무엇을 끝까지 지켜야 하고 어느 절차만 고치면 되는지 나누는 편이 맞습니다. 처음 계획을 지키는 것과 현실에 맞게 고치는 것을 둘 중 하나로 택할 필요가 없습니다. 필요한 결과가 무엇인지 알면, 낯선 도구를 쓰거나 협업 순서를 바꾸면서도 판단의 중심을 유지할 수 있습니다.',
      ja: '状況が変わっても、まず基準を変えるより、何を最後まで守り、どの手順を直せばよいかを分けるやり方が合います。計画を守ることと現実に合わせることは両立します。必要な成果が分かっていれば、慣れない道具を使ったり協力の順序を変えたりしても、判断の中心を保てます。',
      en: 'When circumstances change, separate what the result must still meet from procedures that can be revised. Keeping the aim and adapting the method can go together. A clear view of the required result can keep your judgment steady even with unfamiliar tools or a different order of collaboration.',
    },
  },
  compare_while_learning: {
    chapter: 'CR-02', source: ['07:3118-3120'], replaces: true,
    excludes: 'No intelligence rank, exam result, or success prediction.',
    when: m => m.kind === 'coordination' && !m.recurrence,
    copy: {
      ko: '설명을 한 번 듣는 것보다 비슷한 작업을 다른 조건에서 해 보며 차이를 기억하는 학습이 힘을 발휘하기 좋은 자리입니다. 두 결과를 비교해 어느 단계가 달랐는지 남겨 두면, 다음 과제에서도 그대로 가져갈 부분과 손봐야 할 부분이 보입니다. 세부를 많이 익히는 강점을 쓰려면 자료의 양보다 비교할 수 있는 사례가 있어야 합니다.',
      ja: '一度説明を聞くだけより、似た作業を違う条件で試し、その違いを覚える学び方で力を使いやすくなります。二つの結果を比べ、違った段階を残すと、次の課題にそのまま使える部分と直す部分が見えます。細部を学ぶ力を活かすには、資料の量より比べられる事例が大切です。',
      en: 'You can make good use of your attention to detail by trying similar work under different conditions and recording what changed. Comparing two results shows what can carry forward and what needs adjustment. Examples you can compare matter more here than the amount of material you collect.',
    },
  },
  knowledge_as_a_working_resource: {
    chapter: 'CR-02', source: ['07:453', 'PA-202', 'R-085'],
    excludes: 'The path does not prove full protection or capacity for more responsibility.',
    when: m => m.kind === 'linked_response' && m.path === 'knowledge_and_pressure',
    copy: {
      ko: '까다로운 요구가 들어왔을 때 이미 알고 있는 것을 곧장 답으로 쓰기보다, 이번 문제에 맞는 근거를 골라 쓰는 데 강점이 있습니다. 비슷해 보이는 요청이라도 조건을 하나씩 나누어 보면 이전 방법으로 해결할 부분과 새 판단이 필요한 부분이 드러납니다. 아는 것이 많은 것보다 필요한 순간에 어떤 근거에 기대야 할지 정할 수 있다는 점이 이 능력의 쓰임입니다.',
      ja: '難しい要望が来たとき、知っていることをそのまま答えにするより、今回の問題に合う根拠を選ぶ力が活きます。似た要望でも条件を分けると、以前の方法で解ける部分と、新たな判断が必要な部分が見えてきます。知識の量より、どの根拠を使うか決められることが役立ちます。',
      en: 'When a request is demanding, your strength lies in choosing which knowledge applies rather than using a familiar answer straight away. Break an apparently similar request into conditions to see what the old method can handle and what calls for a new judgment.',
    },
  },
  manageable_scope: {
    chapter: 'CR-03', source: ['07:3122-3127', 'R-084', 'R-086'],
    excludes: 'No diagnosis, forecast of failure, or assumption about actual workload.',
    when: m => m.kind === 'linked_response' && m.path === 'production_and_pressure' && m.dayRoot === 'weakened',
    copy: {
      ko: '결과를 얻을 방법이 보이면 그 일을 더 넓게 맡고 싶어질 수 있습니다. 이때 스스로 해결할 수 있는 부분이 곧 무리 없이 계속 맡을 수 있는 범위는 아닙니다. 범위를 정하기 전에는 최초 작업량과, 마무리 이후에도 수정이나 대응을 해야 하는 몫을 나누어 보세요. 원하는 결실을 좇는 힘과 그것을 끝까지 책임질 여력이 각각 어디에서 달라지는지 보입니다.',
      ja: '成果を得る方法が見えると、その仕事を広く引き受けたくなることがあります。自分で解ける部分が、そのまま無理なく続けられる範囲になるとは限りません。受ける範囲を決める前に、最初の作業量と、仕上げた後も修正や対応が残る分を分けて見ると、目標と余力の違いが見えます。',
      en: 'A visible route to a result can make it tempting to take on more. What you can solve yourself may differ from what you can keep carrying. Before setting the scope, separate the initial work from revisions and responses that might remain after delivery.',
    },
  },
  additional_responsibility: {
    chapter: 'CR-05', source: ['CL-P01', 'CL-R04', '07:3122-3129'],
    excludes: 'No claim about who makes the demand or about an established relationship status.',
    when: m => m.kind === 'linked_response' && m.protected && m.residual === 'weakened',
    copy: {
      ko: '가까운 사이든 함께 일하는 사이든, 문제를 풀 방법을 알려 주는 것과 해결까지 맡는 것은 서로 다른 도움입니다. 익숙한 방법으로 부담을 덜어 줄 수 있어도 상대와 나눌 몫은 남습니다. 부탁을 받을 때는 어느 부분을 같이 해결할지, 어느 부분은 각자 결정할지부터 맞추면 도움이 계속 한쪽의 책임으로 쏠리는 일을 줄일 수 있습니다.',
      ja: '身近な関係でも協力する場でも、解き方を伝えることと最後まで引き受けることは別の助けです。慣れた方法で負担を軽くできても、分け合うべき部分は残ります。頼まれたときは、一緒に解く部分と各自で決める部分を先に合わせると役立ちます。',
      en: 'Offering a way to solve a problem and taking responsibility for solving it are different kinds of help. Even if a familiar method eases the strain, something is still left to share. When someone asks for help, agree on what you will work through together and what each person will decide independently.',
    },
  },
  a_result_others_can_use: {
    chapter: 'CR-06', source: ['07:3122-3127', 'PA-301', 'PA-310'],
    excludes: 'No job, income or learning outcome is inferred.',
    when: m => m.kind === 'linked_response' && m.path === 'production_and_pressure',
    copy: {
      ko: '연구한 내용이 쌓이면 무엇을 알고 있는지와 그것으로 무엇을 만들어 전달할 수 있는지를 구분해 보는 편이 좋습니다. 같은 기술이라도 한 번 만든 결과가 계속 쓸 만한지는 실제 사용하는 사람이 어떤 절차를 다시 밟아야 하는지에 달려 있습니다. 설명을 넘길 때는 완성한 부분, 다른 조건에 적용할 때 바꿀 부분, 다음 사람이 확인할 부분을 함께 정리할 수 있습니다.',
      ja: '調べたことが増えたら、何を知っているかと、それを使って何を作り渡せるかを分けて見られます。同じ技術でも、作った成果を使い続けられるかは、使う人がどの手順を改めて踏むかによります。渡すときは、完成した部分、条件が変われば直す部分、次の人が確かめる部分を分けてまとめられます。',
      en: 'As research accumulates, distinguish what you know from what you can make and hand over. Whether a result remains usable depends in part on which steps someone else needs to repeat. When handing it over, identify what is finished, what would need adapting in other conditions, and what the next person should check.',
    },
  },
  route_demands_instead_of_absorbing_them: {
    chapter: 'CR-06', source: ['07:453', 'PA-202', 'R-085'],
    excludes: 'No assumption that the person has a job or that all demands can be resolved.',
    when: m => m.kind === 'linked_response' && m.path === 'knowledge_and_pressure' && m.residual === 'active',
    copy: {
      ko: '방법을 찾는 일과 새 책임을 떠맡는 일을 분리할 수 있는 환경에서 능력을 쓰기 좋습니다. 예를 들어 여러 요청이 겹치면, 지금 가진 근거로 답할 수 있는 것부터 정리하고 시간이 더 필요한 것은 별도로 알려 줄 수 있습니다. 요구의 범위를 바꿀 수 없다면 무엇을 먼저 처리할지 합의하는 것만으로도, 모든 어려움을 한꺼번에 떠안는 부담을 줄일 여지가 있습니다.',
      ja: '方法を探す仕事と新たな責任を引き受けることを分けられる環境で、力を使いやすくなります。要望が重なったら、手元の根拠で答えられるものを先に整理し、時間が要るものは別に伝えられます。範囲を変えられなくても、先に扱うものを合意すると負担を減らせる余地があります。',
      en: 'Your ability is easier to use when finding a solution is separate from taking on the responsibility. If requests overlap, answer what the available evidence covers and flag what needs more time. Even where the scope cannot change, agreeing on what comes first can reduce the pressure of handling everything together.',
    },
  },
  an_explanation_needs_a_trial: {
    chapter: 'CR-06', source: ['PA-504', 'R-021', 'Authority 25-7:⑤'],
    excludes: 'No guarantee of innovation or evidence of repeated delay.',
    when: m => m.kind === 'linked_response' && m.path === 'expression_and_review',
    copy: {
      ko: '한 가지 방법만 따라야 하는 환경보다, 방법을 고른 이유를 설명하고 작은 범위에서 검증할 수 있는 환경에서 능력을 쓰기 좋습니다. 검토의 기준은 자료를 얼마나 많이 모았는지가 아니라 그 자료로 실제 작업의 결과를 바꿀 수 있는지입니다. 내용을 설명하는 단계와 직접 만들어 보는 단계를 나누면, 새로운 방법을 제안하는 능력이 마무리 시간을 다 쓰지 않게 할 수 있습니다.',
      ja: '一つの手順しか選べない環境より、方法を選んだ理由を説明し、小さな範囲で確かめられる環境で力を使いやすくなります。確認の基準は資料の量ではなく、作業の結果を変えられるかです。説明と試作を別の段階にすると、提案する力と仕上げの時間を両方活かせます。',
      en: 'Your ability has more room where you can explain why you chose an approach and test it on a small scale. Judge review by whether it can change the result, not by how much material you gather. A separate step for trying the approach leaves time to finish as well as to explain it.',
    },
  },
  objective_and_ongoing_cost: {
    chapter: 'CR-07', source: ['07:3122-3127', 'R-086'],
    excludes: 'No cash receipt, expense, loss or retention prediction.',
    when: m => m.kind === 'linked_response' && m.path === 'production_and_pressure',
    copy: {
      ko: '성과가 눈에 보인다고 그 일을 더 크게 가져갈 수 있다는 뜻은 아닙니다. 원하는 기준을 달성하기까지 필요한 자원과, 달성한 뒤에 계속 관리할 몫을 구분할 때 목표를 현실적으로 잡기 좋습니다. 한 번 더 만드는 것은 가능해도 같은 품질을 유지하려면 시간이 달라질 수 있습니다. 확장 여부는 예상 결과와 함께 자신이 계속 써야 할 시간까지 놓고 판단할 수 있습니다.',
      ja: '成果が見えることと、取り組みをさらに広げられることは別に考えられます。目標に届くまでに使う資源と、届いた後に管理し続ける分を分けると、現実的な目標を定めやすくなります。同じ質を保つための時間も含めて、広げるかどうかを判断できます。',
      en: 'Seeing a result and being able to scale the work are separate judgments. To set a realistic goal, distinguish resources needed to reach it from what you will have to keep managing afterward. Include the time required to maintain the same quality when deciding whether to expand.',
    },
  },
  finishing_and_improving: {
    chapter: 'CR-07', source: ['Authority 25-7:⑤', 'PA-504'], replaces: true,
    excludes: 'Latent wealth is not an operating route to income or retention.',
    when: m => m.kind === 'latent_goal' && m.outputPressured && m.mixedMethod,
    copy: {
      ko: '원하는 성과를 정할 때는 끝낼 기준을 먼저 정해 두는 편이 좋습니다. 과정에서 해결책을 더 좋게 만들 수 있어도, 현재 결과를 쓰는 데 꼭 필요한 개선인지에 따라 판단이 달라집니다. 이번에 넘길 수 있는 결과와 다음 번에 개선할 부분을 분리하면, 검토에 쓴 힘이 결과를 만드는 힘과 경쟁하는 상황을 줄일 수 있습니다.',
      ja: '成果を決めるときは、何をもって仕上がりとするかを先に定めると役立ちます。方法を改良できる場合でも、今の成果を使うのに欠かせない変更かどうかで判断が変わります。今回渡すものと次に改善するものを分けると、見直しに使う力と作る力がぶつかりにくくなります。',
      en: 'Set a standard for completion before you refine the work. When an improvement becomes possible, ask whether it is necessary for someone to use the current result. Separating what you can deliver now from what you will improve later helps review and production leave room for each other.',
    },
  },
  coordination_at_the_boundary: {
    chapter: 'CR-04', source: ['07:3121-3129'], replaces: true,
    excludes: 'Only the interval of a resolved repeated configuration within its evaluated parent.',
    when: m => m.kind === 'coordination' && m.recurrence,
    copy: {
      ko: '여러 조건을 확인하고 맞추는 일이 많아지는 동안에는, 모든 세부를 같은 시점에 결정하려 하면 시간이 새기 쉽습니다. 다음 사람의 일이 걸린 결정이나 뒤집기 어려운 결정부터 잡고, 나중에도 고칠 수 있는 부분은 남겨 두세요. 꼼꼼함을 쓰면서도 모든 조율을 직접 떠맡지 않는 데 도움이 됩니다.',
      ja: '条件を確認し調整することが増える間は、細部を同時にすべて決めようとすると時間を使いやすくなります。次の人の作業に関わることや後で戻しにくいことを先に決め、変更できる部分は残せます。細かく確かめる力を使いながら、調整を全部引き受けずに済みます。',
      en: 'When coordination increases, trying to settle every detail at once can consume time. Decide things that other work depends on, or that will be hard to reverse, first. Leave room to revisit adjustable details. That lets you use your care for detail without taking on every adjustment yourself.',
    },
  },
  speaking_and_choosing: {
    chapter: 'CR-01', source: ['Authority 25-7:⑤', 'CL-P01'], replaces: true,
    excludes: 'No claim that all output, challenge, or desire to speak disappears.',
    when: m => m.kind === 'combination' && m.remainingExpression,
    copy: {
      ko: '요구에 몰려 곧바로 답해야 하는 자리와, 방법을 고르고 이유를 설명할 수 있는 자리가 다르게 느껴질 수 있습니다. 전자에서는 대응과 표현이 서로 얽혀 바로 드러나기 어렵지만, 후자에서는 자신의 방식으로 의견을 정리해 전하는 힘이 남습니다. 의견이 없어서 기다리는 것인지, 의견은 있지만 설명할 조건을 기다리는 것인지 구분할 수 있습니다.',
      ja: 'すぐ返事を求められる場面と、方法を選び理由を説明できる場面では、力の使い方が異なります。すぐ答える必要があると対応と表現が絡み、考えを出しにくくなります。方法を選べる場合は、自分の言葉で考えをまとめる力が残ります。',
      en: 'Having to respond immediately calls on you differently from being able to choose a method and explain why. Under immediate demands, response and expression can be tied together. Given room to choose an approach, you can still organize and explain a view of your own.',
    },
  },
  evaluate_the_exchange: {
    chapter: 'CR-03', source: ['CL-P01', 'PA-204', 'R-085'],
    excludes: 'No claim about actual workload, repeated behavior, or an inevitable event.',
    when: m => m.kind === 'linked_response' && m.path === 'knowledge_and_pressure' && m.protected,
    copy: {
      ko: '손에 넣고 싶은 결과가 생겨도 그것을 얻는 조건이 자신에게 맞는지는 다시 따져 볼 수 있습니다. 이미 해결할 방법이 있는 문제에 새 책임이 얹히면, 원래 풀려던 문제와 새로 감당해야 할 약속은 다른 일이 됩니다. 무엇을 더 얻게 되는지와 그 대가로 정기적으로 써야 할 시간을 함께 놓고 보면, 선택의 유불리가 더 분명해집니다.',
      ja: '手にしたい結果があっても、そこに至る条件が自分に合うかは改めて考えられます。解き方が見えていた問題に新たな責任が加われば、元の問題と新しい約束は別の仕事になります。得たいものと、それに継続して使う時間を並べて見ると判断しやすくなります。',
      en: 'Wanting a result leaves room to decide whether its terms suit you. When new responsibility is added to a problem you know how to solve, distinguish the original problem from the ongoing commitment. Compare what the change offers with the time you would regularly have to give it.',
    },
  },
  shared_decision_before_agreement: {
    chapter: 'CR-05', source: ['CL-P01', 'CL-R04'], replaces: true,
    excludes: 'No partner conduct, conflict history, marriage or separation forecast.',
    when: m => m.kind === 'close_context' && !m.reduced,
    copy: {
      ko: '가까운 사람과 의견이 다를 때는 서로를 어떻게 생각하는지보다, 어떤 기준으로 생활을 정하려는지부터 차이가 드러날 수 있습니다. 같은 약속을 두고도 한 사람은 시간의 여유를, 다른 사람은 이미 정한 역할을 더 중요하게 볼 수 있습니다. 먼저 각자 어려운 조건을 말해 두면, 상대가 대신 판단해야 할 부분과 스스로 정할 부분이 뒤섞이지 않습니다.',
      ja: '身近な人と意見が違うときは、相手への気持ちよりも、暮らしをどんな基準で決めるかに違いが出ることがあります。同じ約束でも、時間の余裕を重く見る人と、決めた役割を重く見る人がいます。各自が難しい条件を先に伝えると、一緒に決めることと自分で決めることが整理できます。',
      en: 'When you and someone close disagree, the first difference may be in how you make a shared decision. One of you may give more weight to time, the other to a role you already agreed on. Saying what would be difficult for each of you can clarify what needs a joint decision and what remains yours to decide.',
    },
  },
  finish_one_revision: {
    chapter: 'CR-03', source: ['PA-504', 'R-021'],
    excludes: 'Does not establish the person repeatedly fails to finish.',
    when: m => m.kind === 'linked_response' && m.path === 'expression_and_review',
    copy: {
      ko: '마무리 직전에 더 좋은 방법이 보이면, 이전 작업을 다시 손볼 이유와 다음 결과에 적용할 이유가 동시에 생길 수 있습니다. 확인하는 일이 현재 품질을 얼마나 바꾸는지 판단하고, 작게 시험해 봐도 알 수 있는 것은 먼저 시험하는 편이 좋습니다. 방법을 다시 생각하는 능력을 살리면서 완성에 들일 시간도 남길 수 있습니다.',
      ja: '仕上げ直前によりよい方法が見えると、今の仕事を直す理由と、次に応用する理由の両方が生まれます。確認で今の質がどれほど変わるかを見て、小さく試せば分かることは先に試せます。方法を考え直す力を使いながら、仕上げる時間を残せます。',
      en: 'A better approach found near the end may give you a reason to revise now or a useful idea for the next result. Consider how much another check would change the present quality, and test what a small trial can settle. That leaves time to finish while still using your ability to rethink the method.',
    },
  },
  work_without_the_old_shortcut: {
    chapter: 'CR-08', source: ['SG-037', 'SG-123', '07:3127-3130'],
    excludes: 'Requires an evaluated next period and lost protective role. No specific job, contract or family event.',
    when: m => m.kind === 'axis' && m.comparison === 'next'
      && !!m.changes?.some(change => change.context === 'support' && change.to === 'inactive'),
    copy: {
      ko: '장기 흐름이 바뀐 뒤에는 까다로운 요구를 이전의 익숙한 방법으로 처리할 수 있는지부터 다시 확인해야 합니다. 예전에는 혼자 바로 해결할 수 있었던 부분이라도, 같은 지원을 전제로 일을 넓히면 남는 책임이 커질 수 있습니다. 새 일을 맡을 때는 처음부터 누가 어느 단계에서 결정하고, 도움을 어디까지 받을 수 있는지를 정해 두는 편이 좋습니다.',
      ja: '長い周期が切り替わった後は、難しい要望に以前のやり方で対処できるかを改めて確かめることが大切です。以前なら自分ですぐ解けた部分でも、同じ支えを前提に範囲を広げると、残る責任が増えることがあります。新しく引き受けるときは、誰がどの段階で決め、どこまで助けを得られるかを先に定められます。',
      en: 'After the long-term transition, check whether a familiar approach can still deal with difficult requests. Even work you could previously resolve yourself can leave you with more responsibility if you expand it assuming the same backing. When taking on something new, agree early on who decides at each stage and what help is available.',
    },
  },
  reproduce_the_difficulty: {
    chapter: 'CR-02', source: ['PA-200', 'PA-310', 'PA-501', '07:977'], replaces: true,
    excludes: 'Requires the applied favorable control path. No claim that it resolves all of the pressure.',
    when: m => m.kind === 'applied_mechanism' && m.mechanism === 'practiced_solution' && !m.reduced,
    copy: {
      ko: '까다로운 요구가 들어오면 익혀 둔 절차로 문제가 생기는 부분을 좁힐 수 있습니다. 막힌 일이 있다면 먼저 같은 조건에서 문제가 다시 나타나는지 확인하고, 자신이 다룰 수 있는 부분부터 바꿔 보세요. 다른 사람이 이어서 처리하는 일이라면 무엇을 바꿨고 어떤 부담이 여전히 남았는지까지 설명할 수 있습니다.',
      ja: '難しい要望が来たとき、身につけた手順で問題が起きる部分を絞れます。同じ条件で問題が出るかを確かめ、自分で扱える部分から変えてみられます。次に扱う人がいるなら、変えた部分と残っている負担まで伝えられます。',
      en: 'When a request is demanding, a practiced procedure can help isolate where the problem starts. Check whether it appears under the same conditions, then change the part you can handle. If someone else picks it up afterward, tell them what changed and what remains difficult.',
    },
  },
  evidence_before_proposal: {
    chapter: 'CR-02', source: ['PA-601'], replaces: true,
    excludes: 'Only when the knowledge path currently and favorably supports expression.',
    when: m => m.kind === 'applied_mechanism' && m.mechanism === 'knowledge_shapes_expression' && !m.reduced,
    copy: {
      ko: '새로운 생각을 말할 때는 이미 아는 자료 중 상대도 직접 확인할 수 있는 것을 골라 붙이면 설득의 근거가 분명해집니다. 방법을 바꾸자는 제안이라면 지금 방식이 어디에서 막히는지와, 바꾼 뒤 무엇을 확인할 수 있는지를 각각 설명할 수 있습니다. 생각을 새로 내는 힘과 배운 것으로 그 생각을 다듬는 힘이 이때 함께 쓰입니다.',
      ja: '新しい考えを伝えるとき、相手も確かめられる資料を選んで添えると、説明の根拠が明確になります。方法を変える提案なら、今のやり方がどこで止まり、変更後に何を確かめられるかを分けて説明できます。',
      en: 'An unfamiliar idea is easier to explain when you can attach material the listener can examine. If proposing a change, distinguish where the present method stalls from what you would check after changing it. Learning helps you refine, as well as generate, your ideas.',
    },
  },
  accountable_results: {
    chapter: 'CR-02', source: ['PA-100', 'PA-302'], replaces: true,
    excludes: 'No job offer, promotion, title, or realized recognition is inferred.',
    when: m => m.kind === 'applied_mechanism' && m.mechanism === 'results_build_trust' && !m.reduced,
    copy: {
      ko: '성과는 다른 사람이 맡길 범위를 판단할 수 있을 때 신뢰의 근거가 됩니다. 완성했다는 말에 그치기보다 어떤 기준에 맞췄고, 다른 조건에서도 같은 방식으로 다룰 수 있는 부분이 무엇인지 보여 줄 수 있습니다. 맡을 수 있는 부분과 다른 사람의 확인이 필요한 부분을 구분하면 현실적인 결과가 책임의 기준으로 쓰입니다.',
      ja: '成果は、周囲が任せられる範囲を判断できるときに信頼の根拠になります。何を仕上げたかに加え、どの基準を満たし、条件が違っても同じように扱える部分を示せます。引き受けられる範囲と別の人の確認が要る範囲を分けると役立ちます。',
      en: 'Results can support trust when they show someone what they can reasonably ask you to carry. Explain which standards were met and what would still work under different conditions. Distinguish what you can take responsibility for from what someone else needs to verify.',
    },
  },
  grounded_support_in_uncertainty: {
    chapter: 'CR-03', source: ['CL-P01', 'R-085'],
    excludes: 'No repeated behavior or personal history.',
    when: m => m.kind === 'linked_response' && m.path === 'knowledge_and_pressure' && m.protected && m.seasonalSupport,
    copy: {
      ko: '요구가 갑자기 늘면 당장 답을 정하기보다 무엇을 이미 알고 있고 무엇을 새로 확인해야 하는지부터 나누는 편입니다. 경험을 활용할 수 있는 상황이라면 요구가 까다로워도 어디서부터 판단할지 찾기 쉽습니다. 익숙한 기준을 벗어난 부분까지 한꺼번에 맡게 되면, 평소 잘 처리하던 일에도 같은 여유를 쓰기 어려워집니다.',
      ja: '要求が急に増えたときは、すぐに答えを決めるより、すでに分かっていることと、新たに確かめることを分ける傾向があります。経験を生かせる場面なら、要求が難しくても判断の出発点を見つけやすくなります。慣れた基準から外れるところまで一度に引き受けると、普段なら対応しやすいことにも同じ余裕を使いにくくなります。',
      en: 'When demands rise suddenly, you tend to separate what you already know from what needs checking before giving an answer. Relevant experience makes it easier to find a starting point even under pressure. Taking on unfamiliar requirements all at once can leave you with less room for the things you normally handle well.',
    },
  },
  limits_to_review: {
    chapter: 'CR-03', source: ['CL-P01', 'R-085'],
    excludes: 'No avoidance habit or actual missed deadlines.',
    when: m => m.kind === 'conditioned_tendency' && m.tendency === 'review_crowds_out_practice' && !m.reduced,
    copy: {
      ko: '할 수 있는 방법이 여러 가지라면 생각이 깊어지는 만큼 손을 움직일 때가 늦어질 수 있습니다. 틀려도 쉽게 고칠 수 있는 부분에서는 직접 시험한 결과가 고민을 줄여 줍니다. 처음부터 되돌리기 어려운 결정에는 신중함을 더 쓰게 됩니다. 어느 쪽인지 구분할 수 있을 때 검토와 표현이 서로의 시간을 덜 빼앗습니다.',
      ja: 'できる方法がいくつもあると、考えが深まる一方で、手を動かし始めるまでに時間がかかることがあります。間違っても直しやすい部分は、小さく試すことで迷いを減らせます。初めからやり直しにくい判断には慎重さが生きます。この違いが分かると、検討と実践が互いの時間を奪いにくくなります。',
      en: 'When several approaches are possible, thinking them through can delay the first attempt. Trying a small version can resolve doubts about choices that are easy to reverse. Extra care is more useful when a choice will be hard to undo. Recognizing the difference gives both reflection and expression room to work.',
    },
  },
  ambition_and_exposure: {
    chapter: 'CR-07', source: ['CL-M06', '07:453', 'PA-202'],
    excludes: 'No finding of income, loss, or ability to carry an untested obligation.',
    when: m => m.kind === 'linked_response' && m.path === 'knowledge_and_pressure' && m.protected && m.residual === 'active',
    copy: {
      ko: '실속 있는 성과를 원할수록 그 성과에 딸린 책임까지 커지는 구조입니다. 더 큰 제안을 검토할 때는 얻을 몫과 함께, 결과가 나오기 전까지 묶이는 자원과 나중에도 혼자 맡아야 할 일을 보게 됩니다. 익숙한 기준이나 경험을 활용하면 성급하게 많은 것을 떠안는 부담을 덜 수 있습니다. 그래도 맡은 책임은 일부 남으므로, 얻을 몫이 커진다는 이유로 감당 범위까지 넓어졌다고 보기는 어렵습니다.',
      ja: '実のある成果を求めるほど、それに伴う責任も大きくなりやすい傾向があります。規模の大きい提案を考えるときは、得られるものとあわせて、成果が出るまで使えなくなる資源や、その後も一人で引き受ける仕事に目が向きます。経験や使い慣れた判断基準は、急いで抱え込みすぎる負担を和らげます。それでも責任の一部は残るため、得るものの大きさと引き受けられる範囲は別々に見極める必要があります。',
      en: 'A more substantial result can bring heavier commitments with it. In weighing a bigger offer, you may look both at what it could yield and at what will be tied up until it delivers or left for you to handle afterward. Experience and familiar standards can keep you from taking on too much in haste. Some responsibility still remains, so a bigger potential return does not by itself extend what you can carry.',
    },
  },
  productive_skill_and_exchange: {
    chapter: 'CR-07', source: ['CL-M01', 'CL-M02', 'R-085'],
    excludes: 'No active earning route, actual sale, accumulation, or loss is inferred from a latent resource role.',
    when: m => m.kind === 'latent_goal',
    copy: {
      ko: '공들여 만든 것이 쓸모를 갖추는 과정과, 그 쓸모가 경제적인 결실을 맺는 과정에는 차이가 있습니다. 이 명식에서 먼저 힘을 쓰는 쪽은 손에 잡히는 결과를 만들거나 더 낫게 바꾸는 능력입니다. 그 결과를 필요로 하는 사람과 교환 조건이 구체적으로 맞아야 경제적 가치도 드러납니다. 결과의 완성도가 높아져도 그 조건까지 함께 성숙했다고 볼 수는 없습니다.',
      ja: '手をかけたものが役に立つようになることと、その価値が経済的な実りにつながることには違いがあります。先に力を発揮しやすいのは、形のあるものを作り、よりよくする部分です。それを必要とする人がいて、交換の条件も具体的にかみ合ったときに、経済的な価値が見えてきます。仕上がりがよくなることだけで、その条件も整ったとは判断できません。',
      en: 'Making something useful and realizing its economic value are distinct steps. Your strength comes through first in making something tangible or improving it. Its economic value becomes clearer when someone needs that result and the terms of exchange fit. Better workmanship alone does not establish that those conditions are in place.',
    },
  },
  learning_to_make_your_own_judgment: {
    chapter: 'CR-01', source: ['RES-01', 'CL-P01'],
    excludes: 'Requires an operating knowledge-to-practice policy. No credential or study result.',
    when: m => m.kind === 'applied_mechanism' && m.mechanism === 'knowledge_into_practice'
      && !m.reduced && !m.adverse,
    copy: {
      ko: '새로운 설명을 들으면 그 설명을 그대로 기억하는 데서 그치기보다, 이미 이해한 것과 어떻게 이어지는지 생각하는 편입니다. 이유를 자기 말로 설명할 수 있을 때 비로소 낯선 상황에서도 응용할 수 있다는 확신이 생깁니다. 같은 방법이 언제 통하지 않는지까지 알게 되면 다른 사람의 판단에도 무작정 기대지 않게 됩니다.',
      ja: '新しい説明を聞くと、そのまま覚えるだけでなく、すでに理解したこととどうつながるかを考える傾向があります。理由を自分の言葉で説明できると、慣れない状況にも応用できるという手応えが生まれます。同じ方法が通用しない条件まで分かれば、人の判断にもむやみに頼らずに済みます。',
      en: 'When you hear a new explanation, you tend to think about how it fits with what you already understand. Being able to explain why it works in your own words gives you more confidence in unfamiliar situations. Knowing when the same approach fails also helps you form a judgment of your own.',
    },
  },
  room_to_rethink_a_difficult_request: {
    chapter: 'CR-06', source: ['KILL-08', 'HO-04', 'WEALTH-08'],
    excludes: 'Requires an operating favorable adaptive policy. No claim that a deadline or scarce resources disappear.',
    when: m => m.kind === 'applied_mechanism' && m.mechanism === 'adaptive_solution'
      && !m.reduced && !m.adverse,
    copy: {
      ko: '막힌 과제에서도 요구가 생긴 이유를 다시 보면 선택지가 넓어집니다. 예를 들어 처음 요청한 방법을 그대로 따르기 어렵더라도, 상대가 실제로 필요로 하는 결과를 파악하면 다른 방식으로 같은 필요를 충족할 수 있습니다. 바꿀 수 있는 것이 방법인지 결과의 기준인지 분명할수록 이 재치가 설득력으로 이어집니다.',
      ja: '行き詰まった課題でも、なぜその要望が出たのかを考え直すと、選択肢が広がります。最初に頼まれた方法が難しくても、相手が必要としている結果が分かれば、別の方法でその必要を満たせます。変えられるのが手段なのか結果の基準なのかが明確なほど、その機転は相手にも伝わりやすくなります。',
      en: 'When a task stalls, looking again at why the request was made can open up options. If the requested approach is impractical, understanding what the other person actually needs may let you meet that need another way. Your adaptability is more persuasive when it is clear which methods can change and which standards still apply.',
    },
  },
  social_support_through_a_shared_standard: {
    chapter: 'CR-05', source: ['CL-P01', 'CL-R04'],
    excludes: 'Requires an operating support role protecting the social standard. No partner or family attribution.',
    when: m => m.kind === 'shared_support' && m.setting === 'social',
    copy: {
      ko: '여러 사람이 함께하는 자리에서는 서로 무엇을 기대하는지 분명할수록 협력이 편해집니다. 같은 목표에 동의해도 방법은 다를 수 있으므로, 지켜야 할 기준을 공유하고 각자의 판단을 맡겨 둘 때 도움을 주고받기 쉽습니다. 상대의 몫까지 결정해 주는 것보다, 서로 어디서 힘을 보탤 수 있는지 아는 편이 관계를 편안하게 합니다.',
      ja: '何人かで関わる場では、互いに何を期待しているかがはっきりしているほど協力しやすくなります。同じ目的に賛成していても方法は異なり得るため、守る基準を共有し、各自の判断を尊重すると助けを交わしやすくなります。相手の分まで決めるより、どこで力を貸し合えるかが分かるほうが、関係を無理なく保てます。',
      en: 'Cooperation comes more easily in a group when everyone knows what the others expect. People can share a purpose and still approach it differently. Agreed standards leave room for individual judgment and make it clearer where you can help each other without taking over another person’s decisions.',
    },
  },
  private_mutual_support: {
    chapter: 'CR-05', source: ['CL-R02', 'CL-R04'],
    excludes: 'No partner identity, relationship status, or marriage prediction.',
    when: m => m.kind === 'shared_support' && m.setting === 'close',
    copy: {
      ko: '가까운 사이에서는 각자 편하게 할 수 있는 일을 자연스럽게 나눌 때 친밀감이 자라기 쉽습니다. 상대가 내 일의 방식을 존중하면서 필요한 자리를 채워 주면 도움을 받아들이기도 한결 편합니다. 역할이 익숙해진 뒤에도 한쪽의 몫을 당연하게 여기지 않는 것이 이 관계의 편안함을 지키는 조건입니다.',
      ja: '親しい間柄では、お互いが無理なくできることを自然に分け合えると、距離が縮まりやすくなります。相手が自分のやり方を尊重しながら必要なところを補ってくれると、助けも受け入れやすくなります。分担に慣れたあとも、片方の負担を当たり前にしないことが、心地よさを保つ条件です。',
      en: 'Closeness can grow when both people naturally share what each can do with ease. Help is easier to receive when the other person respects your way of doing things and fills a real need. Once those roles become familiar, continuing to notice each person’s contribution helps preserve that ease.',
    },
  },
  lighter_friction_in_close_decisions: {
    chapter: 'CR-05', source: ['CL-R01', 'CL-R04'],
    excludes: 'No claim of an actual dispute, separation, or a complete removal of friction.',
    when: m => m.kind === 'close_context' && m.reduced,
    copy: {
      ko: '가까이 지내며 하나의 결정을 함께 내려야 할 때에는 각자의 생활 리듬이 다르다는 점이 드러날 수 있습니다. 차이를 완충하는 힘도 있으므로 의견이 갈린 첫 순간이 관계의 방향을 결정한다고 볼 필요는 없습니다. 함께 정해야 할 부분과 각자 선택할 수 있는 부분을 구분하면, 남아 있는 차이를 서로에 대한 불만으로 받아들이기 쉬운 상황을 줄일 수 있습니다.',
      ja: '親しい相手と一つのことを決める場面では、生活のリズムの違いが出ることがあります。違いがやわらぐ余地もあるため、意見が初めて分かれた時点で関係の先行きまで決まるわけではありません。一緒に決めることと各自で選べることを分けると、残る違いを相手への不満として受け取りにくくなります。',
      en: 'A shared decision can reveal that you and someone close live at different rhythms. There is room for the difference to soften, so the first disagreement does not settle the direction of the relationship. Distinguishing joint decisions from individual choices can make the remaining difference easier to live with.',
    },
  },
} satisfies Record<string, Content>

export type InterpretationContentId = keyof typeof interpretationContent
export const interpretationContentEntries = Object.entries(interpretationContent) as [InterpretationContentId, Content][]

type TraitContent = {
  chapter: CustomerChapterId
  trait: readonly string[]
  voice: string
  source: string
  copy: Record<Locale, string>
}

export const personalityContent = {
  personal_standards: {
    chapter: 'CR-01', trait: ['자기 결과물에 엄격함'], voice: 'core', source: 'CL-P01',
    copy: {
      ko: '다른 사람이 충분하다고 보더라도, 자신이 낸 결과를 볼 때는 처음에 세운 기준을 다시 적용하는 편입니다. 여러 사람이 함께 만든 결과라면 어떤 부분을 자신이 책임졌는지부터 돌아볼 수 있습니다. 자신에게 적용한 기준이 다음 작업의 품질을 실제로 높이는지까지 살펴보면, 자기 기준을 유지하면서도 이미 끝낸 부분을 인정할 수 있습니다.',
      ja: '周囲が十分だと見ても、自分の成果には最初に立てた基準をもう一度当てはめる傾向があります。共同の成果なら、自分が担った部分から振り返れます。その基準が次の質を高めるかを確かめると、基準を保ちながら、すでに仕上げたところも認められます。',
      en: 'Even when others find a result satisfactory, you tend to judge your contribution against the standard you set at the start. On a shared result, you may first examine the part you were responsible for. Asking whether that standard will improve the next result helps you keep it while recognizing what is already finished.',
    },
  },
  compare_explanations: {
    chapter: 'CR-02', trait: ['분석력'], voice: 'problem', source: 'CL-P01',
    copy: {
      ko: '같은 문제를 두고 설명이 갈릴 때 어떤 조건이 결론을 바꾸는지 구분하는 능력이 있습니다. 자료마다 출발점이 다르면 전제부터 맞출 수 있고, 전제가 같다면 결론에 이르는 중간 절차를 비교할 수 있습니다. 여러 의견이 나온 회의에서는 반대 의견과 아직 확인하지 못한 사실을 나누어 적는 것만으로도 다음에 무엇을 알아봐야 할지 좁혀집니다.',
      ja: '同じ問題の説明が分かれるとき、どの条件が結論を変えるかを分けて見られます。資料ごとに出発点が違えば前提をそろえ、同じ前提なら途中の手順を比べられます。意見が多い場では、反対意見と未確認の事実を分けて記すと、次に何を調べるかが絞れます。',
      en: 'When accounts of the same problem disagree, you can identify which condition changes the conclusion. Align the assumptions if sources began in different places. If they share assumptions, compare the steps in between. In a discussion with many views, separating disagreements from unchecked facts can narrow what to examine next.',
    },
  },
  independent_basis: {
    chapter: 'CR-01', trait: ['조언을 들어도 스스로 납득한 뒤 움직임', '타당성을 스스로 확인하고 움직임'], voice: 'decision', source: 'CL-P01',
    copy: {
      ko: '조언이 유용해도 무엇을 기준으로 결정할지는 직접 정해야 움직이기 쉽습니다. 누군가 권한 방법이 좋아 보인다면, 그 사람이 중요하게 본 조건이 자신의 선택에도 같은 무게를 갖는지 확인합니다. 제안에 동의할지와 그 안의 일부를 자신의 방식으로 가져다 쓸지는 다른 문제입니다.',
      ja: '助言が役立っても、何を基準に決めるかは自分で定めると動きやすくなります。勧められた方法がよさそうなら、その人が重く見た条件が自分の選択でも同じ重みを持つかを確かめます。提案に同意することと、一部を自分の方法に取り入れることは別々に考えられます。',
      en: 'Advice may be useful, but you move more easily when you can decide what standard justifies the choice. If a suggested method looks promising, consider whether the conditions that matter to the adviser carry the same weight for you. Agreeing to a proposal and using part of it in your own way are different decisions.',
    },
  },
  help_at_close_range: {
    chapter: 'CR-05', trait: ['배려와 재능 나눔이 가까운 범위에 집중됨'], voice: 'relationship', source: 'CL-R04',
    copy: {
      ko: '친밀해질수록 관심을 말로 널리 표현하기보다, 상대가 실제로 필요로 하는 일에 시간이나 자신이 할 수 있는 일을 보태기 쉽습니다. 도움을 청하는 말에 바로 해결책을 내놓기 전에는, 이야기할 사람이 필요한지 일부를 맡아 줄 사람이 필요한지 물어볼 수 있습니다. 가까운 관계에서 자신의 배려가 상대가 기대한 도움과 맞아 들어가는 조건입니다.',
      ja: '親しくなるほど、関心を広く言葉にするより、相手が実際に必要とすることに時間や自分の力を使いやすくなります。すぐに解決策を出す前に、話を聞く相手が必要か、何かを引き受ける助けが必要かを聞けます。身近な関係で自分の気遣いと相手の求める助けが合いやすくなります。',
      en: 'As you grow closer, you may show care by giving time or practical help where it is needed. Before offering a solution, ask whether they want someone to listen or someone to take on a part of the problem. That helps your way of caring fit the help they are seeking.',
    },
  },
  ease_with_a_boundary: {
    chapter: 'CR-05', trait: ['교류의 폭이 넓지만 기준을 넘으면 단호하게 선을 그음'], voice: 'relationship', source: 'CL-R05',
    copy: {
      ko: '편하게 어울리는 모습과 중요한 기준을 분명히 정하는 모습이 함께 나타날 수 있습니다. 처음에는 의견이 다른 사람도 받아들일 수 있지만, 함께 지켜야 할 선을 넘었다고 느끼면 무엇까지 받아들일지를 뚜렷하게 말하는 편입니다. 이 차이를 미리 전해 두면 관계에 열려 있다는 태도와 특정 요구에 동의했다는 뜻이 혼동되기 어렵습니다.',
      ja: '気さくに交流する面と、大切な基準を明確にする面が共に表れます。意見が違う人とも付き合えますが、守るべき線を越えたと感じると、受け入れられる範囲をはっきり伝える傾向があります。何を大切にしているかを先に伝えると、交流に前向きであることと、特定の要望に同意したことが混同されにくくなります。',
      en: 'You can be open to people whose views differ while remaining clear about an important boundary. If something crosses it, you tend to state what you can accept. Sharing the standard beforehand makes it easier for others to distinguish your openness from agreement to a particular request.',
    },
  },
  criteria_through_handoff: {
    chapter: 'CR-06', trait: ['계획대로 꼼꼼하게 완성함'], voice: 'ability', source: 'CL-P01',
    copy: {
      ko: '마무리의 기준이 분명할수록 계획과 결과 사이의 차이를 짚는 힘이 드러납니다. 단계가 여러 개인 일이라면 처음 정한 조건이 최종 결과에도 남았는지 확인하고, 바뀐 요구가 있다면 어느 부분부터 반영해야 하는지 순서를 잡을 수 있습니다. 결정권을 가진 사람과 완성 기준을 먼저 맞춰 두면, 꼼꼼한 점검을 요구가 바뀔 때마다 처음부터 다시 하는 데 쓰지 않아도 됩니다.',
      ja: '仕上がりの基準が明確なほど、計画と成果のずれを見つける力が表れます。段階が多い仕事では、最初の条件が最後まで残っているかを確かめ、変更があるならどこから反映するかを整理できます。決める人と完成の基準を先に合わせておけば、要件が変わるたびに最初から点検する必要が減ります。',
      en: 'Clear standards for completion make it easier to spot a gap between the plan and the result. With several stages, check which original requirements survived and where a changed requirement needs to enter. Agreeing on the finish with the person who decides it can keep careful review from turning into a full restart whenever a request changes.',
    },
  },
} satisfies Record<string, TraitContent>

export type PersonalityContentId = keyof typeof personalityContent
export const personalityContentEntries = Object.entries(personalityContent) as [PersonalityContentId, TraitContent][]
