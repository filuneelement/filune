# 상신 후보: 칠살 역용의 설·일간 생조 검토

이 slice는 확정 PatternJudgment와 YongShenJudgment, 이미 산출된 십신·통근·천간 생극 RelationFact·원국 RuntimeState를 소비한다. 격국·용신·생극·지장간·투출·통근을 다시 계산하지 않는다. source Rule은 A179의 I-01/I-02a(A-8-1), I-04-1(A-8-2), I-03(A-2-2), I-05/I-07(A-2-3)이다. A-8이 앞선 용어 정의보다 우선한다.

I-03의 ‘격을 성립시키는 보조 글자’와 I-04-1의 칠살 역용 중 설 방향만 검토한다. 확정 월령 칠살 용신 → 인성 글자 → 일간의 **기존 directed 생 관계 두 개**와 직접 문서 근거의 로컬 통근이 함께 확인되어야 이 기능 경로의 후보가 된다. 이는 단일 생 관계를 상신으로 바꾸는 범용 규칙이 아니다. 다른 격의 상신 방법은 이 slice에서 지원하지 않으며 deferred다. I-04의 성패 판정, 최종 살인상생·상신 역할 확정은 실행하지 않는다. D152 H-3-1과 25-7 rev16 및 mapping-A/implementation-readiness의 범위를 대조했고 새 지장간 체계나 범용 역할 산출식은 추가하지 않는다.

후보 글자의 기존 용신 역할은 별도 참조로 남긴다. 역할이 있다는 사실만으로 후보가 되거나 제외되지 않는다. 확정 칠살 용신에 대한 실제 기능 경로를 독립적으로 확인한다. 인입 극 관계는 conflicting Fact로 남기되 병/성패로 해석하지 않는다. 이 기능 경로가 없는 글자의 rejected는 이 slice의 해당 경로에 대한 결과이며 가능한 모든 상신 이론을 부정하는 의미가 아니다.

필수 Fact/문서 receipt/evidence/부모 assessment가 confirmed이고 uncertainty가 없을 때만 candidate다. 원국 scope, producer와 coverage 연결을 검사한다. 관계 coverage가 불완전하거나 관계 existence/assessment가 unknown이면 부재로 보지 않고 deferred다. 통근은 완결된 로컬 authority만 사용하며 未/亥 등 미완결 역할을 보완하지 않는다. 통근 수나 강약 점수는 사용하지 않는다. stopped는 자동 rejected로 만들지 않고 기능 검토를 deferred로 남긴다. weakened는 기존 상태를 보존하며 새 임계값을 만들지 않는다.

생극 RelationFact의 confirmed assessment는 upstream의 결정론적 계산 Fact로 소비한다. 그 원본 calculation evidence가 provisional인 경우 이를 confirmed로 승격하지 않고 contextEvidenceIds에 유지한다. 판단 evidence는 원문 hash/revision/직접 절을 검증한 I-07 등 Rule receipt 및 기존 확정 근거만 사용한다. raw source, 역산 출생 시각, independent-cross-check의 불확실성도 그대로 유지한다.

출력은 candidate/rejected/deferred와 assessment를 분리한다. 기존 용신 judgment ID, 관계·root Fact ID, coverage, 상태, supporting/conflicting facts, evidence, 문서·Rule provenance, trace를 남긴다. RoleState는 생성하지 않는다. C215 C-10-1의 상신 기대값은 verify에서만 비교한다. 엔진에는 사례 ID나 기대 글자가 없다.
