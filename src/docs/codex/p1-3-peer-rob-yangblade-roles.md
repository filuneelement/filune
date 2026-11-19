FILUNE Codex P1-3 비견격·겁재격·양인격 및 Role Engine 구현 지시

1. 구현 범위

比肩格
劫財格
羊刃格

그리고 Role Engine P1 마무리.

2. 비견격

고정:

main:
正官
財

auxiliary:
食傷

SevenKillingAsMainYongShen = false

PEER-01 正官制比

비견 과다 또는 財 보호가 필요하고 실제 제어 유효:

favorable

PEER-02 財

주 YongShen 후보.

단:

比肩 → 剋 財

실제 강하면:

unfavorable_candidate

PEER-03 食傷 통관

比肩 → 生 食傷 → 生 財
→ favorable_auxiliary

PEER-04 七殺

주 YongShen 금지.

PEER-05 財生殺

harmful 七殺을 실제 강화할 때만 adverse.

PEER-06 比肩剋財

unfavorable_candidate

통관/정관 제어/財 자체 역할에 따라 재평가.

3. 겁재격

고정:

mainCandidates:
正官
七殺
財

auxiliary:
食傷

SevenKillingAsMainYongShen = true

절대 우선순위는 DEFERRED.

ROB-01 正官制劫

favorable

ROB-02 七殺制劫

필요 구조 + Capacity 근거:

favorable_candidate

ROB-03 劫財剋財

unfavorable_candidate

ROB-04 食傷 통관

favorable_auxiliary

ROB-05 財生殺

필요 七殺이면 favorable_candidate.

과도·해로운 七殺이면 adverse.

조건 근거 없으면 deferred.

4. 양인격

인정:

甲卯
丙午
庚酉
壬子

제외:

戊午

YongShen 우선:

七殺 > 正官 > 財

食傷은 보조.

BLADE-01 七殺制刃

필요 구조:

favorable_priority

BLADE-02 正官制刃

favorable

BLADE-03 財助官殺

favorable_candidate

BLADE-04 食神制必要殺

unfavorable_candidate

BLADE-05 傷官剋必要殺

unfavorable_candidate

BLADE-06 傷官合必要殺

필요한 七殺 합거:

unfavorable

BLADE-07 印增刃勢

조건 미확정:

DEFERRED

5. Role Engine

Role:

YongShen
SangShen
Byeong
GuEung

상호배타 금지.

반드시:

RoleHistory
CurrentState
CurrentFunction

분리.

SangShen

실제 supporting path 필요.

actor
→ action
→ target
→ protectedFunction

Protective Standby SangShen

미래 위협을 막을 수 있는 원국 글자.

현재 Byeong 강제 생성 금지.

Byeong

반드시 Path:

source
→ action
→ target
→ damagedFunction
→ structuralConsequence

십신 존재만으로 Byeong 생성 금지.

ConditionalByeong

현재 favorable + 미래 문제 가능성 동시 보존.

GuEung

반드시:

targetByeongId

필요.

운 해결자는 LuckEffect.

6. Role Engine 테스트

Role non-exclusive

No-Byeong

Protective Standby SangShen

ConditionalByeong

GuEung targetByeongId

stopped Byeong → RoleHistory 유지 + inactive

Luck relief → relieves_byeong

7. Cross-pattern 회귀

財剋印

財格 favorable
印格 unfavorable
印多用財 favorable
食神格 + 偏印奪食 favorable
傷官格 + 必要印 unfavorable

七殺 control

七殺格 + 食神制殺 → favorable
財格 + harmful 七殺 → favorable
食神格 + 食神制殺 → favorable
羊刃格 + required 七殺 → unfavorable_candidate

傷官合殺

正官格 + mixed 七殺 → favorable
財格 + harmful 七殺 → favorable
傷官格 + harmful 七殺 → favorable
羊刃格 + required 七殺 → unfavorable

8. 검증

npx tsc -b
npm run build
기존 40/40
P0
P1-1
P1-2
P1-3

Personality Engine / Palace / Renderer는 시작하지 않는다.

