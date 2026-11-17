# 최종 상신: 기존 기능 경로의 확정

입력은 기존 PatternJudgment, YongShenJudgment, SangShenCandidate, Fact, RuntimeState, evidence다. 후보/격국/용신/생극/투출/통근을 다시 생성하지 않는다. 원문 C215의 상신 값은 verify의 expected로만 읽는다.

A179 A-8-1 I-01/I-02a, A-8-2 I-04-1을 우선한다. I-03(A-2-2)의 격 성립 보조 역할, I-05(A-2-3)의 통근과 I-07의 생극 기준을 함께 적용한다. A-8-2 절차의 상신 확인 단계까지만 구현하며 I-04 성패, 병·구응, 운 유불리는 판정하지 않는다. D152/25-7 rev16과 mapping-A/implementation-readiness의 REVIEW를 범용 역할 공식으로 확대하지 않는다.

이 slice는 기존 후보가 제공한 칠살 용신 → 인성 보조 글자 → 일간 경로만 지원한다. 후보의 relatedYongShenIds를 확정 용신 judgment 및 용신 RoleState와 연결하고, 전달된 두 방향의 RelationFact를 검증한다. 관계를 새로 계산하거나 이름만으로 칠살격의 상신을 정하지 않는다. 존재·assessment·producer/scope·조사 coverage·직접 Rule receipt·통근 local authority·현재 기능 상태가 모두 유효해야 confirmed다. 후보 status=candidate 또는 runtime=active만으로는 확정하지 않는다.

상신 후보의 status와 근거 assessment는 별도다. 확정되지 않은 핵심 Fact/evidence, 누락/변경된 경로, 불완전한 local authority, legacy fallback, 미확정 격국/용신, 상태 handoff 불일치는 deferred다. stopped는 현재 기능이 정지했으므로 이 범위에서 상신 confirmed를 주장하지 않고 deferred다. 역할/투출 이력을 삭제하거나 영구 탈락시키지 않는다. weakened는 공급된 기능 상태로 보존하며 수치 임계값을 추가하지 않는다. 명시적인 경로 제외로 rejected인 후보만 그 범위의 rejected를 유지한다. 다른 격의 범용 상신 판단은 추가하지 않는다.

인입 극 관계와 원본 provisional calculation evidence는 후보의 conflicting/context 참조로 보존한다. 이를 병/손상/성패로 변환하지 않는다. RelationFact의 기존 confirmed assessment와 직접 Rule receipt를 소비하며 raw evidence를 승격하지 않는다. 미완결 未/亥나 다른 지장간을 보완하지 않는다.

최종 판단에는 source candidate/related yong judgment, supporting/conflicting facts, Rule/evidence, uncertainty, 현재 상태, trace와 provenance를 남긴다. confirmed 판단에만 상신 RoleState와 I-03 application을 생성한다. 용신 역할을 덮어쓰지 않고 같은 entity에 별도 상신 역할을 연결한다. bundle에는 기존 용신 역할을 보존하고 새 상신 역할만 추가하며 병/구응 역할은 생성하지 않는다.
