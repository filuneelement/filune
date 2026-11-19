# FILUNE Codex P3-C
## Localization Authority Mapping 구축

일본어 Personality Renderer 구현은 완료되었고 다음 상태다.

```text
READY_FOR_PERSONALITY_RENDERER_JA_AUDIT
```

현재 localization 원문:

```text
src/docs/source/localization/
FILUNE-ja-en-terminology-rendering-standard.md
```

이 원문은 **수정하지 않는다.**

원문 자체가 다음 원칙을 명시한다.

```text
- 명리 판정을 새로 만들지 않는다.
- 한국어 확정 문서의 판정을 일본어·영어로 옮기는 방법만 정한다.
- 번역과 한국어 확정 판정이 충돌하면 번역을 고친다.
- 한국어 고객 문장을 거쳐 중역하지 않는다.
```

이번 작업의 목적은 이 원문과 현재 FILUNE authority/master 사이의 우선순위를 명확히 고정하는 것이다.

---

# 1. 산출물

새 문서:

```text
src/docs/rules/authority/mapping-localization.md
```

를 만든다.

Codex 작업 결과는:

```text
src/docs/codex/p3c-localization-authority-mapping-result.md
```

에 기록한다.

---

# 2. 절대 원칙

다음 source 문서는 변경하지 않는다.

```text
src/docs/source/localization/FILUNE-ja-en-terminology-rendering-standard.md
```

이 문서는 작성 당시의 source/provenance로 보존한다.

---

# 3. 판정과 번역을 분리

Authority Mapping에서 반드시 다음 우선순위를 명시한다.

```text
Structural / Personality 판단
→ 현행 FILUNE authority/master가 우선

용어 / 문체 / 고객 표현
→ localization source가 우선
```

즉:

```text
판정 의미 ≠ localization source가 결정
표현 방식 ≠ Structural Engine이 결정
```

이다.

---

# 4. Authority hierarchy

저장소를 조사하여 현재 사용 중인 최신 authority revision을 확인한다.

최소 대상:

```text
25-7
A
B
C
D
```

현재 authority 폴더의 실제 파일을 기준으로 latest revision을 기록한다.

revision 번호를 추측하지 않는다.

---

# 5. Master hierarchy

현재 `src/docs/rules/master/`를 확인하여
localization과 관련된 최신 master를 기록한다.

최소:

```text
03-branch-relations-master.md
04-root-twelve-stages-master.md
05-sangshen-byeong-gueung-master.md
08-luck-master.md
09-engine-integration-spec.md
11-personality-master.md
12-personality-knowledge-schema.md
```

실제 존재 파일 기준으로 작성한다.

---

# 6. Localization source의 작성시점 표기

원문에 다음과 같은 작성 당시 revision 표기가 존재하더라도:

```text
A rev179
B rev38
C rev215
D rev152
```

이를 현재 판정 revision으로 강제하지 않는다.

Mapping 문서에:

```text
작성 당시 provenance
```

로만 기록한다.

---

# 7. 충돌 처리

localization source와 현재 authority/master가 충돌하면:

```text
현재 authority/master의 판정 의미를 유지
↓
localization 표현만 수정
```

한다.

금지:

```text
localization 문장에 맞추기 위해
Structural/Personality 판단을 변경
```

---

# 8. Personality 특칙

Personality Renderer에서는:

```text
PersonalityResult
```

가 유일한 의미 입력이다.

localization source는:

```text
일본어 표현
호칭
문체
확정/조건부 어미
금지어
내부용어 표준
```

에만 사용한다.

---

# 9. KO → JA 중역 금지

Mapping에 다음을 명시한다.

```text
PersonalityResult → JA Renderer
```

직접 연결.

금지:

```text
PersonalityResult
→ KO Renderer
→ Korean text
→ Japanese
```

---

# 10. 공통 엔진 원칙

언어별 판단 엔진을 만들지 않는다.

```text
Canonical Engine
Judgment Engine
Personality Engine
```

은 언어 공통 1개다.

언어별:

```text
KO Renderer
JA Renderer
EN Renderer
```

만 분리한다.

---

# 11. 일본어 내부 용어

localization source의 glossary를
일본어 내부 출력 표준으로 사용한다.

예:

```text
日干
日柱
月令
天干
地支
通変星
比肩
劫財
食神
傷官
偏財
正財
偏官
正官
偏印
印綬
格局
用神
相神
病
救応
透干
通根
合去
```

