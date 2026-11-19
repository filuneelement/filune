FILUNE Codex P1-2 인수격·식신격·상관격 구현 지시

1. 구현 범위

印格
食神格
傷官格

2. 인수격

RES-01 印生身

favorable

RES-02 官生印

favorable

RES-03 殺印相生

필요 구조:

favorable_candidate

RES-04 財剋印

印格 + 財剋印
→ unfavorable

RES-05 印多用財

印格 + 印過多 + 財剋印
→ favorable
Formula = resource_excess_uses_wealth

일반 財剋印보다 우선.

RES-06 印輕財重

印 약 + 財 강 + 실제 印 파괴:

unfavorable

RES-07 食傷泄秀

印·日主 과다 + 食傷 설기 유효:

favorable_candidate

RES-08 印奪必要食

필요한 食傷을 印이 손상:

unfavorable

RES-09 印用殺에서 財

財 → 剋 印
財 → 生 七殺

살인상생 필요 구조이면:

unfavorable_candidate

3. 식신격

FOOD-01 食神生財

favorable

FOOD-02 食神制殺

favorable

FOOD-03 財生殺로 제살 방해

unfavorable_candidate

FOOD-04 財 위치 예외

食神生財
+
食神制殺

동시 가능.

실제 財가 七殺을 생하지 않으면 favorable coexistence 가능.

FOOD-05 偏印奪食

偏印 → 剋 食神
→ unfavorable

FOOD-06 財剋害食之印

偏印이 食神을 해치고 있고 財가 印을 제어:

favorable

FOOD-07 食神 과다 + 印 조절

근거 있으면:

favorable_candidate

FOOD-08 output capacity

Capacity 부족 근거 있으면:

unfavorable_candidate

근거 없으면 deferred.

4. 상관격

HO-01 傷官生財

favorable

HO-02 傷官佩印

필요한 경우:

favorable_candidate

HO-03 傷官見官

unfavorable_candidate

HO-04 傷官剋殺

해로운 七殺:

favorable_candidate

HO-05 傷官合殺

context_dependent

해로운 七殺이면 favorable.

필요한 七殺이면 unfavorable.

HO-06 財破必要印

필요한 印을 財가 공격:

unfavorable

HO-07 복합 경로

印 controls 傷官
傷官 controls 七殺
七殺 generates 印

모두 보존.

5. Cross-pattern 財剋印

반드시:

財格
→ favorable

印格
→ unfavorable

印格 + 印過多
→ favorable

食神格 + 偏印奪食
→ favorable

傷官格 + 必要印
→ unfavorable

6. Role 연결

PolicyDirection만으로 Role 생성 금지.

Policy
+
ActualStructuralFunction
+
supporting/adverse path
→ Role

Role non-exclusive 유지.

No-Byeong 허용.

운 글자는 새 natal Role 생성 금지.

7. 검증

npx tsc -b
npm run build
기존 40/40
P0
P1-1
P1-2 신규 검증