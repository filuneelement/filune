FILUNE Codex P0.1 계약 보완 지시

P0 감사 결과에 따라 P1로 넘어가지 말고 아래 항목만 보완한다.

1. 겸격 유정·무정 수정

TenGod pair만으로 유정 판정 금지.

특히:

食神 + 財
→ 자동 favorable_harmony 금지

최소 근거:

실제 RelationFact

generate/control/combine

source/target

RuntimeState

필요 시 RootState

합거 여부

현재 PatternContext의 실제 기능

근거 부족:

deferred

2. inherited combine

상위 scope 합거가 하위 scope로 내려갈 때:

Relation / Formula History

과거 발생 사실 유지.

Runtime

stopped/weakened 상태 승계.

Current Structural Effect

현재 scope에서도 효과가 유지되는지 별도 기록.

필요 개념:

originScope
inherited
currentlyEffective
sourceRelationFactId
sourceFormulaFactId

새 이벤트로 중복 생성하지 않는다.

3. LuckEffect P0 계약

최소:

manifests_yongshen
changes_pattern_mode
activates_byeong
strengthens_byeong
weakens_byeong
relieves_byeong
attacks_yongshen
protects_yongshen
activates_sangshen_function
weakens_sangshen
changes_root_state
changes_capacity
changes_formation

운 글자에 새 natal Role 생성 금지.

4. Role CurrentFunction 보완

최소:

stopped → inactive
weakened → reduced
active + 확정 ActualStructuralFunction → operating
근거 부족 → deferred

RoleHistory 삭제 금지.

5. 신규 테스트

겸격 유정

TenGod pair만 존재, Relation 없음 → favorable_harmony 금지

실제 FoodGod → generate → Wealth → favorable_harmony 가능

source stopped → current harmony inactive/re-evaluate

weakened source

RelationFact 유지 + reduced.

stopped source

RelationFact/history 유지 + current inactive.

운 합 우선순위

daewoon > sewoon

sewoon > month

month > day

inherited combine

상위 Formula history 유지 + current effect 유지 + 중복 신규 Formula 금지.

LuckEffect

최소:

manifests_yongshen

changes_pattern_mode

activates_byeong

relieves_byeong

자동 단언.

6. 기존 계약 보존

절대 변경 금지:

財格 + 財剋印 = favorable
印格 + 財剋印 = unfavorable
印格 + 印過多 + 財剋印 = favorable

食神制殺 ≠ 傷官剋殺 ≠ 傷官合殺

luck↔luck = weakened
luck↔natal = stopped

BranchPattern immutable
stopped + Root strengthened = stopped
RelationFact no intrinsic good/bad
numeric scoring 금지

7. 검증

npx tsc -b
npm run build
기존 검증 전체
npm run verify:judgment-p0