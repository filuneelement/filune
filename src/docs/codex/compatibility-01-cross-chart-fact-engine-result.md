# FILUNE Compatibility-01 Cross-chart Fact Engine

**최종 판정 — `COMPATIBILITY_CROSS_CHART_FACT_ENGINE_READY`**

## 적용 범위

`buildCompatibilityFacts(a, b)`는 두 사람의 고유 ID, 기존 natal chart entity 및 natal Judgment snapshot을 받는다. 제품 라벨 없이 정적 관계만 계산한다. 각 명식의 entity ID가 같더라도 사람과 원본 Judgment ID를 함께 보존한다. 표에 없는 시주는 만들지 않으며, 제공된 부분 명식이 있으면 그 범위에서 계산한다. [API](../../lib/compatibility/index.ts) · [입력과 Fact 타입](../../lib/compatibility/types.ts)

| Fact | 확인된 동작 |
|---|---|
| Cross stem | 천간의 양방향 生·剋과 무방향 合을 별도 기록한다. C-02에 따라 기존 canonical 합 짝에 작용 가능한 두 참여자가 있으면 교차 context에서 양쪽 stop을 기록한다. 剋은 각 방향의 weaken만 기록한다. 원본 runtime이 미확정이거나 이미 stopped인 참여자의 관계 관측은 남기고, 그 관계에서 새 runtime 효과는 만들지 않는다. 출력은 작용별 효과다. 동시 작용의 종합 우선순위는 이번 단계에 적용하지 않았다. |
| Cross branch | Master 03과 기존 판별 함수를 재사용했다. 六合·沖·刑·破·害, 완성 三合·方合, 왕지 포함 半合, 왕지 없는 두 글자의 관계를 분리했다. 두 사람의 참여자가 각각 있는 Fact에 한해 소유자·위치·일지 참여를 기록한다. 六合에는 국·자동 강화·stop을 부여하지 않았다. |
| Cross root | 기존 지장간 표와 통근의 오행 판별을 사용한다. 제공 지지와 수혜 천간을 분리하며, 본기는 `main`, 중기·여기는 동일 `secondary` 우선도로 기록한다. 개인 RootState와 오행 강화 상태에 쓰지 않는다. |
| Cross role | 실제 개인 RoleHistory의 actor·현재 기능과 기존 경로에 접점을 연결한다. 병의 actor에 剋 또는 합으로 작용하는 경우, 기존 작동 병과 근거 경로가 확인되면 `relief_candidate`를 남긴다. 해로운 역할 경로의 生·Root 지원은 활성 후보가 될 수 있다. 병 역할이나 유해 정책이 확정되지 않은 기존 경로는 `path_contact`로 기록한다. 역할이 여럿이면 링크도 별도 유지한다. 해소 확정과 유불리 verdict는 이 단계에 포함하지 않았다. |

Master 03·04·05·06·09와 승인 C-01~C-04를 적용했다. 관측 producer의 왕지 없는 `branch-half-combination` 명칭은 국 판정으로 사용하지 않았다. [Compatibility-00 판정](./compatibility-00-readiness-audit-result.md) · [실행 모듈](../../lib/compatibility/buildCompatibilityFacts.ts)

## 원자료 검증

