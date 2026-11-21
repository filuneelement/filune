# FILUNE Compatibility-03 Personality Interaction

**판정 · `COMPATIBILITY_C3_POLICY_DECISION_REQUIRED`**

승인된 인성·식상 표현 규칙과 성격 상호작용을 구현했다. 남은 결정은 일반 출생 입력에서 인성 우세를 확인할 근거의 공급 방식이다. 검증된 근거를 전달하면 일반 출생 입력과 원자료 스냅샷에 같은 로직을 적용한다.

## 구현 범위

- 개인 표현 계층은 기존 Natal Personality와 Judgment를 읽는다. 인성 우세가 확정되면 식상 기능 억제와 표현 억제를 확정한다. 현재 표현은 원국과 별도로 기존 Judgment의 유효한 작용에서 회복, 강화, 유지 또는 근거 유보를 기록한다.
- 두 사람이 모두 원국에서 억제되면 상호 표현 억제와 대화 마찰을 확정한다. 한쪽의 억제가 확정되고 상대에게 해당 경로가 없으면 해당 방향의 표현 억제를 기록한다. 현재 양쪽 완화, 한쪽 부분 완화, 방향별 강화, 완화와 강화가 공존하는 상태를 보존한다.
- 개인 Personality와 Judgment 원본을 읽기 전용으로 사용한다. C1, C2, Judgment, Personality Engine, 고객 결과 및 Renderer의 기존 의미를 유지했다.

[개인 표현 투영](../../lib/reading/personalityResourceOutput.ts) · [Pair 정책](../../lib/compatibility/personalityInteraction.ts) · [Master 11](../rules/master/11-personality-master.md) · [Master 16](../rules/master/16-compatibility-spec.md)

## 검증

| Fixture | 결과 |
|---|---|
| C00-03 | 원문이 확인한 인성 우세를 기존 검증 근거 입력으로 전달했다. 양쪽 억제, 상호 표현 억제, 대화 마찰 확정 |
| 일반 BirthInput 2건 | 기존 Judgment 검증 근거와 함께 전달했을 때 상호 대화 마찰 확정 |
| 일반 BirthInput, 우세 검증 근거 없음 | 현행 우세 등급 유보 확인 |
| Current 회복 | 기존 Judgment의 인성 약화와 작동 중인 식상 통근 강화로 회복 확정. 원국 억제는 유지 |
| Current 악화 | 기존 Judgment의 인성 강화와 식상 정지로 악화 확정 |
| 한쪽 및 범위 경계 | 단방향 표현 억제와 부분 회복, 회복·악화 공존, 만료·시점 불일치의 유보 검증 |
| Identity 및 격리 | 실행 반복과 인자 순서 교환에서 동일 ID 및 결과. 중복, 고아 근거 및 입력 mutation 0 |

[Targeted verifier](../../../scripts/verify-compatibility-personality-c3.mjs) · [원자료 §13](../source/primary/07-사주풀이예시.md#L3322)

기존 회귀에서 Compatibility C1·C2, Judgment 35/35, Personality P2-G 및 KO·JA·EN Renderer가 통과했다. Money P4-I, Health P4-G, Relationship P4-E, Event Timing P4-N.1 배선 회귀도 통과했다. TypeScript, production build 및 `git diff --check`도 통과했다.

## 남은 정책 결정

- **Question** — 일반 출생 입력에서 검증된 인성 우세 근거를 어디서 제공할 것인가?
- **Observed Personality Facts** — 출현과 위치, 근거 목록은 존재한다. 현재 `resolveProminence`는 `no_grade_criteria`로 유보한다.
- **Existing FILUNE support** — Judgment는 이미 검증된 `resourceExcessEvidence`를 입력받는다. 일반 제품의 출생 입력에는 해당 근거 생성 또는 전달 경로가 없다.
- **Source support** — C00-03은 그 두 사람의 우세를 직접 확인한다. 사례는 일반 명식의 질적 우세 판정 기준을 제공하지 않는다.
- **Option A** — 상위 흐름이 별도로 검증한 사람별 인성 우세 근거를 기존 Judgment 입력에 전달한다.
- **Option B** — 현행 Personality/Judgment에서 자동 우세를 확정할 질적 조건을 별도로 승인하고 생산 경로를 연결한다.
- **Engine consequence** — 어느 경로든 C3 효과와 원자료 기대값은 유지된다. 출생 정보만 제공하는 일반 입력에서 근거가 확인되기까지 해당 효과만 유보된다.

[사용자 승인](compatibility-03-personality-interaction-decision.md) · [우세 판정](../../lib/personality/prominence/tenGodProminence.ts) · [Judgment 입력](../../lib/judgment/pipeline/internalReading.ts)