단 고객 Personality 본문에는 전문용어를 노출하지 않는다.

---

# 12. 고객용 용어와 내부 용어 분리

반드시:

```text
Internal terminology
≠
Customer wording
```

를 유지한다.

예:

```text
Internal: 用神
Customer: 실제 작용을 평이한 일본어로 설명
```

---

# 13. 확정도 계약

localization source의 상태 표현을 현행 Personality 상태와 매핑한다.

최소:

```text
confirmed
→ 확정형

contextual / conditional
→ 조건부형

reduced
→ 약화된 현재 작용

inactive
→ 현재 본문 제외

deferred
→ 판단한 것처럼 쓰지 않음
```

---

# 14. Personality의 deferred와 localization deferred

둘을 혼동하지 않는다.

특히 현재:

```text
TenGodProminence = deferred
```

는 Renderer가 임의로 해결하지 않는다.

금지:

```text
最も強い
一番目立つ
圧倒的
```

---

# 15. 12운성 충돌 처리

localization source에는 작성 당시:

```text
12운성은 FILUNE 현행 규칙에 판정 규칙 없음
```

이라는 취지의 문장이 있다.

현재:

```text
src/docs/rules/master/04-root-twelve-stages-master.md
```

가 존재하므로
**현행 04 master의 판정 계약을 우선한다.**

Mapping 문서에 이를 명시한다.

단 localization source 원문은 수정하지 않는다.

---

# 16. 12운성 고객 표현

현행 master가 제한적 supporting evidence로 사용하는 경우에도
Renderer가 12운성 이름 자체를 고객 본문에 노출하지 않는 기존 localization 원칙은 유지한다.

즉:

```text
판정 사용 여부
→ 현행 master

고객 용어 노출 여부
→ localization rule
```

로 분리한다.

---

# 17. 용신 정의

localization source의 `用神` 번역은
FILUNE 내부 정의를 표현하기 위한 용어 표준일 뿐이다.

다른 일본/영어 명리 자료의:

```text
守護神
喜神
Useful God
Favorable Element
```

개념을 FILUNE 판정에 가져오지 않는다.

---

# 18. 정인 일본어 표기

일본어 내부 출력에서:

```text
印綬
```

를 고정 표기로 사용한다.

`正印`은 동의어 인식 범위로만 취급한다.

단 내부 TypeScript canonical TenGod enum을 일본어 때문에 변경하지 않는다.

---

# 19. 편관 일본어 표기

일본어 내부 표기는:

```text
偏官
```

을 기본으로 한다.

`七殺`은 동의어로 인식할 수 있으나
고객 본문에 노출하지 않는다.

---

# 20. 세운 일본어 표기

일본어 내부 표기는:

```text
年運
```

으로 고정.

`歳運`, `流年`은 동의어 인식 범위.

Canonical scope 이름은 변경하지 않는다.

---

# 21. 고객 표현 금지어

Mapping에 localization source의 금지 범주를 요약한다.

최소:

```text
명리 전문용어
あなた・君・お前
고풍 점술체
공포 표현
고객 미제공 사건 단정
생활상태 단정
건강 추정
점수/확률/랭크
투자 지시
운명적 인연 단정
```

---

# 22. source와 authority 역할

Mapping 문서에 다음 표를 만든다.

