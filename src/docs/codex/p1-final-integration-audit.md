# FILUNE P1 전체 통합 감사

## A. 전체 판정

**P1_FIX_REQUIRED**

아홉 격의 정책 68개는 단독 조건으로 조회하면 각각 예상 정책 ID·방향·출처로 해석된다. 통합 실행에서는 정책 근거 충돌, 차단 경로의 재작동, 정책 상신의 정지 효과 누락을 재현했다. 기존 회귀 결과와 아래 계약 판정은 별개다.

감사 기준은 [01 격국](../rules/master/01-pattern-master.md), [02 비겁계](../rules/master/02-peer-rob-yangblade-master.md), [05 역할](../rules/master/05-sangshen-byeong-gueung-master.md), [06 정책](../rules/master/06-pattern-effect-policy.md), [07 정책 감사](../rules/master/07-pattern-effect-policy-audit.md), [08 운](../rules/master/08-luck-master.md), [09 엔진](../rules/master/09-engine-integration-spec.md), [10 구현 감사](../rules/master/10-implementation-audit.md)다. P1 레지스트리 전 항목을 정적으로 대조하고 합성 Fact 조회, 기존 회귀, 읽기 전용 통합 재현을 수행했다. 구현과 fixture 기대값은 감사의 편집 대상에서 제외했다.

## B. 계약 감사표