| 구분 | 결과 | 기존 사례의 Fact 기대값과 확인 범위 |
|---|---|---|
| Positive | PASS | C00-02. B의 甲·丙이 A의 己·辛과 각각 合 및 cross stop. 亥卯 木 반합국, B의 卯에서 A의 乙 일간으로 본기 Root, 기존 己 병에 대한 B→A 완화 후보 연결. 기존 Judgment 입력에 원문 07:3280의 辛 칠살 근거를 전달했다. |
| Negative | PASS | C00-01. 일↔일 子午 충과 시↔시 卯午 파. 원진은 이번 승인 범위에서 유보했다. |
| Mixed | PASS | C00-03. 寅戌은 관계만 유지하며 火 반합국·강화 0. B의 子는 A의 癸에, A의 戌은 B의 庚에 Root를 제공한다. 후자의 기존 庚→壬 生 경로 ID를 보존했다. 이 개인 Judgment에서 유해 역할이 승인되지 않은 해당 경로는 `path_contact`다. 합성 계약 검증에서는 개인 Judgment가 확인한 병과 용신 양쪽에의 Root 제공 및 병 활성 후보도 확인했다. |
| Directional | PASS | C00-02에서 근거 있는 B→A 병 링크를 확인했고, C00-03에서 각 방향의 Root와 경로 출처를 따로 유지했다. API 인수 순서를 바꿔도 이미 존재하는 방향·ID·출처가 동일했다. |

두 명식 원자료 3쌍은 snapshot-only다. 출생일, 절입 시각, 운 시점을 합성하지 않았다. 외부 정성 결론은 verifier 기대값으로 사용하지 않았다. [§13 원자료](../source/primary/07-사주풀이예시.md#L3206) · [신규 verifier](../../../scripts/verify-compatibility-cross-chart-facts-c1.mjs)

## Fact 및 계약 검증 계수

원자료 3쌍과 합성 계약 5개 시나리오의 최초 실행 합계다. 반복 입력과 인수 교환 실행은 계수에 중복 합산하지 않았다.

| 측정 | 결과 |
|---|---:|
| CrossStemInteractionFacts | 99 |
| CrossBranchInteractionFacts | 60 |
| CrossRootSupportFacts | 90 |
| CrossRoleInteractionFacts | 212 |
| A→B / B→A 방향 Fact 또는 방향별 작용 | 222 / 188 |
| 무방향 관계 Fact | 77 |
| Unstable ID / duplicate / orphan provenance / mutation | 0 / 0 / 0 / 0 |

합성 계약에서 양쪽 合 stop과 剋 weaken, 원본 runtime 보존, 기존 개인 stop에서 추가 cross stop이 발생하지 않는 경우, 왕지 포함 반합국, 왕지 없는 짝의 국·강화 미생성, 완전 방합과 부분 방합 미생성을 확인했다. 한쪽의 시주가 없고 개인 runtime도 미확정인 경우, 다른 쪽의 확인된 시주를 포함한 관계·Root를 계산하되 가짜 시주와 미확정 runtime 효과를 만들지 않았다. 개인 Judgment·RootState·차트 입력의 mutation은 0건이다. Personality나 타 도메인의 코드 및 입력에 쓰는 경로가 없다.

## 유보 및 격리

원진·귀문·격각·별도 암합은 `DEFERRED_PENDING_POLICY`다. 미래 지속성, 결혼·이별 타이밍, 전체 verdict, 고객 문장 및 렌더러도 이번 Fact 엔진 범위 밖이다. 수치 점수·관계 하나로 내리는 결론·유불리 합산은 0건이다. 기존 Judgment·Personality·Money·Health·Relationship·Event Timing 의미 변경과 고객 Reading 연결 변경은 모두 0건이다.

## 기존 회귀와 빌드

| 검증 | 결과 |
|---|---|
| Judgment | PASS 35/35. P0/P1, 역할·runtime, 지지 관측 producer, Root·투간 및 월간 창 회귀 포함. 기존 문서 경로 별칭은 임시 사본에서만 사용했다. |
| Money / Health / Relationship | PASS · P4-J / P4-H 및 P4-K.2A / P4-F |
| Event Timing Batch 1 | PASS · P4-M.2, P4-M.3B 및 그 안의 M.5, P4-N.1 제품 연결 |
| Personality | PASS · P2-G 엔진 통합 |
| TypeScript / Build | PASS · `npx tsc -b`, `npm run build`. 기존 Vite Reading 청크 크기 경고 표시. |
| Diff | PASS · `git diff --check`와 신규 파일 별도 공백 검사 |