| 문서군 | 역할 | 판정 변경 권한 |
|---|---|---|
| source/localization | 원문·용어·문체 근거 | 없음 |
| rules/authority | 현행 적용 우선순위 | 있음 |
| rules/master | 구조/Personality 판정 계약 | 있음 |
| render/* | 표현 실행 | 없음 |

---

# 23. Renderer dependency

다음 구조를 명시한다.

```text
Personality Engine
↓
PersonalityResult
↓
Locale Renderer
```

Renderer가:

```text
Judgment Engine
Knowledge source
다른 언어 Renderer
```

를 우회해 새 판단을 만들면 안 된다.

---

# 24. JA Renderer 현재 구조 감사

현재 코드에서 확인:

```text
renderPersonalityJa()
```

가:

```text
PersonalityResult
```

를 직접 입력으로 받는지 확인한다.

다음은 0이어야 한다.

```text
Japanese separate Personality Engine
JA → KO Renderer call
JA → Judgment direct dependency
```

---

# 25. 한국어 Renderer 변경 금지

이번 Mapping 작업에서:

```text
src/lib/personality/render/ko/
```

수정하지 않는다.

---

# 26. 일본어 Renderer 의미 변경 금지

이번 단계는 authority mapping 작성이 목적이다.

P3-C가 이미 통과한 일본어 Renderer의 문장 로직을
이 작업에서 임의로 다시 수정하지 않는다.

문제가 발견되면 보고만 하고
P3-D audit에서 처리한다.

---

# 27. source/localization 변경 금지 검사

반드시:

```bash
git diff -- src/docs/source/localization/
```

를 확인한다.

원문 파일 내용 변경:

```text
0
```

이어야 한다.

신규 source 파일이 이미 staged 상태라면
그 파일 생성 자체는 정상이다.

---

# 28. mapping 문서 필수 섹션

`mapping-localization.md`에는 최소:

```text
1. 목적
2. Source 문서
3. 현재 Authority
4. 우선순위
5. Structural 판정과 Localization 분리
6. Personality Renderer 적용
7. 일본어 고정 용어
8. 영어 고정 용어
9. 고객 금지 표현
10. Revision 차이 처리
11. 12운성 특칙
12. 다국어 공통엔진 계약
13. 충돌 처리
```

가 있어야 한다.

---

# 29. 출처 구분

각 규칙에 가능하면 다음 provenance를 표시한다.

```text
SOURCE_LOCALIZATION
CURRENT_AUTHORITY
CURRENT_MASTER
```

새 규칙을 발명하지 않는다.

---

# 30. 금지

이번 문서에서:

```text
SOURCE_INFERENCE
FILUNE_APPROVED_OVERRIDE
```

가 새로 필요한 경우 임의로 확정하지 않는다.

필요하면:

```text
DEFERRED
```

로 보고한다.

---

# 31. 검증

최소 확인:

```text
localization source unchanged
latest authority revisions identified
current master paths identified
12운성 conflict resolved by priority
Personality Engine count = 1
JA → KO dependency = 0
JA → Judgment dependency = 0
```

---

# 32. TypeScript / Build

이번 작업이 문서만 변경한다면
코드 변경이 없는지 확인한다.

코드 변경 0이면 기존 build를 강제로 다시 돌릴 필요는 없지만,
결과 보고서에:

```text
code changes = 0
```

을 명시한다.

---

# 33. 결과 보고

`src/docs/codex/p3c-localization-authority-mapping-result.md`

에 다음을 기록한다.

## A. 전체 판정

```text
READY_FOR_JA_RENDERER_AUDIT
```

또는:

```text
LOCALIZATION_MAPPING_FIX_REQUIRED
```

## B. Source

```text
localization source path:
source changed:
```

Expected:

```text
source changed = no
```

## C. Current authority

```text
25-7:
A:
B:
C:
D:
```

실제 저장소 latest revision 기록.

## D. Current master

관련 master 경로 기록.

## E. Conflict handling

```text
revision mismatch:
12운성:
용신 정의:
일본어 내부 용어:
```

## F. Architecture

```text
Personality Engine count:
JA separate engine:
JA → KO:
JA → Judgment:
```

Expected:

```text
1
no
no
no
```

## G. 남은 항목

```text
FAIL:
PARTIAL:
DEFERRED:
SOURCE_MISSING:
NOT_IMPLEMENTED:
```

---

# 34. 종료 조건

다음이면:

```text
READY_FOR_JA_RENDERER_AUDIT
```

판정한다.

```text
[ ] localization source 원문 변경 0
[ ] 최신 authority 확인
[ ] latest master 확인
[ ] revision 차이는 provenance로만 처리
[ ] 현행 판정이 localization보다 우선
[ ] localization은 용어·문체만 담당
[ ] 12운성은 현행 master 우선
[ ] Personality Engine 1개 유지
[ ] JA 별도 엔진 없음
[ ] JA → KO 0
[ ] JA → Judgment 0
[ ] 새 판정 규칙 발명 0
```

---

# 35. 다음 단계

이 작업 통과 후:

```text
P3-D
Japanese Personality Renderer Semantic Audit
```

로 진행한다.

P3-D에서는 실제 대표 fixture를 일본어로 출력해:

```text
Internal PersonalityResult
↔ Japanese Customer Text
```

의 의미 보존과 일본어 자연성을 감사한다.

이번 Mapping 문서는 이후 영어 Renderer에서도 동일하게 사용한다.