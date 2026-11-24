import type ja from './ja'
const ko: { [K in keyof typeof ja]: unknown } = {
  flow: { heroMain: '당신의 이야기를 읽어드립니다', start: '내 운세 보기', luneName: '루네', guideLine: '', permissionTitle: '루네가 당신의 이야기를\n읽어봐도 될까요?', birthInputTitle: '먼저 당신에 대해 알려주세요', permissionBody: '당신의 이야기를 읽기 위해 이름과\n태어난 날짜·시간, 출생지를 알려주세요.', permissionAccept: '네, 계속할게요', back: '뒤로', next: '다음으로', topicIntroTitle: '이제 가장 궁금한 이야기를 알려주세요', topicEyebrow: '관심 주제', topics: ['성향·강점', '연애·결혼', '일·커리어', '돈·재물'], followUp: '조금만 더 알려주세요', relationshipQuestion: '현재 관계 상태는?', relationshipStatuses: ['솔로', '연애 중', '기혼'], careerQuestion: '현재 어떤 상태인가요?', careerStatuses: ['구직 중', '재직 중', '사업 중'], transition: '좋아요.\n이제 명식의 흐름을 하나씩 연결해볼게요.', loading: '명식을 살펴보는 중' },
  language: '언어', country: '출생국', countryNames: { JP: '일본', KR: '한국', US: '미국' },
  entryTitle: '만세력', brandSubline: '사주로, 당신을 읽어드립니다', entryCta: '내 사주 보기', profile: '프로필', name: '이름', gender: '성별', female: '여성', male: '남성', birthDate: '생년월일', birthDateTime: '생년월일시', year: '년', month: '월', day: '일', birthTime: '출생 시간', hour: '시', minute: '분', unknownTime: '출생 시간을 모름',
  birthplace: '출생지', searchLocation: '도시 검색', locationAria: '출생지 검색', locationPlaceholder: { JP: '예: 도쿄, 신주쿠, 요코하마', KR: '예: 서울, 강남, 수원', US: '예: New York, Los Angeles, Chicago' }, candidates: '출생지 후보', noCandidates: '후보가 없습니다', selectedLocation: '선택한 출생지', useCorrection: '지역시 보정 사용', submit: '만세력 보기',
  errors: { year: '연도는 서기 4자리로 입력해 주세요.', month: '월은 1부터 12까지 입력해 주세요.', day: '일을 숫자로 입력해 주세요.', date: '해당 연월의 유효한 날짜를 입력해 주세요.', hour: '시는 0부터 23까지 입력해 주세요.', minute: '분은 0부터 59까지 입력해 주세요.', calculate: '입력한 날짜와 시간을 계산할 수 없습니다.' },
  back: '입력 화면으로 돌아가기', resultTitle: '만세력', birthTimeUnknown: '출생 시간 모름', correctionOriginal: '출생 시각', correction: '지역시 보정', calculationTime: '계산 시각', solarNotice: '절기 교체일이므로 출생 시각에 따라 연주와 월주가 달라질 수 있습니다.', basicChart: '기본 명식',
  pillars: { 年柱: '년주', 月柱: '월주', 日柱: '일주', 時柱: '시주' }, dayMaster: '일간', tenGod: '십성', twelveStagesTitle: '12운성', hiddenStems: '지장간', minuteUnit: '분', roles: { residual: '여기', middle: '중기', main: '정기' }, expandHidden: '지장간 자세히 보기', collapseHidden: '간략히 보기', fortuneFlow: '운의 흐름', greatLuck: '대운', yearlyLuck: '세운', monthlyLuck: '월운',
  direction: { 順行: '순행', 逆行: '역행' }, greatLuckList: '대운 목록', yearlyLuckList: '세운 목록', displayYear: '표시 연도', previousYear: '이전 연도', nextYear: '다음 연도', unknownStartAge: '출생 시간을 몰라 대운 시작 시기는 참고용입니다.', startAge: '대운 시작', monthSuffix: '월', yearsSuffix: '세', ageSeparator: ' / ', genderRequired: '성별을 선택하면 대운을 표시합니다.', ambiguousLuck: '절기 교체일이고 출생 시간을 몰라 연주와 월주를 확정할 수 없습니다.',
  tenGods: { 比肩: '비견', 劫財: '겁재', 食神: '식신', 傷官: '상관', 偏財: '편재', 正財: '정재', 偏官: '편관', 正官: '정관', 偏印: '편인', 印綬: '정인' },
  stages: { 長生: '장생', 沐浴: '목욕', 冠帯: '관대', 建禄: '건록', 帝旺: '제왕', 衰: '쇠', 病: '병', 死: '사', 墓: '묘', 絶: '절', 胎: '태', 養: '양' }, elements: { 木: '목', 火: '화', 土: '토', 金: '금', 水: '수' },
  resultNatalChart: '사주 원국',
  dailyCalendar: { previousMonth: '이전 달', nextMonth: '다음 달', stem: '천간 십성', branch: '지지 십성' },
  resultDailyPillar: '일진',
  resultChapterCopy: {
    densePairs: ["{first} 쪽으로 기울 때가 있습니다. 다른 한편으로는 {second} 모습도 나타날 수 있습니다.", "{first} 방식도 쓰지만, {second} 선택을 할 때도 있습니다.", "또 다른 특징은 {first} 점입니다. {second} 점 역시 살펴볼 만합니다."],
    selectedTopicTitle: '지금 가장 궁금한 {topic}',
    "synthesisPair": "{first} 점과 {second} 점이 판단과 행동에 함께 나타나기도 합니다.",
    "currentPair": "요즘은 {first} 일과 {second} 일이 함께 중요해질 수 있습니다.",
    "currentPeriod": "이 해석은 현재 계산된 장기 흐름({years})을 기준으로 합니다.",
    "topicLens": {
      "job_seeking": "구직 중이라면 지원할 일을 고를 때 이 점을 살펴볼 수 있습니다.",
      "employed": "재직 중이라면 현재 맡은 일에서 이 방식이 얼마나 쓰이는지 살펴보세요.",
      "business": "사업 중이라면 일을 직접 정하고 운영할 때 이 점을 살펴볼 수 있습니다.",
      "single": "솔로라면 새로운 관계를 맺을 때 이 점을 돌아볼 수 있습니다.",
      "dating": "연애 중이라면 가까워지는 과정에서 이 점을 돌아볼 수 있습니다.",
      "married": "기혼이라면 일상에서 의견을 주고받을 때 이 점을 돌아볼 수 있습니다."
    },
    "current": ["요즘은 {trait} 쪽으로 기울기 쉽습니다.", "상황에 따라 {trait} 경향도 함께 나타납니다."],
    "supported": [
      [
        "기본적으로 {trait} 편입니다.",
        "판단이나 행동에서도 {trait} 쪽으로 기우는 편입니다.",
        "또 하나의 특징은 {trait} 점입니다.",
        "{trait} 성향도 판단에 영향을 줍니다."
      ],
      [
        "{trait} 데 강점이 있습니다.",
        "{trait} 힘도 잘 발휘됩니다.",
        "{trait} 능력 역시 강점입니다.",
        "또 주목할 점은 {trait} 힘입니다."
      ],
      [
        "비슷한 상황에서는 {trait} 경향이 있습니다.",
        "또 {trait} 반응도 반복되는 편입니다.",
        "함께 살펴볼 점은 {trait} 경향입니다.",
        "{trait} 방식도 자주 쓰는 편입니다."
      ]
    ],
    "qualified": [
      [
        "상황에 따라 {trait} 편입니다.",
        "{trait} 쪽으로 기울기도 합니다.",
        "경우에 따라 {trait} 점도 눈에 띕니다.",
        "{trait} 경향도 함께 나타나곤 합니다."
      ],
      [
        "상황이 맞으면 {trait} 데 강점을 보입니다.",
        "{trait} 힘이 발휘되는 때도 있습니다.",
        "경우에 따라 {trait} 능력도 도움이 됩니다.",
        "{trait} 힘은 상황에 따라 다르게 발휘됩니다."
      ],
      [
        "비슷한 상황에서 {trait} 쪽으로 기울 때가 있습니다.",
        "상황에 따라 {trait} 반응을 보이기도 합니다.",
        "{trait} 경향도 살펴볼 만합니다.",
        "경우에 따라 {trait} 방식으로 대응합니다."
      ]
    ]
  },
  resultPreview: {
    "paidLabel": "유료 리딩 목차",
    "indexTitle": "전체 리딩에서 이어지는 이야기",
    "selectedLabel": "당신이 선택한 주제",
    "selectedDescription": "전체 사주를 살펴보면서, 지금 가장 궁금한 이 주제는 한 단계 더 구체적으로 이어서 살펴봅니다.",
    "differenceTitle": "중요한 차이를 놓치지 않는 사주풀이",
    "focusTitle": "지금 가장 궁금한 부분은 더 자세히 봅니다.",
    "focusBody": "전체 사주를 읽으면서, 지금 가장 궁금한 주제는 한 걸음 더 들어가 구체적으로 살펴봅니다.",
    "testimonialsTitle": "사용자 후기",
    "offerTitle": "전체 사주 리딩",
    "offerTopic": "선택한 관심 주제 심화",
    "cta": "전체 리딩 보기",
    "checkoutStatus": "현재 전체 리딩은 구매할 수 없습니다.",
    "chapters": [
      {
        "title": "지금 나는 어떤 흐름 안에 있는가",
        "description": "현재 삶에서 어떤 변화와 흐름이 강하게 작동하고 있는지"
      },
      {
        "title": "왜 비슷한 관계가 반복되는가",
        "description": "연애·결혼·가까운 인간관계에서 반복되는 방식과 주의할 점"
      },
      {
        "title": "어떤 일과 환경에서 가장 잘 풀리는가",
        "description": "어떤 환경과 방식에서 능력이 잘 살아나고, 어떤 조건에서 막히기 쉬운지"
      },
      {
        "title": "나는 어떻게 벌고, 어디서 돈이 새는가",
        "description": "수입을 만드는 방식, 돈이 새기 쉬운 지점, 재물을 지키는 데 중요한 조건"
      },
      {
        "title": "앞으로 언제 변화가 커지는가",
        "description": "앞으로 삶의 방향이나 상황이 크게 달라질 가능성이 있는 시기"
      },
      {
        "title": "언제 움직이고, 언제 기다려야 하는가",
        "description": "움직이기 좋은 시기와 판단을 서두르지 않는 편이 좋은 시기"
      }
    ],
    "difference": [
      {
        "before": "같은 재물운이 들어와도 누군가는 실제 수입이 늘고, 누군가는 돈이 들어오는 만큼 부담과 지출이 함께 커질 수 있습니다.",
        "emphasis": "",
        "after": ""
      },
      {
        "before": "같은 변화운도 누군가에게는 기회가 되지만, 누군가에게는 불안과 갈등을 동반한 선택의 시기가 될 수 있습니다.",
        "emphasis": "",
        "after": ""
      },
      {
        "before": "",
        "emphasis": "한 가지 요소만 보고 좋다, 나쁘다로 결론 내리면 정작 중요한 차이를 놓치게 됩니다.",
        "after": ""
      },
      {
        "before": "FILUNE에서 확인할 수 있는 것은 단순한 성격 설명이나 운세의 좋고 나쁨이 아닙니다. ",
        "emphasis": "왜 비슷한 문제가 반복되는지, 내 강점은 어떤 상황에서 가장 잘 살아나는지, 지금은 유지해야 할 때인지 변화를 준비해야 할 때인지, 관계·일·돈에서 무엇을 조심해야 하는지, 그리고 앞으로 언제 움직이고 언제 신중해야 하는지까지",
        "after": " 구체적으로 확인할 수 있습니다."
      },
      {
        "before": "막연하게 느껴졌던 고민에 지금의 흐름과 앞으로의 시기를 함께 놓고 보면 ",
        "emphasis": "무엇을 계속하고, 무엇을 바꾸고, 언제 움직일지 판단할 기준이 생깁니다.",
        "after": ""
      },
      {
        "before": "결과를 보고 나면 “나는 왜 이럴까?”에서 끝나는 것이 아니라, ",
        "emphasis": "“그래서 지금 나는 어떻게 움직이면 되는가”를 생각할 수 있게 만드는 것.",
        "after": ""
      },
      {
        "before": "그것이 FILUNE가 드리고 싶은 결과입니다.",
        "emphasis": "",
        "after": ""
      }
    ],
    "sampleLabel": "유료 리딩 미리보기",
    "sampleContinuation": "이어지는 내용에서는 이 흐름이 일·관계·재물에 어떻게 연결되는지와 시기를 함께 살펴봅니다.",
    "pricePending": "판매가 확정 전"
  },
  reading: { freeTemperament: '나의 기본 성향', freePatterns: '상황에 따라 달라지는 나의 반응', brandLine: 'LUNE · FILUNE', heroBrand: 'LUNE', heroNamed: '{name}님의 사주를\n하나씩 살펴볼게요.', heroGeneral: '당신의 사주를\n하나씩 살펴볼게요.', core: '나를 나타내는 핵심', personality: '기본 성향', strengths: '나의 강점', cautions: '주의할 패턴', balance: '오행 밸런스', evidence: '명식에서 확인할 수 있는 것', dayMaster: '나의 일간', dayBranch: '나의 일지', elements: '오행', tenGods: '주요 십성', yin: '음', yang: '양', disclosure: '이 해석의 기준이 된 명식 보기', topicsIntro: '여기서부터는 조금 더 구체적인 이야기예요.', topics: ['연애·결혼', '일·재능', '돈', '2027년', '종합'], preview: '미리보기', previewOpen: '첫 부분 보기', locked: '잠긴 내용 보기', previewUnavailable: '개인화 리딩을 준비하고 있어요.', previewLabel: '미리보기', luneLine: '먼저, 나 자신부터 살펴보자.', howTitle: '한 가지 요소만으로는 이야기가 완성되지 않아요.', readingPath: ['일간', '월령', '십성', '대운'], howBody: 'FILUNE은 하나의 요소만 따로 판단하지 않고, 명식 안에서 서로 연결되는 패턴을 함께 읽습니다.', selectedTopicLead: '선택한 주제를 이어서 살펴볼게요.', premiumTitle: '더 깊이 보는 리딩', premiumLoveItems: ['끌리기 쉬운 상대', '오래 이어지는 관계 패턴', '관계에서 반복되는 부분', '시기별 흐름'] },
  compatibility: { introTitle: '루네가 두 사람의 관계를 살펴봐도 될까요?', introBody: '두 사람의 관계를 읽기 위해 각자의 태어난 날짜·시간과 출생지를 알려주세요.', entry: '두 사람의 궁합 보기', title: '두 사람의 정보를 입력해 주세요', inputYou: '나', inputOtherPerson: '상대', inputBack: '이전으로', personA: '첫 번째 사람', personB: '두 번째 사람', pairIdentity: '결과를 보는 두 사람', navigation: '궁합 결과 탐색', backToInput: '입력으로 돌아가기', home: '첫 화면으로', optionalName: '이름 (선택)', country: '출생국', timeCorrection: '지역시 보정 사용', relationshipStatus: '현재 관계 상태 (선택)', noRelationshipStatus: '선택 안 함', single: '현재 연애 중이 아님', dating: '연애 중', partnered: '파트너 관계', married: '기혼', calculate: '두 사람 결과 보기', calculating: '두 사람의 정보를 살펴보는 중', timeline: '시기별 흐름', error: '결과를 만들지 못했습니다. 입력 내용을 확인하고 다시 시도해 주세요.', invalidDate: '유효한 생년월일을 입력해 주세요.', invalidTime: '유효한 출생 시각을 입력하거나 시간 모름을 선택해 주세요.' },
}
export default ko as typeof ja
