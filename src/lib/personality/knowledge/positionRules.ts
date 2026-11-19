import type { PersonalityPosition, PositionExpressionRule } from '../types'

const source = 'src/docs/source/personality/십성.md'
const master = 'src/docs/rules/master/11-personality-master.md'
const schema = 'src/docs/rules/master/12-personality-knowledge-schema.md'

export const POSITION_EXPRESSION_RULES = {
  stem: {
    positionType: 'stem',
    expressionDomain: ['외부에서 빠르게 보이는 성격', '사회적 표현', '말과 행동에 드러나는 태도', '타인이 초기에 인식하는 성향'],
    interpretationRules: ['십성 성향이 외부에서 관찰되는 방식을 설명하는 맥락'],
    evidenceNotes: [{
      sourceType: 'position', sourceId: 'stem', fields: ['expressionDomain', 'interpretationRules'],
      sourceRef: source + '#L1516-L1518', corroboratingRefs: [master + '#L145-L152'],
      confidence: 'filune_interpretation',
    }],
  },
  branch: {
    positionType: 'branch',
    expressionDomain: ['내재된 판단기제', '본능적 성향', '가까운 사람에게 보이는 반응', '오래 교류하면 드러나는 성향'],
    interpretationRules: ['각 지지 위치에 공통인 내적 발현 맥락'],
    evidenceNotes: [{
      sourceType: 'position', sourceId: 'branch', fields: ['expressionDomain', 'interpretationRules'],
      sourceRef: source + '#L1516-L1518', corroboratingRefs: [master + '#L154-L161'],
      confidence: 'filune_interpretation',
    }],
  },
  month_branch: {
    positionType: 'month_branch',
    expressionDomain: ['타고난 본성', '쉽게 바뀌지 않는 반응', '사회·직업 환경에서 반복되는 기본 기질'],
    interpretationRules: ['다른 성격 자료와 함께 해석하는 기본 기질의 맥락'],
    evidenceNotes: [{
      sourceType: 'position', sourceId: 'month_branch', fields: ['expressionDomain', 'interpretationRules'],
      sourceRef: source + '#L1519-L1520', corroboratingRefs: [master + '#L173-L182'],
      confidence: 'filune_interpretation',
    }],
  },
  day_branch: {
    positionType: 'day_branch',
    expressionDomain: ['개인적 판단', '생활 속 본능적 선택', '친밀한 관계에서의 반응', '내부 결정 기준'],
    interpretationRules: ['일상과 가까운 관계에서 드러나는 내부 판단의 맥락'],
    evidenceNotes: [{
      sourceType: 'position', sourceId: 'day_branch', fields: ['expressionDomain', 'interpretationRules'],
      sourceRef: source + '#L1522-L1523', corroboratingRefs: [master + '#L184-L190'],
      confidence: 'filune_interpretation',
    }],
  },
  hour_branch: {
    positionType: 'hour_branch',
    expressionDomain: ['개인적 욕구', '장기 계획', '미래를 생각하는 방식', '혼자 있을 때의 판단'],
    interpretationRules: ['개인적 계획과 장기적 선택에 쓰이는 내부 판단의 맥락'],
    evidenceNotes: [{
      sourceType: 'position', sourceId: 'hour_branch', fields: ['expressionDomain', 'interpretationRules'],
      sourceRef: source + '#L1522-L1523', corroboratingRefs: [master + '#L184-L196', schema + '#L466-L475'],
      confidence: 'filune_interpretation',
    }],
  },
  year_branch: {
    positionType: 'year_branch',
    expressionDomain: [],
    interpretationRules: ['지지 일반의 보조 맥락'],
    evidenceNotes: [
      {
        sourceType: 'position', sourceId: 'year_branch', fields: ['interpretationRules'],
        sourceRef: master + '#L154-L161', corroboratingRefs: [schema + '#L479-L489'],
        confidence: 'filune_interpretation',
      },
      { sourceType: 'position', sourceId: 'year_branch', fields: ['expressionDomain'], note: 'source_gap' },
    ],
  },
} satisfies Record<PersonalityPosition, PositionExpressionRule>
