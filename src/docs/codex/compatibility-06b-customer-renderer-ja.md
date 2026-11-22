# FILUNE Compatibility-06B
## Japanese Customer Renderer

진입 조건:

```text
COMPATIBILITY_KO_RENDERER_FINAL_READY
```

현재 완료:

```text
C1 Cross-chart Fact Engine
C2 Structural Compatibility
C3 Personality Interaction
C4 Relationship Lifecycle & Timing
C5 Final Compatibility Assembly

C6-A Korean Renderer
C6-A.1 Korean Presentation Polish
```

이번 단계에서는
**일본어 고객 결과 Renderer만 구현한다.**

새로운 명리 판단:

```text
0
```

---

# 1. 핵심 원칙 — 한국어 중역 금지

일본어 Renderer는:

```text
FinalCompatibilityResult
↓
Japanese Customer Renderer
```

로 직접 변환한다.

금지:

```text
FinalCompatibilityResult
↓
Korean customer sentence
↓
Japanese translation
```

한국어 문장을 parsing하거나 번역해서
일본어 결과를 만들지 않는다.

---

# 2. C6-A.1 정보 구조는 그대로 사용

고객 결과의 section 구조와
presentation architecture는 한국어 최종본과 동일하게 유지한다.

최소:

```text
01 二人の関係をひと目で
02 この関係の強み
03 この関係で気をつけたいこと
04 お互いに与える影響
05 性格とコミュニケーション
06 恋愛・結婚の流れ
07 関係が楽になる時期
08 関係の負担が大きくなる時期
09 結婚が具体化しやすい時期
10 結婚を進めやすい時期 / 負担が大きい時期
11 関係が大きく揺れやすい時期
12 時期ごとの流れ
```

실제 Japanese UX wording은 자연스럽게 조정 가능하다.

단 section의 **의미와 순서**는 C6-A.1과 대응해야 한다.

---

# 3. Localization Authority

반드시 현재 localization authority를 따른다.

고객 일본어:

```text
현대 일본어
부드러운 대화체
강한 남성어/여성어 금지
고풍 점술체 금지
```

기본 어미:

```text
〜だよ
〜なんだ
〜している
〜しやすい
〜になる
```

---

# 4. 호칭

금지:

```text
あなた
君
お前
```

이름이 있으면:

```text
{名前}さん
```

으로 고정한다.

금지:

```text
様
ちゃん
くん
```

이름이 없으면 가능한 한 주어를 생략하거나:

```text
一人目
二人目
```

등 중립적 UI 표현을 사용한다.

---

# 5. 확정도 보존

내부:

```text
confirmed
```

이면 일본어도 확정형으로 쓴다.

예:

```text
〜だよ
〜なんだ
〜している
```

금지:

```text
〜かもしれない
もしかすると
たぶん
可能性もある
```

로 certainty를 임의 하향.

---

# 6. conditional은 conditional로 유지

내부 조건부 결과는:

```text
〜しやすい
〜なら
〜こともある
```

처럼 표현한다.

조건부를:

```text
必ず
絶対
間違いなく
```

으로 올리지 않는다.

---

# 7. breakdown risk 강도

내부:

```text
relationship_breakdown_risk = confirmed
```

이면 확정된 **위험 흐름**으로 표현한다.

예:

```text
この時期は、関係が大きく揺れやすい流れがはっきり出ているよ。
すでに負担がたまっている関係なら、
別れや距離を置く決断につながりやすい時期なんだ。
```

금지:

```text
少し気をつけて
ちょっと不安定かも
```

수준으로 하향.

---

# 8. 사건 확정과 위험 확정은 구분

다음은 금지:

```text
この時期に離婚するよ。
必ず別れるよ。
```

엔진이 확정한 것은:

```text
breakdown risk
```

이지 실제 이혼 사건 자체가 아니다.

---

# 9. 사주 전문용어 고객 노출 금지

