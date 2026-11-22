# FILUNE Compatibility-06A.1
## Korean Renderer Presentation Polish

진입 조건:

```text
COMPATIBILITY_KO_RENDERER_READY
```

이번 작업은 **표시 방식만 정리한다.**

명리 판단, C1~C5 semantic, C6-A assertion policy는 변경하지 않는다.

---

# ALLOWED INPUT

```text
src/docs/codex/compatibility-06a-customer-result-architecture-ko-result.md

현재 Compatibility KO Renderer
현재 FinalCompatibilityResult
현재 C6-A verifier
```

필요하면:

```text
src/docs/rules/master/16-compatibility-spec.md
```

에서 현재 확정된 의미 계약만 확인한다.

원자료 재연구 금지.

---

# 1. 최종 목표

성공:

```text
COMPATIBILITY_KO_RENDERER_FINAL_READY
```

실패:

```text
COMPATIBILITY_C6A1_FIX_REQUIRED
```

---

# 2. 절대 변경 금지

```text
C1 semantic
C2 semantic
C3 semantic
C4 semantic
C5 semantic

confirmed / deferred certainty
marriage opportunity
marriage favorable
marriage caution
relationship breakdown risk

A→B / B→A direction
```

변경:

```text
0
```

---

# 3. 첫 번째 수정 — 시간 라벨

현재 다음과 같은 표현:

```text
현재 · 2020년 1월 1일~2030년 1월 1일
```

은 고객에게 혼란을 준다.

현재 날짜가 그 기간 안에 포함되면:

```text
현재를 포함한 장기 흐름 · 2020년 1월 1일~2030년 1월 1일
```

처럼 표시한다.

---

# 4. 시간 관계 분류

Renderer는 실제 기준일과 Gregorian interval만 비교한다.

허용:

```text
past
current
current_spanning
future
unknown_calendar
```

실제 naming은 repository convention에 맞춘다.

---

# 5. past

기간 전체가 기준일 이전:

```text
지난 시기 · YYYY...
```

---

# 6. current

짧은 구간이 실제 기준일을 포함하고
현재 시기로 자연스럽게 볼 수 있으면:

```text
현재 · YYYY...
```

---

# 7. current_spanning

장기간 구간이 기준일을 포함하면서
과거와 미래를 모두 걸치면:

```text
현재를 포함한 장기 흐름 · YYYY~YYYY
```

사용.

단순:

```text
현재
```

로 축약하지 않는다.

---

# 8. future

기간 시작이 기준일 이후:

```text
앞으로 · YYYY...
```

---

# 9. calendar unknown

Gregorian projection이 없으면 기존대로:

```text
달력 시점 미확인
```

을 유지한다.

가짜 날짜 생성 금지.

---

# 10. 기준일

현재 서비스가 사용하는 evaluation/reference date가 있으면 그대로 사용한다.

새로운 운 계산 금지.

단순 Gregorian interval 비교만 한다.

---

# 11. 두 번째 수정 — 겹치는 기간 표현

Underlying Fact는 하나도 삭제하지 않는다.

하지만 같은 사람에게:

```text
2020~2030 marriage opportunity
2028~2029 marriage opportunity
```

처럼 상위 기간 안에 하위 기간이 중첩될 경우
고객 문장을 기계적으로 두 번 반복하지 않는다.

---

# 12. 전체 흐름 + 집중 구간

예:

```text
두 번째 사람에게는 2020~2030년 동안
관계를 공식화하기 쉬운 흐름이 이어집니다.

그중 2028년 2월~2029년 2월은
두 사람 모두에게 결혼·관계 공식화 흐름이 겹치는 시기입니다.
```

처럼 표현한다.

---

# 13. Mutual window 강조

개인 window와 mutual window가 중첩되면:

```text
individual window
→ 전체 흐름

mutual window
→ 그중 두 사람에게 동시에 강해지는 구간
```

으로 설명한다.

---

# 14. 중첩은 semantic 삭제가 아니다

Underlying:

```text
individual TimingFact
mutual TimingFact
```

를 모두 유지한다.

Presentation에서만 grouping한다.

---

# 15. 서로 다른 의미는 합치지 않는다

같은 기간이어도:

```text
marriage opportunity
marriage caution
relationship strain
```

은 별개 의미다.

예:

```text
2028년에는 결혼 이야기가 구체화되기 쉽습니다.
다만 같은 시기에 관계 부담도 함께 커집니다.
```

처럼 함께 보여준다.

---

# 16. 세 번째 수정 — 시기별 보기

현재:

```text
현재 · 결혼 가능성이 높아지는 시기 2번째 항목,
연애·결혼 흐름 1번째 항목...
```

형식은 고객용으로 사용하지 않는다.

이것은 내부 reference처럼 보인다.

---

# 17. 고객용 chronological timeline

`시기별 보기`는 실제 시간순 카드/항목으로 출력한다.

예:

```text
2028년 2월~2029년 2월

- 두 사람 모두 관계를 공식화하거나 결혼을 구체화하기 쉽습니다.
- 첫 번째 사람에게는 같은 시기에 관계 부담도 커집니다.
- 기존 문제가 있다면 관계가 크게 흔들릴 위험도 함께 높아집니다.
```

---

# 18. Timeline grouping

동일 기간의 Fact를:

```text
window
→ statements[]
```

형태로 묶는다.

Underlying source Fact ID는 모두 보존한다.

