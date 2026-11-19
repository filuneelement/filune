P1-3 비견격·겁재격·양인격과 Role Engine

세 격을 별도 정책 계열로 등록했다.

판정 코어는 월령과 기존 투출 이력을 보존하고, specialYongShen에 주용신 후보와 식상 보조 후보를 기록한다.

Role Engine은 원국의 역할 이력, 현재 상태, 현재 기능과 운 효과를 분리해 내보낸다.

근거와 구현 위치

용신 자격과 양인 인정 범위는 BG-012, BG-031, BG-044~045, BG-052~053 적용.

정책 방향과 근거 상태는 PP-700~906, PA-700~905 적용.

실제 작동 경로를 확인한 뒤 역할 기록.

GuEung은 targetByeongId 필요.

운에서 발생한 해소는 LuckEffect로 기록.

격별 정책

격

등록 Policy

용신·역할 연결

신규 검증

比肩

4 + 용신 자격 규칙 2

정관·재성을 주 후보, 식상을 보조. 칠살 주용신 자격 제외. 정관제비는 실제 재성 보호 또는 비견 과다 근거 확인. 유효 통관은 favorable_auxiliary. 재생살은 해로운 칠살에 실질적으로 기여할 때 병 경로.

6

劫財

6

정관·칠살·재성을 주 후보로 열어두고 식상을 보조. 칠살제겁은 실제 겁재 문제, 칠살 Root 및 정성 Capacity 확인. 재생살 필요·해로움 분기 구분.

6

羊刃

6 + 보류 1

甲卯·丙午·庚酉·壬子만 인정. 칠살 → 정관 → 재성 순으로 검토. 戊午 제외. 필요한 칠살을 손상하는 제살·극살·합살은 병 경로 가능.

9

PEER-02·04는 주용신 자격 계약으로 구현했다.

겁재격 6개 등록에는 ROB-05 필요·해로움 두 분기가 포함된다.

Role Engine 검증

항목

결과

Role non-exclusive

PASS — 동일 재성이 YongShen과 ConditionalByeong 이력 동시 유지

No-Byeong

PASS — 병이 없으면 none, GuEung은 not_applicable

Protective Standby SangShen

PASS — 원국 인성이 정관 보호 대기와 운 활성화

ConditionalByeong

PASS — harmful 財生殺 실제 작동 시 활성화

GuEung targetByeongId

PASS — 해소 대상 병 경로 연결된 원국 해결자만 기록

LuckReliefEffect

PASS — stopped 병 이력 유지, 해소 발생 scope에서 효과 기록

남은 조건

BG-045에 따라 겁재격의 正官·七殺·財 절대 순위는 보류.

七殺 Capacity 및 과다 여부는 확인된 정성 근거에 의존.

양인격 印增刃勢(BLADE-07)는 실행 조건 확인 전까지 deferred.

BLADE-06은 유효합과 필요한 七殺 제어 경로를 요구.

검증 결과

검증

결과

npx tsc -b

PASS

npm run build

PASS

기존 회귀

40/40

P0

PASS

P1-1

23/23

P1-2

25/25

P1-3

30/30

FAIL 없음.

PARTIAL은 승인된 deferred/정성 근거 의존 항목뿐.

NOT_IMPLEMENTED 없음.