고객 일본어에 다음 직접 노출 금지:

```text
用神
相神
病
救応
格局

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

大運
歳運
月運
日運
日辰

通根
透干
三合
六合
冲
刑
破
害
```

내부 provenance에는 허용.

---

# 10. 고풍 점술어 금지

고객 결과에:

```text
吉
凶
大吉
凶運
宿命
天中殺
空亡
災い
破滅
```

금지.

---

# 11. 숫자 궁합 금지

금지:

```text
相性80点
90%
ランクA
★★★★★
確率
```

---

# 12. Structural favorable

내부:

```text
favorable
```

일본어 의미:

```text
相手が、一人では解きにくい問題をほどいたり、
必要な力を実際に引き出してくれる関係
```

자연스러운 고객 문장으로 구성한다.

---

# 13. favorable_dominant

```text
助けになる面と負担になる面は両方あるけれど、
関係全体では支えになる働きのほうが大きいよ。
```

의미를 유지한다.

---

# 14. balanced_mixed

절대:

```text
普通
どちらとも言えない
微妙
半々
```

로 번역하지 않는다.

정확한 의미:

```text
大きく助け合える部分と、
強くぶつかる部分がどちらもはっきりある関係
```

이다.

---

# 15. unfavorable_dominant

생활 의미:

```text
助けになる部分もあるけれど、
相手と一緒にいることで元々の弱点や負担が
大きくなりやすい面のほうが重要
```

---

# 16. unfavorable

생활 의미:

```text
相手との関係が、
必要な働きを弱めたり
元々抱えている問題を強めやすい関係
```

---

# 17. minor_effect

```text
影響はあるけれど、
人生の大きな土台を変えるほど強い作用ではない
```

의미를 사용한다.

---

# 18. A→B / B→A 방향 보존

일본어에서도 방향을 지운:

```text
お互いに影響します
```

한 줄로 축약 금지.

예:

```text
一人目から二人目へは、支えになる働きが強いよ。

逆に二人目から一人目へは、
元々の負担を大きくしやすい面が目立つんだ。
```

---

# 19. 이름이 있는 경우

예:

```text
YunaさんからMikaさんへは、
一人では解きにくい問題をほどく働きが強いよ。
```

이름 남용 금지.

같은 문단에서 반복적으로 이름을 호출하지 않는다.

---

# 20. Strengths

C5 strengths를 일본어 생활 언어로 직접 mapping한다.

예:

```text
relieves_byeong
→ 一人では解きにくかった問題が、相手との関係でほどける

supports_required_function
→ 必要な力を相手が引き出してくれる

supports_required_root
→ 持っている長所が実際に力を出しやすくなる

communication_relief
→ 言葉や気持ちを伝えやすくなる

relationship_relief
→ 関係を続ける負担が軽くなる
```

---

# 21. Risks

예:

```text
strengthens_harmful_path
→ 元々抱えている問題が、関係の中で大きくなりやすい

damages_required_function
→ 普段できている大事なことが、相手といるとやりにくくなる

supports_harmful_root
→ 元々の弱点が長引きやすくなる

communication_friction
→ 気持ちを内側にため込み、会話が減りやすい

relationship_strain
→ 関係を続ける負担が大きくなる

relationship_breakdown_risk
→ 大切な関係が大きく揺れやすい時期
```

---

# 22. Personality — Resource Dominance 고객 번역

내부:

```text
ResourceDominance
OutputSuppression
ExpressionConstraint
```

을 그대로 번역하지 않는다.

예:

```text
考えをすぐ外に出すより、
自分の中で長く整理してから動く傾向が強いんだ。
気持ちや考えをその場で言葉にするのは得意なほうではないよ。
```

---

# 23. 양쪽 expression restraint

내부:

```text
mutualExpressionRestraint
communicationFriction
```

예:

```text
二人とも、気持ちをすぐ口にするより
自分の中で考え続けるほうなんだ。

近くなるほど必要な話を後回しにして、
会話が詰まりやすい組み合わせだよ。
```

