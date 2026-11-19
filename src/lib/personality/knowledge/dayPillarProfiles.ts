import type { EarthlyBranch, HeavenlyStem, TwelveStage } from '../../twelveStages'
import type {
  DayPillar,
  DayPillarConflict,
  DayPillarProfile,
  DayPillarTraits,
  ExcludedPersonalityClaim,
  PersonalityTenGod,
} from '../types'

type TraitField = keyof DayPillarTraits
type Confidence = 'source_explicit' | 'source_synthesis' | 'filune_interpretation'
type TraitEntry =
  | [Exclude<TraitField, 'internalConflict'>, string, string, Confidence]
  | ['internalConflict', DayPillarConflict, string, Confidence]

type ExclusionReason = ExcludedPersonalityClaim['exclusionReason']

const exclusionSummaries: Record<ExclusionReason, string> = {
  relationship_prediction: '배우자·연애 관련 풀이',
  gender_determinism: '성별에 따른 일주 풀이',
  wealth_prediction: '재물·소득 결과 풀이',
  career_prediction: '구체적인 진로·직업 결과 풀이',
  health_prediction: '건강·사고·음주 관련 풀이',
  compatibility_prediction: '궁합 관련 풀이',
  non_personality_claim: '십이운성 등 구조 설명',
}

const source = 'src/docs/source/personality/일주풀이.md'

function sourceRef(range: string | number): string {
  return source + '#L' + String(range).replace('-', '-L')
}

function profile(
  pillar: DayPillar,
  dayBranchTenGod: PersonalityTenGod,
  twelveLifeStage: TwelveStage,
  introLine: number,
  entries: TraitEntry[],
  excluded: [ExclusionReason, number][],
): DayPillarProfile {
  const traits: DayPillarTraits = {
    branchNature: [],
    corePersonality: [],
    decisionStyle: [],
    interpersonalStyle: [],
    strengths: [],
    shadowPatterns: [],
    internalConflict: [],
    expressionPattern: [],
    growthDirection: [],
  }
  const evidenceNotes: DayPillarProfile['evidenceNotes'] = [
    {
      sourceType: 'day_pillar', sourceId: pillar, fields: ['dayBranchTenGod', 'twelveLifeStage'],
      sourceRef: sourceRef(introLine), confidence: 'source_explicit', note: '원자료 메타데이터 대조 위치',
    },
  ]

  for (const [field, trait, range, confidence] of entries) {
    if (field === 'internalConflict') {
      traits[field].push(trait)
    } else {
      traits[field].push(trait)
    }
    evidenceNotes.push({ sourceType: 'day_pillar', sourceId: pillar, fields: [field], sourceRef: sourceRef(range), confidence })
  }

  const missing = (Object.keys(traits) as TraitField[]).filter(field => traits[field].length === 0)
  if (missing.length) {
    evidenceNotes.push({ sourceType: 'day_pillar', sourceId: pillar, fields: missing, note: 'source_gap' })
  }

  const [dayStem, dayBranch] = [...pillar] as [HeavenlyStem, EarthlyBranch]
  return {
    pillar, dayStem, dayBranch, dayBranchTenGod, twelveLifeStage, ...traits, evidenceNotes,
    excludedClaims: excluded.map(([exclusionReason, line]) => ({
      exclusionReason, sourceTextSummary: exclusionSummaries[exclusionReason], sourceRef: sourceRef(line),
    })),
  }
}