---

# 19. Timeline 정렬

순서:

```text
현재 포함 구간
가까운 미래
먼 미래
과거
달력 시점 미확인
```

또는 기존 product chronology convention을 따른다.

단 날짜가 있는 미래는 반드시 시간순 정렬한다.

---

# 20. 현재 포함 장기 window

장기 window 안에 단기 future window가 있다면:

```text
장기 흐름
+
그중 특히 중요한 시기
```

구조로 표현한다.

같은 문장을 반복하지 않는다.

---

# 21. 고객에게 section 번호 노출 금지

금지:

```text
1번째 항목
2번째 항목
섹션 7
section reference
```

Expected:

```text
0
```

내부 provenance에는 유지 가능하다.

---

# 22. 이름 사용

명시적 이름이 있으면 기존 C6-A 계약대로 이름 사용.

없으면:

```text
첫 번째 사람
두 번째 사람
```

유지.

---

# 23. 관계 상태

명시적 relationship status가 있으면
기존 C6-A의 상태별 문구 사용.

상태를 사주로 추정하지 않는다.

---

# 24. Sample A 재렌더링

기존 Sample A에서 특히 검증:

```text
2020~2030
2028~2029
```

중첩이 고객에게 자연스럽게 표현되는가.

Expected:

```text
현재를 포함한 장기 흐름
+
그중 2028~2029 집중 구간
```

---

# 25. Sample B

`달력 시점 미확인` Fact 여러 개를
항목 번호 목록으로 보여주지 않는다.

같은 의미군끼리 읽기 좋게 묶는다.

단 서로 다른 사람의 Fact는 identity를 보존한다.

---

# 26. Sample C

두 사람에게 각각 존재하는
breakdown risk를 한 문장으로 뭉개지 않는다.

가능하면:

```text
첫 번째 사람 쪽에서는 ...
두 번째 사람 쪽에서는 ...
```

처럼 원인이 다른 경우 분리한다.

---

# 27. 관계 파탄 위험 강도 유지

Presentation cleanup 과정에서:

```text
관계 파탄 위험이 뚜렷하게 높아집니다.
```

를:

```text
관계를 조금 조심하세요.
```

로 약화 금지.

---

# 28. 결혼 기회와 주의 유지

Grouping 과정에서:

```text
marriage opportunity
+
marriage caution
```

중 하나를 삭제하지 않는다.

---

# 29. balanced_mixed 유지

Presentation grouping 때문에:

```text
balanced_mixed
```

를:

```text
보통
```

으로 바꾸지 않는다.

---

# 30. 반복 문장 제거

동일 semantic + 동일 direction + 동일 window가
여러 section에서 반복될 때
고객 결과에서는 불필요한 반복을 줄인다.

하지만 section별 핵심 의미가 달라야 하는 경우는 유지한다.

---

# 31. Dedup 기준

문자열 단순 비교만 하지 않는다.

최소:

```text
semantic ID
direction
person
window
source fact
```

를 이용한다.

---

# 32. Headline 유지

현재 C6-A headline 의미는 변경하지 않는다.

Presentation cleanup은 headline policy를 재설계하지 않는다.

---

# 33. 신규 명리 판단 금지

이번 작업에서:

```text
new compatibility effect
new relationship timing
new marriage rule
new breakdown rule
```

생성:

```text
0
```

---

# 34. 신규 verifier

권장:

```text
scripts/verify-compatibility-renderer-ko-c6a1.mjs
```

---

# 35. 필수 검사

```text
current-long-window label violations
overlapping-window duplicate violations
customer item-number references
chronological ordering violations

certainty downgrade
Saju terminology
numeric scoring
invented outcome
orphan statement
```

Expected 모두:

```text
0
```

---

# 36. 기존 C6-A 검사 유지

```text
Saju terminology violations = 0
numeric score violations = 0
invented outcome violations = 0
certainty downgrade violations = 0
```

---

# 37. Regression

반드시:

```text
Compatibility C1-C5
C6-A renderer

Judgment 35/35
Personality
Money
Health
Relationship
Event Timing

npx tsc -b
npm run build
git diff --check
```

의미 기대값 변경 금지.

---

# 38. 결과 파일

생성:

```text
src/docs/codex/compatibility-06a1-ko-renderer-presentation-polish-result.md
```

---

# 39. 결과에 전체 샘플 재출력

Sample A/B/C를 다시 출력한다.

우리가 실제 고객 결과 품질을 확인할 수 있게
축약하지 않는다.

---

# 40. 최종 성공

다음을 만족하면:

```text
COMPATIBILITY_KO_RENDERER_FINAL_READY
```

조건:

```text
[ ] C5 semantic changes 0
[ ] C6-A semantic changes 0

[ ] long current window labeling corrected
[ ] overlapping windows grouped
[ ] chronological timeline customer-readable
[ ] item-number references 0

[ ] certainty downgrade 0
[ ] Saju terminology 0
[ ] numeric scoring 0
[ ] invented result 0

[ ] TypeScript PASS
[ ] Build PASS
```

---

# 41. 다음 단계

성공 후 바로:

```text
Compatibility-06B Japanese Renderer
```

로 이동한다.

일본어 Renderer는
**C6-A.1에서 확정한 고객 정보 구조와 의미를 그대로 번역**한다.

JA 단계에서 새로운 presentation architecture나
새 궁합 규칙을 만들지 않는다.