---

# 24. Current expression relief

```text
今は普段よりも、
言葉や気持ちを外に出しやすい流れだよ。

いつもなら話しにくいことも、
この時期はお互いに言葉にしやすいんだ。
```

처럼 표현 가능.

---

# 25. Natal vs Current 보존

가능:

```text
もともとは会話が詰まりやすい二人だけれど、
今は気持ちを言葉にしやすくなっていて、
普段より関係をほぐしやすい時期だよ。
```

원국과 현재를 상쇄하지 않는다.

---

# 26. 관계 형성

내부:

```text
relationship_formation
```

일본어:

```text
新しい接点が生まれやすい
距離が縮まりやすい
```

등 source/localization authority에 맞게 표현한다.

---

# 27. 관계 변화

```text
関係の形や距離感に変化が起きやすい時期
```

로 표현 가능.

자동으로 좋은 변화/나쁜 변화라고 쓰지 않는다.

---

# 28. 운명적 인연 표현 금지

금지:

```text
運命の人
赤い糸
魂の相手
宿命の相手
```

---

# 29. Marriage Opportunity

내부:

```text
marriage_opportunity
```

예:

```text
結婚や関係を正式な形にする話が
具体的になりやすい時期だよ。
```

---

# 30. 관계 상태 미상

현재 결혼/연애 상태를 추정하지 않는다.

상태가 없으면:

```text
関係を正式な形に進めやすい時期
```

처럼 중립적으로 표현한다.

---

# 31. explicit relationship status

사용자가 명시한 상태가 있으면
해당 문맥에 맞춰:

```text
交際中
既婚
```

등을 사용할 수 있다.

사주에서 상태 추정 금지.

---

# 32. Marriage Favorable

```text
結婚を進めるなら、
関係そのものもその決断を支えやすい時期だよ。
```

의미를 사용한다.

---

# 33. Marriage Caution

내부:

```text
marriage_opportunity
+
marriage_caution
```

이면 둘 다 유지한다.

예:

```text
結婚の話は具体的になりやすい時期だよ。
ただ、同じ時期に二人で抱える負担も大きくなるんだ。

結婚しやすい時期と、
結婚後も楽に続けやすい時期は同じではないよ。
```

---

# 34. Opportunity ≠ Favorable

다음 shortcut 금지:

```text
結婚しやすい
→ 結婚に最適
```

---

# 35. Relationship Strain

예:

```text
関係を続けるために必要な負担が大きくなって、
普段なら流せることも実際の衝突になりやすい時期だよ。
```

---

# 36. Relationship Relief

예:

```text
これまでたまっていた負担が軽くなって、
会話や関係を続けることが普段より楽になる時期だよ。
```

---

# 37. Breakdown A

내부:

```text
Baseline Vulnerability Aggravation
```

생활 일본어:

```text
前から関係の中にあった問題が
この時期にもう一度強く出てきて、
関係を続けることが難しくなりやすい流れ
```

---

# 38. Breakdown B

내부:

```text
Spouse Event + Palace Disruption
```

생활 일본어:

```text
普段の関係が大きく悪くなくても、
この時期はパートナーとの間で大きな動きが起きやすく、
関係が急に揺れやすい流れ
```

단 `パートナー` 사용은 현재 localization authority와
사용자 context 계약을 확인한다.

기혼/연애 상태 미상에서 부적절하면:

```text
大切な相手
近い関係
```

등 중립 표현 사용.

---

# 39. A+B 동시

두 breakdown path가 겹치면:

```text
前から抱えていた問題と、
この時期の大きな関係変化が重なっているよ。

関係が大きく崩れやすい力が
特にはっきり出る時期なんだ。
```

처럼 표현한다.

새 숫자 위험등급 금지.

---

# 40. 불안 조장 표현 금지

금지:

```text
危険
破滅
災い
恐ろしい
最悪
```

