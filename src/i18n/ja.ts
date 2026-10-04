const ja = {
  language: '言語', country: '出生国', countryNames: { JP: '日本', KR: '韓国', US: 'アメリカ' },
  entryTitle: '万年暦', profile: 'プロフィール', name: '名前', gender: '性別', female: '女性', male: '男性',
  birthDate: '生年月日', birthDateTime: '生年月日時', year: '年', month: '月', day: '日', birthTime: '出生時刻', hour: '時', minute: '分', unknownTime: '出生時刻がわからない',
  birthplace: '出生地', searchLocation: '都市を検索', locationAria: '出生地を検索', locationPlaceholder: { JP: '例: 東京、新宿、横浜', KR: '例: 서울、강남、수원', US: '例: New York、Los Angeles、Chicago' },
  candidates: '出生地の候補', noCandidates: '候補がありません', selectedLocation: '確定した出生地', useCorrection: '地域時補正を使用する', submit: '万年暦を見る',
  errors: { year: '年は西暦4桁の数字で入力してください。', month: '月は1から12までの数字で入力してください。', day: '日を数字で入力してください。', date: '入力した年月に有効な日付を入力してください。', hour: '時は0から23までの数字で入力してください。', minute: '分は0から59までの数字で入力してください。', calculate: '入力した日時を計算できませんでした。' },
  back: '入力画面へ戻る', resultTitle: 'あなたの命式', birthTimeUnknown: '出生時刻不明', correctionOriginal: '出生時刻', correction: '地域時補正', calculationTime: '計算時刻',
  solarNotice: 'この日は節入り日にあたるため、出生時刻によって年柱・月柱が異なる場合があります。', basicChart: '基本命式',
  pillars: { 年柱: '年柱', 月柱: '月柱', 日柱: '日柱', 時柱: '時柱' }, dayMaster: '日干', tenGod: '十神', twelveStagesTitle: '十二運星', hiddenStems: '蔵干', minuteUnit: '分',
  roles: { residual: '余気', middle: '中気', main: '本気' }, expandHidden: '蔵干を詳しく見る', collapseHidden: '簡略表示', fortuneFlow: '運の流れ', greatLuck: '大運', yearlyLuck: '年運（歳運）', monthlyLuck: '月運',
  direction: { 順行: '順行', 逆行: '逆行' }, greatLuckList: '大運の一覧', yearlyLuckList: '年運の一覧', displayYear: '表示年', previousYear: '前年', nextYear: '翌年',
  unknownStartAge: '出生時刻が不明のため、起運時期は目安です', startAge: '起運', monthSuffix: '月', yearsSuffix: '歳', ageSeparator: ' / ',
  genderRequired: '性別を選択すると大運を表示します。', ambiguousLuck: '節入り日かつ出生時刻不明のため、年柱・月柱が確定せず大運を表示できません。',
  tenGods: { 比肩: '比肩', 劫財: '劫財', 食神: '食神', 傷官: '傷官', 偏財: '偏財', 正財: '正財', 偏官: '偏官', 正官: '正官', 偏印: '偏印', 印綬: '印綬' },
  stages: { 長生: '長生', 沐浴: '沐浴', 冠帯: '冠帯', 建禄: '建禄', 帝旺: '帝旺', 衰: '衰', 病: '病', 死: '死', 墓: '墓', 絶: '絶', 胎: '胎', 養: '養' },
  elements: { 木: '木', 火: '火', 土: '土', 金: '金', 水: '水' },
} as const
export default ja
