# FILUNE P4-D Health Outcome Semantic 보강 감사 결과

## A. 전체 판정

**`HEALTH_OUTCOME_SPEC_READY`** — Health Outcome Source Contract READY. Health 엔진 구현은 P4-E 후보이며, 기존 구현 상태는 `PARTIAL_OUTCOME_IMPLEMENTATION`이다. 이 보강 감사로 P4-D를 닫는다.

대조 기준은 수정 전 14 spec과 P4-D 결과의 OUT-HEALTH-01~05 및 F–L이다. 조치 열은 이번에 확정한 명세 기준이다. 건강 A·B의 표와 근거 차이, C의 사례 색인, D의 조건과 추정, E의 적용 사례, F의 4단계·장 간 계약, G의 문헌 범위를 대조했다. [⑲-A](../source/health/FILUNE-19A-premium-health-evidence.md) · [기존 P4-D 결과](./p4d-outcome-semantic-source-audit-result.md)

## B. Coverage

```text
Audit rules: 42
ALREADY_COVERED: 3
MISSING_SUPPORTED: 18
SOURCE_INFERENCE: 7
DEFERRED: 5
CONFLICT: 2
PROHIBITED: 7
```

| Health Rule | ⑲-A | 현재 14 spec | 판정 | 조치 |
|---|---|---|---|---|
| H-01 일간 오행 전통 대응 | A/B/F, 일간 중심은 B의 CS-077 및 034·061·014 | OUT-HEALTH-01, A I-16 | ALREADY_COVERED | KEEP |
| H-02 甲 직접 부위 | B/C, R-43·CS-014/026. 026은 일간이 아닌 용신 甲 | 개별 근거 없음 | MISSING_SUPPORTED | ADD |
| H-03 丙 직접 부위 | B/C, R-43·CS-034의 눈·심혈관. 071은 용신 火 | 개별 근거 없음 | MISSING_SUPPORTED | ADD |
| H-04 土 직접 부위 | B/F, R-43의 戊·己 공유 대응. 061/077에서 土 선정 이유는 추정 | 개별 근거 없음 | MISSING_SUPPORTED | ADD |
| H-05 辛 직접 부위 | B/C, CS-077 폐·치아·관절 등. 정강이·배꼽은 사례 세부 | 개별 근거 없음 | MISSING_SUPPORTED | ADD |
| H-06 癸 직접 부위 | B/C, R-43·CS-061 신장·부인과 | 개별 근거 없음 | MISSING_SUPPORTED | ADD |
| H-07 乙/丁/庚/壬 element-only | B-2/F, FILUNE 적용 결정. 이미지의 오행 대응까지만 | 천간별 확장 경계 없음 | MISSING_SUPPORTED | ADD |
| H-08 손상된 용신 오행 | B/C/D, CS-026 사후·071 원고 해석. 실제 손상 대상만 전통 참조 | OUT-HEALTH-02의 일반 대상만 | MISSING_SUPPORTED | ADD |
| H-09 상신 손상 | F와 B W-35의 실제 대상 조건. E의 CS-005는 적용이며 단독 증명 아님 | 01의 상신 참조와 02의 압력 조건이 분리되어 있음 | MISSING_SUPPORTED | NARROW |
| H-10 칠살 소생 | C/D/F, CS-014 및 010·039·050·058·088·103·110·123·126·133. 구조적으로 살아나는 해로운 경로 | 공통 역할 상태만 | MISSING_SUPPORTED | ADD |
| H-11 財生殺 | C/D, 039·088·110 등 맥락. Master 06 PP-503의 실제 제살 방해 확인 | Scope 절에 pattern-specific policy 명시 | ALREADY_COVERED | KEEP |
| H-12 용신 제어 | C/D, 026·071. 기능에 도달한 유효한 극의 약화와 정지 구별 | 공통 실제 기능만, Health의 OP-P06 연결 없음 | MISSING_SUPPORTED | ADD |
| H-13 용신 합거 | D 직접 연결 없음. E의 CS-005 辛卯는 적용안 | 자동 Health 규칙 없음 | DEFERRED | DEFER |
| H-14 병 강화 | D, 039·088·110의 재생살로 한정하면 H-10 충족. 다른 病으로 일반화는 근거 부족 | 범위 명시 없음 | MISSING_SUPPORTED | ADD |
| H-15 병 해소 | D 직접 연결 없음. E의 CS-005 조건 해소는 적용안 | 동일 경로 구조 relief만 | PROHIBITED | PROHIBIT |
| H-16 일간 root 약화 | D, 039의 뿌리 약함과 건강 간 직접 연결 없음 | Health 규칙 없음 | DEFERRED | DEFER |
| H-17 오행 상극 | D, 034·071의 水剋火는 기존 경로의 증거. 모든 극에 적용하는 규칙은 추정 | Health의 일반 대상 gate만 | SOURCE_INFERENCE | NARROW |
| H-18 대운 계절 전환 | D/E/F, CS-034 사후 예시와 R-43의 전환+절운 설명. 단독 전환의 일반 판정 기준 부족 | 타이밍 보류 | SOURCE_INFERENCE | DEFER |
| H-19 대세운 동일 방향 집중 | C/D, CS-031 巳午未 방향 단일 문맥 | 규칙 없음 | SOURCE_INFERENCE | DEFER |
| H-20 조후 | D/G, 042의 조후 좋음은 Health 직접 근거 없음 | Health 규칙 없음 | DEFERRED | DEFER |
| H-21 삼형 | D, CS-031 丑戌未 및 GZ-29의 보조 수준. C의 삼형 가중도 구조 이력 | Health 규칙 없음 | SOURCE_INFERENCE | NARROW |
| H-22 지지 충 | D의 058은 수화 싸움. 충→해당 신체 부위 손상은 분석자 추정 | 02의 실제 대상 gate | SOURCE_INFERENCE | DEFER |
| H-23 삼합으로 칠살국 | C/D, 103·110·123. 실제 해로운 기능 및 성립 자격 필요 | Health 조건 없음 | MISSING_SUPPORTED | ADD |
| H-24 식신 기능 저하 | C의 CS-002 한 문맥. CS-026은 용신 손상이라는 다른 자격 | Health 독립 규칙 없음 | SOURCE_INFERENCE | DEFER |
| H-25 overall luck vs health independence | C의 CS-043. 역방향의 자동 상속도 별도 분야 근거 원칙으로 차단 | Boundary 일반 분야 근거, Health 독립성 명시 없음 | MISSING_SUPPORTED | ADD |
| H-26 Natal→Daewoon→Sewoon→Month chain | E/F의 FILUNE 연결 계약. CS-034 세운 미기재, CS-005는 적용 | OP-L01/L02 공통, Health 경로 없음 | MISSING_SUPPORTED | ADD |
| H-27 health attention period | C–F의 소생·유효 손상과 재발동, B W-35 | OUT-HEALTH-02의 월 gate는 있으나 시기 출력 보류 | MISSING_SUPPORTED | ADD |
| H-28 health relief period | D/E에 독립 회복 시기 직접 근거 없음. E는 적용안 | 시기 보류, 동일 경로 구조 relief만 | DEFERRED | DEFER |
| H-29 질병 예측 | F Level 4, A I-16·B W-30~35·D Q10. 발병·시기·수명·사망·수술 포함 | Health 금지 | PROHIBITED | PROHIBIT |
| H-30 의료 권고 | F/G 및 B·D. 검사·치료·약·의학적 체질·식이 등을 포함 | Health 금지 | PROHIBITED | PROHIBIT |
| H-31 칠살 존재만으로 주의 | C/D는 소생을 요구. Master 01 PT-038의 양인 필요 칠살 포함 | pattern-specific policy만 | PROHIBITED | PROHIBIT |
| H-32 현재 기능·상태 보존 | F의 실제 조건. Master 05/09와 OP-P06/P07 | Scope 절에 이력과 작동, reduced/stopped/conditional/expired 명시 | ALREADY_COVERED | KEEP |
| H-33 동일 조건·동일 fact | F 및 B-6, D Q13 | Assembly 분리만, Health ID 재사용 명시 없음 | MISSING_SUPPORTED | ADD |
| H-34 정신건강 진단 및 증상 | C의 014/021/035/077 표현은 원고 서술. F/B/D의 제한 우선 | 질병·증상·진단 금지 | PROHIBITED | PROHIBIT |
| H-35 점수 및 최고·최저 Health 월 | 상품 범위·F 및 A I-14 | 공통 ranking 금지, Health score 명시 없음 | PROHIBITED | PROHIBIT |
| H-36 표의 합성 및 실제 취약으로 변환 | A/B의 출전 미상 이미지와 R-43의 다른 대응, 일부 원고의 ‘약하다’ | I-16 승인 표 및 상태 생성 금지 | CONFLICT | NARROW |
| H-37 증거와 적용 이력 provenance | A–G의 R-43, CS ID, 이미지, 〔추〕, 〔설〕, 〔적〕. C의 사후 기록 | 일반 evidence classification만 | MISSING_SUPPORTED | ADD |
| H-38 문헌 후보 및 미확정 강약 판정선 | D/F/G. 일간 쇠함 판정선 및 문헌 체계 연결 미확정 | 채택 없음 | DEFERRED | DEFER |
| H-39 독립 세운·월운 반복 확인 | F의 반복, C/D의 026·034. E의 034에는 세운 근거 없음 | 상위 scope 이식 금지만 | MISSING_SUPPORTED | ADD |
| H-40 061/077의 다른 오행 선정, 105의 관살·비견, 068의 년지 | B/C. 앞의 둘은 분석자 추정, 뒤의 둘은 각 사례 맥락 | 독립 대상 매핑 없음 | SOURCE_INFERENCE | DEFER |
| H-41 停止로 바꾸는 천간 극 | D의 극 표현을 stop으로 바꾸면 A OP-P06 및 Master 09와 충돌 | 구조 상태 보존만 | CONFLICT | PROHIBIT |
| H-42 오행 결핍·과다·충을 질병으로 읽기 | A/B/F, 상징 대응과 질병 분리 | 전통 대응과 Health 금지 | PROHIBITED | PROHIBIT |

