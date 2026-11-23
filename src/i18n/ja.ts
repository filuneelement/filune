const ja = {
  flow: { heroMain: 'あなたの物語を読み解く', start: '自分の運勢を見る', luneName: 'LUNE', guideLine: '', permissionTitle: 'あなたの物語を\n読んでもいいですか？', birthInputTitle: 'まず、あなたのことを教えてください', permissionBody: 'あなたの物語を読み解くために\nお名前と生年月日・出生時刻・出生地を\n教えてください。', permissionAccept: 'はい、続けます', back: '戻る', next: '次へ', topicIntroTitle: '今、いちばん気になることを教えてください', topicEyebrow: '気になるテーマ', topics: ['性格・強み', '恋愛・結婚', '仕事・キャリア', 'お金・財運'], followUp: 'もう少し教えてください', relationshipQuestion: '現在の関係について教えてください', relationshipStatuses: ['独身', '交際中', '結婚している'], careerQuestion: '現在のお仕事の状況を教えてください', careerStatuses: ['求職中', '在職中', '事業を営んでいる'], transition: 'いいですね。\n命式の流れを一つずつつないでいきます。', loading: '読み込み中' },
  language: '言語', country: '出生国', countryNames: { JP: '日本', KR: '韓国', US: 'アメリカ' },
  entryTitle: '万年暦', brandSubline: '四柱推命で、あなたを読み解く', entryCta: '自分の四柱推命を見る', profile: 'プロフィール', name: '名前', gender: '性別', female: '女性', male: '男性',
  birthDate: '生年月日', birthDateTime: '生年月日時', year: '年', month: '月', day: '日', birthTime: '出生時刻', hour: '時', minute: '分', unknownTime: '出生時刻がわからない',
  birthplace: '出生地', searchLocation: '都市を検索', locationAria: '出生地を検索', locationPlaceholder: { JP: '例: 東京、新宿、横浜', KR: '例: 서울、강남、수원', US: '例: New York、Los Angeles、Chicago' },
  candidates: '出生地の候補', noCandidates: '候補がありません', selectedLocation: '確定した出生地', useCorrection: '地域時補正を使用する', submit: '万年暦を見る',
  errors: { year: '年は西暦4桁の数字で入力してください。', month: '月は1から12までの数字で入力してください。', day: '日を数字で入力してください。', date: '入力した年月に有効な日付を入力してください。', hour: '時は0から23までの数字で入力してください。', minute: '分は0から59までの数字で入力してください。', calculate: '入力した日時を計算できませんでした。' },
  back: '入力画面へ戻る', resultTitle: '万年暦', birthTimeUnknown: '出生時刻不明', correctionOriginal: '出生時刻', correction: '地域時補正', calculationTime: '計算時刻',
  solarNotice: 'この日は節入り日にあたるため、出生時刻によって年柱・月柱が異なる場合があります。', basicChart: '基本命式',
  pillars: { 年柱: '年柱', 月柱: '月柱', 日柱: '日柱', 時柱: '時柱' }, dayMaster: '日干', tenGod: '十神', twelveStagesTitle: '十二運星', hiddenStems: '蔵干', minuteUnit: '分',
  roles: { residual: '余気', middle: '中気', main: '本気' }, expandHidden: '蔵干を詳しく見る', collapseHidden: '簡略表示', fortuneFlow: '運の流れ', greatLuck: '大運', yearlyLuck: '年運（歳運）', monthlyLuck: '月運',
  direction: { 順行: '順行', 逆行: '逆行' }, greatLuckList: '大運の一覧', yearlyLuckList: '年運の一覧', displayYear: '表示年', previousYear: '前年', nextYear: '翌年',
  unknownStartAge: '出生時刻が不明のため、起運時期は目安です', startAge: '起運', monthSuffix: '月', yearsSuffix: '歳', ageSeparator: ' / ',
  genderRequired: '性別を選択すると大運を表示します。', ambiguousLuck: '節入り日かつ出生時刻不明のため、年柱・月柱が確定せず大運を表示できません。',
  tenGods: { 比肩: '比肩', 劫財: '劫財', 食神: '食神', 傷官: '傷官', 偏財: '偏財', 正財: '正財', 偏官: '偏官', 正官: '正官', 偏印: '偏印', 印綬: '印綬' },
  stages: { 長生: '長生', 沐浴: '沐浴', 冠帯: '冠帯', 建禄: '建禄', 帝旺: '帝旺', 衰: '衰', 病: '病', 死: '死', 墓: '墓', 絶: '絶', 胎: '胎', 養: '養' },
  elements: { 木: '木', 火: '火', 土: '土', 金: '金', 水: '水' },
  resultNatalChart: '命式',
  dailyCalendar: { previousMonth: '前の月', nextMonth: '次の月', stem: '天干の十神', branch: '地支の十神' },
  resultDailyPillar: '日運（日辰）',
  resultChapterCopy: {
    densePairs: ["{first}ことがあります。もう一つの特徴は、{second}ことです。", "{first}ところがあります。別の面では、{second}こともあります。", "{first}ことに加えて、{second}ところも見られます。"],
    selectedTopicTitle: '今いちばん気になるテーマ：{topic}',
    "synthesisPair": "{first}ところと、{second}ところが、同じ場面に重なることもあります。",
    "currentPair": "今は、{first}ことと、{second}ことが重なりやすい時期です。",
    "currentPeriod": "この読み解きは、現在の長期的な流れ（{years}）を対象にしています。",
    "topicLens": {
      "job_seeking": "求職中なら、応募先を選ぶときにこの点を振り返ってみてください。",
      "employed": "在職中なら、今の役割でこのやり方を活かせる場面を探してみてください。",
      "business": "事業を営んでいるなら、仕事の進め方を決める場面で振り返ってみてください。",
      "single": "独身なら、新しい関係を築くときにこの点を振り返ってみてください。",
      "dating": "交際中なら、距離が近づくときにこの点を振り返ってみてください。",
      "married": "結婚しているなら、日々意見を交わすときにこの点を振り返ってみてください。"
    },
    "current": ["今は、{trait}傾向が出やすい時期です。", "場面によっては、{trait}こともあります。"],
    "supported": [
      [
        "基本的には、{trait}傾向があります。",
        "考え方や行動には、{trait}ところもあります。",
        "もう一つの特徴は、{trait}ことです。",
        "普段の判断にも、{trait}傾向が表れます。"
      ],
      [
        "{trait}ところが強みです。",
        "{trait}ことにも力を発揮します。",
        "また、{trait}ところも持ち味です。",
        "{trait}ことも得意な方です。"
      ],
      [
        "似た場面では、{trait}傾向があります。",
        "また、{trait}という反応もよく見られます。",
        "もう一つ目を向けたいのは、{trait}傾向です。",
        "{trait}ことも、繰り返し選びやすい対応です。"
      ]
    ],
    "qualified": [
      [
        "場面によっては、{trait}ことがあります。",
        "状況に応じて、{trait}傾向も見られます。",
        "{trait}ところが出る場面もあります。",
        "ときには{trait}場合もあります。"
      ],
      [
        "状況が合えば、{trait}ことが力になります。",
        "{trait}ところを活かせる場面もあります。",
        "場面によっては、{trait}ことも持ち味になります。",
        "{trait}ところも、状況によって活かせます。"
      ],
      [
        "似た場面では、{trait}ことがあります。",
        "状況によっては、{trait}という反応も出ます。",
        "{trait}傾向にも目を向けてみてください。",
        "ときには{trait}形で対応することもあります。"
      ]
    ]
  },
  resultPreview: {
    "paidLabel": "有料リーディングの目次",
    "indexTitle": "全編で読み解くこと",
    "selectedLabel": "あなたが選んだテーマ",
    "selectedDescription": "命式全体を読み解きながら、今いちばん気になるテーマをもう一歩掘り下げます。",
    "differenceTitle": "大切な違いを見落とさない命式の読み解き",
    "focusTitle": "今いちばん気になることを、より詳しく。",
    "focusBody": "命式全体を見ながら、今いちばん気になるテーマは、さらに具体的に読み解きます。",
    "testimonialsTitle": "ユーザーの声",
    "offerTitle": "命式リーディング全編",
    "offerTopic": "選んだテーマの詳しい読み解き",
    "cta": "全編を見る",
    "checkoutStatus": "現在、全編はご購入いただけません。",
    "chapters": [
      {
        "title": "今はどんな流れの中にいるのか",
        "description": "今の暮らしにどんな変化や流れが強く表れているか"
      },
      {
        "title": "なぜ似た関係を繰り返すのか",
        "description": "恋愛・結婚・身近な関係で繰り返しやすいことと注意点"
      },
      {
        "title": "どんな仕事や環境で力を発揮しやすいのか",
        "description": "力を活かしやすい環境や進め方と、行き詰まりやすい条件"
      },
      {
        "title": "どう稼ぎ、どこでお金が出ていくのか",
        "description": "収入の作り方、支出が増えやすいところ、資産を守るための条件"
      },
      {
        "title": "いつ変化が大きくなるのか",
        "description": "暮らしの方向や状況が大きく変わりやすい時期"
      },
      {
        "title": "いつ動き、いつ待つのか",
        "description": "動きやすい時期と、判断を急がない方がよい時期"
      }
    ],
    "difference": [
      {
        "before": "同じように金運が巡ってきても、実際に収入が増える人もいれば、入ってくるお金とともに負担や支出が増える人もいます。",
        "emphasis": "",
        "after": ""
      },
      {
        "before": "同じ変化の流れも、ある人には機会となり、別の人には不安や葛藤を伴う選択の時期となることがあります。",
        "emphasis": "",
        "after": ""
      },
      {
        "before": "",
        "emphasis": "一つの要素だけで良いか悪いかを決めると、大切な違いを見落としてしまいます。",
        "after": ""
      },
      {
        "before": "FILUNEでは性格や運勢の良し悪しに加え、",
        "emphasis": "似た悩みを繰り返す理由、強みが生きる場面、今の流れを保つか変化に備えるか、関係・仕事・お金で気をつけたいこと、動く時期と慎重に進む時期",
        "after": "を具体的に読み解きます。"
      },
      {
        "before": "今の流れとこれからの時期を合わせて見ることで、漠然としていた悩みにも、",
        "emphasis": "何を続け、何を変え、いつ動くかを考える手がかりが見えてきます。",
        "after": ""
      },
      {
        "before": "「なぜ私はこうなのだろう」と感じたとき、",
        "emphasis": "「では今、どう動けばいいのだろう」",
        "after": "まで考えられること。それが、FILUNEがお届けしたい結果です。"
      }
    ],
    "sampleLabel": "有料リーディングの試し読み",
    "sampleContinuation": "続きでは、この流れが仕事・人間関係・お金にどうつながるのかを、時期と合わせて読み解きます。",
    "pricePending": "販売価格は未定"
  },
  reading: { freeTemperament: '私の基本的な傾向', freePatterns: '繰り返し現れる行動パターン', brandLine: 'LUNE · FILUNE', heroBrand: 'LUNE', heroNamed: '{name}さんの命式を\n読み解いてみよう。', heroGeneral: 'あなたの命式を\n読み解いてみよう。', core: 'あなたを表す核', personality: '基本の性質', strengths: '私の強み', cautions: '気をつけたいパターン', balance: '五行バランス', evidence: '命式から見えること', dayMaster: 'あなたの日干', dayBranch: 'あなたの日支', elements: '五行', tenGods: '主な十神', yin: '陰', yang: '陽', disclosure: 'この読み解きのもとになった命式を見る', topicsIntro: 'ここからは、もう少し具体的な話。', topics: ['恋愛・結婚', '仕事・才能', 'お金', '2027年', '総合'], preview: '続きを読む', previewOpen: '最初の一部を見る', locked: '続きはロックされています', previewUnavailable: '個別の読み解きは準備中です。', previewLabel: 'プレビュー', luneLine: 'まず、あなた自身から見てみよう。', howTitle: '一つの要素だけでは、物語は完成しません。', readingPath: ['日干', '月令', '十神', '大運'], howBody: 'FILUNEは一つの要素だけで判断せず、命式の中でつながるパターンを一緒に読み解きます。', selectedTopicLead: '選んだテーマを続けて見ていきます。', premiumTitle: 'さらに詳しいリーディング', premiumLoveItems: ['惹かれやすい相手', '長く続く関係のパターン', '関係で繰り返すこと', '時期ごとの流れ'] },
  compatibility: { introTitle: 'ルネが二人の関係を\n読み解いてもいいですか？', introBody: 'お二人の関係を読み解くために\nお二人の生年月日・出生時刻・出生地を\n教えてください。', entry: '二人の相性を見る', title: 'お二人の情報を入力してください', inputYou: 'あなた', inputOtherPerson: 'お相手', inputBack: '戻る', personA: '一人目', personB: '二人目', pairIdentity: '結果を見る二人', navigation: '結果ページの移動', backToInput: '入力に戻る', home: '最初の画面へ', optionalName: '名前（任意）', country: '出生国', timeCorrection: '地域時補正を使用', relationshipStatus: '現在の関係（任意）', noRelationshipStatus: '指定しない', single: '交際していない', dating: '交際中', partnered: 'パートナー関係', married: '結婚している', calculate: '二人の結果を見る', calculating: '二人の情報を読み取っています', timeline: '時期ごとの流れ', error: '結果を作成できませんでした。入力内容を確認して、もう一度お試しください。', invalidDate: '有効な生年月日を入力してください。', invalidTime: '有効な出生時刻を入力するか、時刻不明を選択してください。' },
} as const
export default ja
