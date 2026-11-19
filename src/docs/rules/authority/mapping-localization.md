# FILUNE 다국어 Localization Authority Mapping

## 1. 목적

Structural·Personality 판정과 일본어·영어 표현 사이의 적용 우선순위를 고정한다. 아래의 `SOURCE_LOCALIZATION`, `CURRENT_AUTHORITY`, `CURRENT_MASTER`는 근거 문서군을 나타낸다.

## 2. Source 문서

`SOURCE_LOCALIZATION` — **FILUNE 일본어·영어 명리 용어 표준과 고객 표현 기준**, 2026-11-17. 저장소의 실제 파일 확장자는 `.m`이다. 원문은 작성 당시의 근거로 보존한다. [Localization 원문](../../source/localization/FILUNE-ja-en-terminology-rendering-standard.m)

## 3. 현재 Authority

`CURRENT_AUTHORITY` — `src/docs/source/authority/`에서 파일명과 헤더의 revision 및 상태를 대조한 각 문서군의 최신 개정본이다.

| 문서군 | 최신 revision | 상태 | 역할 |
| --- | --- | --- | --- |
| 25-7 | [rev16](../../source/authority/25-7_rev16.md) | frozen | 운영자 승인 규칙의 반영과 회귀 검증 |
| A | [rev182](../../source/authority/A_rev182.md) | approved | 명리 계산·해석 기준. 문서가 지정한 A-8 우선순위 적용 |
| B | [rev38](../../source/authority/B_rev38.md) | frozen | 공통 고객 작성 기준과 한국어 표현 |
| C | [rev215](../../source/authority/C_rev215.md) | frozen | 판정과 고객 표현의 검증 사례 |
| D | [rev155](../../source/authority/D_rev155.md) | approved | 운영·검사 기준. 헤더가 A rev182를 참조 |

`CURRENT_MASTER` — 현행 `src/docs/rules/master/`의 관련 파일과 문서 표제 버전이다.

| 실행 계약 | 파일 | 버전 |
| --- | --- | --- |
| 지지 관계 | [03-branch-relations-master.md](../master/03-branch-relations-master.md) | v0.2 |
| 통근·12운성 | [04-root-twelve-stages-master.md](../master/04-root-twelve-stages-master.md) | v0.2 |
| 상신·병·구응·성패 | [05-sangshen-byeong-gueung-master.md](../master/05-sangshen-byeong-gueung-master.md) | v0.3 |
| 운 범위·상태 | [08-luck-master.md](../master/08-luck-master.md) | v0.4 |
| 엔진 통합 | [09-engine-integration-spec.md](../master/09-engine-integration-spec.md) | v0.3 |
| Personality | [11-personality-master.md](../master/11-personality-master.md) | v0.1 |
| Personality Knowledge 스키마 | [12-personality-knowledge-schema.md](../master/12-personality-knowledge-schema.md) | v0.1 |

## 4. 우선순위

- **Structural·Personality 판정**은 `CURRENT_AUTHORITY`의 현행 적용 규칙과 `CURRENT_MASTER`의 실행 계약을 따른다. C의 사례는 검증 근거로 사용한다.
- **일본어·영어 용어, 문체, 고객 문장**은 `SOURCE_LOCALIZATION`의 해당 언어 기준을 우선 적용한다. B rev38의 공통 근거·확정도·노출 제한은 유지하며, B의 한국어 전용 문체 규칙은 언어별 표현 기준으로 대응한다. [B 렌더링 매핑](mapping-B-rendering.md)

| 문서군 | 역할 | 판정 변경 권한 |
| --- | --- | --- |
| `source/localization` | 원문·용어·문체 근거 | 없음 |
| `rules/authority` | 현행 적용 우선순위 | 있음 · 승인된 근거 범위 |
| `rules/master` | 구조·Personality 판정 계약 | 있음 · 현행 authority 계약 범위 |
| `render/*` | 표현 실행 | 없음 |

## 5. Structural 판정과 Localization 분리

