# FILUNE P3-B 한국어 Renderer 역할 문구 보완 결과

## A. 수정 전후

**READY_FOR_MULTILINGUAL_PERSONALITY_RENDERER**

| 의미 판정 | 수정 전 | 수정 후 |
|---|---:|---:|
| UNSUPPORTED | 1 | 0 |
| 차단 PARTIAL_LOSS | 2 | 0 |
| OVERSTATEMENT | 0 | 0 |

기존 P3-B의 동일한 17개 fixture를 다시 렌더링했다. Personality와 Judgment 계산, Knowledge Registry 및 감사 당시 기록은 그대로 사용했다. [기존 감사](p3b-personality-renderer-ko-audit-result.md)

## B. 3건 상세

| 감사 항목 | Internal meaning | 기존 출력 문제 | 수정 출력 | 결과 |
|---|---|---|---|---|
| P3B-01 · F | 보호 대기. 필요할 때 보조할 수 있으며 현재 기능은 비활성 | 선택의 기준이라는 심리 의미 추가 | 받쳐 줄 필요가 생기면 배우고 가르치는 일에 마음을 두는 면이 다른 면이 제 역할을 하도록 받쳐 줄 수 있어. | PASS |
| P3B-02 · G | 평소의 유리한 발현과 조건부 방해가 공존 | 조건부 방해 대신 선택 기준을 설명 | 과감하게 시도하는 면은 평소에도 쓰여. 다만 다른 반응과 맞물리는 상황에서는 그 면이 다른 면을 드러내기 어렵게 할 수 있어. | PASS |
| P3B-03 · E | 역할 이력은 조건부이며 현재 기능은 `confirmed/operating` | 현재 작동을 가능성으로만 표현 | 요즘은 과감하게 시도하는 면이 다른 면을 드러내기 어렵게 하기도 해. | PASS |

확정된 현재 기능과 조건부 역할 이력을 각각 읽어 문체를 고른다. 보호 대기와 조건부 방해의 의미는 입력에 기록된 역할 맥락에서 읽고, 문장의 주체는 제공된 Fact에 근거한다. 대상 Fact가 없으면 역할 문장을 생략한다. [역할 문구 구현](../../lib/personality/render/ko/renderPersonalityKo.ts#L93)

나머지 14개 fixture 중 13개는 전체 출력 구조가 수정 전과 동일했다. H의 완화 경로와 다른 문장은 동일했고, 함께 존재하던 조건부 방해 문장 한 개에만 G와 동일한 보완이 적용됐다.

## C. Role operation coverage

| Operation | Confirmed | Contextual | Reduced | Inactive |
|---|---|---|---|---|
| supports_expression | 받침 명시 | 받침 가능성 | 제한적 받침 | 생략 |
| channels_expression | 방향 명시 | 방향의 가능성 | 제한적 방향 조정 | 생략 |
| restrains_expression | 누그러뜨리는 작용 | 누그러뜨릴 가능성 | 제한적 억제 | 생략 |
| distorts_expression | 방해 작용 | 방해 가능성 | 제한적 방해 | 생략 |
| protects_expression | 유지 기능 명시 | 보호 가능성 | 제한적 보호 | 생략 |
| resolves_tension | 긴장 완화 명시 | 완화 가능성 | 제한적 완화 | 생략 |
| contextualizes | N/A · 조건부 문구 유지 | 조건부 맥락 | 제한적·조건부 맥락 | 생략 |

추가 조합 검증은 7개 operation마다 confirmed, contextual, deferred, reduced, inactive를 적용했다. 해당 문장의 Fact·Modifier 근거와 대상 Fact 결여 시 생략도 확인했다. [회귀 스크립트](../../../scripts/verify-personality-renderer-ko-audit-p3b.mjs)

## D. Guardrails

| 항목 | 위반 |
|---|---:|
| 명리 용어, 내부 코드명, 한자 및 금지 호칭 | 0 |
| 사건·건강·배우자·궁합 예측 | 0 |
| 점수·확률·임의 강도 순위 | 0 |
| 근거 없는 역할 의미 및 문단 | 0 |
| 만료 효과의 현재 출력 | 0 |
| 조건부 의미를 확정으로 상향하거나 현재 효과를 원국에 포함 | 0 |
| 현재 확인된 기능을 가능성만으로 표현 | 0 |

## E. 회귀

| 검증 | 결과 |
|---|---|
| P2-A · P2-B · P2-C | PASS |
| P2-D · P2-E · P2-F | PASS |
| P2-G | PASS · 18/18 |
| P3-A | PASS · 16/16 |
| P3-B | PASS · 기존 17 fixture, 의미 차단 3건 및 조합 35/35 |
| Judgment | PASS · 35/35 |
| `npx tsc -b` | PASS |
| `npm run build` | PASS |

Judgment 회귀는 기존 명령이 참조하는 레거시 문서를 HEAD에서 복원한 임시 사본에서 실행했다. Judgment 소스와 fixture 변경은 0건이다.

## F. 남은 상태

- FAIL 0 · PARTIAL 0 · UNSUPPORTED 0 · OVERSTATEMENT 0
- DEFERRED · Prominence 판정 경계
- NOT_IMPLEMENTED · 이번 수정 범위 0
