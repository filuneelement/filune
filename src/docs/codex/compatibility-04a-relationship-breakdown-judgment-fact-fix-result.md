# FILUNE Compatibility-04A Relationship Breakdown Judgment Fact Fix

**판정 · `COMPATIBILITY_C4A_POLICY_DECISION_REQUIRED`**

**Gap class · POLICY (`SOURCE_OR_POLICY_GAP`)**

C4의 원자료 스냅샷을 다시 실행했다. 원자료 07:3260–3276은 丁酉에 실제 이혼했고 卯酉 충이 이유 중 하나일 수 있다고 기록한다. 같은 사례는 甲이 丙을 생하는 원국 구조를 유리하게 설명한다. 허용된 Master에는 이 사례의 원국 지지 관계와 丁酉의 충을 배우자 기능 취약성 및 손상으로 확정하고 동일 경로로 연결하는 규칙이 없다.

## 丁酉 실제 경로

| 필드 | 관측값 |
|---|---|
| Natal vulnerability · Fact ID | 미발행 |
| Natal vulnerability · semantic | 辰卯 해와 午卯 파의 지지 관계가 관찰됨. 배우자 기능 취약 판정은 미확정 |
| Natal vulnerability · current/history state | 연간·시간의 丙 정재는 두 개의 `relationship_significator(partner)`로 확인됨. 대응 역할은 원국과 丁酉 모두 `active / operating` |
| 丁酉 interaction · relation | `clash` (卯酉) |
| 丁酉 interaction · source | 해당 운의 酉, `branch:luck:0` |
| 丁酉 interaction · target | 원국 일지 卯, `entity:["/chart/pillars/day/value/ganZhi","branch"]` |
| Spouse-function damage · Fact ID | 미발행 |
| Spouse-function damage · CurrentFunction | 丙 관련 관찰 경로 및 丁에 대한 甲→丁·癸→丁 관계는 `operating`이며 방향은 `deferred`, `policyId`는 null. 확인된 배우자 기능 약화·정지 또는 연결된 손상 경로가 없음 |
| Breakdown linkage · Fact IDs | 미발행. 충 관계 ID는 `relationship_change`가 참조 |

丁酉 interaction의 실제 Fact ID

```text
p0-branch-relation:["p0-scope:[\"source-3274\",\"[\\\"greatLuck\\\",\\\"source:0\\\",{\\\"kind\\\":\\\"unknown\\\",\\\"reason\\\":\\\"fixture\\\"},{\\\"kind\\\":\\\"unknown\\\",\\\"reason\\\":\\\"fixture\\\"}]\"]","clash","entity:[\"/chart/pillars/day/value/ganZhi\",\"branch\"]","branch:luck:0"]
```

Master 05 SG-030–032는 실제 손상 기능과 출처·대상 경로를 요구한다. Master 08 LK-141–142는 원국 일지와 운 지지의 충을 영향을 받는 영역에 연결한다. Master 09의 역할·현재 기능 계약과 Master 14의 기존 Relationship Outcome에서도 이 사례의 추가 손상 Fact를 확인할 수 없었다. Master 15·16은 기존에 확인된 원국 취약성과 현재 손상 경로를 읽도록 규정한다.

필요한 정책 결정은 **이 사례에서 어떤 공개 구조 근거로 원국 배우자 기능의 취약성과 丁酉의 실제 손상을 각각 확정하고, 동일한 배우자 기능으로 연결할 수 있는가**이다.

## Targeted 진단

| 사례 | 실제 결과 |
|---|---|
| 丁酉 | `relationship_change = confirmed`, `relationship_breakdown_risk = deferred` |
| 乙丑 + 甲辰 | `relationship_breakdown_risk = confirmed` 유지 |
| Clash-only | 변화 확정, 파탄 위험 발행 0 |
| Vulnerability-only | 원국 OFF-03의 실제 작동을 확인했고 추가 현재 손상이 없는 범위의 파탄 위험 발행 0 |
| 戊戌 / 戊申 | 戊戌 결혼 기회 및 戊申 결혼 기회·주의 유지 |

Targeted 진단은 기존 C4 fixture를 임시 실행에 재사용했다. 丁酉의 필수 연결 조건이 미충족이므로 C4 전체 재실행 및 그 이후 회귀는 이번 단계에서 유보했다.

- 변경 파일은 이 결과 문서 1건이다.
- Judgment 관련 외 의미 변경 0, C1·C2·C3 의미 변경 0, Personality·Money·Health·Relationship·Event Timing 실행 코드 변경 0.
- TypeScript, Build, `git diff --check` 통과.

[丁酉 원자료](../source/primary/07-사주풀이예시.md#L3274) · [C4 결과](compatibility-04-relationship-lifecycle-timing-result.md)
