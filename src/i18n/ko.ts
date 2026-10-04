import type ja from './ja'
const ko: { [K in keyof typeof ja]: unknown } = {
  language: '언어', country: '출생국', countryNames: { JP: '일본', KR: '한국', US: '미국' },
  entryTitle: '만세력', profile: '프로필', name: '이름', gender: '성별', female: '여성', male: '남성', birthDate: '생년월일', birthDateTime: '생년월일시', year: '년', month: '월', day: '일', birthTime: '출생 시간', hour: '시', minute: '분', unknownTime: '출생 시간을 모름',
  birthplace: '출생지', searchLocation: '도시 검색', locationAria: '출생지 검색', locationPlaceholder: { JP: '예: 도쿄, 신주쿠, 요코하마', KR: '예: 서울, 강남, 수원', US: '예: New York, Los Angeles, Chicago' }, candidates: '출생지 후보', noCandidates: '후보가 없습니다', selectedLocation: '선택한 출생지', useCorrection: '지역시 보정 사용', submit: '만세력 보기',
  errors: { year: '연도는 서기 4자리로 입력해 주세요.', month: '월은 1부터 12까지 입력해 주세요.', day: '일을 숫자로 입력해 주세요.', date: '해당 연월의 유효한 날짜를 입력해 주세요.', hour: '시는 0부터 23까지 입력해 주세요.', minute: '분은 0부터 59까지 입력해 주세요.', calculate: '입력한 날짜와 시간을 계산할 수 없습니다.' },
  back: '입력 화면으로 돌아가기', resultTitle: '만세력', birthTimeUnknown: '출생 시간 모름', correctionOriginal: '출생 시각', correction: '지역시 보정', calculationTime: '계산 시각', solarNotice: '절기 교체일이므로 출생 시각에 따라 연주와 월주가 달라질 수 있습니다.', basicChart: '기본 명식',
  pillars: { 年柱: '년주', 月柱: '월주', 日柱: '일주', 時柱: '시주' }, dayMaster: '일간', tenGod: '십성', twelveStagesTitle: '12운성', hiddenStems: '지장간', minuteUnit: '분', roles: { residual: '여기', middle: '중기', main: '정기' }, expandHidden: '지장간 자세히 보기', collapseHidden: '간략히 보기', fortuneFlow: '운의 흐름', greatLuck: '대운', yearlyLuck: '세운', monthlyLuck: '월운',
  direction: { 順行: '순행', 逆行: '역행' }, greatLuckList: '대운 목록', yearlyLuckList: '세운 목록', displayYear: '표시 연도', previousYear: '이전 연도', nextYear: '다음 연도', unknownStartAge: '출생 시간을 몰라 대운 시작 시기는 참고용입니다.', startAge: '대운 시작', monthSuffix: '월', yearsSuffix: '세', ageSeparator: ' / ', genderRequired: '성별을 선택하면 대운을 표시합니다.', ambiguousLuck: '절기 교체일이고 출생 시간을 몰라 연주와 월주를 확정할 수 없습니다.',
  tenGods: { 比肩: '비견', 劫財: '겁재', 食神: '식신', 傷官: '상관', 偏財: '편재', 正財: '정재', 偏官: '편관', 正官: '정관', 偏印: '편인', 印綬: '정인' },
  stages: { 長生: '장생', 沐浴: '목욕', 冠帯: '관대', 建禄: '건록', 帝旺: '제왕', 衰: '쇠', 病: '병', 死: '사', 墓: '묘', 絶: '절', 胎: '태', 養: '양' }, elements: { 木: '목', 火: '화', 土: '토', 金: '금', 水: '수' },
}
export default ko as typeof ja
