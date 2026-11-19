# FILUNE P2-G 충돌 이력 보완 결과

## A. 수정 결과

| 항목 | 결과 |
|---|---|
| Conflict originScope | 현재 충돌에 필요한 마지막 운 Fact가 합류한 범위를 사용한다. 대운 丁巳와 월운 癸子의 충돌은 `month`에서 시작한다. |
| Conflict originPeriod | 참여 운 Fact 기간의 교집합을 기록한다. 시작은 가장 늦은 시작, 종료는 가장 이른 종료다. 원국 Fact는 기간을 제한하지 않는다. |
| Conflict expiry | 월운 종료 경계에서 현재 충돌이 해제되며 이력은 `currentlyEffective = false`, `expired = true`로 보존된다. 두 기간이 겹치지 않으면 현재 충돌이 생성되지 않는다. |
| Conflict inheritance | 같은 월운 안에서 일진을 평가하면 occurrence ID가 유지된다. 일진은 해당 ID를 상속하며 발생 이력이 추가되지 않는다. |
| Conflict reactivation | 별도의 월에 같은 Fact 조합이 다시 충돌하면 정의 ID는 유지되고 occurrence ID는 새로 생성된다. 과거 occurrence는 만료 상태로 남는다. |
| 독립 리딩 | 동일한 입력에서 이전 이력 유무에 따른 현재 Fact, 역할 modifier, 충돌 및 범위 표현의 차이가 없다. |

운 Fact 두 개가 참여한 충돌 이벤트는 양쪽 운 근거를 기록한다. 같은 Fact를 하위 범위에서도 지원할 경우 먼저 유효해진 근거를 사용한다. 역할 충돌의 현재 표시 여부는 기존 범위별 역할 투영에 따른다. Knowledge, Judgment, 戊午 provenance 및 Renderer 파일 변경은 0건이다. [충돌 이력 구현](../../lib/personality/current/currentPersonality.ts#L38)

기존 G-01에 대운·월운, 월운 만료, 일진 승계, 월운·일진, 세운·월운, 대운·세운, 원국·월운, 기간 불일치, 비연속 재발생과 독립 리딩 검증을 추가했다. 기간이 일부만 겹치는 별도 fixture로 종료일이 상위 범위의 이른 종료일로 제한되는 경우도 확인했다. [통합 검증](../../../scripts/verify-personality-engine-integration-p2g.mjs#L346)

## B. 회귀

| 검증 | 결과 |
|---|---|
| P2-A · P2-B · P2-C | PASS |
| P2-D · P2-E · P2-F | PASS |
| P2-G | PASS · 18/18 |
| Judgment | PASS · 35/35 |
| `npx tsc -b` | PASS |
| `npm run build` | PASS |

Judgment 회귀는 작업 트리에서 삭제 상태인 레거시 문서를 HEAD에서 복원한 임시 사본에서 실행했다. 임시 사본의 Judgment 소스는 현재 작업 트리와 동일하다.

## C. 상태

| 항목 | 결과 |
|---|---|
| 전체 판정 | READY_FOR_PERSONALITY_RENDERER |
| FAIL | 0 |
| PARTIAL | 0 |
| DEFERRED | Prominence 정성 등급 경계. 기존 SOURCE_GAP 및 戊午 SOURCE_CONFLICT 유지. |
| NOT_IMPLEMENTED | 이번 수정 범위 0 |

## D. Prominence

Prominence 변경 없음. 상태는 `deferred`이며 수치 임계값과 성격 점수를 도입하지 않았다.
