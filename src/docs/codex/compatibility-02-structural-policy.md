# FILUNE Compatibility-02
## Structural Compatibility Policy — Approved Scope Only

현재 상태:

```text id="xpwc0l"
COMPATIBILITY_CROSS_CHART_FACT_ENGINE_READY
```

이번 작업은 Compatibility-01에서 생성한 Cross-chart Fact를
구조적 궁합 결과로 연결한다.

---

# ALLOWED SOURCES

이번 작업에서 규칙 판정에 사용할 수 있는 것은 아래뿐이다.

```text id="4aqmj8"
src/docs/rules/master/03-branch-relations-master.md
src/docs/rules/master/04-root-twelve-stages-master.md
src/docs/rules/master/05-sangshen-byeong-gueung-master.md
src/docs/rules/master/06-pattern-effect-policy.md
src/docs/rules/master/09-engine-integration-spec.md

src/docs/codex/compatibility-01-cross-chart-fact-engine-result.md

사용자 승인 Compatibility C-01 ~ C-04
```

과거 A/B/C/D revision,
과거 Codex task/result,
과거 audit,
원자료의 이미 FILUNE에서 정규화한 규칙을
새 정책 근거로 사용하지 않는다.

---

# FIXED RULES

사용자가 승인한 규칙:

```text id="3yb4p7"
C-01
개인 Judgment A/B는 변경하지 않는다.

C-02
Cross-chart valid stem combine
→ Compatibility Runtime에서 양쪽 해당 기능 stopped

Cross-chart control
→ target 기능 weakened

C-03
상대가 제공하는 root는 CrossRootSupportFact로만 기록한다.
개인 RootState는 변경하지 않는다.

필요한 기능 root support
→ 도움 후보

해로운 기능/Byeong path root support
→ 문제 활성화 후보

C-04
A→B / B→A를 각각 판정한다.
숫자 점수는 사용하지 않는다.
mixed effect를 지우지 않는다.
```

---

# OUT OF SCOPE

이번 C2에서는 다음을 구현하거나 판단하지 않는다.

```text id="261lng"
원진
귀문
격각
새 암합 규칙

성격 궁합
결혼 가능 시기
결혼 유불리 시기
이별/이혼 위험 시기
future relationship sustainability

고객 문장
다국어 renderer
궁합 숫자 점수
```

위 항목은 후속 C3/C4에서 다룬다.

새 개념이 필요하면 임의 구현하지 말고:

```text id="3grp3z"
COMPATIBILITY_C2_POLICY_DECISION_REQUIRED
```

로 중단한다.

---

# 1. 최종 목표

성공:

```text id="k9p1ab"
COMPATIBILITY_STRUCTURAL_POLICY_READY
```

실패:

```text id="6vxtjt"
COMPATIBILITY_C2_FIX_REQUIRED
```

새 정책 결정 필요:

```text id="5njk9a"
COMPATIBILITY_C2_POLICY_DECISION_REQUIRED
```

---

# 2. 새 Master

다음 파일을 생성한다.

```text id="e451pd"
src/docs/rules/master/16-compatibility-spec.md
```

이번 C2에서 실제 확정된 규칙만 기록한다.

향후 C3/C4 규칙을 미리 넣지 않는다.

---

# 3. 입력

Compatibility-01의:

```text id="x4o8qi"
CrossStemInteractionFact[]
CrossBranchInteractionFact[]
CrossRootSupportFact[]
CrossRoleInteractionFact[]
```

만 사용한다.

---

# 4. 결과 방향

반드시:

```text id="1j09za"
A → B
B → A
```

독립적으로 계산한다.

---

# 5. 구조 효과 종류

이번 C2에서 허용되는 구조 의미는 아래뿐이다.

```text id="nzbwzq"
relieves_byeong
weakens_byeong

activates_byeong
strengthens_harmful_path

supports_required_function
damages_required_function

supports_required_root
supports_harmful_root
```

실제 코드 naming은 repository convention에 맞춘다.

새 생활 결과 semantic을 추가하지 않는다.

---

# 6. Byeong relief

상대의 Cross Interaction이
내 특정 Byeong path를 실제로 차단하면:

```text id="vi4d9y"
relieves_byeong
```

반드시:

```text id="6v1c2n"
targetByeongId
crossFactId
```

를 가진다.

단순 접촉만으로 해결 확정 금지.

---

# 7. stopped vs weakened

```text id="sjg3dy"
valid combine → stopped
control → weakened
```

기존 승인 규칙 유지.

따라서:

```text id="9z8fup"
Byeong actor stopped
```

과

```text id="qx1lwu"
Byeong actor weakened
```