| 영역 | 상태 | 문제 | 수정 필요 |
|---|---|---|---|
| Policy ID·격·관계·기본 방향·필수 조건·근거 상태 | PASS | 68개 ID와 격/관계/정규화된 조건 집합 조합이 각각 유일하다. 68/68 단독 선택에서 예상 ID·방향·출처를 확인했다. [Registry](../../lib/judgment/core/patternPolicyRegistry.ts) · [검증과 조회](../../lib/judgment/core/policies.ts#L25) | — |
| 반전 조건·예외·우선순위 | PARTIAL | EX-041의 reversalConditions·exceptions가 명시된 데이터 계약이 없다. 반전은 별도 항목과 배열 순서 또는 luckScope 후처리로 표현한다. 전 등록 항목의 patternMode는 any, activeYongShenTypes는 빈 배열이며 핵심 기능 조건은 경로 증거 계산에 분산돼 있다. [EX-041](../rules/master/09-engine-integration-spec.md#L249) · [조회](../../lib/judgment/core/policies.ts#L42) · [후처리](../../lib/judgment/core/luckScope.ts#L126) | 반전·예외 및 중첩 시 적용 근거를 계약으로 명시하고 검증한다. |
| 정책 충돌 | FAIL | **F1.** 칠살격 印奪食에서 식신의 과도·필수 근거가 공존하면 반대 방향 두 정책이 같은 Fact에 적용 가능하다. 현재 배열 순서로 favorable_candidate를 선택한다. [조건 계산](../../lib/judgment/core/patternPolicyEvidence.ts#L108) · [first match](../../lib/judgment/core/policies.ts#L62) | 상충 근거 배제·보류 또는 승인된 우선순위를 명시한다. |
| 財剋印·식신제살·상관합살·재생살 교차 검증 | PARTIAL | 財剋印과 식신제살 통과. 상관합살의 양인 분기는 유효합 가정에서 통과하며 정상 간지 명식에서는 도달 불가다. 재생살은 대상 기능과 실제 지원 근거에 따라 분기한다. §E 참조. | 양인격 유효합 도달 조건을 master와 대조한다. |
| RoleHistory / CurrentState / CurrentFunction | PASS | roleEngine의 역사와 현재 투영이 분리되고 정지된 병의 이력이 남는다. 기존 P0 역할 투영도 유지된다. [Role Engine](../../lib/judgment/core/roleEngine.ts#L61) · [ROLE-T5](../../../scripts/verify-judgment-p1-3.mjs#L243) | — |
| 역할의 비배타성 | PASS | 동일 재성의 용신과 조건부 병, 유리한 현재 기능을 동시에 확인했다. 키는 역할 종류·개체·경로별로 독립된다. 동일 개체 용신+병, 용신+상신의 개별 종단 단언은 별도 가치가 있다. [ROLE-T1](../../../scripts/verify-judgment-p1-3.mjs#L197) | — |
| 상신 supporting path | PARTIAL | 정책 상신은 실제 작동 중인 관계 및 해당 개체의 통근을 확인한다. 일반 활성 상신에는 actor/action/target을 찾는 참조가 있지만, 보호되는 기능을 명시하는 protectedFunction 필드는 대기 상신에만 있다. [정책 역할](../../lib/judgment/core/patternRoles.ts#L48) · [이력 계약](../../lib/judgment/core/roleEngine.ts#L14) | 활성 상신 경로에 보호 기능과 그 근거를 명시한다. |
| Protective Standby | PARTIAL | 정관을 보호하는 원국 인성의 상관 제어에 대해 대기→활성을 검증했다. 대기 상태에서 병을 만들지 않는다. 일반화된 대기 위협의 근거·활성화 계약은 확인되지 않았다. [자동 식별·활성화](../../lib/judgment/core/roleEngine.ts#L111) · [ROLE-T3](../../../scripts/verify-judgment-p1-3.mjs#L211) | 지원 범위를 명시하고, 다른 대기 경로는 master 근거가 마련된 경우에 확장한다. |
| 병 경로·No-Byeong·조건부 병 | PASS | 정책 병 경로는 source/action/target/damagedFunction/structuralConsequence를 보존한다. none·conditional·confirmed·deferred 상태가 있다. 식상생재의 현재 기능과 미래 재생살 조건을 유지한다. [병 경로](../../lib/judgment/core/patternRoles.ts#L10) · [상태 종합](../../lib/judgment/core/roleEngine.ts#L150) | — |
| 구응 대상 및 상태 | PASS | targetByeongId가 실제 경로에 존재할 때 기록한다. 병 없음은 not_applicable이고 병이 남고 해결자 없으면 none이다. [구응 검사](../../lib/judgment/core/roleEngine.ts#L163) · [ROLE-T2/T4](../../../scripts/verify-judgment-p1-3.mjs#L206) | — |
| 운 역할 금지 및 LuckEffect | FAIL | **F3.** 13개 타입의 발행 분기는 존재한다. 운 글자에 새 원국 역할을 만들지 않는 경로와 병 해소는 통과한다. 그러나 정책으로 생성된 활성 상신이 운에서 합거되어도 정지 scope에 weakens_sangshen이 빠진다. [효과 결합](../../lib/judgment/core/luckScope.ts#L190) · [레거시 효과 분기](../../lib/judgment/core/luckEffects.ts#L101) · [P1 대기 상신 효과](../../lib/judgment/core/roleEngine.ts#L131) | P1 정책 역할의 상태 전이를 실제 LuckEffect 입력에 연결한다. |
| 상위 효과의 이력·현재 작동 분리 | FAIL | **F2.** 합거 이력과 지속 효과는 유지하며 기존 회귀에서 새 공식이나 해소 이벤트를 반복하지 않는다. 다만 월운 일반 비교 범위 밖으로 이관되는 차단된 재생살은 차단 근거를 보존하면서 현재 작동을 operating으로 되돌린다. [재평가 경로](../../lib/judgment/core/luckScope.ts#L149) · [합거 효과 이력](../../lib/judgment/core/combineHistory.ts#L32) | 승계 경로를 Runtime뿐 아니라 차단·보호·조절 근거로도 재평가한다. |
| active/weakened/stopped, stopped + Root | PASS | 약화 source는 관계에 참여하고 생·극의 현재 기능이 reduced다. 정지 source도 관찰 Fact는 보존되지만 현재 기능은 inactive다. Root 강화로 정지는 풀리지 않는다. [Runtime 적용](../../lib/judgment/core/policies.ts#L72) · [정지와 Root](../../../scripts/verify-judgment-p0.mjs#L85) · [생·극](../../../scripts/verify-judgment-p0.mjs#L155) | — |
| 겸격 유정·무정 | PASS | 실제 위치가 다른 두 참여자의 Fact, 실제 작동, Root, 유효 합거와 두 유효 투출을 확인한다. 관계가 없거나 근거 부족은 deferred다. [구현](../../lib/judgment/core/pattern.ts#L54) · [P0 회귀](../../../scripts/verify-judgment-p0.mjs#L133) | — |
| PatternContext·scope 스냅샷 | PASS | 원국 BranchPattern과 투출 이력을 승계하고 가안→Runtime→유효 투출·격 모드·관계 순으로 확정한다. 독립 동결 스냅샷과 별도 FormationBranchPool을 검증했다. [scope](../../lib/judgment/core/luckScope.ts#L95) · [P0](../../../scripts/verify-judgment-p0.mjs#L24) | — |
| 운 천간합 우선순위·일간 예외 | PASS | 운↔운 선처리·양쪽 weakened·원국 재합 차단·잔여 운↔원국 stopped를 확인했다. 대운>세운, 세운>월운, 월운>일진의 resolver 경쟁 단언과 일간합 예외를 확인했다. [resolver](../../lib/judgment/core/stems.ts#L30) · [P0](../../../scripts/verify-judgment-p0.mjs#L170) | — |
| 저수준 직접 입력 유효기간 | PARTIAL | 직접 호출에 기준시각이 지난 대운을 넘기면 합거 이벤트의 currentlyEffective는 false인데 두 참여자의 Runtime은 stopped다. 일반 reading은 기준시각의 활성 기간을 선별한다. [일반 진입점](../../lib/judgment/pipeline/internalReading.ts#L242) · [효과 유효성](../../lib/judgment/core/combineHistory.ts#L38) | 직접 코어 입력도 기준시각과 기간을 검증하거나 필터링 계약을 명시한다. |
| 양인·비견·겁재 자격 | PASS | 양인 네 조합과 戊午 제외, 칠살>정관>재성 및 식상 보조. 비견의 칠살 주용신 제외와 겁재의 허용·절대 순위 보류를 확인했다. [월령](../../lib/judgment/core/pattern.ts#L10) · [자격](../../lib/judgment/core/peerPatterns.ts#L9) · [P1-3](../../../scripts/verify-judgment-p1-3.mjs#L68) | — |
| Fact purity·숫자 scoring | PASS | 일반·복합·월지 관계 Fact에 고유 길흉 필드가 없다. src/lib/judgment 전역에서 지정된 점수 식별자가 없었고 score 검색은 주석만 적중했다. 순서·길이·기간 연산은 정책 방향을 합산하지 않는다. [Fact 스키마](../../lib/judgment/contracts/relationFact.ts#L24) · [StemFact](../../lib/judgment/core/types.ts#L49) | — |

### 읽기 전용 재현

- **F1 정책 충돌.** 甲일·申월 庚, 원국 丙 식신·壬 인성. 丙에 excessive_food_control과 key_food_control, 庚에 insufficient_killing을 함께 공급했다. 두 조건이 모두 실제 조건 집합에 들어갔고 壬→극→丙에 KILL-04 favorable_candidate가 선택됐다. 반대 분기 KILL-04-required-food는 unfavorable다.
- **F2 차단된 경로 재작동.** 甲일·巳월 丙, 원국 戊, 대운 庚, 세운 壬, 월운 丁. 대운의 戊→생→庚에 blocked_wealth_feed를 주고 해당 경로를 직접 역할 기능 근거로 연결했다. 원국→대운→세운→월운 역할 기능은 deferred→inactive→inactive→operating이었다. 월운 승계 작동의 resolutionEvidence에는 여전히 blocked_wealth_feed가 남는다.
- **F3 정지된 정책 상신의 운 효과 누락.** 甲일·酉월 辛, 원국 丁傷官·壬印. 壬의 OFF-02 보호가 원국에 작동한다. 丁 대운이 壬과 합거한 뒤 normalized 역할 이력은 유지되고 대운·세운 모두 stopped/inactive지만, 발단인 대운에도 weakens_sangshen이 없다.
- **직접 입력 기간.** 乙일 원국 辛, 대운 丙의 유효기간이 7월 1일 끝나는 입력에 8월 1일 기준시각을 지정했다. 대운 합거의 현재 효과는 false로 계산되지만 세운에서도 원국 辛은 stopped다.

## C. 격별 Registry

PASS는 단독 선택과 근거 보존이 확인된 등록 항목에서 재현된 통합 충돌에 연루된 항목을 제외한 수다. deferred 열은 아예 기본값이 deferred인 등록 행의 수다. 조건부 등록은 필수 근거가 빠질 때 후보가 탈락할 수 있는 행이며, 실제 명식에서의 deferred 건수와 다르다.

| 격 | Policy 수 | PASS | deferred | 충돌 | 조건부 등록 | FILUNE override |
|---|---:|---:|---:|---:|---:|---:|
| 正官 | 7 | 7 | 0 | 0 | 5 | 0 |
| 七殺 | 10 | 8 | 0 | 1 | 9 | 0 |
| 財 | 9 | 9 | 0 | 0 | 4 | 1 |
| 印 | 9 | 9 | 0 | 0 | 6 | 0 |
| 食神 | 8 | 8 | 0 | 0 | 6 | 0 |
| 傷官 | 9 | 9 | 0 | 0 | 7 | 0 |
| 比肩 | 4 | 4 | 0 | 0 | 3 | 0 |
| 劫財 | 6 | 6 | 0 | 0 | 5 | 1 |
| 羊刃 | 6 | 6 | 0 | 0 | 5 | 0 |
| **합계** | **68** | **66** | **0** | **1** | **50** | **2** |

충돌 열은 충돌 쌍 수다. 印多用財와 일반 財剋印은 문서에 명시된 정상 우선 적용이며 충돌에 포함하지 않았다. 官殺混雜과 去殺留官/去官留殺은 Runtime이 각각 활성 공존 또는 합거된 상태를 요구한다. 傷官合殺의 harmful/necessary 분기와 七殺·劫財의 財生殺 반대 분기는 조건 생성에서 필요/해로움이 함께 선택되지 않게 한다. 격별 주용신 자격 override와 양인 인정 범위는 정책 행과 별도 출력이다. 양인 BLADE-06의 PASS는 합성 조건 선택에 한정한다.

## D. Role Engine

생성 경로 수는 공개 roleEngine으로 들어가는 정규화 경로 수다. GuEung은 그 아래 실제 후보 생성 3개 분기를 표시한다. 테스트 수는 P1 명명 사례에서 해당 출력이나 역할 관련 조건을 직접 확인한 수다. P0 묶음과 읽기 전용 재현은 별도로 표시한다.

| Role | 상태 | 핵심 테스트 | 문제 |
|---|---|---|---|
| YongShen | PASS | P1-2 RES-T2, P1-3 PEER-T3/T4·ROB-T5·BLADE-T3·ROLE-T1 | 격별 자격 및 현재 투출의 투영을 확인했다. |
| SangShen | PARTIAL | P1-1 OFF-T3·KILL-T1/T4·WEALTH-T3, P1-2 RES-T2/T4/T6·FOOD-T1/T8·HO-T1/T3, P1-3 PEER-T1 | 일반 상신의 protectedFunction이 명시되지 않는다. |
| Protective Standby | PARTIAL | P1-3 ROLE-T3 | 정관 보호에 대한 대기·활성은 확인했다. 기타 보호 경로에 대한 자동 식별은 확인되지 않았다. |
| Byeong | PASS | P1-1 OFF-T2/T4·WEALTH-T1/T4/T7, P1-2 RES-T3/T7·FOOD-T3/T7, P1-3 ROLE-T2/T5 | 경로 요건, 무병 및 합거 이후 이력을 확인했다. F2는 해당 역할의 승계 작동을 별도로 판정했다. |
| ConditionalByeong | PASS | P1-1 WEALTH-T8, P1-2 FOOD-T8, P1-3 PEER-T6·ROLE-T1/T4 | 원국의 유리 경로, 미래 재생살 활성과 구응 상태를 확인했다. |
| GuEung | PASS | P1-1 WEALTH-T7/T9, P1-2 RES-T3·FOOD-T4/T8·HO-T5, P1-3 BLADE-T6·ROLE-T2/T4 | targetByeongId 대응, 해결자 없는 병, 운의 원국 구응 미생성을 확인했다. |
| LuckEffect | FAIL | P0 운 효과 묶음, P1-1 OFF-T3·WEALTH-T7/T8, P1-2 FOOD-T8, P1-3 PEER-T6·ROLE-T3/T6 | 13종 발행기를 읽기 전용 합성 입력에서 확인했다. 통합 정책 상신 정지의 F3는 재현된다. |

| Role | 생성 경로 수 | 테스트 수 | 미검증 경로 |
|---|---:|---:|---|
| YongShen | 3 | 6 | legacy 수입과 격 발현의 중복 표현, 동일 개체 용신+병/상신 종단 사례 |
| SangShen | 2 | 12 | 일반 활성 상신의 protectedFunction 및 정지 시 정규화 효과 |
| Protective Standby | 1 | 1 | 정관-인성-상관 이외 유형, 대기 후 활성 상태에서의 정지·약화 |
| Byeong | 2 | 36 | 복수 병의 동시 약화·해소, 일반 범위에서 사라지는 차단 경로 |
| ConditionalByeong | 2 입력 계열 | 5 | 여러 보호 및 병 경로가 동시에 발생할 때의 귀속 |
| GuEung | 3 | 9 | 원국 해결자가 이후 운에서 상실되는 다양한 경우 |
| LuckEffect | 13 타입 | P1 명명 사례 7 + P0 묶음 | 직접 자동 긍정 단언은 5개 타입이다. 나머지 8개는 읽기 전용 발행기 재현까지 확인했다. |

직접 자동 긍정 단언 5개는 manifests_yongshen, changes_pattern_mode, activates_byeong, relieves_byeong, activates_sangshen_function이다. 나머지 8개인 strengthens_byeong, weakens_byeong, attacks_yongshen, protects_yongshen, weakens_sangshen, changes_root_state, changes_capacity, changes_formation은 발행기 분기 재현과 scope 종단 보장을 구분했다. [발행기](../../lib/judgment/core/luckEffects.ts#L58)

## E. Cross-pattern

- **財剋印: PASS.** 財格 favorable, 印格 unfavorable, 印過多 favorable, 食神格+偏印奪食 favorable, 傷官格+必要印 unfavorable. [독립 회귀](../../../scripts/verify-judgment-p1-3.mjs#L261)
- **七殺 control: PASS.** 칠살격·해로운 칠살의 재격·식신격에서 食神制殺은 favorable이고 필요한 칠살의 양인격은 unfavorable_candidate다. control은 칠살 Runtime을 자동 정지시키지 않는다. 食神制殺, 傷官剋殺, 傷官合殺은 각각 별도 공식이다. [교차 회귀](../../../scripts/verify-judgment-p1-3.mjs#L278) · [공식 분기](../../lib/judgment/core/stems.ts#L64)
- **傷官合殺: PARTIAL.** 정관격 혼입 칠살, 재격 해로운 칠살, 상관격 해로운 칠살의 실제 유효합에서 favorable. 필요한 칠살의 양인격은 합성 유효합 계약에서 unfavorable다. 네 양인 일간의 상관/칠살 쌍 丁/庚, 己/壬, 癸/丙, 乙/戊에 오합은 없으므로 네 번째 행의 정상 명식 종단 단언은 성립하지 않는다. [교차 회귀](../../../scripts/verify-judgment-p1-3.mjs#L291) · [도달성 검증](../../../scripts/verify-judgment-p1-3.mjs#L173)
- **財生殺: PASS.** 칠살격 필요·부족 favorable_candidate/해로움 unfavorable, 재격 해로움 unfavorable_candidate, 비견격 실질 강화 unfavorable, 겁재격 필요 favorable_candidate, 양인격 필요 favorable_candidate. [칠살격 회귀](../../../scripts/verify-judgment-p1-1.mjs#L89) · [재격 회귀](../../../scripts/verify-judgment-p1-1.mjs#L152) · [비견·겁재·양인 회귀](../../../scripts/verify-judgment-p1-3.mjs#L78)

## F. 남은 deferred

Registry에는 직접 deferred로 등록된 행이 없다. 매칭 실패는 정책 ID가 없는 DEFERRED 결과다. 아래는 명시 보류와 현재 근거 조건별 경로의 목록이며, 개별 등록 행의 정확한 조건 토큰은 부록에 있다.

| rule·경로 | 부족 evidence 또는 보류 이유 | 판정 가능 조건 |
|---|---|---|
| OFF-02·04 | 정관 보호 경로와 인성의 필요성 | 실제 傷官剋官, 유효한 印制傷官, 필수 보호 경로를 공격하는 유효 財剋印을 각각 확인 |
| OFF-05·06·07, KILL-06·07 | 혼입 영향, 유효합·유지 대상 | 중심 관살과 혼입의 실제 경로, 현재 활성 또는 필요한 제거·유지 상태 확인 |
| KILL-02·03·04, RES-03·06·07·08·09 | 과도 제어·칠살 부족, 인성 연결·필요성, 인경재중, 필요한 식상 | 정성 상태의 신뢰 가능한 근거와 관련 생극 경로. KILL-02 근거가 없으면 일반 KILL-01로 유지. KILL-04의 상충 근거는 F1 해소 필요 |
| KILL-05·08, WEALTH-06~09, HO-04·05, PEER-05·ROB-05 | 칠살 해로움·과다·필요·부족과 실제 보강/제어/유효합 | 같은 칠살 개체에 대한 정성 근거와 동작 중인 생극 또는 유효합. 유효 상관합살의 방향이 미정이면 현재 HO-05 context_dependent |
| 印多用財 | 印過多 정성 근거 | 대상 인격의 과다 근거와 실제 財剋印. 확인 전에는 일반 인격 분기 |
| FOOD-03·04·05·06·07·08 | 제살 중 재생살, 위치 차단, 핵심 식신 손상, 식신 과다, 설기 Capacity | 동일 칠살 경로 확인, 차단 증거 또는 관계 부재 확인, 편인 공격 및 재의 제어, 관련 Capacity의 확인된 입력 |
| HO-02·06·07 | 상관 조절의 필요성 및 인성 보호 기능 | 같은 실제 印制傷官과 해당 복합 경로 및 필요한 기능 근거 확인 |
| PEER-01·03·06, ROB-01·02·03·04 | 초과 비겁의 제어 필요, 실제 통관, 재가 해로운 예외, 칠살 부담 | 재 손상 또는 비겁 문제, 살아 있는 두 통관 연결, 재 자체 역할, 칠살의 Root 및 정성 Capacity 확인 |
| BLADE-01·03·04·05·06 | 필요한 칠살·관의 월지 제어, 과다/감당력 및 유효 합거 | 개체별 필요성, 실제 월지 제어, 정성 Capacity와 유효합의 조건 충족. BLADE-06 정상 명식 도달성 제한은 §E 참조 |
| BLADE-07 印增刃勢 | 상반된 구조 가능성, 범용 방향 미승인 | 印의 실제 刃 증세와 보호/인화 경로를 구별할 명시적인 master 실행 조건 |
| 겁재 절대 순위, 겸격 전 조합별 정책 | PA-1300 및 BG-045의 승인 보류 | 구체적 구조와 승인된 순위/정책 근거를 확보한 경우 |
| 중기·여기 정밀 강도, 傷官制殺 명칭 범용화 | PA-1300의 승인 보류 | 현 동순위·분리 공식 사용 유지. 새로운 명확한 master 규정이 생긴 경우에만 판정 범위 조정 |

68개 단독 조회에서는 충분한 조건이 주어진데도 deferred로 누락되는 행이 없었다. 다만 재 자체가 해롭다는 근거의 PEER-06/ROB-03은 조회 후 방향을 deferred로 둔다. 자동으로 유리하다고 간주하기보다 대체 기능의 근거를 요구하는 보수 처리다. 승계 중 차단이 사라지는 F2 및 조건 충돌 F1은 승인된 보류와 별도로 관리해야 한다.

## G. 검증

| 검증 | 결과 |
|---|---|
| npx tsc -b | PASS |
| npm run build | PASS |
| 기존 회귀 | 40/40 |
| P0 | PASS |
| P1-1 | 23/23 |
| P1-2 | 25/25 |
| P1-3 | 30/30 |

등록 검증 명령 44개와 타입 검사·빌드까지 총 46/46 실행 통과. 12개월 월운 창 회귀도 통과했다. 옮겨진 권위 문서가 필요한 검증은 기존 경로에 임시 링크를 연결해 실행했으며 이후 링크를 제거했다. 구현 코드, master 및 기존 fixture 기대값은 이번 감사에서 편집하지 않았다.

## H. 최종 남은 항목

- **FAIL 3건** — F1 칠살격 반대 조건 충돌, F2 차단 경로의 승계 후 재작동, F3 정책 상신 정지 효과 발행 누락.
- **PARTIAL** — 반전·예외 메타데이터와 우선순위 계약, 활성 상신 보호기능과 대기 자동 식별 범위, 기준시각 직접 입력 검증, 양인 합살 정상 명식 도달성, 운 효과 8종의 종단 회귀 및 §F의 승인된 보류.
- **NOT_IMPLEMENTED** — 별도 필수 정책의 전면 부재는 확인되지 않았다. EX-041의 명시적 반전·예외 데이터 및 검증 계약은 부분 구현으로 분류했다.

## 부록. 등록 68개 전수 조회

조건 집합을 개별 공급한 합성 Fact 조회 결과다. F1에 연루된 두 항목도 단독 선택은 통과한다.

### 正官

| Policy ID | Relation type | 기본 방향 | 필수 조건 | 근거 및 조회 |
|---|---|---|---|---|
| OFF-01 | WealthGeneratesOfficer | favorable | — | PA-100 · SOURCE_EXPLICIT · PASS |
| OFF-02 | ResourceControlsHurting | favorable | protects_officer | PA-101 · SOURCE_EXPLICIT · PASS |
| OFF-03 | HurtingControlsOfficer | unfavorable | — | PA-102 · SOURCE_EXPLICIT · PASS |
| OFF-04 | WealthControlsResource | unfavorable | necessary_protector | PA-103 · SOURCE_EXPLICIT · PASS |
| OFF-06 | OfficerKilling | favorable | killing_removed | PA-105 · SOURCE_EXPLICIT · PASS |
| OFF-05 | OfficerKilling | unfavorable_candidate | mixed | PA-104 · SOURCE_EXPLICIT · PASS |
| OFF-07 | HurtingCombinesKilling | favorable | mixed_killing_combined | PA-106 · SOURCE_EXPLICIT · PASS |

### 七殺

| Policy ID | Relation type | 기본 방향 | 필수 조건 | 근거 및 조회 |
|---|---|---|---|---|
| KILL-02 | FoodControlsKilling | context_dependent | excessive_food_control | PA-201 · SOURCE_EXPLICIT · PASS |
| KILL-01 | FoodControlsKilling | favorable | — | PA-200 · SOURCE_EXPLICIT · PASS |
| KILL-03 | KillingGeneratesResource | favorable_candidate | needed_resource_chain | PA-202 · SOURCE_EXPLICIT · PASS |
| KILL-04 | ResourceControlsFood | favorable_candidate | excessive_food_control | PA-203 · SOURCE_EXPLICIT · PASS |
| KILL-04-required-food | ResourceControlsFood | unfavorable | key_food_control | PA-203 · SOURCE_EXPLICIT · PASS |
| KILL-05 | WealthGeneratesKilling | unfavorable | harmful_killing | PA-204 · SOURCE_EXPLICIT · PASS |
| KILL-05-needed-killing | WealthGeneratesKilling | favorable_candidate | needed_insufficient_killing | PA-204 · SOURCE_EXPLICIT · PASS |
| KILL-07 | OfficerKilling | favorable | officer_removed | PA-206 · SOURCE_EXPLICIT · PASS |
| KILL-06 | OfficerKilling | unfavorable_candidate | mixed | PA-205 · SOURCE_EXPLICIT · PASS |
| KILL-08 | HurtingControlsKilling | favorable_candidate | harmful_killing | PA-207 · SOURCE_EXPLICIT · PASS |

### 財

| Policy ID | Relation type | 기본 방향 | 필수 조건 | 근거 및 조회 |
|---|---|---|---|---|
| WEALTH-01 | FoodGeneratesWealth | favorable | — | PA-301 · SOURCE_EXPLICIT · PASS |
| WEALTH-02 | WealthGeneratesOfficer | favorable | — | PA-302 · SOURCE_EXPLICIT · PASS |
| WEALTH-03 | WealthResource | favorable | — | PA-303 · SOURCE_EXPLICIT · PASS |
| WEALTH-04 | WealthControlsResource | favorable | — | EX-043 · FILUNE_APPROVED_OVERRIDE · PASS |
| WEALTH-05 | PeerControlsWealth | unfavorable_candidate | — | PA-308 · SOURCE_EXPLICIT · PASS |
| WEALTH-06 | WealthGeneratesKilling | unfavorable_candidate | harmful_killing | PA-309 · SOURCE_EXPLICIT · PASS |
| WEALTH-07 | FoodControlsKilling | favorable | controls_wealth_generated_killing | PA-310 · SOURCE_EXPLICIT · PASS |
| WEALTH-08 | HurtingControlsKilling | favorable | controls_wealth_generated_killing | PA-312 · SOURCE_EXPLICIT · PASS |
| WEALTH-09 | HurtingCombinesKilling | favorable | combines_wealth_generated_killing | PA-311 · SOURCE_EXPLICIT · PASS |

### 印

| Policy ID | Relation type | 기본 방향 | 필수 조건 | 근거 및 조회 |
|---|---|---|---|---|
| resource-excess-uses-wealth | WealthControlsResource | favorable | resource_excessive | EX-046 · SOURCE_EXPLICIT · PASS |
| RES-01 | ResourceGeneratesDay | favorable | — | PA-401 · SOURCE_EXPLICIT · PASS |
| RES-02 | OfficerGeneratesResource | favorable | — | PA-402 · SOURCE_EXPLICIT · PASS |
| RES-03 | KillingGeneratesResource | favorable_candidate | needed_resource_chain | PA-403 · SOURCE_EXPLICIT · PASS |
| RES-06 | WealthControlsResource | unfavorable | weak_resource_strong_wealth | PA-407 · SOURCE_EXPLICIT · PASS |
| RES-07 | DayGeneratesOutput | favorable_candidate | excessive_resource_and_day | PA-408 · SOURCE_EXPLICIT · PASS |
| RES-08 | ResourceControlsOutput | unfavorable | necessary_output | PP-406 · SOURCE_EXPLICIT · PASS |
| RES-09 | WealthGeneratesKilling | unfavorable_candidate | disrupts_resource_chain | PA-410 · SOURCE_EXPLICIT · PASS |
| wealth-controls-resource-in-resource | WealthControlsResource | unfavorable | — | EX-045 · SOURCE_EXPLICIT · PASS |

### 食神

| Policy ID | Relation type | 기본 방향 | 필수 조건 | 근거 및 조회 |
|---|---|---|---|---|
| food-god-wealth-protects-output | WealthControlsResource | favorable | resource_attacks_food_god | EX-047 · SOURCE_EXPLICIT · PASS |
| FOOD-04 | FoodGeneratesWealth | favorable | food_coexisting_paths | PA-503 · SOURCE_EXPLICIT · PASS |
| FOOD-01 | FoodGeneratesWealth | favorable | — | PA-500 · SOURCE_EXPLICIT · PASS |
| FOOD-02 | FoodControlsKilling | favorable | — | PA-501 · SOURCE_EXPLICIT · PASS |
| FOOD-03 | WealthGeneratesKilling | unfavorable_candidate | controlled_killing | PA-502 · SOURCE_EXPLICIT · PASS |
| FOOD-07 | ResourceControlsFood | favorable_candidate | excessive_food | PA-506 · SOURCE_EXPLICIT · PASS |
| FOOD-05 | IndirectResourceControlsFood | unfavorable | core_food | PA-504 · SOURCE_EXPLICIT · PASS |
| FOOD-08 | DayGeneratesFood | unfavorable_candidate | insufficient_output_capacity | PP-507 · SOURCE_EXPLICIT · PASS |

### 傷官

| Policy ID | Relation type | 기본 방향 | 필수 조건 | 근거 및 조회 |
|---|---|---|---|---|
| HO-01 | HurtingGeneratesWealth | favorable | — | PA-600 · SOURCE_EXPLICIT · PASS |
| HO-02 | ResourceControlsHurting | favorable_candidate | necessary_hurting_regulation | PA-601 · SOURCE_EXPLICIT · PASS |
| HO-03 | HurtingControlsOfficer | unfavorable_candidate | — | PA-602 · SOURCE_EXPLICIT · PASS |
| HO-04 | HurtingControlsKilling | favorable_candidate | harmful_killing | PA-603 · SOURCE_EXPLICIT · PASS |
| HO-05-harmful | HurtingCombinesKilling | favorable | valid_harmful_combine | PA-604 · SOURCE_EXPLICIT · PASS |
| HO-05-needed | HurtingCombinesKilling | unfavorable | valid_necessary_combine | PA-604 · SOURCE_EXPLICIT · PASS |
| HO-05 | HurtingCombinesKilling | context_dependent | valid_combine | PA-604 · SOURCE_EXPLICIT · PASS |
| HO-06 | WealthControlsResource | unfavorable | necessary_hurting_resource | PA-605 · SOURCE_EXPLICIT · PASS |
| HO-07 | KillingGeneratesResource | favorable_candidate | hurting_resource_killing_chain | PP-607 · SOURCE_EXPLICIT · PASS |

### 比肩

| Policy ID | Relation type | 기본 방향 | 필수 조건 | 근거 및 조회 |
|---|---|---|---|---|
| PEER-01 | OfficerControlsPeer | favorable | peer_needs_control | PP-701 · SOURCE_EXPLICIT · PASS |
| PEER-03 | OutputGeneratesWealth | favorable_auxiliary | output_bridge | PA-701 · SOURCE_EXPLICIT · PASS |
| PEER-05 | WealthGeneratesKilling | unfavorable | material_harmful_feed | PA-702 · SOURCE_EXPLICIT · PASS |
| PEER-06 | PeerOnlyControlsWealth | unfavorable_candidate | — | BG-034 · SOURCE_EXPLICIT · PASS |

### 劫財

| Policy ID | Relation type | 기본 방향 | 필수 조건 | 근거 및 조회 |
|---|---|---|---|---|
| ROB-01 | OfficerControlsRob | favorable | rob_needs_control | PP-801 · SOURCE_EXPLICIT · PASS |
| ROB-02 | KillingControlsRob | favorable_candidate | rob_needs_control, safe_killing_control | PA-801 · FILUNE_APPROVED_OVERRIDE · PASS |
| ROB-03 | RobControlsWealth | unfavorable_candidate | — | PA-802 · SOURCE_EXPLICIT · PASS |
| ROB-04 | OutputGeneratesWealth | favorable_auxiliary | output_bridge | PP-803 · SOURCE_EXPLICIT · PASS |
| ROB-05 | WealthGeneratesKilling | favorable_candidate | feeds_needed_rob_killing | BG-044 · SOURCE_EXPLICIT · PASS |
| ROB-05-harmful | WealthGeneratesKilling | unfavorable_candidate | material_harmful_feed | BG-044 · SOURCE_EXPLICIT · PASS |

### 羊刃

| Policy ID | Relation type | 기본 방향 | 필수 조건 | 근거 및 조회 |
|---|---|---|---|---|
| BLADE-01 | KillingControlsBlade | favorable_priority | safe_needed_blade_killing | PA-900 · SOURCE_EXPLICIT · PASS |
| BLADE-02 | OfficerControlsBlade | favorable | — | PA-901 · SOURCE_EXPLICIT · PASS |
| BLADE-03 | WealthFeedsController | favorable_candidate | feeds_blade_controller | PP-903 · SOURCE_EXPLICIT · PASS |
| BLADE-04 | FoodControlsKilling | unfavorable_candidate | attacks_needed_blade_killing | PA-903 · SOURCE_EXPLICIT · PASS |
| BLADE-05 | HurtingControlsKilling | unfavorable_candidate | attacks_needed_blade_killing | BG-084 · SOURCE_EXPLICIT · PASS |
| BLADE-06 | HurtingCombinesKilling | unfavorable | combines_needed_blade_killing | PA-904 · SOURCE_INFERENCE · PASS |