## C. 4 Levels

| Level | 확정 범위 |
|---|---|
| 1 traditional correspondence | 일간 중심의 상징적 대응. 고객 표는 A I-16 사용. 일간은 개인 상태나 취약 부위의 증거가 아니다. |
| 2 structural | 실제 손상된 용신·건강 관련 상신 기능 또는 실제로 해로운 칠살 경로. 조건부 압력을 설명할 때 발동 근거와 현재 작동 여부를 보존한다. |
| 3 timing | 같은 건강 경로가 해당 기간에 실제 작동할 때의 주의 시기. 월에는 독립적인 해당 월 근거가 필요하며 조건부 부위는 생략한다. 계절 전환·방향 집중은 맥락으로만 쓴다. |
| 4 disease | PROHIBITED |

## D. Day Stem Coverage

| 일간 | 근거 수준 | ⑲-A의 전통 참조 근거 |
|---|---|---|
| 甲 | direct-source-specific | 머리·신경·피부, R-43 및 014/026 |
| 乙 | element-level-only | 木 |
| 丙 | direct-source-specific | 눈·심혈관, R-43 및 034 |
| 丁 | element-level-only | 火 |
| 戊 | direct-source-specific | 戊己 공유 土, 위·소화·옆구리·허리 |
| 己 | direct-source-specific | 戊己 공유 土, 위·소화·옆구리·허리 |
| 庚 | element-level-only | 金 |
| 辛 | direct-source-specific | 폐·치아·관절, 077에 정강이·배꼽 사례 세부 |
| 壬 | element-level-only | 水 |
| 癸 | direct-source-specific | 신장·부인과, R-43 및 061 |

