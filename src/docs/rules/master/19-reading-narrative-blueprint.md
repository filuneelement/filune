# P4 Reading Narrative Blueprint

[17 원인 대응](17-cause-to-life-mapping.md)과 [18 장 계약](18-customer-chapter-content-contract.md)이 선택한 의미를 읽기 순서로 고정한다. Chapter sentence와 제목의 로컬라이징은 표현 계층에 둔다. Blueprint는 locale-neutral이며 의미 생성, 확정도 변경, 판정 재실행을 금지한다.

## 역할과 분량

원칙 순서는 결론 → 원인 → 현실 기제 및 장면 → 도움/악화 조건 또는 대비 → 해당 시기 → 판단 기준이다. 한 문단에는 주 역할 하나와 그 의미를 완결하는 관련 근거를 둔다. 빈 역할은 제외한다. 두 번째 기제, 기회, 부담, 다음 국면은 독립 근거가 있을 때 각각 전개한다.

| 장 | 문단/카드 | 한국어 본문 글자 | 최소 전개 역할 순서 |
| --- | --- | --- | --- |
| 01 | 5–7 | 900–1,400 | 핵심 기질 → 외부 발현 → 내적 판단·수용 → 사회/스트레스의 맥락 → 지지된 대비 또는 적용 |
| 02 | 4–6 | 800–1,300 | 첫 능력·근거 → 발휘·행동 → 독립 강점들 → 협업/일 적용 → 과사용 조건 |
| 03 | 4–6 | 800–1,300 | 상황·판단/반응·행동 → 다른 상황·판단/반응·행동 → 근거 있는 결과·대비·재발 → 지원된 갈림 기준 |
| 04 | 7–10 | 1,500–2,400 | 원국 기준 → 대운 배경 → 세운 활성 → 실제 기능 변화/원인 → 기회 → 압박 → 구간 및 판단 조건 |
| 05 | 장면의 근거에 맞춤 | A만 800–1,500 · A+B 1,200–2,200 | A 원국 관계 방식과 지지된 단계 연결 → B 독립 Outcome과 평가 기간 |
| 06 | 8–12 | 1,700–2,700 | 방식 → 능력·발휘 조건 → 역할/환경 → 인정 경로 → 어려움/원인 → 생활 장면 → 승인된 현재/미래 → 판단 기준 |
| 07 | 7–10 | 1,500–2,500 | 획득 → 방식/원인 → 유지/축적 → 보호 → 유출/배분·비용 → 별도 부담 → 검증 구간/판단 기준 |
| 08 | 6–9 | 1,300–2,200 | 경계와 이전 배경 → 새 구조 → 변한 기능의 이유 → 분야/기회 → 부담 → 지속 및 다음 단계 |
| 09 | 8–12 또는 동등 카드 | 1,700–2,800 | 적용 기간/배경 → 카드마다 판정·원인·대상·조건 → 공존/갈림 설명 → 기억할 판단 기준 |

분량은 근거가 충분한 완성본의 품질 목표다. 검증 시 제목과 내부 메타데이터를 제외하고 NFC 정규화한 보이는 한국어 문단/카드 본문의 Unicode 코드포인트를 센다. 문단 내부 공백은 포함하고 문단 구분은 제외한다. 품질 band 미달은 발행 PARTIAL의 밀도 공백으로 다룬다. 원천 의미의 충분성은 문단 수와 분리하며 근거를 늘려 쓰거나 반복하지 않는다.

CR-03의 의미 판정은 지원된 독립 반응 수로 정한다. 발행 판정에만 권장 품질 band를 적용한다. 결과·재발·대비를 채우기 위해 문단을 늘리지 않는다. CR-05는 A와 B를 각각 독립된 section metadata로 유지한다. A만으로 발행 후보가 되며 B만 유효하면 시기 섹션은 내부 결과로 유지한다. 두 층을 소개하는 연결 문장에서만 주제를 전환할 수 있으며 원국 성향과 평가 기간 사이의 인과를 부여하지 않는다.

CR-07은 획득 경로와 수단 → 유지 → 정성적 축적 → 합성 유출·배분 → 보호 → 부담 순으로 읽는다. 문단에서는 판단을 먼저 제시하고, 확인된 기제·고객 판단 기준·대비를 필요한 만큼 설명한 뒤 기간을 붙인다. 대비는 같은 재원을 대상으로 하는 두 기존 meaning unit을 참조한다. 보호와 손상의 평가 범위, 돈을 남기는 제약과 이어 쌓는 제약, 두 부담의 원인은 각각 유지한다. 같은 기제에서 파생된 두 결과를 설명할 때 원인 설명을 반복하는 대신 결과의 차이를 밝힌다.

## 표현 계획과 추적

```ts
type ParagraphPurpose = 'conclusion' | 'cause' | 'life_expression' | 'condition'
  | 'contrast' | 'timing' | 'application'

interface CustomerReadingParagraphPlan extends ReadingProvenance {
  readonly id: string
  readonly purpose: ParagraphPurpose
  readonly semanticUnitIds: readonly string[]
  readonly sourceOutcomeIds: readonly string[]
  readonly sourceMappingIds: readonly string[]
  readonly lifeMechanismIds: readonly string[]
  readonly scope: ReadingScope
  readonly periodRef?: string
  readonly contributionKeys: readonly string[]
}
```