export const DAY_PILLAR_PROFILES = {
  甲子: profile('甲子', '正印', '沐浴', 79, [
    ['branchNature', '겨울 물의 정적이고 속도를 늦추는 이미지', '47-48', 'source_explicit'],
    ['corePersonality', '먼저 나서고 싶은 의욕이 검토 과정에서 제동이 걸리는 경향', '44-49', 'source_synthesis'],
    ['decisionStyle', '가능성을 반복해 검토하면서 결단을 늦추는 경향', '94-97', 'source_explicit'],
    ['internalConflict', { sourceA: '선두에 서려는 의욕', sourceB: '움직여도 되는지 재확인하는 망설임', tension: '출발하려는 의욕과 판단을 보류하는 신중함의 충돌', possibleExpression: ['하고 싶은 일이 있어도 실제 착수가 늦어짐'] }, '44-49', 'source_synthesis'],
  ], [
    ['relationship_prediction', 83],
    ['gender_determinism', 2],
    ['compatibility_prediction', 57],
    ['non_personality_claim', 79],
  ]),
  乙丑: profile('乙丑', '偏財', '衰', 216, [
    ['branchNature', '겨울에서 봄으로 더디게 넘어가는 얼어 있는 땅', '119-123', 'source_explicit'],
    ['expressionPattern', '차분해 보이면서도 안으로는 확장과 변화를 지향함', '187', 'source_explicit'],
    ['strengths', '더디게 진행되는 일에 끈기를 발휘함', '199', 'source_explicit'],
  ], [
    ['relationship_prediction', 220],
    ['gender_determinism', 118],
    ['wealth_prediction', 180],
    ['compatibility_prediction', 206],
    ['non_personality_claim', 216],
  ]),
  丙寅: profile('丙寅', '偏印', '長生', 325, [
    ['corePersonality', '호기심이 질문과 행동으로 이어지는 경향', '277-282', 'source_explicit'],
    ['shadowPatterns', '크게 생각한 끝에 중간 선택지를 놓치기 쉬움', '277-282', 'source_explicit'],
  ], [
    ['relationship_prediction', 329],
    ['gender_determinism', 231],
    ['wealth_prediction', 306],
    ['career_prediction', 306],
    ['compatibility_prediction', 267],
    ['non_personality_claim', 325],
  ]),
  丁卯: profile('丁卯', '偏印', '病', 434, [
    ['corePersonality', '밝은 기색을 과시하지 않으면서 은근히 표현함', '350-351', 'source_explicit'],
    ['expressionPattern', '활달해 보이는 인상 뒤에 의심과 많은 생각을 품음', '389-394', 'source_explicit'],
    ['shadowPatterns', '화가 바로 드러나지 않고 짜증으로 오래 남는 경향', '421', 'source_explicit'],
  ], [
    ['relationship_prediction', 438],
    ['gender_determinism', 349],
    ['compatibility_prediction', 376],
    ['non_personality_claim', 434],
  ]),
  戊辰: profile('戊辰', '比肩', '冠帯', 508, [
    ['corePersonality', '자기 기준에 따라 어느 편에도 서지 않으려 함', '475-476', 'source_explicit'],
    ['decisionStyle', '손해와 비효율을 감수하는 결정을 꺼림', '467-470', 'source_explicit'],
    ['shadowPatterns', '중립을 지키려다 자기 기준만 옳다고 고집하기 쉬움', '493', 'source_explicit'],
    ['strengths', '융통성을 발휘할 때도 꼼꼼함과 책임감을 유지함', '499', 'source_explicit'],
  ], [
    ['relationship_prediction', 512],
    ['gender_determinism', 501],
    ['wealth_prediction', 500],
    ['compatibility_prediction', 485],
    ['non_personality_claim', 508],
  ]),
  己巳: profile('己巳', '正印', '帝旺', 602, [
    ['strengths', '눈에 띄지 않게 시작한 일을 끝까지 실행함', '544-545', 'source_explicit'],
    ['expressionPattern', '활동적인 모습과 여린 내면이 함께 드러남', '544-548', 'source_synthesis'],
    ['shadowPatterns', '타인을 넓게 수용하다 자기 상태를 뒤늦게 돌아봄', '549-552', 'source_explicit'],
  ], [
    ['relationship_prediction', 606],
    ['gender_determinism', 555],
    ['compatibility_prediction', 596],
    ['non_personality_claim', 602],
  ]),
  庚午: profile('庚午', '正官', '沐浴', 683, [
    ['corePersonality', '행동이 바른 기준에서 벗어날 가능성을 잦게 점검함', '635-637', 'source_explicit'],
    ['internalConflict', { sourceA: '바르게 처신하려는 의지', sourceB: '행실이 어긋날까 하는 불안', tension: '원칙을 지키려는 태도와 평가를 의식하는 부담의 공존', possibleExpression: ['행동을 지나치게 걱정하고 검열함'] }, '635-637', 'source_synthesis'],
  ], [
    ['relationship_prediction', 687],
    ['gender_determinism', 653],
    ['wealth_prediction', 650],
    ['career_prediction', 646],
    ['compatibility_prediction', 678],
    ['non_personality_claim', 683],
  ]),
  辛未: profile('辛未', '偏印', '衰', 759, [
    ['branchNature', '한여름에 말라 있는 흙', '703-704', 'source_explicit'],
    ['strengths', '사회적 활동에서 결단과 의리를 드러냄', '703-704', 'source_explicit'],
    ['shadowPatterns', '검토가 길어지면 시도하기 전에 스스로 포기할 수 있음', '738-745', 'source_explicit'],
  ], [
    ['relationship_prediction', 763],
    ['gender_determinism', 697],
    ['wealth_prediction', 701],
    ['non_personality_claim', 759],
  ]),
  壬申: profile('壬申', '偏印', '長生', 810, [
    ['decisionStyle', '생각을 많이 하면서도 결단을 강하게 내리는 편', '788', 'source_explicit'],
    ['corePersonality', '흔하지 않은 분야에 도전하며 높은 완성도를 지향함', '789-790', 'source_explicit'],
  ], [
    ['relationship_prediction', 814],
    ['gender_determinism', 796],
    ['wealth_prediction', 794],
    ['career_prediction', 794],
    ['compatibility_prediction', 804],
    ['non_personality_claim', 810],
  ]),
  癸酉: profile('癸酉', '偏印', '病', 855, [
    ['branchNature', '예리하고 정밀하게 가다듬는 이미지', '829', 'source_explicit'],
    ['strengths', '풍부한 감각을 정밀하게 가다듬어 산만함을 줄임', '829', 'source_explicit'],
    ['shadowPatterns', '오래 검토할수록 부정적 가능성을 과대평가하기 쉬움', '832-835', 'source_explicit'],
  ], [
    ['relationship_prediction', 859],
    ['gender_determinism', 842],
    ['compatibility_prediction', 850],
    ['non_personality_claim', 855],
  ]),
  甲戌: profile('甲戌', '偏財', '養', 916, [
    ['branchNature', '수확을 마무리해 겨울을 대비하는 늦가을의 안정감', '890', 'source_explicit'],
    ['corePersonality', '무리를 이끌며 주변에 안정감을 주려는 책임감', '886-893', 'source_explicit'],
    ['shadowPatterns', '버팀을 뒷받침할 여유가 부족할 때 책임 부담에 쉽게 지침', '893', 'source_explicit'],
  ], [
    ['relationship_prediction', 920],
    ['gender_determinism', 901],
    ['career_prediction', 896],
    ['compatibility_prediction', 910],
    ['non_personality_claim', 916],
  ]),
  乙亥: profile('乙亥', '正印', '死', 972, [
    ['branchNature', '초겨울의 마무리와 절제 이미지', '955', 'source_explicit'],
    ['decisionStyle', '욕구를 조절하고 생각을 정리한 뒤 판단함', '956-958', 'source_explicit'],
    ['interpersonalStyle', '자신의 몫을 해치지 않는다고 판단할 때 양보하고 기다림', '958', 'source_explicit'],
  ], [
    ['relationship_prediction', 976],
    ['gender_determinism', 963],
    ['health_prediction', 971],
    ['non_personality_claim', 972],
  ]),
  丙子: profile('丙子', '正官', '胎', 1014, [
    ['branchNature', '차갑고 정적이며 움츠려 모으는 한겨울의 물', '992-993', 'source_explicit'],
    ['corePersonality', '활동을 넓히려는 태도와 스스로 움츠리는 반응이 교차함', '992-993', 'source_synthesis'],
    ['shadowPatterns', '감정 기복이 커지기 쉬움', '993', 'source_explicit'],
    ['internalConflict', { sourceA: '바깥으로 에너지를 확산하는 방향', sourceB: '움츠리고 안으로 모으는 방향', tension: '외부로 발산하려는 힘과 내부로 수렴하려는 반응의 충돌', possibleExpression: ['활동과 억제 사이에서 감정의 진폭이 커짐'] }, '991-993', 'source_synthesis'],
  ], [
    ['relationship_prediction', 1018],
    ['gender_determinism', 1004],
    ['career_prediction', 989],
    ['compatibility_prediction', 1012],
    ['non_personality_claim', 1014],
  ]),
  丁丑: profile('丁丑', '食神', '墓', 1084, [
    ['branchNature', '차분하고 정적인 한겨울의 흙', '1050-1052', 'source_explicit'],
    ['expressionPattern', '표현할 때와 필요를 가려 발산함', '1055-1058', 'source_explicit'],
  ], [
    ['relationship_prediction', 1088],
    ['gender_determinism', 1070],
    ['wealth_prediction', 1067],
    ['non_personality_claim', 1084],
  ]),
  戊寅: profile('戊寅', '偏官', '長生', 1131, [
    ['corePersonality', '주도하려는 욕구에 자기 위치를 잃을까 하는 불안이 따름', '1105-1112', 'source_explicit'],
    ['internalConflict', { sourceA: '주도권을 잡으려는 마음', sourceB: '자기 위치를 잃을 수 있다는 불안', tension: '주도하려는 욕구와 주도권을 잃을까 하는 불안의 공존', possibleExpression: ['주도권을 유지하는 데 신경을 많이 씀'] }, '1105-1112', 'source_synthesis'],
  ], [
    ['relationship_prediction', 1135],
    ['gender_determinism', 1121],
    ['compatibility_prediction', 1119],
    ['non_personality_claim', 1131],
  ]),
  己卯: profile('己卯', '偏官', '病', 1232, [
    ['decisionStyle', '다른 사람의 선택을 기다릴 수 있고 상대가 어려워하면 직접 고름', '1164-1170', 'source_explicit'],
    ['interpersonalStyle', '가까운 사람을 포용하되 자신이 돌볼 범위를 주도적으로 정하려 함', '1204-1208', 'source_explicit'],
  ], [
    ['relationship_prediction', 1236],
    ['gender_determinism', 1163],
    ['non_personality_claim', 1232],
  ]),
  庚辰: profile('庚辰', '偏印', '養', 1283, [
    ['branchNature', '변화와 활동의 가능성을 지닌 진토', '1264', 'source_explicit'],
    ['strengths', '숙련된 방식과 재치를 모아두었다가 움직일 계기에 드러냄', '1263-1266', 'source_explicit'],
    ['shadowPatterns', '움직일 생각이 있어도 실행을 미룰 수 있음', '1266-1270', 'source_explicit'],
  ], [
    ['relationship_prediction', 1287],
    ['gender_determinism', 1275],
    ['wealth_prediction', 1277],
    ['non_personality_claim', 1283],
  ]),
  辛巳: profile('辛巳', '正官', '死', 1352, [
    ['corePersonality', '예민하고 날카로운 기준에 정직하고 성실하게 행동하려는 태도가 더해짐', '1322-1325', 'source_explicit'],
  ], [
    ['relationship_prediction', 1356],
    ['gender_determinism', 1342],
    ['career_prediction', 1325],
    ['health_prediction', 1351],
    ['compatibility_prediction', 1347],
    ['non_personality_claim', 1352],
  ]),
  壬午: profile('壬午', '正財', '胎', 1433, [
    ['branchNature', '한여름 볕의 움직이는 열기', '1391-1393', 'source_explicit'],
    ['corePersonality', '평소의 활동 수준과 달리 자신과 비슷한 상대의 발전을 보면 경쟁 의욕이 커짐', '1415-1423', 'source_explicit'],
  ], [
    ['relationship_prediction', 1437],
    ['gender_determinism', 1426],
    ['non_personality_claim', 1433],
  ]),
  癸未: profile('癸未', '偏官', '墓', 1492, [
    ['branchNature', '열기를 품지만 반응은 느리고 덤덤한 흙', '1462-1463', 'source_explicit'],
    ['strengths', '느리고 차분한 반응이 감정의 급한 변화를 누그러뜨림', '1462-1463', 'source_explicit'],
    ['shadowPatterns', '실수가 없어야 한다는 기준 때문에 시작이나 경로 변경을 주저함', '1466-1475', 'source_explicit'],
  ], [
    ['relationship_prediction', 1496],
    ['gender_determinism', 1485],
    ['non_personality_claim', 1492],
  ]),
  甲申: profile('甲申', '偏官', '絶', 1547, [
    ['strengths', '이상에 행동을 보태며 어려움 속에서 끈질기게 버팀', '1511-1516', 'source_explicit'],
    ['interpersonalStyle', '갈등을 우회하기보다 자기 뜻을 지키며 부딪히는 편', '1526-1532', 'source_explicit'],
  ], [
    ['relationship_prediction', 1551],
    ['gender_determinism', 1539],
    ['non_personality_claim', 1547],
  ]),
  乙酉: profile('乙酉', '偏官', '絶', 1609, [
    ['corePersonality', '마음에 맞는 환경과 활동을 반복해서 선택함', '1572-1576', 'source_explicit'],
    ['strengths', '선택한 분야에 노력을 꾸준히 모음', '1574-1576', 'source_explicit'],
  ], [
    ['relationship_prediction', 1613],
    ['gender_determinism', 1598],
    ['wealth_prediction', 1576],
    ['compatibility_prediction', 1608],
    ['non_personality_claim', 1609],
  ]),
  丙戌: profile('丙戌', '食神', '墓', 1690, [
    ['shadowPatterns', '안정감을 충분히 느끼지 못하면 이미 가진 것보다 결핍에 주의를 기울임', '1643-1644', 'source_explicit'],
    ['expressionPattern', '사교적으로 어울리면서도 관계가 깊어지면 자기 영역을 쉽게 내어주지 않음', '1665-1667', 'source_synthesis'],
  ], [
    ['relationship_prediction', 1694],
    ['gender_determinism', 1676],
    ['career_prediction', 1672],
    ['health_prediction', 1686],
    ['non_personality_claim', 1690],
  ]),
  丁亥: profile('丁亥', '正官', '胎', 1751, [
    ['corePersonality', '스스로 세운 원칙과 맡은 역할을 잘 지키려 함', '1716-1724', 'source_explicit'],
    ['internalConflict', { sourceA: '신뢰와 인정을 통해 움직이는 힘', sourceB: '인정을 유지해야 한다는 압박', tension: '인정이 주는 동기와 인정을 유지하려는 압박의 공존', possibleExpression: ['역할과 대상에 몰입하면서 사고와 행동이 경직됨'] }, '1721-1732', 'source_synthesis'],
  ], [
    ['relationship_prediction', 1755],
    ['gender_determinism', 1743],
    ['wealth_prediction', 1713],
    ['career_prediction', 1719],
    ['non_personality_claim', 1751],
  ]),
  戊子: profile('戊子', '正財', '胎', 1814, [
    ['branchNature', '행동보다 생각을 앞세우는 정적인 자수', '1790-1792', 'source_explicit'],
    ['decisionStyle', '현재 상태를 지키는 데 유리한지 따져 판단함', '1792-1795', 'source_explicit'],
    ['interpersonalStyle', '집단에 섞이기 위해 억지로 움직이지 않으며 혼자 있는 상태를 크게 불편해하지 않음', '1795-1797', 'source_explicit'],
  ], [
    ['relationship_prediction', 1818],
    ['gender_determinism', 1803],
    ['non_personality_claim', 1814],
  ]),
  己丑: profile('己丑', '比肩', '墓', 1872, [
    ['branchNature', '반복적이고 보수적인 축토', '1845', 'source_explicit'],
    ['corePersonality', '자신이 좋아하는 일에는 꾸준히 몰두하면서도 관심이 다른 일로 옮겨감', '1852-1855', 'source_explicit'],
    ['shadowPatterns', '자기 기준을 앞세워 타인의 요구를 쉽게 따르지 않음', '1841-1846', 'source_explicit'],
  ], [
    ['relationship_prediction', 1876],
    ['gender_determinism', 1864],
    ['non_personality_claim', 1872],
  ]),
  庚寅: profile('庚寅', '偏財', '絶', 1959, [
    ['branchNature', '생명력이 만개하는 봄의 확장', '1931-1934', 'source_explicit'],
    ['expressionPattern', '자기 방식대로 일을 크게 벌리고 마무리까지 주도하려 함', '1935-1941', 'source_explicit'],
    ['growthDirection', '일을 더 벌이기 전에 다른 의견을 들어봄', '1939-1945', 'source_synthesis'],
  ], [
    ['relationship_prediction', 1963],
    ['gender_determinism', 1921],
    ['non_personality_claim', 1959],
  ]),
  辛卯: profile('辛卯', '偏財', '絶', 2040, [
    ['branchNature', '활동하는 봄의 기운', '2006-2010', 'source_explicit'],
    ['corePersonality', '큰 구상을 여러 방면에서 펼치려 함', '2009-2011', 'source_explicit'],
    ['shadowPatterns', '활동과 자신감이 앞서 주변 상황을 잠시 멈춰 살피기 어려움', '2014-2017', 'source_explicit'],
  ], [
    ['relationship_prediction', 2044],
    ['gender_determinism', 2028],
    ['non_personality_claim', 2040],
  ]),
  壬辰: profile('壬辰', '偏官', '墓', 2110, [
    ['strengths', '집단에 적응하면서도 필요하면 새로운 방식으로 움직이는 편', '2082-2085', 'source_explicit'],
    ['shadowPatterns', '옳다고 여긴 방향에 오랫동안 매달리기 쉬움', '2086-2090', 'source_explicit'],
    ['decisionStyle', '자기 판단을 고수하다가도 논점에 설득되면 빠르게 방향을 바꿈', '2086-2092', 'source_explicit'],
  ], [
    ['relationship_prediction', 2114],
    ['gender_determinism', 2101],
    ['health_prediction', 2093],
    ['compatibility_prediction', 2099],
    ['non_personality_claim', 2110],
  ]),
  癸巳: profile('癸巳', '正財', '胎', 2206, [
    ['expressionPattern', '겉으로는 친절하고 부드럽지만 이해득실을 따질 때는 냉정해짐', '2158', 'source_explicit'],
    ['decisionStyle', '겉 태도와 달리 실속을 따지는 상황에서는 냉정하게 결정함', '2158', 'source_explicit'],
  ], [
    ['relationship_prediction', 2210],
    ['gender_determinism', 2141],
    ['career_prediction', 2165],
    ['compatibility_prediction', 2203],
    ['non_personality_claim', 2206],
  ]),
  甲午: profile('甲午', '傷官', '死', 2284, [
    ['strengths', '유창한 말로 여럿의 관심을 모으는 편', '2240-2242', 'source_explicit'],
    ['shadowPatterns', '표현의 인상이 실행보다 앞서 보일 수 있음', '2240-2243', 'source_explicit'],
  ], [
    ['relationship_prediction', 2288],
    ['gender_determinism', 2273],
    ['wealth_prediction', 2275],
    ['non_personality_claim', 2284],
  ]),
  乙未: profile('乙未', '偏財', '養', 2364, [
    ['corePersonality', '사소한 선택에서 중요한 가치까지 자기 만족의 기준을 높게 잡는 편', '2322', 'source_explicit'],
    ['shadowPatterns', '높은 만족 기준이 불안과 압박으로 이어지기 쉬움', '2322-2326', 'source_explicit'],
  ], [
    ['relationship_prediction', 2368],
    ['gender_determinism', 2350],
    ['wealth_prediction', 2359],
    ['health_prediction', 2358],
    ['non_personality_claim', 2364],
  ]),
  丙申: profile('丙申', '偏財', '病', 2411, [
    ['branchNature', '만물을 무르익게 하는 초가을의 변화와 움직임', '2381-2383', 'source_explicit'],
    ['decisionStyle', '생각에서 판단과 실행으로 빠르게 넘어감', '2379-2383', 'source_explicit'],
    ['shadowPatterns', '빠른 결단이 성급해지면 실수가 늘어날 수 있음', '2379-2380', 'source_explicit'],
  ], [
    ['relationship_prediction', 2415],
    ['gender_determinism', 2398],
    ['non_personality_claim', 2411],
  ]),
  丁酉: profile('丁酉', '偏財', '長生', 2485, [
    ['strengths', '주변 사람의 기술과 방식을 눈치 빠르게 관찰해 익힘', '2469-2470', 'source_explicit'],
    ['shadowPatterns', '자기 부족함을 인식하기 어려울 때 고집을 부리거나 타인을 낮춰 보기 쉬움', '2455-2458', 'source_explicit'],
  ], [
    ['relationship_prediction', 2489],
    ['gender_determinism', 2474],
    ['non_personality_claim', 2485],
  ]),
  戊戌: profile('戊戌', '比肩', '墓', 2573, [
    ['branchNature', '메마르고 수렴하는 산과 하루를 정리하는 저녁의 이미지', '2520-2523', 'source_explicit'],
    ['corePersonality', '겉으로 믿음직하게 보이며 한편으로 혼자 있는 시간과 공간을 선호함', '2519-2523', 'source_explicit'],
    ['strengths', '혼자 공부하고 단련하는 데 집중함', '2521-2523', 'source_explicit'],
  ], [
    ['relationship_prediction', 2577],
    ['gender_determinism', 2518],
    ['non_personality_claim', 2573],
  ]),
  己亥: profile('己亥', '正財', '胎', 2644, [
    ['decisionStyle', '위험을 크게 늘리지 않는 안정적인 선택을 선호함', '2609', 'source_explicit'],
    ['expressionPattern', '일상에서 정한 방식을 꾸준히 지켜 한결같다는 인상을 줌', '2617-2621', 'source_synthesis'],
  ], [
    ['relationship_prediction', 2648],
    ['gender_determinism', 2636],
    ['career_prediction', 2619],
    ['non_personality_claim', 2644],
  ]),
  庚子: profile('庚子', '傷官', '死', 2731, [
    ['branchNature', '움직임이 적고 고요한 자수', '2692-2695', 'source_explicit'],
    ['decisionStyle', '미뤄도 된다고 판단한 일은 자신이 정한 한계까지 미뤘다가 처리함', '2699-2700', 'source_explicit'],
    ['expressionPattern', '정적인 태도와 달리 자기 생각을 표현할 때 말이 날카로워질 수 있음', '2707-2710', 'source_synthesis'],
  ], [
    ['relationship_prediction', 2735],
    ['gender_determinism', 2724],
    ['career_prediction', 2712],
    ['health_prediction', 2724],
    ['compatibility_prediction', 2723],
    ['non_personality_claim', 2731],
  ]),
  辛丑: profile('辛丑', '偏印', '養', 2792, [
    ['branchNature', '차갑고 정적인 축토', '2755-2761', 'source_explicit'],
    ['decisionStyle', '신중하게 움직이며 적은 행동으로 높은 효율을 내는 방식을 선호함', '2766-2767', 'source_explicit'],
    ['expressionPattern', '밖에서는 활동적이어도 혼자 있는 곳에서는 조용히 에너지를 회복함', '2758-2761', 'source_explicit'],
  ], [
    ['relationship_prediction', 2796],
    ['gender_determinism', 2789],
    ['health_prediction', 2790],
    ['non_personality_claim', 2792],
  ]),
  壬寅: profile('壬寅', '食神', '病', 2857, [
    ['branchNature', '따스한 봄의 초목', '2819-2823', 'source_explicit'],
    ['strengths', '안으로 굴리던 생각을 구체적인 행동으로 옮길 수 있음', '2822-2826', 'source_explicit'],
  ], [
    ['relationship_prediction', 2861],
    ['gender_determinism', 2842],
    ['wealth_prediction', 2830],
    ['non_personality_claim', 2857],
  ]),
  癸卯: profile('癸卯', '食神', '長生', 2916, [
    ['corePersonality', '관심 분야에는 집중하지만 낯선 과제에서는 지속력이 빠르게 떨어짐', '2893-2899', 'source_explicit'],
    ['growthDirection', '낯선 과제에 적응할 때 과거의 비슷한 경험을 활용함', '2896-2905', 'source_synthesis'],
  ], [
    ['relationship_prediction', 2920],
    ['gender_determinism', 2910],
    ['compatibility_prediction', 2915],
    ['non_personality_claim', 2916],
  ]),
  甲辰: profile('甲辰', '偏財', '衰', 3002, [
    ['strengths', '구상한 목표에 실제 행동을 보태는 편', '2965-2968', 'source_explicit'],
    ['decisionStyle', '과정보다 예상 결과를 기준으로 시도 여부를 정함', '2974-2977', 'source_explicit'],
    ['shadowPatterns', '결과를 중시한 나머지 목표에 집착하거나 결과가 마음에 들지 않을 일은 시작하지 않기 쉬움', '2974-2977', 'source_explicit'],
  ], [
    ['relationship_prediction', 3006],
    ['gender_determinism', 2987],
    ['wealth_prediction', 2949],
    ['health_prediction', 2980],
    ['compatibility_prediction', 2983],
    ['non_personality_claim', 3002],
  ]),
  乙巳: profile('乙巳', '傷官', '沐浴', 3055, [
    ['branchNature', '따뜻하게 넓게 퍼지는 생동감', '3020-3021', 'source_explicit'],
    ['corePersonality', '두 기운의 확산성이 겹쳐 온화하고 명랑하게 활동함', '3021', 'source_explicit'],
  ], [
    ['relationship_prediction', 3059],
    ['gender_determinism', 3044],
    ['career_prediction', 3033],
    ['non_personality_claim', 3055],
  ]),
  丙午: profile('丙午', '劫財', '帝旺', 3118, [
    ['corePersonality', '거침없는 기세와 강한 자기 주장이 함께 드러남', '3079-3085', 'source_synthesis'],
  ], [
    ['relationship_prediction', 3122],
    ['gender_determinism', 3106],
    ['compatibility_prediction', 3110],
    ['non_personality_claim', 3118],
  ]),
  丁未: profile('丁未', '食神', '冠帯', 3179, [
    ['decisionStyle', '새 방식을 시도하기보다 이미 익숙한 방식으로 표현하기를 선호함', '3155-3158', 'source_explicit'],
    ['shadowPatterns', '익숙한 패턴을 지속하다 활동에 권태를 느끼기 쉬움', '3158-3164', 'source_explicit'],
  ], [
    ['relationship_prediction', 3183],
    ['gender_determinism', 3167],
    ['career_prediction', 3163],
    ['compatibility_prediction', 3178],
    ['non_personality_claim', 3179],
  ]),
  戊申: profile('戊申', '食神', '病', 3235, [
    ['branchNature', '빠르게 움직이는 신금', '3206-3208', 'source_explicit'],
    ['corePersonality', '확고한 생각을 실행에 옮기되 진중함으로 빠른 행동의 속도를 잡음', '3206-3208', 'source_explicit'],
    ['strengths', '새 기술에 호기심을 보이며 직접 익혀 활용하는 속도가 빠름', '3212-3213', 'source_explicit'],
    ['shadowPatterns', '결과를 충분히 활용하기 전에 새로운 흥미로 옮겨가기 쉬움', '3214-3217', 'source_explicit'],
  ], [
    ['relationship_prediction', 3239],
    ['gender_determinism', 3226],
    ['career_prediction', 3224],
    ['non_personality_claim', 3235],
  ]),
  己酉: profile('己酉', '食神', '長生', 3321, [
    ['strengths', '배우려는 의지가 강하고 분석적이며 미래지향적임', '3298', 'source_explicit'],
    ['decisionStyle', '자기 손해를 따지면서도 남에게 피해를 주는 이득은 꺼림', '3309', 'source_explicit'],
  ], [
    ['relationship_prediction', 3325],
    ['gender_determinism', 3307],
    ['non_personality_claim', 3321],
  ]),
  庚戌: profile('庚戌', '偏印', '衰', 3369, [
    ['decisionStyle', '실행에 높은 확신을 요구하고 확신이 생기면 끝까지 밀고 감', '3340-3346', 'source_explicit'],
    ['shadowPatterns', '확신의 문턱이 높아 행동하기까지 오래 걸림', '3344-3352', 'source_explicit'],
    ['growthDirection', '완전히 확신할 때까지 기다리기보다 작은 결과물부터 시도함', '3352-3354', 'source_synthesis'],
  ], [
    ['relationship_prediction', 3373],
    ['gender_determinism', 3359],
    ['non_personality_claim', 3369],
  ]),
  辛亥: profile('辛亥', '傷官', '沐浴', 3442, [
    ['expressionPattern', '비판을 겉으로 바로 받아치기보다 감정을 쌓아 두었다가 자기 방식으로 대응함', '3417-3423', 'source_synthesis'],
    ['internalConflict', { sourceA: '불편을 티 내지 않고 혼자 짊어지는 태도', sourceB: '자존심과 승부욕을 회복하려는 마음', tension: '감정을 드러내지 않는 태도와 대항하려는 승부욕의 긴장', possibleExpression: ['겉으로 조용해 보여도 뒤늦게 반격하려 함'] }, '3417-3423', 'source_synthesis'],
  ], [
    ['relationship_prediction', 3446],
    ['gender_determinism', 3432],
    ['compatibility_prediction', 3441],
    ['non_personality_claim', 3442],
  ]),
  壬子: profile('壬子', '劫財', '帝旺', 3503, [
    ['branchNature', '겨울밤처럼 안으로 향하는 고요한 물', '3472-3475', 'source_explicit'],
    ['expressionPattern', '온순하고 느려 보이지만 내면으로 강한 활력과 경쟁심이 흐름', '3472-3476', 'source_synthesis'],
  ], [
    ['relationship_prediction', 3507],
    ['gender_determinism', 3492],
    ['compatibility_prediction', 3499],
    ['non_personality_claim', 3503],
  ]),
  癸丑: profile('癸丑', '偏官', '冠帯', 3575, [
    ['expressionPattern', '함께 있을 때는 활발하고 편안하지만 혼자 남으면 대화를 되짚으며 후회함', '3537-3541', 'source_synthesis'],
    ['shadowPatterns', '타인이 자신을 어떻게 보았는지 오래 걱정하며 위축될 수 있음', '3545-3554', 'source_explicit'],
  ], [
    ['relationship_prediction', 3579],
    ['gender_determinism', 3565],
    ['compatibility_prediction', 3569],
    ['non_personality_claim', 3575],
  ]),
  甲寅: profile('甲寅', '比肩', '建禄', 3635, [
    ['corePersonality', '같은 목의 기운이 겹쳐 자기 주장과 자존심이 더욱 뚜렷해짐', '3605-3607', 'source_explicit'],
    ['shadowPatterns', '자기 주장을 억누르는 압박이 지속되면 내적으로 크게 흔들릴 수 있음', '3617-3618', 'source_explicit'],
  ], [
    ['relationship_prediction', 3639],
    ['gender_determinism', 3624],
    ['career_prediction', 3613],
    ['non_personality_claim', 3635],
  ]),
  乙卯: profile('乙卯', '比肩', '建禄', 3712, [
    ['expressionPattern', '안정적인 내면이 모나지 않은 태도로 나타남', '3677-3679', 'source_explicit'],
    ['interpersonalStyle', '생활의 안정을 위해 관계를 세심하게 관리함', '3684-3688', 'source_explicit'],
    ['internalConflict', { sourceA: '기존 관계를 돌보려는 노력', sourceB: '새로운 경험을 하고 싶은 욕구', tension: '기존 관계의 안정과 새로운 경험에 대한 욕구의 충돌', possibleExpression: ['관계를 유지하느라 새 시도에 쓸 시간과 에너지가 줄어듦'] }, '3688-3692', 'source_synthesis'],
  ], [
    ['relationship_prediction', 3716],
    ['gender_determinism', 3702],
    ['non_personality_claim', 3712],
  ]),
  丙辰: profile('丙辰', '食神', '冠帯', 3775, [
    ['branchNature', '열정과 냉정함이 함께 나타나는 데 관여하는 진토의 이중성과 변동성', '3752-3753', 'source_explicit'],
    ['expressionPattern', '말과 행동으로 열정을 드러내면서도 상황에 따라 냉정한 면을 보임', '3745-3753', 'source_synthesis'],
    ['decisionStyle', '스스로 납득하는 합리성과 효율성을 찾아 움직임', '3749-3750', 'source_explicit'],
  ], [
    ['relationship_prediction', 3779],
    ['gender_determinism', 3766],
    ['wealth_prediction', 3748],
    ['career_prediction', 3763],
    ['compatibility_prediction', 3761],
    ['non_personality_claim', 3775],
  ]),
  丁巳: profile('丁巳', '劫財', '帝旺', 3816, [
    ['branchNature', '한낮과 뜨거운 여름의 확산하는 불', '3788-3789', 'source_explicit'],
    ['interpersonalStyle', '사람을 모아 무리를 만들고 그 안에서 주도하고자 함', '3790-3791', 'source_explicit'],
  ], [
    ['relationship_prediction', 3820],
    ['gender_determinism', 3806],
    ['non_personality_claim', 3816],
  ]),
  戊午: profile('戊午', '正印', '帝旺', 3883, [
    ['expressionPattern', '점잖고 정적인 인상 안에 강한 에너지를 담아 둠', '3860-3862', 'source_synthesis'],
    ['internalConflict', { sourceA: '내면의 힘을 드러내려는 본능', sourceB: '고요와 규칙을 지키려는 자기 통제', tension: '내면의 힘을 표현하려는 마음과 절제하려는 마음의 충돌', possibleExpression: ['한쪽으로 치우치면 고집을 과하게 표출하거나 의욕이 둔해짐'] }, '3860-3866', 'source_synthesis'],
  ], [
    ['relationship_prediction', 3887],
    ['gender_determinism', 3827],
    ['compatibility_prediction', 3878],
    ['non_personality_claim', 3883],
  ]),
  己未: profile('己未', '比肩', '冠帯', 3925, [
    ['expressionPattern', '평소에는 무던해 보이지만 자기 의견이 생기면 거침없이 표현함', '3896-3900', 'source_synthesis'],
    ['decisionStyle', '사소한 선택도 구체적으로 알아본 뒤 결정함', '3902', 'source_explicit'],
  ], [
    ['relationship_prediction', 3929],
    ['gender_determinism', 3916],
    ['compatibility_prediction', 3920],
    ['non_personality_claim', 3925],
  ]),
  庚申: profile('庚申', '比肩', '建禄', 3970, [
    ['corePersonality', '자기 정체성이 뚜렷하고 평소에는 변화 없이 무던하게 지냄', '3948-3951', 'source_explicit'],
    ['strengths', '경쟁할 상대나 진심으로 원하는 목표가 생기면 추진력이 두드러짐', '3948-3952', 'source_explicit'],
    ['shadowPatterns', '자기 기준이 지나치게 확고해지면 다른 의견을 듣지 않으려 함', '3955', 'source_explicit'],
  ], [
    ['relationship_prediction', 3974],
    ['gender_determinism', 3960],
    ['non_personality_claim', 3970],
  ]),
  辛酉: profile('辛酉', '比肩', '建禄', 4041, [
    ['branchNature', '날카롭고 깔끔하게 구분하는 유금', '4016', 'source_explicit'],
    ['interpersonalStyle', '때와 장소를 가려 의견을 내고 공적인 일과 사적인 일을 구분함', '4016', 'source_explicit'],
    ['shadowPatterns', '자기 판단을 유일한 기준으로 삼기 쉬움', '4007-4009', 'source_explicit'],
  ], [
    ['relationship_prediction', 4045],
    ['gender_determinism', 4030],
    ['non_personality_claim', 4041],
  ]),
  壬戌: profile('壬戌', '偏官', '冠帯', 4108, [
    ['interpersonalStyle', '다른 사람을 돕고 협력하며 그 안에서 자신의 역량을 발휘할 길을 찾음', '4080-4089', 'source_explicit'],
    ['internalConflict', { sourceA: '관계 속에서 역할과 역량을 키우려는 태도', sourceB: '그동안의 노력이 허무하게 느껴지는 소진', tension: '관계에 힘을 쏟는 태도와 소진 후 거리를 두려는 마음의 공존', possibleExpression: ['지친 시기에 기존 관계와 역할에서 갑자기 거리를 두고 싶어짐'] }, '4087-4095', 'source_synthesis'],
  ], [
    ['relationship_prediction', 4112],
    ['gender_determinism', 4099],
    ['non_personality_claim', 4108],
  ]),
  癸亥: profile('癸亥', '劫財', '帝旺', 4151, [
    ['expressionPattern', '유순하게 보이면서도 속으로는 경쟁과 성취 욕구를 강하게 품음', '4125-4134', 'source_synthesis'],
    ['internalConflict', { sourceA: '스스로 나서지 않고 간접적으로 의견을 드러내는 태도', sourceB: '경쟁에서 앞서고 싶은 야망', tension: '간접적인 자기표현과 내면의 강한 성취 욕구의 간극', possibleExpression: ['외부 표현과 내부 욕구 사이의 간극이 커짐'] }, '4125-4135', 'source_synthesis'],
  ], [
    ['relationship_prediction', 4155],
    ['gender_determinism', 4137],
    ['compatibility_prediction', 4147],
    ['non_personality_claim', 4151],
  ]),
} satisfies Partial<Record<DayPillar, DayPillarProfile>>