을 같은 결과로 만들지 않는다.

---

# 8. harmful activation

상대가:

```text id="g78qzp"
Byeong actor에 root 제공
harmful function generate
harmful path 강화
```

하면:

```text id="nvgs76"
activates_byeong
또는
strengthens_harmful_path
```

로 기록한다.

---

# 9. 필요한 기능 지원

상대가 내 confirmed required function에:

```text id="jlg48b"
generate
root support
protective structural effect
```

를 제공하면:

```text id="43eebq"
supports_required_function
```

후보.

실제 target function이 필요해야 한다.

---

# 10. 필요한 기능 손상

상대가 내 required function을:

```text id="of1oxn"
control → weakened
combine → stopped
```

시키면:

```text id="rfqe9u"
damages_required_function
```

---

# 11. Root support

CrossRootSupportFact가 있을 때
receiver function을 확인한다.

필요 기능이면:

```text id="a1xbmo"
supports_required_root
```

해로운 기능 / Byeong actor이면:

```text id="pl5sqb"
supports_harmful_root
```

---

# 12. Root support 자동 favorable 금지

```text id="tnglkd"
root support exists
→ good
```

금지.

---

# 13. 개인 상태 mutation 금지

Compatibility result 때문에:

```text id="m44uxj"
Judgment A
Judgment B
RootState A
RootState B
RoleHistory A
RoleHistory B
```

변경:

```text id="nl5ou4"
0
```

---

# 14. Branch Fact

CrossBranchInteractionFact는
현재 `03-branch-relations-master.md` 결과 그대로 사용한다.

이미 확정된:

```text id="phvg35"
삼합
반합
방합
육합
충
형
파
해
```

규칙을 다시 연구하지 않는다.

---

# 15. Branch relation 자체로 유불리 판정 금지

```text id="afvbgb"
합 = favorable
충 = unfavorable
```

금지.

실제 role/function/root에 구조적 효과가 연결되는 경우만 사용한다.

---

# 16. mixed effect 보존

예:

```text id="jp6170"
B → A
supports_required_function

동시에

B → A
activates_byeong
```

이면 둘 다 보존한다.

하나를 삭제하지 않는다.

---

# 17. directional verdict

각 방향별 결과:

```text id="r0v3hr"
favorable
favorable_dominant
minor_effect
unfavorable_dominant
unfavorable
```

를 사용할 수 있다.

숫자 점수는 금지.

---

# 18. verdict는 Fact 개수로 결정 금지

금지:

```text id="ndyffc"
positive 3개
negative 2개
→ favorable
```

실제 구조 경로를 본다.

---

# 19. 우선 판단 기준

숫자 weight가 아니라 구조 우선순위:

```text id="abdc59"
1. 핵심 Byeong path 해소 / 활성화
2. confirmed required function 지원 / 손상
3. required/harmful root 작용
4. 그 외 연결된 structural function
5. raw relation only
```

raw relation 개수가 상위 구조 결론을 뒤집지 않는다.

---

# 20. favorable

핵심 Byeong path가 실제로 해소되거나
핵심 required function이 확실히 보호되고
동급 이상의 harmful activation이 없으면:

```text id="kovqyn"
favorable
```

---

# 21. favorable_dominant

도움과 손상이 공존하지만
핵심 구조 해결이 더 중요하면:

```text id="r7xhy0"
favorable_dominant
```

---

# 22. unfavorable

핵심 harmful path가 활성화되거나
핵심 required function이 손상되고
이를 상쇄할 구조 relief가 없으면:

```text id="mo3nca"
unfavorable
```

---

# 23. unfavorable_dominant

도움도 있으나
핵심 harmful path 활성화 또는
required function 손상이 우세하면:

```text id="9x50bd"
unfavorable_dominant
```

---

# 24. minor_effect

Cross relation은 있지만
핵심 구조 기능에 실제 영향을 주지 못하면:

```text id="vu2rcz"
minor_effect
```

---

# 25. positive + negative 때문에 deferred 금지

mixed effect라는 이유로:

```text id="9eaj0s"
deferred
ambiguous
```

처리하지 않는다.

실제 evidence가 부족할 때만 deferred 허용.

---

# 26. 두 방향 평균 금지

예:

```text id="g04qu9"
A → B = favorable
B → A = unfavorable
```

그대로 보존한다.

이를:

```text id="4pgfpb"
average = neutral
```

로 만들지 않는다.

---

# 27. Source Fixture

Compatibility-01에서 이미 사용한
source snapshot 3쌍을 그대로 재사용한다.

새 source fixture를 만들지 않는다.