하지만 confirmed risk를 숨기지도 않는다.

---

# 41. 시간 표현 — C6-A.1 구조 그대로

다음 presentation classification을 유지한다.

```text
past
current
current_spanning
future
unknown_calendar
```

---

# 42. current_spanning 일본어

한국어:

```text
현재를 포함한 장기 흐름
```

일본어 권장:

```text
今を含む長い流れ
```

예:

```text
今を含む長い流れ · 2020年1月1日〜2030年1月1日
```

더 자연스러운 UX wording이 있으면
동일 의미 범위에서 조정 가능.

---

# 43. current

```text
今
現在
```

중 UI convention에 맞는 하나로 고정한다.

---

# 44. future

```text
これから
```

를 기본으로 사용할 수 있다.

---

# 45. past

```text
これまで
過去
```

중 기존 renderer convention을 확인하여 고정한다.

---

# 46. unknown calendar

```text
時期をカレンダー上で特定できない流れ
```

처럼 자연스럽게 표현한다.

너무 길면 UI label:

```text
カレンダー上の時期は未確定
```

가능.

---

# 47. 가짜 Gregorian 날짜 금지

```text
invented Japanese date = 0
```

C5 TimingFact projection만 사용한다.

---

# 48. 날짜 표기

일본 고객 표기:

```text
2028年2月4日〜2029年2月3日
```

사용.

미국식/한국식 날짜 문자열 금지.

---

# 49. overlapping window grouping

C6-A.1과 동일.

예:

```text
2020〜2030年は、関係を正式な形に進めやすい流れが続くよ。

その中でも2028年2月〜2029年2月は、
二人とも結婚や関係の具体化が進みやすい時期なんだ。
```

Underlying Fact 삭제 금지.

---

# 50. Mutual window

개인 window와 상호 window를 구분한다.

일본어:

```text
二人とも同じ時期に
```

등 자연스럽게 표현한다.

---

# 51. Timeline

한국어 C6-A.1의 chronological timeline 구조를 그대로 유지한다.

금지:

```text
第1項
第2項
セクション7
```

Expected:

```text
0
```

---

# 52. Timeline example

```text
2028年2月〜2029年2月

・二人とも、関係を正式な形に進めやすい時期だよ。
・一人目には、同じ時期に関係の負担も大きくなる。
・すでに問題がある関係なら、大きく揺れやすい時期でもあるんだ。
```

---

# 53. 동일 기간 mixed events 보존

같은 기간에:

```text
marriage opportunity
marriage caution
relationship strain
```

이 있으면 모두 표현한다.

---

# 54. Strength + Future Risk 동시

가능:

```text
二人は基本的には助け合える関係だよ。
ただ、2030年には関係を大きく揺らす流れが強くなる。
```

모순 처리 금지.

---

# 55. Difficult baseline + Relief

가능:

```text
もともとはぶつかりやすい部分が多いけれど、
2029年は会話と関係の負担が軽くなる時期だよ。
```

---

# 56. 생활 결과로 설명

금지:

```text
印綬が強い
食神が弱い
財が冲される
```

대신:

```text
気持ちを内側にため込みやすい
話し合いが減りやすい
関係の負担が大きくなる
```

---

# 57. 외래어 남용 금지

금지 예:

```text
エネルギー
パワー
チャンス
```

반복.

일상 일본어로 쓴다.

---

# 58. 일본어 한 문장 길이

기존 localization authority 준수:

```text
약 40자 전후
한 문단 약 3문장
```

긴 한국어 구조를 한 문장에 몰아넣지 않는다.

---

# 59. deterministic renderer

같은:

```text
FinalCompatibilityResult
```

이면 같은 일본어 결과를 반환한다.

LLM runtime dependency:

```text
0
```

---

# 60. KO 문자열 dependency 금지

코드에서:

```text
renderKO(...)
→ translate(...)
```

형태 금지.

