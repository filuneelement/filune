FILUNE Codex P1-1 정관격·칠살격·재격 구현 지시

1. 범위

이번 작업:

正官格
七殺格
財格

만 구현.

2. 정관격

OFF-01 財生官

財 → 生 正官
→ favorable

OFF-02 印護官

傷官 → 剋 正官
印 → 制 傷官
→ favorable

印은 SangShen 후보.

OFF-03 傷官見官

傷官 → 剋 正官
→ unfavorable

실제 손상 시 Byeong 후보.

OFF-04 財剋護官之印

필요한 印을 財가 공격하면:

unfavorable

OFF-05 官殺混雜

unfavorable_candidate

단 존재만으로 Byeong 강제 금지.

OFF-06 去殺留官

혼입 七殺 제거 + 正官 유지:

favorable

OFF-07 傷官合殺

정관격의 혼입 七殺을 유효합으로 제거하면:

favorable

Runtime은 기존 P0 규칙 사용.

3. 칠살격

KILL-01 食神制殺

favorable

칠살 자동 stopped 금지.

KILL-02 제살태과

근거가 있을 때:

context_dependent

수치 threshold 금지.

KILL-03 殺印相生

필요 구조:

favorable_candidate

KILL-04 印奪食

필요한 食神을 印이 공격:

unfavorable

식신 과다/칠살 부족이면 favorable_candidate 가능.

KILL-05 財生殺

해로운 七殺 강화:

unfavorable

필요·부족한 七殺 지원:

favorable_candidate

근거 부족:

deferred

KILL-06 官殺混雜

unfavorable_candidate

KILL-07 去官留殺

필요 구조이면:

favorable

KILL-08 傷官剋殺

해로운 七殺 제어:

favorable_candidate

4. 재격

WEALTH-01 食神生財

favorable

WEALTH-02 財生官

favorable

WEALTH-03 財 + 印

재격에서 印 존재 자체 adverse 금지.

WEALTH-04 財剋印

고정:

財格 + 財剋印
→ favorable

Byeong 생성 금지.

WEALTH-05 比劫剋財

unfavorable_candidate

WEALTH-06 財生害殺

해로운 七殺 강화:

unfavorable_candidate

WEALTH-07 食神制害殺

favorable

WEALTH-08 傷官剋害殺

favorable

WEALTH-09 傷官合害殺

유효합으로 해로운 七殺 기능 제거/약화:

favorable

5. Role 최소 연결

SangShen 후보

정관격 印護官의 印

칠살격 食神制殺의 食神

칠살격 필요한 印

재격 食神生財의 食神

재격 해로운 七殺 제어자

Byeong 후보

정관격 傷官見官

칠살격 harmful 財生殺

재격 harmful 財生殺

단:

財格 + 財剋印

은 Byeong 금지.

ConditionalByeong

원국 食神生財가 미래 七殺을 만나 재생살 가능.

GuEung

반드시 targetByeongId 필요.

운 해결자는 LuckEffect.

6. 필수 회귀

정관격:

財生官

傷官見官

印護官

官殺混雜

傷官合殺

칠살격:

食神制殺

harmful 財生殺

required 財生殺

殺印相生

傷官剋殺

재격:

財剋印 favorable

財+印 adverse 아님

食神生財

財生 harmful 七殺

食神制殺

傷官剋殺

傷官合殺

7. 검증

npx tsc -b
npm run build
기존 검증 전체
P0
P1-1 신규 검증

P1-2 영역은 구현하지 않는다.