---

# 28. Synthetic Contract Fixtures

최소:

```text id="set1rh"
combine stops Byeong
control weakens Byeong
combine stops required function
control weakens required function
required root support
harmful root support
support + damage coexist
asymmetric A→B / B→A
```

검증.

---

# 29. 결과 약화 금지

구조가 확정되면:

```text id="l61hhy"
favorable
unfavorable
```

등을 확정한다.

AI식:

```text id="ltx26s"
어떤 영향이 있을 수 있음
관계 변화 가능
```

으로 축소하지 않는다.

---

# 30. 고객 생활 결과는 아직 만들지 않는다

이번 C2에서:

```text id="w86zrx"
결혼한다
이혼한다
헤어진다
잘 맞는다
성격이 맞는다
```

등의 생활 결과는 만들지 않는다.

이유는 보수적 출력 때문이 아니라,
C2가 **Structural Compatibility Layer**이기 때문이다.

생활 결과는 C3/C4에서 별도로 연결한다.

---

# 31. Verification

신규 verifier:

```text id="w8ckrt"
scripts/verify-compatibility-structural-policy-c2.mjs
```

---

# 32. 필수 검증

```text id="slj8dy"
A→B effects
B→A effects

Byeong relief
Byeong activation

required function support
required function damage

required root support
harmful root support

mixed effects
asymmetric effects

directional verdict
```

---

# 33. Integrity

Expected:

```text id="igx5iu"
duplicate IDs = 0
orphan provenance = 0
unstable IDs = 0

Judgment mutation = 0
RootState mutation = 0
```

---

# 34. Existing regression

최소:

```text id="087rwb"
Compatibility-01
Judgment 35/35
Branch regression
Root regression
Role/Byeong regression

Money
Health
Relationship
Personality
Event Timing Batch 1
```

기대값 변경 금지.

---

# 35. TypeScript / Build

```text id="nvap3o"
npx tsc -b
npm run build
```

PASS.

---

# 36. 결과 파일

```text id="h6f545"
src/docs/codex/compatibility-02-structural-policy-result.md
```

---

# 37. 결과 보고

```text id="93sguy"
Structural effects:
A→B:
B→A:

Byeong relief:
Byeong activation:

Required support:
Required damage:

Required root support:
Harmful root support:

favorable:
favorable_dominant:
minor_effect:
unfavorable_dominant:
unfavorable:

mixed preserved:
asymmetric preserved:

deferred:
```

---

# 38. 새 정책 발견 시

이번 허용 범위 밖의 개념이 필요하면
구현하지 않는다.

```text id="x12uxx"
COMPATIBILITY_C2_POLICY_DECISION_REQUIRED
```

로 종료.

반드시:

```text id="jjkj74"
Question:
Why required:
Existing FILUNE rule:
Option A:
Option B:
Engine consequence:
```

를 보고한다.

---

# 39. 최종 판정

다음을 만족하면:

```text id="to7dvq"
COMPATIBILITY_STRUCTURAL_POLICY_READY
```

조건:

```text id="2nv4no"
[ ] Master 16 생성
[ ] 승인 범위만 기록

[ ] Cross facts → structural effect 연결
[ ] A→B / B→A 보존

[ ] Byeong relief/activation 분리
[ ] required support/damage 분리
[ ] required/harmful root 분리

[ ] mixed effect 보존
[ ] asymmetric effect 보존

[ ] qualitative verdict 생성
[ ] numeric score 0
[ ] raw count scoring 0

[ ] 승인되지 않은 새 궁합 개념 0

[ ] Judgment mutation 0
[ ] RootState mutation 0

[ ] C1 PASS
[ ] 기존 회귀 PASS
[ ] TypeScript PASS
[ ] Build PASS
```

---

# 40. 이후 고정 로드맵

C2 성공 후:

```text id="luidcs"
Compatibility-03
Personality Interaction

Compatibility-04
Relationship Lifecycle & Timing
```

C4에서는 현재 source가 지원하는 범위에서 최소:

```text id="3obn32"
relationship formation window
marriage opportunity window
marriage favorable/unfavorable window
relationship strain window
separation/divorce risk window
```

를 다룬다.

중요:

```text id="eylu0x"
결혼 가능 시기
≠
좋은 결혼 시기
```

를 분리한다.

또한:

```text id="mx8efm"
관계 악화/이혼 위험 증가
≠
무조건 이혼
```

으로 처리하되,
근거가 강하면 위험 시기는 명확하게 판정한다.

C4는 기존 Event Timing Engine을 최대한 재사용하며
새로운 임의 점수 체계를 만들지 않는다.