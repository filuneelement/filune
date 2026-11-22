# FILUNE Compatibility-05 Final Assembly

**최종 판정 · `COMPATIBILITY_FINAL_ASSEMBLY_READY`**

`readBirthCompatibility`는 두 출생 입력을 한 번씩 독립 평가하고 C1–C4의 결과를 `FinalCompatibilityResult`에 연결한다. 기존 호출자가 사용하던 C3 `people`, `natal`, `current` 필드는 그대로 제공한다.

- C1의 canonical 인물 ID 순서를 공용 함수로 꺼냈다. 공개된 직렬화 Pair ID는 이 순서를 기존 `recordId` 형식으로 담는다. 입력 순서는 별도로 기록하며 A→B 및 B→A 조회에 사용한다.
- C2의 방향별 verdict·효과·우선순위, C3 원국과 현재, C4 개인·한쪽·상호 구간 및 두 파탄 경로를 보존한다. 강점·위험 및 요약은 확인된 원본의 ID를 참조한다.
- 현재·미래·과거는 기존 TimingFact와 C4가 확정한 구간에서 읽는다. 요청 시 `monthlyWindowStart`로 기존 월 범위를 함께 평가한다. 원자료의 간지만 있는 Decision은 달력 구간과 분리해 보존한다.
- 명시된 관계 상태는 사용자 문맥으로 분리한다. 요약은 구조·성격·관계 시기를 독립적으로 제공한다.

[제품 진입점](../../lib/product/readBirthCompatibility.ts) · [조립기](../../lib/compatibility/final/assembleFinalCompatibility.ts) · [C5 verifier](../../../scripts/verify-compatibility-final-assembly-c5.mjs) · [Master 16](../rules/master/16-compatibility-spec.md)

## 조립 검증

아래 수치는 fixture별 결과를 합산한 검증 집계다. 두 방향이 존재하는 7건은 각각 A→B와 B→A를 대조했다. 나머지 두 원자료 조합에는 C4와 C3 결과를 조립했다.

| 항목 | 결과 |
|---|---|
| Final compatibility fixtures | 9 |
| Structural preserved | 9 |
| Personality preserved | 9 |
| Lifecycle preserved | 9 |
| A→B preserved / B→A preserved | 7 / 7 |
| Strength facts / Risk facts | 14 / 45 |
| Current facts / Future windows / History windows | 37 / 9 / 15 |
| Marriage opportunity / favorable / caution | 14 / 4 / 5 |
| Relationship formation / change | 14 / 3 |
| Relationship strain / relief | 12 / 2 |
| Breakdown risk | 10 |
| Mixed cases / Asymmetric cases | 명시적 fixture 각각 1건. `balanced_mixed`와 두 파탄 경로의 공존도 별도로 확인 |
| Duplicate IDs / Orphan provenance / Fake dates / Mutations | 0 / 0 / 0 / 0 |

혼합 fixture에서 구조적 도움, 원국 소통 마찰, 미래 파탄 위험이 공존했다. 같은 fixture의 결혼 유리는 현재 구간에 유지됐다. 다른 fixture에서는 원국 소통 마찰과 현재 소통·관계 회복을 함께 보존했다. 제품 진입점에서 출생 입력의 순서를 뒤집어도 Pair ID, C1 근거, C4 시기와 요약이 동일했다. 숫자 점수, 포괄 평균화, 확정도 하향은 0건이다.

## 회귀 검증

Compatibility C1–C5, Judgment 35/35, Personality Engine과 KO·JA·EN Renderer, Money, Health, Relationship, Event Timing Batch 1과 제품 배선이 통과했다. `npx tsc -b`, `npm run build`, `git diff --check`도 통과했다. Judgment의 이전 문서 경로는 임시 검증 사본에서만 연결했다.