일본어 template는 canonical semantic ID에 직접 연결한다.

---

# 61. 기존 Japanese Personality Renderer 재사용

문체, 이름 처리, 문장 길이, punctuation,
certainty 처리 등은 현재 Japanese Personality Renderer와
가능한 한 같은 helper/contract를 재사용한다.

Parallel style system을 새로 만들지 않는다.

---

# 62. internal terminology와 customer wording 분리

내부 debug/provenance에서는
canonical English/internal IDs를 유지 가능.

Customer JA에는 명리 용어가 나오지 않아야 한다.

---

# 63. 결과 타입

권장:

```text
CompatibilityCustomerResultJA
```

단 KO와 가능한 한 동일한 semantic schema를 사용한다.

언어마다 별도 의미 구조를 만들지 않는다.

---

# 64. 언어 구조

권장:

```text
CompatibilityCustomerResult
  semantic sections
  locale-specific strings
```

또는 현재 repository의 localization architecture를 따른다.

KO/JA 결과 의미 필드가 달라지지 않게 한다.

---

# 65. Localization parity

같은 fixture에서:

```text
KO statement semantic IDs
=
JA statement semantic IDs
```

이어야 한다.

문장 수는 일본어 자연스러움 때문에 다소 달라도 되지만
의미 누락/추가:

```text
0
```

---

# 66. 확정도 parity

Expected:

```text
KO confirmed → JA confirmed
KO conditional → JA conditional
```

Mismatch:

```text
0
```

---

# 67. Direction parity

Expected:

```text
KO A→B
=
JA A→B

KO B→A
=
JA B→A
```

뒤집힘:

```text
0
```

---

# 68. Timing parity

Expected:

```text
same source TimingFact IDs
same Gregorian intervals
same past/current/current_spanning/future classification
```

---

# 69. Marriage parity

각 fixture:

```text
marriage opportunity
marriage favorable
marriage caution
```

KO와 JA semantic presence가 동일해야 한다.

---

# 70. Breakdown parity

```text
BREAKDOWN-A
BREAKDOWN-B
A+B
```

각각 KO와 동일한 Fact ID를 사용한다.

---

# 71. 일본어 금지어 검사

최소 customer output에서 검사:

```text
用神
相神
救応
格局
大運
歳運
月運
日運
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

吉
凶
大吉
凶運
宿命
天中殺
空亡

運命の人
赤い糸
```

Expected:

```text
0
```

---

# 72. 호칭 금지 검사

```text
あなた
君
お前
```

Expected customer body:

```text
0
```

---

# 73. 수치 검사

금지:

```text
%
点
ランク
★
```

궁합 numeric output:

```text
0
```

날짜 숫자는 제외.

---

# 74. certainty downgrade 검사

예:

```text
confirmed
→ かもしれない
```

위반:

```text
0
```

---

# 75. invented outcome 검사

FinalCompatibilityResult에 없는:

```text
浮気
不倫
妊娠
再婚
裁判
借金
```

등을 새로 만들지 않는다.

Expected:

```text
0
```

---

# 76. 관계 상태 추정 검사

입력에 없는데:

```text
夫
妻
夫婦
彼氏
彼女
婚約者
```

를 단정적으로 사용:

```text
0
```

중립적 표현을 사용한다.

---

# 77. Customer Statement Provenance

각 일본어 문장은
C5 source semantic / fact IDs까지 추적 가능해야 한다.

Orphan:

```text
0
```

---

# 78. 신규 verifier

권장:

```text
scripts/verify-compatibility-renderer-ja-c6b.mjs
```

---

# 79. 기존 fixture 재사용

C6-A.1의 Sample/fixture를 그대로 재사용한다.

최소:

```text
A — structural support + communication friction
B — marriage opportunity + caution
C — breakdown risk

balanced_mixed
A→B/B→A asymmetric
current expression relief
BREAKDOWN-A
BREAKDOWN-B
A+B
```

