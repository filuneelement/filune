# FILUNE Compatibility-03 Personality Interaction

**판정 · `COMPATIBILITY_PERSONALITY_INTERACTION_READY`**

`readBirthCompatibility`는 두 사람의 출생 정보로 Judgment와 Natal Personality를 평가한다. RD-01·RD-02가 확정되면 각자의 원국 인성 우세, 식상 억제, 표현 억제를 생성한다. 양쪽에서 확정되면 상호 표현 억제와 대화 마찰을 확정한다.

`ResourceDominanceFact`는 인성 본기 자리, 원래 정인·편인 출현, Judgment 통근·천간 관계·Formation 및 범위 ID를 보존한다. RD-02의 약화된 천간은 통근 근거를 보존하며 실제 작동 여부를 Judgment에서 확인한다. 전체 십성 `TenGodProminence` 계약은 독립적으로 유지된다.

현재 표현은 원국 기록과 함께 반환한다. 같은 유효 범위에서 인성 기능 약화와 실제 식상 강화 또는 활성화가 함께 확인되면 현재 표현 회복을 확정한다. 식상 표현 성향은 실제 작동한 십성의 기존 Personality 지식에 연결한다. 현재 범위별 결과는 C4에서 원래 근거를 추적할 수 있도록 보존한다.

## C3 검증 사례

| 사례 | 기대 결과 |
|---|---|
| C00-03 여성 4/4, 남성 3/4 | 둘 다 RD-01 확정. 원국 상호 표현 억제와 대화 마찰 확정 |
| 일반 BirthInput | 별도 인성 우세 입력 없이 원국 우세부터 관계 결과까지 계산 |
| 본기 2/4와 월지 단독 | 독립 보강이 없으면 우세 미확정 |
| 월지 본기 인성과 독립 보강 | 다른 인성 본기 자리, 실제 통근한 천간 또는 유효한 Formation으로 RD-02 확정 |
| 시주 미상 | 알려진 인성 3/3은 RD-01 확정. 2/3은 독립 보강이 없으면 유보 |
| Current 회복·악화 | 근거가 유효한 범위에서 회복 또는 강화를 확정하고 원국 기록을 보존 |
| Pair 경계 | 단방향 표현 억제, 부분 완화, 혼합 상태, 만료·시점 불일치 검증 |

[ResourceDominanceFact](../../lib/reading/resourceDominance.ts) · [제품 입력 경로](../../lib/product/readBirthCompatibility.ts) · [C3 verifier](../../../scripts/verify-compatibility-personality-c3.mjs) · [Master 11](../rules/master/11-personality-master.md) · [Master 12](../rules/master/12-personality-knowledge-schema.md) · [Master 16](../rules/master/16-compatibility-spec.md)

## 회귀 검증

Compatibility C1·C2·C3, Personality Engine P2-G, KO·JA·EN Renderer, Judgment 35/35, Money P4-I, Health P4-G, Relationship P4-E, Event Timing P4-N.1이 통과했다. `npx tsc -b`, `npm run build`, `git diff --check`도 통과했다. Judgment 검증의 이전 문서 경로는 임시 사본에서만 연결했다.