`CURRENT_AUTHORITY` · `CURRENT_MASTER` — 엔진이 방향·강도·근거·시점과 작동 상태를 결정하고, 렌더러가 이를 언어별로 표현한다. 용신은 A I-03 및 A-8의 계약에 따른 월령에서 정한 격의 중심이다. `用神`과 `Yong Shen`은 그 정의의 내부 표준 표기다. 외부 학파의 `守護神`, `喜神`, `Useful God`, `Favorable Element` 정의는 판정에 도입할 수 없다. [A rev182](../../source/authority/A_rev182.md) · [05 역할 마스터](../master/05-sangshen-byeong-gueung-master.md)

## 6. Personality Renderer 적용

`CURRENT_MASTER` · `SOURCE_LOCALIZATION` — `PersonalityResult`가 유일한 의미 입력이다. 현행 공개 계약인 `PersonalityRenderInput`의 `natal`과 선택적 `current`가 이 결과를 전달한다. Fact, Conflict, 작용, 확정도, Natal/Current 구분과 만료 상태를 보존한다. 현지화 기준은 고객 표현, 호칭, 말투, 확정·조건부 어미, 금지어, 내부 용어 표기를 정하는 데 사용한다. [공통 입력 타입](../../../lib/personality/render/types.ts) · [JA 렌더러](../../../lib/personality/render/ja/renderPersonalityJa.ts)

| 내부 상태 | 고객 표현 |
| --- | --- |
| `confirmed` | 근거가 확정된 성향이나 작용을 확정형으로 표현한다. 실제 현재 작동은 현재형으로 표현한다. |
| `contextual` / `conditional` | 조건과 관련 작용을 함께 보존하며 가능성·경향형을 사용한다. |
| `reduced` | 약화되어 남아 있는 작용을 표현한다. |
| `inactive` | 활성 Current 본문에서 제외한다. 이미 만료된 효과도 현재 본문에서 제외한다. |
| `deferred` | 보류된 판단을 확정하거나 추측하지 않는다. 별도 근거가 있는 조건부 표현은 근거와 조건 범위 안에서 유지한다. |

원문 D-1의 `deferred`는 해당 판단의 고객 표현 처리 지침이다. Personality의 `TenGodProminence = deferred`는 순위 판정이 보류된 엔진 상태다. `最も強い`, `一番目立つ`, `圧倒的` 같은 임의 순위 표현을 금지한다.

## 7. 일본어 고정 용어

`SOURCE_LOCALIZATION` — 원문 A 및 E-1을 일본어 내부 출력 표준으로 사용한다.

| 범주 | 고정 표기 |
| --- | --- |
| 기본 구조 | 日干、日柱、月令、天干、地支、通変星 |
| 십성 | 比肩、劫財、食神、傷官、偏財、正財、偏官、正官、偏印、印綬 |
| 구조와 역할 | 格局、用神、相神、病、救応 |
| 작용과 운 | 透干、通根、合去、年運 |

`正印`은 `印綬`, `七殺`은 `偏官`, `歳運`과 `流年`은 `年運`의 입력 동의어로만 인식한다. TypeScript canonical TenGod enum과 scope 이름은 그대로 사용한다. 고객 Personality 본문에서 내부 전문어를 숨긴다. 내부의 `用神`은 고객에게 근거가 있는 실제 작용을 평이한 일본어로 설명한다.

## 8. 영어 고정 용어

`SOURCE_LOCALIZATION` — 원문 A, C-1, E-1의 영어 내부 표기와 표의 동의어 처리 기준을 사용한다.

| 범주 | 대표 고정 표기 |
| --- | --- |
| 기본 구조 | Day Master, Day Pillar, Month Commander, Heavenly Stems, Earthly Branches, Hidden Stems, Ten Gods |
| 십성 | Companion (Friend), Rob Wealth, Eating God, Hurting Officer, Indirect Wealth, Direct Wealth, Seven Killings, Direct Officer, Indirect Resource, Direct Resource |
| 구조와 역할 | Structure, Yong Shen, Xiang Shen, Bing (structural flaw), Jiu Ying (remedy) |
| 작용과 운 | Revealed, Rooted, Combined Away, Luck Pillar, Annual Pillar, Monthly Pillar |

