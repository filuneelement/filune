FILUNE Codex P0 엔진 코어 구현 지시문

0. 작업 목표

FILUNE 명리 판정 엔진의 P0 코어 실행 구조만 구현한다.

이번 작업의 목표는 격별 세부 해석을 완성하는 것이 아니다.

Canonical Facts
↓
PatternContext
↓
Stem Runtime
↓
Effective PatternContext
↓
RelationFact
↓
PatternEffectPolicy
↓
ActualStructuralFunction
↓
Role State
↓
LuckScopeState

1. 기준 문서

우선순위:

src/docs/rules/master/09-engine-integration-spec.md

src/docs/rules/master/10-implementation-audit.md

필요한 세부 규칙:

01-pattern-master.md

02-peer-rob-yangblade-master.md

03-branch-relations-master.md

04-root-twelve-stages-master.md

05-sangshen-byeong-gueung-master.md

06-pattern-effect-policy.md

07-pattern-effect-policy-audit.md

08-luck-master.md

src/docs/source/는 근거 확인용이다.

master에 없는 명리 규칙을 source에서 임의로 만들어 구현하지 않는다.

2. 구현 범위

이번 P0에서 구현:

core types

PatternContext

ManifestationHistory

EffectiveManifestedYongShen

provisional/final PatternContext

StemRuntimeState

운↔운 합

운↔원국 합

RelationAction 분리

FormulaFact

PatternEffectPolicy Registry 골격

ActualStructuralFunction

RoleHistory / CurrentState

immutable LuckScopeState

FormationBranchPool

P0 regression tests

구현하지 않음:

전체 9개 격 Policy

전체 SangShen/Byeong/GuEung

Personality Engine

Palace

고객 Renderer

숫자 점수

3. PatternContext

단일 Pattern enum 금지.

최소:

interface PatternContext {
  id: string;
  scope: JudgmentScope;

  branchPattern: BranchPattern;

  monthHiddenStemCandidates: MonthHiddenStemCandidate[];

  manifestationHistory: ManifestedYongShen[];
  effectiveManifestedYongShen: ManifestedYongShen[];

  usableHeavenlyFocus: UsableHeavenlyFocus[];

  heavenlyPatterns: HeavenlyPattern[];

  patternMode: PatternMode;

  yongShenRelations: YongShenRelation[];
}

4. JudgmentScope

type JudgmentScope =
  | "natal"
  | "daewoon"
  | "sewoon"
  | "month"
  | "day";

5. BranchPattern

BranchPattern은 원국 월령 History다.

운에서 변경하지 않는다.

6. ManifestedYongShen

배열로 관리한다.

interface ManifestedYongShen {
  id: string;
  stem: HeavenlyStem;
  tenGod: TenGod;

  sourceHiddenStem: HeavenlyStem;
  sourceClass: "main" | "middle" | "residual";

  manifestationScope: JudgmentScope;

  monthCommandRoot: true;

  runtimeState: StemRuntimeState;

  roleHistory: "yongshen";
}

7. ManifestationHistory / EffectiveManifestation

반드시 분리.

ManifestationHistory
= 해당 scope에서 투출된 사실

EffectiveManifestedYongShen
= Runtime 처리 후 실제 현재 기능 가능한 집합

8. PatternMode

type PatternMode =
  | "proper"
  | "transformed"
  | "combined"
  | "month_command_unusable"
  | "special_peer_pattern";

기본:

본기 하나 → proper
본기 아닌 하나 → transformed
usable YongShen 2개 이상 → combined
usable manifestation 없음 → month_command_unusable

9. StemRuntimeState

type StemRuntimeState =
  | "active"
  | "weakened"
  | "stopped";

weakened != stopped

10. RelationAction

type RelationAction =
  | "generate"
  | "control"
  | "combine"
  | "protect"
  | "drain"
  | "formation_strengthen";

특히:

control != combine

11. 세 칠살 공식 분리

FoodGodControlsKilling

食神 → control → 七殺

HurtingOfficerControlsKilling

傷官 → control → 七殺

HurtingOfficerCombinesKilling

傷官 → combine → 七殺

통합 금지.

12. FormulaFact

interface FormulaFact {
  id: string;
  formulaType: FormulaType;

  relationFactIds: string[];
  patternContextId: string;

  validity:
    | "confirmed"
    | "conditional"
    | "invalid";
}

13. 운 천간합 순서

반드시:

1. 현재 direct scope의 운↔운 합 먼저
2. 운↔운 유효합 → 양쪽 weakened
3. 해당 운 천간은 동일 scope에서 원국과 재합 금지
4. 나머지 운 천간만 원국 합 검사
5. 운↔원국 유효합 → 양쪽 stopped

14. 복수 운 합 우선순위

Daewoon
→ Sewoon
→ Month
→ Day

하나만 선택.

15. 일간합 예외

일간 참여 합은 일반 운세 합거로 처리하지 않는다.

16. provisional / final PatternContext

luck stem 등장
↓
potential manifestation
↓
provisional PatternContext
↓
stem combination/runtime
↓
EffectiveManifestedYongShen 재계산
↓
final PatternContext

17. PatternEffectPolicy

RelationFact
+
PatternContext
→ PatternEffectPolicy

RelationFact 자체에 길흉 저장 금지.

18. P0 최소 Policy

財格 + 財剋印

favorable

印格 + 財剋印

unfavorable

印格 + 印過多 + 財剋印

favorable
Formula = resource_excess_uses_wealth

19. ActualStructuralFunction

PatternEffectPolicy
+
Runtime
+
Root
+
Formation
→ ActualStructuralFunction

Policy가 favorable이어도 source stopped이면 inactive 가능.

20. Role 구조

최소:

roleHistory
currentState
currentFunction

분리.

21. LuckScopeState

상위 state 직접 mutate 금지.

NatalState
→ DaewoonState
→ SewoonState
→ MonthState
→ DayState

각각 독립 snapshot.

22. FormationBranchPool

ordinary relation scope와 분리.

Daewoon = Natal + Daewoon
Sewoon = Natal + Daewoon + Sewoon
Month = Natal + Daewoon + Sewoon + Month
Day = Natal + Daewoon + Sewoon + Month + Day

23. stopped + Root 강화

Runtime stopped
+
Root strengthened
→ Runtime remains stopped

24. 필수 테스트

반드시 검증:

財格 財剋印 favorable

印格 財剋印 unfavorable

印多用財 favorable

食神制殺 control

傷官剋殺 control

傷官合殺 combine

운↔운 합 → weakened

운↔원국 합 → stopped

운↔운 합 우선

복수 운 합 우선순위

provisional combined → final effective single

stopped + Root 강화 → stopped

25. 구현 금지

단일 PatternType

RelationFact에 길흉

財剋印 전역 방향

제살/합살 통합

weakened/stopped 통합

숫자 길흉 점수

Root 강화로 stopped 해제

운에서 BranchPattern 교체

26. 검증

실행:

npx tsc -b
npm run build
기존 검증 전체
신규 P0 회귀