`ReadingProvenance`의 Fact/Role/Effect/Personality/Conflict/Evidence ID를 그대로 사용한다. plan에서 Outcome record ID는 v1 `meaningRef.recordId`로 해소한다. 범위가 둘 이상인 비교 문단은 각각의 원천 unit 및 기간을 보존하고 대표 배치 scope를 기록한다. `periodRef`는 같은 실행에서 검증된 Validity 또는 절기월 키이며 월 parent ID를 해소할 수 있어야 한다. 출력 문장은 plan ID를 참조하는 표현 결과에만 둔다. 고객 텍스트에는 내부 ID를 숨긴다.

## 결정론과 중복

동일 chart, Judgment, Personality, Outcome, Context, 기준일 및 계약 버전에서 같은 장·슬롯·mapping·순서·선택을 생성한다. 기준일은 명시 입력 또는 Canonical의 시점을 따른다. 레지스트리 순서와 슬롯 우선순위를 버전으로 고정한다. 유효 후보는 장 → 역할 → 범위 → 기간 시작/끝 → 축 → domain/semantic/대상 → 안정 ID 순으로 정렬한다. 문자열 비교는 locale-independent 코드포인트 기준이다. 동일 손상 경로의 상세 규칙은 명시 우선순위를 따른다. 동급의 독립 경로는 모두 유지한다. 승인된 선택 권한 없는 순위 선정은 deferred다.

정규 의미 키는 원천 assertion + target + condition + axis + scope + interval이다. 공통 ID는 최초 결론 장에서 발행하고 이후 새 근거·조건·시기·대조·적용에만 재사용한다. 새 목적 라벨이나 다른 어휘만으로 새로운 의미가 생기지 않는다. B-6의 요약 및 질문은 원본 결론을 직접 참조할 수 있다. Renderer/LLM은 승인된 plan의 표현만 소비하며 선택·우선순위·해석 경로·기간·확정도를 바꾸거나 랜덤 사례를 고르지 않는다.

## QA 계약

문단마다 새로운 conclusion, cause, condition, target, scope, timing, contrast, application 중 하나 이상을 `contributionKeys`로 기록한다. contribution은 원천 ID 및 scope와 함께 정규화한다. 의미를 표현만 바꾸어 반복하면 FAIL이다.

| 검증 | 자동 산출 및 처리 |
| --- | --- |
| 의미 밀도 | `distinctSemanticCount`, `distinctCauseCount`, `distinctLifeMechanismCount`, `paragraphRoleCoverage`를 승인된 참조와 역할로 계산. 장별 최소 커버리지나 목표 미충족은 GAP |
| 중복·무근거 | `duplicateMeaningCount`, `unsupportedClaimCount`. 동일 목적의 중복 의미 또는 허용되지 않은 assertion 참조가 하나라도 있으면 FAIL |
| 원인 | assertion별 `causeAvailable`, `lifeMappingAvailable`, `reasonStatus` 및 gap 코드. 결론만 확인되면 해당 의미를 유지하고 사유 GAP 기록 |
| 시기 | 평가 구간·축·로컬 근거·부모 기간·현재/미래/과거 구분과 장 간 ID 일치. 위반 FAIL, 입력 미제공 GAP |
| 발행과 locale | 제품 범위, certainty, publication gate 및 locale 간 의미 ID·역할·순서 일치. 위반 FAIL. 자연어가 허용 의미를 넘는지는 자동 참조 검사에 더해 KO/JA/EN의 문장 QA에서 판정 |
| 재현성 | 같은 입력 재실행, 순서가 의미 없는 컬렉션의 역순 입력, 다른 명식·원인·맥락, scope 경계·stopped/expired·조건부 반례를 확인 |

합산 점수는 두지 않는다. 완성본 PASS는 필수 내용과 공개 검사가 통과한 경우에만 가능하다. GAP 보존은 prototype 검증에서 PASS할 수 있으며 해당 장의 발행 readiness는 별도로 partial이다. [비교 예시와 fixture](20-reading-renderer-quality-reference.md)


## P4-G 시간 장 조립

- CR-04는 기준일이 포함된 범위만 현재로 다룬다. 원국이나 평가된 부모 범위의 기존 작용을 현재 근거와 비교한다. 같은 작용이 다시 관측된 것만으로 강해졌다고 해석하지 않는다.
- CR-08은 정확한 경계 전후의 독립 평가를 비교한다. 위치만 바뀐 달력 경계, 관측 누락, 연·월의 단기 활성으로 장기 전환을 만들지 않는다. 고객용 선택 범위는 현재부터 가장 가까운 전환 쌍 두 개다.
- CR-09는 기준일을 포함하는 구간과 이후 구간을 날짜순으로 배치한다. 카드의 기준은 기간·범위·대상이다. 중첩해도 각각의 기회와 주의를 유지한다. 동일 의미·대상·기제·방향의 상하위 Outcome이 실제 포함될 때만 하위 구간을 상위 구간에 연결한다. 승인 이벤트 시기는 별도 출처로 표시한다.