영어 고객 본문은 실제 작용을 평이한 영어로 풀어 쓴다. 내부 표준의 전문어·한자·병음은 고객 본문에서 제외한다.

## 9. 고객 금지 표현

`SOURCE_LOCALIZATION` · `CURRENT_AUTHORITY` — 원문 B·C·E-2와 B rev38의 공통 노출 제한을 적용한다.

| 금지 범주 | 적용 예 |
| --- | --- |
| 명리 전문용어·간지 기호 | 用神、印綬、十二運、甲子, Day Master |
| 일본어 금지 호칭 | あなた、君、お前. 호칭이 필요한 위치의 이름은 `{名前}さん` |
| 고풍 점술체·공포 표현 | 〜であろう、〜なり、〜すべし、宿命、破滅、災い |
| 고객 미제공 사건 단정 | 転職したでしょう、別れたはず |
| 고객 미제공 생활 상태 단정 | 夫、妻、子ども、会社、上司를 실제 상태로 전제하는 문장 |
| 건강 추정 | 신체 증상, 질병·수명 예측, 의료 조언 |
| 점수·확률·랭크 | ％、点、確率、ランク、★ |
| 투자 지시 | 買い時、売り時、銘柄 |
| 운명적 인연 단정 | 運命の人、赤い糸、soulmate |

일본어는 일반 한자와 부드러운 구어체를 사용하며, 주어 생략을 우선한다.

## 10. Revision 차이 처리

`SOURCE_LOCALIZATION` — 원문 0절의 A rev179, B rev38, C rev215, D rev152는 **작성 당시 provenance**다. 현재 적용 개정본은 3절의 자료와 각 문서에서 명시한 적용 계약으로 확인한다. 원문의 인용 개정본과 본문은 보존한다.

## 11. 12운성 특칙

`CURRENT_MASTER` — 원문의 작성 당시 설명에는 12운성 판정 규칙이 없다는 취지가 있다. 현행 04 master의 R-020~R-022 및 R-092를 우선 적용한다. 12운성은 천간의 유무력, 실제 Root의 질, DayMasterCapacity를 검토할 때의 제한적 보조 근거다. 이를 단독 용신 선정, 격 결정, 독립 길흉 판정에 사용하는 것은 금지한다. [04 master](../master/04-root-twelve-stages-master.md)

`SOURCE_LOCALIZATION` — 보조 근거로 사용한 경우에도 고객 본문에서 12운성 명칭 및 개별 단계명은 제외한다. 필요하면 확정된 작용만 평이하게 표현한다.

## 12. 다국어 공통엔진 계약

`CURRENT_MASTER` · `SOURCE_LOCALIZATION` — Canonical Engine, Judgment Engine, Personality Engine은 각각 언어 공통으로 하나씩 둔다. KO·JA·EN은 표현을 담당하는 렌더러 경계다. EN에도 이 매핑을 적용한다.

```text
Personality Engine → PersonalityResult ┬→ KO Renderer
                                      ├→ JA Renderer
                                      └→ EN Renderer
```

JA가 `PersonalityResult`에서 KO Renderer와 한국어 고객 문장을 경유하는 중역은 금지한다. Locale Renderer가 Judgment Engine 또는 Knowledge 원문을 직접 조회하거나 다른 언어 Renderer를 호출해 새 판단을 만드는 것도 금지한다.

## 13. 충돌 처리

`CURRENT_AUTHORITY` · `CURRENT_MASTER` · `SOURCE_LOCALIZATION` — 결과의 의미·강도·시점을 현행 판정 근거에 맞춰 확인하고, 차이는 locale 고객 표현을 조정해 해결한다. 표현 때문에 Structural·Personality 판정을 변경할 수 없다. 현행 계약으로 해결할 수 없어 새 추론 또는 운영자 승인이 필요한 쟁점은 `DEFERRED`로 보고한다.