---

# 80. 전체 일본어 샘플

결과 문서에 최소 3개 전체 출력:

```text
Sample A
Sample B
Sample C
```

를 생략 없이 기록한다.

한국어 번역문을 옆에 붙일 필요는 없다.

대신 semantic parity table을 별도 작성한다.

---

# 81. parity table

최소:

| Fixture | KO semantic count | JA semantic count | Missing | Extra | Certainty mismatch | Direction mismatch | Timing mismatch |
|---|---:|---:|---:|---:|---:|---:|---:|

Expected:

```text
Missing = 0
Extra = 0
Certainty mismatch = 0
Direction mismatch = 0
Timing mismatch = 0
```

---

# 82. 기존 엔진 isolation

Expected:

```text
C1 = unchanged
C2 = unchanged
C3 = unchanged
C4 = unchanged
C5 = unchanged

KO Renderer = unchanged

Judgment = unchanged
Personality = unchanged
Money = unchanged
Health = unchanged
Relationship = unchanged
Event Timing = unchanged
```

---

# 83. 기존 일본어 Personality Renderer 회귀

반드시 실행한다.

일본어 공통 helper를 수정했다면
Personality JA 결과가 바뀌지 않았는지 확인한다.

Expected semantic changes:

```text
0
```

---

# 84. 기존 KO Renderer 회귀

C6-A / C6-A.1 verifier 재실행.

Expected:

```text
COMPATIBILITY_KO_RENDERER_FINAL_READY
```

유지.

---

# 85. TypeScript / Build

```text
npx tsc -b
npm run build
git diff --check
```

PASS.

---

# 86. 결과 파일

생성:

```text
src/docs/codex/compatibility-06b-customer-renderer-ja-result.md
```

---

# 87. 결과 보고

반드시:

```text
JA fixtures rendered:

Semantic parity:
Missing semantics:
Extra semantics:

Certainty mismatches:
Direction mismatches:
Timing mismatches:

Saju terminology violations:
Divination-style wording violations:
Address-term violations:
Numeric-score violations:
Invented-outcome violations:
Relationship-status inference violations:
Orphan statements:
Duplicate statements:

KO semantic changes:
C1-C5 semantic changes:

Japanese Personality Renderer changes:

TypeScript:
Build:
```

---

# 88. 성공 판정

다음을 모두 만족하면:

```text
COMPATIBILITY_JA_RENDERER_READY
```

조건:

```text
[ ] FinalCompatibilityResult 직접 렌더링
[ ] KO 문장 중역 0

[ ] KO/JA semantic parity
[ ] certainty parity
[ ] direction parity
[ ] timing parity

[ ] C6-A.1 presentation architecture 유지
[ ] overlapping window grouping 유지
[ ] chronological timeline 유지

[ ] 명리 용어 노출 0
[ ] 점술체 0
[ ] あなた・君・お前 0
[ ] 숫자 궁합 점수 0
[ ] invented outcome 0
[ ] relationship status inference 0

[ ] deterministic
[ ] provenance traceable

[ ] KO regression PASS
[ ] Japanese Personality regression PASS
[ ] TypeScript PASS
[ ] Build PASS
```

---

# 89. 정책 결정 필요 시

일본어 표현 때문에
새 명리 결과를 추가하거나
C5 의미를 바꾸지 않는다.

정말 새로운 localization policy 결정이 필요하면:

```text
COMPATIBILITY_C6B_POLICY_DECISION_REQUIRED
```

로 중단한다.

반드시:

```text
Question:
Existing localization authority:
Option A:
Option B:
Customer consequence:
```

형식으로 보고한다.

---

# 90. 다음 단계

C6-B 성공 후:

```text
Compatibility-06C
English Customer Renderer
```

로 이동한다.

영어도 동일하게:

```text
FinalCompatibilityResult
→ English Renderer
```

직접 변환하며
KO 또는 JA 문자열을 중역하지 않는다.