위 표는 근거 수준 기록이다. R-43·원고와 이미지의 차이(예를 들어 木의 눈과 원고 丙의 눈, 金의 치아와 승인 표의 피부)는 각각의 출처에 귀속한다. 출전 미상의 이미지는 전통 상징 자료다. 고객 대응은 A I-16 범위를 유지하며, 천간이 다르다는 이유로 같은 오행의 원고 부위를 복사하지 않는다. [A I-16](../source/authority/A_rev182.md#L110)

## E. Structural Conditions

| 조건 | 감사 상태 및 적용 |
|---|---|
| YongShen damage | MISSING_SUPPORTED → 유효 극이 실제 기능에 도달하고 보호 이후 압력이 남는 경우에만 채택. 합거의 자동 Health 연결은 DEFERRED. |
| SangShen damage | MISSING_SUPPORTED → 검증된 실제 기능 손상과 별도 Health 관련성 필요. 역할명이나 CS-005 적용 예시만으로 부위를 결정하지 않는다. |
| Killing activation | MISSING_SUPPORTED → 실제 해로운 경로만 채택. 양인의 필요 칠살과 제살·통관·보호를 현재 PatternContext에서 확인. |
| Wealth→Killing | ALREADY_COVERED → PP-503 및 실제 CurrentFunction 보존. 재가 제살을 방해하는 경우와 두 기능이 병존하는 경우를 구별. |
| Root damage | DEFERRED → 기존 통근·실제 기능의 증거로만 소비. |
| Formation | MISSING_SUPPORTED → 성립과 해로운 칠살 기능 모두 필요. 지지합이 글자를 변환한다고 처리하지 않는다. |
| Clash | SOURCE_INFERENCE → 구조 관계·실제 기능 증거까지. 충 자체로 신체 손상 없음. |
| Season transition | SOURCE_INFERENCE → R-43과 CS-034에 나온 복합 조건의 맥락만 인정. 단독 계절 전환 조건 없음. |

Master 01 PT-036~038의 격별 칠살, 03 B-060/B-082의 Formation·형, 04 R-005/006의 통근과 실제 기능, 05의 역할 이력과 현재 기능, 06 PP-503의 실제 경로, 08의 범위·효과 승계, 09 EX-058과 A OP-P06/P07의 약화·정지 구분을 적용했다. A OP-Z11은 합충 관계와 실제 손상을 나누며, A I-04b의 조후는 전체 구조 보조에 머문다. C CS-005의 건강 행과 정정 이력은 대상·시기와 문구의 회귀 근거다. B W-30~35 및 D Q10/Q13이 표현·일관성의 기준이다. [Authority A](../source/authority/A_rev182.md) · [B](../source/authority/B_rev38.md) · [C](../source/authority/C_rev215.md) · [D](../source/authority/D_rev155.md)

## F. Lifecycle

| 범위·상태 | 확정 계약 |
|---|---|
| Natal | 일간과 원국에서 확인된 구조를 기록. 운에서 등장한 조건을 원국 기질로 소급하지 않는다. |
| Daewoon | 기존 대운 결과와 유효구간을 읽는다. 계절 변경만으로 발동하지 않는다. |
| Sewoon | 원국·대운·세운에 대한 기존 세운 결과에서 해당 경로의 작동을 확인한다. 세운이 비어 있으면 적용 사례로 채우지 않는다. |
| Month | 기존 월운의 원국·세운·월운 직접 비교와 유효한 승계만 소비. 별도의 월–대운 일반 관계를 만들지 않는다. Formation은 별도 upstream 결과에 따른다. |
| expired | 이력만 보존. 같은 경로의 종료가 확인되면 종료 상태 기록 가능. 다음 scope 작동은 별도 근거 필요. |
| stopped | 정지 범위의 활성 주의를 종료. 독립적으로 성립한 다른 경로는 별도 사실이다. |
| reduced | 약화된 기능·효과를 보존. full active로 승격하지 않는다. |
| conditional | 발동을 검증할 때까지 조건부. 월 근거가 조건부면 부위를 생략한다. |

CS-034는 네 단계의 **설계 참고**다. 원고가 기록한 연결은 원국 丙 → 대운 방향 전환·水剋火 → 丙子월 반복이며, 세운 판단은 공란이다. CS-005의 E절은 적용안이며 특히 합거·화국과 월 사례를 직접 규칙으로 승격하지 않았다. 동일 조건·유효기간의 CH-7/8/9/10 소비는 같은 OutcomeFact ID와 provenance를 사용한다. 다른 기간의 독립 발동은 원천 조건에 연결한다. 장별 표현은 B-6을 따르며 판단을 다시 만들지 않는다.

## G. Prohibited

| 항목 | 상태 |
|---|---|
| Disease diagnosis | PROHIBITED |
| Disease timing | PROHIBITED |
| Medical advice | PROHIBITED |
| Treatment | PROHIBITED |
| Life expectancy | PROHIBITED |
| Health score | PROHIBITED |

질병명, 발병 확정, 사망, 수술, 검사 판단, 약, 의학적 체질 및 식이 처방, 증상과 정신건강 진단을 결과·타입·고객 문구에서 제외한다. 병 해소나 구응에서 건강 개선을 자동 생성하지 않는다. 경로 종료가 확인된 경우에만 기존 구조 주의 조건의 비활성화 상태를 기록한다.

## H. 14 spec changes

- OUT-HEALTH-01/02의 일간 근거 범위와 구조·시기 자격 보강.
- Health source contract에 4단계, 적격 경로와 제외 조건, scope·lifecycle·OutcomeFact ID 재사용, 출처 계층 추가.
- Health 제외 항목에 일반화된 주의 시기와 독립 relief semantic 보류 유지.
- 감사에서 찾은 CONFLICT 2건은 계약에서 제외했다. 추가된 미지원 규칙은 0건. [14 Outcome Semantic Spec](../rules/master/14-outcome-semantic-spec.md#health-source-contract)

## I. Source integrity

| 검증 | 변경 건수 |
|---|---:|
| health source changed | 0 |
| application code changed | 0 |
| Work/Money/Relationship changed | 0 |
| Selection Layer changed | 0 |

## J. 남은 연구

**Future literature research** — 《滴天髓》의 疾病 전문·주석과 판본, 《三命通會》의 천간별 구분, 《黃帝內經》 오행·장부 대응의 인용 계보, 《窮通寶鑑》 조후의 문맥이 후속 연구 대상이다. 《滴天髓》의 일부 인용은 적용 기준과 자평진전 구조 연결이 미확정이다. 《窮通寶鑑》 조후는 Health 규칙으로 채택하지 않는다. 전환기·방향 집중·식신 단독·완화 시기의 일반화도 보류한다.

**v1 implementation blocker** — 추가 문헌 연구로 인한 차단 없음. 실제 구현에서 각 결과를 만들려면 upstream target/function/lifecycle 및 scope 근거가 필요하다. 누락된 시기 fact는 보류하며 해당 월의 판단을 합성하지 않는다. P4-E Batch 1은 기존 P4-D 결과와 함께 결정할 수 있다. Health 후보는 승인된 전통 대응 및 검증된 구조 경로와 동일 fact 공유이며, 주의 시기는 필요한 scope 입력이 있는 경우에 한한다. Work `SOURCE_GAP`은 기존 판정을 유지한다.
