# 구현 준비도 (문서 매핑 단계의 검토 결과)

READY/REVIEW/BLOCKED는 이 작업의 문서 준비도이며 문서 OP·S 상태나 코드 OperatorReview 상태가 아니다. READY도 실제 구현 승인·전체 schema 적합성 인증이 아니다.

READY는 원문에 입력/조건/결과가 명시되고 D 구조 테스트 또는 C·25-7 고정 사례가 있어 canonical 간지·일시 사실 또는 그 명시적 파생 사실로 평가할 수 있는 구조 단위다. 숫자 강도·질적 최종 성패를 새 공식으로 바꾸지 않는다. REVIEW는 정성 판단, 전용 pointer/증거, 기대값 직접 연결 또는 이력/별칭/범위 확인이 남은 항목이다. BLOCKED는 원문 미확정 독자 작용이다. historical/U ID는 새 실행 규칙을 구현하지 않고 현행 대체 기준을 검토한다.

| READY | REVIEW | BLOCKED | 전체 고유 ID |
| --- | --- | --- | --- |
| 32 | 72 | 1 | 105 |

| Rule ID | 상태 | 이유 | 출처 |
| --- | --- | --- | --- |
| C-01 | READY | 구조/절차 조건과 출력이 명시되고 D 테스트 또는 C·25-7의 고정 기대값이 존재. canonical 입력 수용 위치는 아래 제한 참조. | [A:53](/workspaces/filune/src/docs/source/A_rev179.md:53) |
| C-02 | REVIEW | 정성 판단·표현/운영 절차·이력/별칭 또는 canonical 증거/행별 기대값 연결 확인 필요. 미확정 학설을 현행 운영 미확정으로 승격하지 않음. | [A:54](/workspaces/filune/src/docs/source/A_rev179.md:54) |
| C-03 | REVIEW | 정성 판단·표현/운영 절차·이력/별칭 또는 canonical 증거/행별 기대값 연결 확인 필요. 미확정 학설을 현행 운영 미확정으로 승격하지 않음. | [A:55](/workspaces/filune/src/docs/source/A_rev179.md:55) |
| C-04 | REVIEW | 정성 판단·표현/운영 절차·이력/별칭 또는 canonical 증거/행별 기대값 연결 확인 필요. 미확정 학설을 현행 운영 미확정으로 승격하지 않음. | [A:56](/workspaces/filune/src/docs/source/A_rev179.md:56) |
| C-05 | READY | 구조/절차 조건과 출력이 명시되고 D 테스트 또는 C·25-7의 고정 기대값이 존재. canonical 입력 수용 위치는 아래 제한 참조. | [A:57](/workspaces/filune/src/docs/source/A_rev179.md:57) |
| C-06 | READY | 구조/절차 조건과 출력이 명시되고 D 테스트 또는 C·25-7의 고정 기대값이 존재. canonical 입력 수용 위치는 아래 제한 참조. | [A:58](/workspaces/filune/src/docs/source/A_rev179.md:58) |
| C-07 | REVIEW | 정성 판단·표현/운영 절차·이력/별칭 또는 canonical 증거/행별 기대값 연결 확인 필요. 미확정 학설을 현행 운영 미확정으로 승격하지 않음. | [A:59](/workspaces/filune/src/docs/source/A_rev179.md:59) |
| C-08 | READY | 구조/절차 조건과 출력이 명시되고 D 테스트 또는 C·25-7의 고정 기대값이 존재. canonical 입력 수용 위치는 아래 제한 참조. | [A:60](/workspaces/filune/src/docs/source/A_rev179.md:60) |
| C-09 | READY | 구조/절차 조건과 출력이 명시되고 D 테스트 또는 C·25-7의 고정 기대값이 존재. canonical 입력 수용 위치는 아래 제한 참조. | [A:61](/workspaces/filune/src/docs/source/A_rev179.md:61) |
| C-10 | REVIEW | 정성 판단·표현/운영 절차·이력/별칭 또는 canonical 증거/행별 기대값 연결 확인 필요. 미확정 학설을 현행 운영 미확정으로 승격하지 않음. | [A:377](/workspaces/filune/src/docs/source/A_rev179.md:377) |
| C-11 | REVIEW | 정성 판단·표현/운영 절차·이력/별칭 또는 canonical 증거/행별 기대값 연결 확인 필요. 미확정 학설을 현행 운영 미확정으로 승격하지 않음. | [A:63](/workspaces/filune/src/docs/source/A_rev179.md:63) |
| C-12 | REVIEW | 정성 판단·표현/운영 절차·이력/별칭 또는 canonical 증거/행별 기대값 연결 확인 필요. 미확정 학설을 현행 운영 미확정으로 승격하지 않음. | [A:64](/workspaces/filune/src/docs/source/A_rev179.md:64) |
| I-00 | REVIEW | 정성 판단·표현/운영 절차·이력/별칭 또는 canonical 증거/행별 기대값 연결 확인 필요. 미확정 학설을 현행 운영 미확정으로 승격하지 않음. | [A:72](/workspaces/filune/src/docs/source/A_rev179.md:72) |
| I-01 | READY | 구조/절차 조건과 출력이 명시되고 D 테스트 또는 C·25-7의 고정 기대값이 존재. canonical 입력 수용 위치는 아래 제한 참조. | [A:374](/workspaces/filune/src/docs/source/A_rev179.md:374) |
| I-02 | READY | 구조/절차 조건과 출력이 명시되고 D 테스트 또는 C·25-7의 고정 기대값이 존재. canonical 입력 수용 위치는 아래 제한 참조. | [A:375](/workspaces/filune/src/docs/source/A_rev179.md:375) |
| I-02a | READY | 구조/절차 조건과 출력이 명시되고 D 테스트 또는 C·25-7의 고정 기대값이 존재. canonical 입력 수용 위치는 아래 제한 참조. | [A:376](/workspaces/filune/src/docs/source/A_rev179.md:376) |
| I-03 | REVIEW | 정성 판단·표현/운영 절차·이력/별칭 또는 canonical 증거/행별 기대값 연결 확인 필요. 미확정 학설을 현행 운영 미확정으로 승격하지 않음. | [A:84](/workspaces/filune/src/docs/source/A_rev179.md:84) |
| I-04 | REVIEW | 정성 판단·표현/운영 절차·이력/별칭 또는 canonical 증거/행별 기대값 연결 확인 필요. 미확정 학설을 현행 운영 미확정으로 승격하지 않음. | [A:85](/workspaces/filune/src/docs/source/A_rev179.md:85) |
| I-04-1 | REVIEW | 정성 판단·표현/운영 절차·이력/별칭 또는 canonical 증거/행별 기대값 연결 확인 필요. 미확정 학설을 현행 운영 미확정으로 승격하지 않음. | [A:381](/workspaces/filune/src/docs/source/A_rev179.md:381) |
| I-04-2 | REVIEW | 정성 판단·표현/운영 절차·이력/별칭 또는 canonical 증거/행별 기대값 연결 확인 필요. 미확정 학설을 현행 운영 미확정으로 승격하지 않음. | [A:382](/workspaces/filune/src/docs/source/A_rev179.md:382) |
| I-04a | READY | 구조/절차 조건과 출력이 명시되고 D 테스트 또는 C·25-7의 고정 기대값이 존재. canonical 입력 수용 위치는 아래 제한 참조. | [A:383](/workspaces/filune/src/docs/source/A_rev179.md:383) |
| I-04b | READY | 구조/절차 조건과 출력이 명시되고 D 테스트 또는 C·25-7의 고정 기대값이 존재. canonical 입력 수용 위치는 아래 제한 참조. | [A:387](/workspaces/filune/src/docs/source/A_rev179.md:387) |
| I-04c | REVIEW | 정성 판단·표현/운영 절차·이력/별칭 또는 canonical 증거/행별 기대값 연결 확인 필요. 미확정 학설을 현행 운영 미확정으로 승격하지 않음. | [A:384](/workspaces/filune/src/docs/source/A_rev179.md:384) |
| I-05 | REVIEW | 정성 판단·표현/운영 절차·이력/별칭 또는 canonical 증거/행별 기대값 연결 확인 필요. 미확정 학설을 현행 운영 미확정으로 승격하지 않음. | [A:88](/workspaces/filune/src/docs/source/A_rev179.md:88) |
| I-06 | REVIEW | 정성 판단·표현/운영 절차·이력/별칭 또는 canonical 증거/행별 기대값 연결 확인 필요. 미확정 학설을 현행 운영 미확정으로 승격하지 않음. | [A:89](/workspaces/filune/src/docs/source/A_rev179.md:89) |
| I-07 | REVIEW | 정성 판단·표현/운영 절차·이력/별칭 또는 canonical 증거/행별 기대값 연결 확인 필요. 미확정 학설을 현행 운영 미확정으로 승격하지 않음. | [A:90](/workspaces/filune/src/docs/source/A_rev179.md:90) |
| I-08 | REVIEW | 정성 판단·표현/운영 절차·이력/별칭 또는 canonical 증거/행별 기대값 연결 확인 필요. 미확정 학설을 현행 운영 미확정으로 승격하지 않음. | [A:144](/workspaces/filune/src/docs/source/A_rev179.md:144) |
| I-08a | READY | 구조/절차 조건과 출력이 명시되고 D 테스트 또는 C·25-7의 고정 기대값이 존재. canonical 입력 수용 위치는 아래 제한 참조. | [A:92](/workspaces/filune/src/docs/source/A_rev179.md:92) |
| I-09 | REVIEW | 정성 판단·표현/운영 절차·이력/별칭 또는 canonical 증거/행별 기대값 연결 확인 필요. 미확정 학설을 현행 운영 미확정으로 승격하지 않음. | [A:95](/workspaces/filune/src/docs/source/A_rev179.md:95) |
| I-10 | REVIEW | 정성 판단·표현/운영 절차·이력/별칭 또는 canonical 증거/행별 기대값 연결 확인 필요. 미확정 학설을 현행 운영 미확정으로 승격하지 않음. | [A:96](/workspaces/filune/src/docs/source/A_rev179.md:96) |
| I-10a | REVIEW | 정성 판단·표현/운영 절차·이력/별칭 또는 canonical 증거/행별 기대값 연결 확인 필요. 미확정 학설을 현행 운영 미확정으로 승격하지 않음. | [A:97](/workspaces/filune/src/docs/source/A_rev179.md:97) |
| I-11 | REVIEW | 정성 판단·표현/운영 절차·이력/별칭 또는 canonical 증거/행별 기대값 연결 확인 필요. 미확정 학설을 현행 운영 미확정으로 승격하지 않음. | [A:100](/workspaces/filune/src/docs/source/A_rev179.md:100) |
| I-12 | REVIEW | 정성 판단·표현/운영 절차·이력/별칭 또는 canonical 증거/행별 기대값 연결 확인 필요. 미확정 학설을 현행 운영 미확정으로 승격하지 않음. | [A:103](/workspaces/filune/src/docs/source/A_rev179.md:103) |
| I-13 | READY | 구조/절차 조건과 출력이 명시되고 D 테스트 또는 C·25-7의 고정 기대값이 존재. canonical 입력 수용 위치는 아래 제한 참조. | [A:104](/workspaces/filune/src/docs/source/A_rev179.md:104) |
| I-14 | REVIEW | 정성 판단·표현/운영 절차·이력/별칭 또는 canonical 증거/행별 기대값 연결 확인 필요. 미확정 학설을 현행 운영 미확정으로 승격하지 않음. | [A:105](/workspaces/filune/src/docs/source/A_rev179.md:105) |
| I-15 | REVIEW | 정성 판단·표현/운영 절차·이력/별칭 또는 canonical 증거/행별 기대값 연결 확인 필요. 미확정 학설을 현행 운영 미확정으로 승격하지 않음. | [A:108](/workspaces/filune/src/docs/source/A_rev179.md:108) |
| I-16 | REVIEW | 정성 판단·표현/운영 절차·이력/별칭 또는 canonical 증거/행별 기대값 연결 확인 필요. 미확정 학설을 현행 운영 미확정으로 승격하지 않음. | [A:109](/workspaces/filune/src/docs/source/A_rev179.md:109) |
| I-17 | REVIEW | 정성 판단·표현/운영 절차·이력/별칭 또는 canonical 증거/행별 기대값 연결 확인 필요. 미확정 학설을 현행 운영 미확정으로 승격하지 않음. | [A:110](/workspaces/filune/src/docs/source/A_rev179.md:110) |
| I-18 | REVIEW | 정성 판단·표현/운영 절차·이력/별칭 또는 canonical 증거/행별 기대값 연결 확인 필요. 미확정 학설을 현행 운영 미확정으로 승격하지 않음. | [A:111](/workspaces/filune/src/docs/source/A_rev179.md:111) |
| I-19 | REVIEW | 정성 판단·표현/운영 절차·이력/별칭 또는 canonical 증거/행별 기대값 연결 확인 필요. 미확정 학설을 현행 운영 미확정으로 승격하지 않음. | [A:112](/workspaces/filune/src/docs/source/A_rev179.md:112) |
| I-20 | REVIEW | 정성 판단·표현/운영 절차·이력/별칭 또는 canonical 증거/행별 기대값 연결 확인 필요. 미확정 학설을 현행 운영 미확정으로 승격하지 않음. | [A:322](/workspaces/filune/src/docs/source/A_rev179.md:322) |
| I-21 | REVIEW | 정성 판단·표현/운영 절차·이력/별칭 또는 canonical 증거/행별 기대값 연결 확인 필요. 미확정 학설을 현행 운영 미확정으로 승격하지 않음. | [A:323](/workspaces/filune/src/docs/source/A_rev179.md:323) |
| I-22 | REVIEW | 정성 판단·표현/운영 절차·이력/별칭 또는 canonical 증거/행별 기대값 연결 확인 필요. 미확정 학설을 현행 운영 미확정으로 승격하지 않음. | [A:324](/workspaces/filune/src/docs/source/A_rev179.md:324) |
| IR-01 | REVIEW | 정성 판단·표현/운영 절차·이력/별칭 또는 canonical 증거/행별 기대값 연결 확인 필요. 미확정 학설을 현행 운영 미확정으로 승격하지 않음. | [A:425](/workspaces/filune/src/docs/source/A_rev179.md:425) |
| IR-02 | REVIEW | 정성 판단·표현/운영 절차·이력/별칭 또는 canonical 증거/행별 기대값 연결 확인 필요. 미확정 학설을 현행 운영 미확정으로 승격하지 않음. | [A:426](/workspaces/filune/src/docs/source/A_rev179.md:426) |
| IR-03 | REVIEW | 정성 판단·표현/운영 절차·이력/별칭 또는 canonical 증거/행별 기대값 연결 확인 필요. 미확정 학설을 현행 운영 미확정으로 승격하지 않음. | [A:427](/workspaces/filune/src/docs/source/A_rev179.md:427) |
| IR-04 | REVIEW | 정성 판단·표현/운영 절차·이력/별칭 또는 canonical 증거/행별 기대값 연결 확인 필요. 미확정 학설을 현행 운영 미확정으로 승격하지 않음. | [A:428](/workspaces/filune/src/docs/source/A_rev179.md:428) |
| IR-05 | REVIEW | 정성 판단·표현/운영 절차·이력/별칭 또는 canonical 증거/행별 기대값 연결 확인 필요. 미확정 학설을 현행 운영 미확정으로 승격하지 않음. | [A:429](/workspaces/filune/src/docs/source/A_rev179.md:429) |
| OP-L01 | READY | 구조/절차 조건과 출력이 명시되고 D 테스트 또는 C·25-7의 고정 기대값이 존재. canonical 입력 수용 위치는 아래 제한 참조. | [A:408](/workspaces/filune/src/docs/source/A_rev179.md:408) |
| OP-L02 | REVIEW | 정성 판단·표현/운영 절차·이력/별칭 또는 canonical 증거/행별 기대값 연결 확인 필요. 미확정 학설을 현행 운영 미확정으로 승격하지 않음. | [A:420](/workspaces/filune/src/docs/source/A_rev179.md:420) |
| OP-L03 | READY | 구조/절차 조건과 출력이 명시되고 D 테스트 또는 C·25-7의 고정 기대값이 존재. canonical 입력 수용 위치는 아래 제한 참조. | [A:413](/workspaces/filune/src/docs/source/A_rev179.md:413) |
| OP-P01 | REVIEW | 정성 판단·표현/운영 절차·이력/별칭 또는 canonical 증거/행별 기대값 연결 확인 필요. 미확정 학설을 현행 운영 미확정으로 승격하지 않음. | [A:416](/workspaces/filune/src/docs/source/A_rev179.md:416) |
| OP-P02 | REVIEW | 정성 판단·표현/운영 절차·이력/별칭 또는 canonical 증거/행별 기대값 연결 확인 필요. 미확정 학설을 현행 운영 미확정으로 승격하지 않음. | [A:417](/workspaces/filune/src/docs/source/A_rev179.md:417) |
| OP-P03 | REVIEW | 정성 판단·표현/운영 절차·이력/별칭 또는 canonical 증거/행별 기대값 연결 확인 필요. 미확정 학설을 현행 운영 미확정으로 승격하지 않음. | [A:418](/workspaces/filune/src/docs/source/A_rev179.md:418) |
| OP-P04 | REVIEW | 정성 판단·표현/운영 절차·이력/별칭 또는 canonical 증거/행별 기대값 연결 확인 필요. 미확정 학설을 현행 운영 미확정으로 승격하지 않음. | [A:419](/workspaces/filune/src/docs/source/A_rev179.md:419) |
| OP-P05 | REVIEW | 정성 판단·표현/운영 절차·이력/별칭 또는 canonical 증거/행별 기대값 연결 확인 필요. 미확정 학설을 현행 운영 미확정으로 승격하지 않음. | [A:421](/workspaces/filune/src/docs/source/A_rev179.md:421) |
| OP-R01 | REVIEW | 정성 판단·표현/운영 절차·이력/별칭 또는 canonical 증거/행별 기대값 연결 확인 필요. 미확정 학설을 현행 운영 미확정으로 승격하지 않음. | [A:322](/workspaces/filune/src/docs/source/A_rev179.md:322) |
| OP-R02 | REVIEW | 정성 판단·표현/운영 절차·이력/별칭 또는 canonical 증거/행별 기대값 연결 확인 필요. 미확정 학설을 현행 운영 미확정으로 승격하지 않음. | [A:323](/workspaces/filune/src/docs/source/A_rev179.md:323) |
| OP-R03 | REVIEW | 정성 판단·표현/운영 절차·이력/별칭 또는 canonical 증거/행별 기대값 연결 확인 필요. 미확정 학설을 현행 운영 미확정으로 승격하지 않음. | [A:324](/workspaces/filune/src/docs/source/A_rev179.md:324) |
| OP-T01 | READY | 구조/절차 조건과 출력이 명시되고 D 테스트 또는 C·25-7의 고정 기대값이 존재. canonical 입력 수용 위치는 아래 제한 참조. | [A:390](/workspaces/filune/src/docs/source/A_rev179.md:390) |
| OP-T02 | READY | 구조/절차 조건과 출력이 명시되고 D 테스트 또는 C·25-7의 고정 기대값이 존재. canonical 입력 수용 위치는 아래 제한 참조. | [A:392](/workspaces/filune/src/docs/source/A_rev179.md:392) |
| OP-T03 | READY | 구조/절차 조건과 출력이 명시되고 D 테스트 또는 C·25-7의 고정 기대값이 존재. canonical 입력 수용 위치는 아래 제한 참조. | [A:235](/workspaces/filune/src/docs/source/A_rev179.md:235) |
| OP-T04 | READY | 구조/절차 조건과 출력이 명시되고 D 테스트 또는 C·25-7의 고정 기대값이 존재. canonical 입력 수용 위치는 아래 제한 참조. | [A:394](/workspaces/filune/src/docs/source/A_rev179.md:394) |
| OP-T05 | REVIEW | 정성 판단·표현/운영 절차·이력/별칭 또는 canonical 증거/행별 기대값 연결 확인 필요. 미확정 학설을 현행 운영 미확정으로 승격하지 않음. | [A:237](/workspaces/filune/src/docs/source/A_rev179.md:237) |
| OP-T06 | REVIEW | 정성 판단·표현/운영 절차·이력/별칭 또는 canonical 증거/행별 기대값 연결 확인 필요. 미확정 학설을 현행 운영 미확정으로 승격하지 않음. | [A:238](/workspaces/filune/src/docs/source/A_rev179.md:238) |
| OP-T07 | READY | 구조/절차 조건과 출력이 명시되고 D 테스트 또는 C·25-7의 고정 기대값이 존재. canonical 입력 수용 위치는 아래 제한 참조. | [A:239](/workspaces/filune/src/docs/source/A_rev179.md:239) |
| OP-T08 | READY | 구조/절차 조건과 출력이 명시되고 D 테스트 또는 C·25-7의 고정 기대값이 존재. canonical 입력 수용 위치는 아래 제한 참조. | [A:397](/workspaces/filune/src/docs/source/A_rev179.md:397) |
| OP-T09 | READY | 구조/절차 조건과 출력이 명시되고 D 테스트 또는 C·25-7의 고정 기대값이 존재. canonical 입력 수용 위치는 아래 제한 참조. | [A:391](/workspaces/filune/src/docs/source/A_rev179.md:391) |
| OP-T10 | READY | 구조/절차 조건과 출력이 명시되고 D 테스트 또는 C·25-7의 고정 기대값이 존재. canonical 입력 수용 위치는 아래 제한 참조. | [A:395](/workspaces/filune/src/docs/source/A_rev179.md:395) |
| OP-T11 | READY | 구조/절차 조건과 출력이 명시되고 D 테스트 또는 C·25-7의 고정 기대값이 존재. canonical 입력 수용 위치는 아래 제한 참조. | [A:396](/workspaces/filune/src/docs/source/A_rev179.md:396) |
| OP-T12 | READY | 구조/절차 조건과 출력이 명시되고 D 테스트 또는 C·25-7의 고정 기대값이 존재. canonical 입력 수용 위치는 아래 제한 참조. | [A:393](/workspaces/filune/src/docs/source/A_rev179.md:393) |
| OP-Z01 | REVIEW | 정성 판단·표현/운영 절차·이력/별칭 또는 canonical 증거/행별 기대값 연결 확인 필요. 미확정 학설을 현행 운영 미확정으로 승격하지 않음. | [A:246](/workspaces/filune/src/docs/source/A_rev179.md:246) |
| OP-Z02 | REVIEW | 정성 판단·표현/운영 절차·이력/별칭 또는 canonical 증거/행별 기대값 연결 확인 필요. 미확정 학설을 현행 운영 미확정으로 승격하지 않음. | [A:247](/workspaces/filune/src/docs/source/A_rev179.md:247) |
| OP-Z03 | READY | 구조/절차 조건과 출력이 명시되고 D 테스트 또는 C·25-7의 고정 기대값이 존재. canonical 입력 수용 위치는 아래 제한 참조. | [A:403](/workspaces/filune/src/docs/source/A_rev179.md:403) |
| OP-Z04 | READY | 구조/절차 조건과 출력이 명시되고 D 테스트 또는 C·25-7의 고정 기대값이 존재. canonical 입력 수용 위치는 아래 제한 참조. | [A:249](/workspaces/filune/src/docs/source/A_rev179.md:249) |
| OP-Z05 | READY | 구조/절차 조건과 출력이 명시되고 D 테스트 또는 C·25-7의 고정 기대값이 존재. canonical 입력 수용 위치는 아래 제한 참조. | [A:250](/workspaces/filune/src/docs/source/A_rev179.md:250) |
| OP-Z06 | REVIEW | 정성 판단·표현/운영 절차·이력/별칭 또는 canonical 증거/행별 기대값 연결 확인 필요. 미확정 학설을 현행 운영 미확정으로 승격하지 않음. | [A:251](/workspaces/filune/src/docs/source/A_rev179.md:251) |
| OP-Z07 | READY | 구조/절차 조건과 출력이 명시되고 D 테스트 또는 C·25-7의 고정 기대값이 존재. canonical 입력 수용 위치는 아래 제한 참조. | [A:402](/workspaces/filune/src/docs/source/A_rev179.md:402) |
| OP-Z08 | REVIEW | 정성 판단·표현/운영 절차·이력/별칭 또는 canonical 증거/행별 기대값 연결 확인 필요. 미확정 학설을 현행 운영 미확정으로 승격하지 않음. | [A:401](/workspaces/filune/src/docs/source/A_rev179.md:401) |
| OP-Z09 | READY | 구조/절차 조건과 출력이 명시되고 D 테스트 또는 C·25-7의 고정 기대값이 존재. canonical 입력 수용 위치는 아래 제한 참조. | [A:402](/workspaces/filune/src/docs/source/A_rev179.md:402) |
| OP-Z10 | READY | 구조/절차 조건과 출력이 명시되고 D 테스트 또는 C·25-7의 고정 기대값이 존재. canonical 입력 수용 위치는 아래 제한 참조. | [A:400](/workspaces/filune/src/docs/source/A_rev179.md:400) |
| OP-Z11 | REVIEW | 정성 판단·표현/운영 절차·이력/별칭 또는 canonical 증거/행별 기대값 연결 확인 필요. 미확정 학설을 현행 운영 미확정으로 승격하지 않음. | [A:401](/workspaces/filune/src/docs/source/A_rev179.md:401) |
| OP-Z12 | READY | 구조/절차 조건과 출력이 명시되고 D 테스트 또는 C·25-7의 고정 기대값이 존재. canonical 입력 수용 위치는 아래 제한 참조. | [A:404](/workspaces/filune/src/docs/source/A_rev179.md:404) |
| OP-Z13 | READY | 구조/절차 조건과 출력이 명시되고 D 테스트 또는 C·25-7의 고정 기대값이 존재. canonical 입력 수용 위치는 아래 제한 참조. | [A:405](/workspaces/filune/src/docs/source/A_rev179.md:405) |
| U-A1 | REVIEW | 정성 판단·표현/운영 절차·이력/별칭 또는 canonical 증거/행별 기대값 연결 확인 필요. 미확정 학설을 현행 운영 미확정으로 승격하지 않음. | [A:116](/workspaces/filune/src/docs/source/A_rev179.md:116) |
| U-A2 | REVIEW | 정성 판단·표현/운영 절차·이력/별칭 또는 canonical 증거/행별 기대값 연결 확인 필요. 미확정 학설을 현행 운영 미확정으로 승격하지 않음. | [A:117](/workspaces/filune/src/docs/source/A_rev179.md:117) |
| U-A3 | REVIEW | 정성 판단·표현/운영 절차·이력/별칭 또는 canonical 증거/행별 기대값 연결 확인 필요. 미확정 학설을 현행 운영 미확정으로 승격하지 않음. | [A:118](/workspaces/filune/src/docs/source/A_rev179.md:118) |
| U-A4 | REVIEW | 정성 판단·표현/운영 절차·이력/별칭 또는 canonical 증거/행별 기대값 연결 확인 필요. 미확정 학설을 현행 운영 미확정으로 승격하지 않음. | [A:119](/workspaces/filune/src/docs/source/A_rev179.md:119) |
| U-A5 | REVIEW | 정성 판단·표현/운영 절차·이력/별칭 또는 canonical 증거/행별 기대값 연결 확인 필요. 미확정 학설을 현행 운영 미확정으로 승격하지 않음. | [A:120](/workspaces/filune/src/docs/source/A_rev179.md:120) |
| U-N1 | REVIEW | 정성 판단·표현/운영 절차·이력/별칭 또는 canonical 증거/행별 기대값 연결 확인 필요. 미확정 학설을 현행 운영 미확정으로 승격하지 않음. | [A:121](/workspaces/filune/src/docs/source/A_rev179.md:121) |
| U-N2 | REVIEW | 정성 판단·표현/운영 절차·이력/별칭 또는 canonical 증거/행별 기대값 연결 확인 필요. 미확정 학설을 현행 운영 미확정으로 승격하지 않음. | [A:122](/workspaces/filune/src/docs/source/A_rev179.md:122) |
| U-N3 | REVIEW | 정성 판단·표현/운영 절차·이력/별칭 또는 canonical 증거/행별 기대값 연결 확인 필요. 미확정 학설을 현행 운영 미확정으로 승격하지 않음. | [A:123](/workspaces/filune/src/docs/source/A_rev179.md:123) |
| U-N4 | BLOCKED | 학설 독자 작용은 원문 미확정. 운영은 I-07 생극 기준이며 신규 작용 구현은 차단. | [A:124](/workspaces/filune/src/docs/source/A_rev179.md:124) |
| U-N5 | REVIEW | 정성 판단·표현/운영 절차·이력/별칭 또는 canonical 증거/행별 기대값 연결 확인 필요. 미확정 학설을 현행 운영 미확정으로 승격하지 않음. | [A:125](/workspaces/filune/src/docs/source/A_rev179.md:125) |
| U-N6 | REVIEW | 정성 판단·표현/운영 절차·이력/별칭 또는 canonical 증거/행별 기대값 연결 확인 필요. 미확정 학설을 현행 운영 미확정으로 승격하지 않음. | [A:410](/workspaces/filune/src/docs/source/A_rev179.md:410) |
| U-N7 | REVIEW | 정성 판단·표현/운영 절차·이력/별칭 또는 canonical 증거/행별 기대값 연결 확인 필요. 미확정 학설을 현행 운영 미확정으로 승격하지 않음. | [A:127](/workspaces/filune/src/docs/source/A_rev179.md:127) |
| U-N8 | REVIEW | 정성 판단·표현/운영 절차·이력/별칭 또는 canonical 증거/행별 기대값 연결 확인 필요. 미확정 학설을 현행 운영 미확정으로 승격하지 않음. | [A:128](/workspaces/filune/src/docs/source/A_rev179.md:128) |
| U-O1 | REVIEW | 정성 판단·표현/운영 절차·이력/별칭 또는 canonical 증거/행별 기대값 연결 확인 필요. 미확정 학설을 현행 운영 미확정으로 승격하지 않음. | [A:274](/workspaces/filune/src/docs/source/A_rev179.md:274) |
| U-O2 | REVIEW | 정성 판단·표현/운영 절차·이력/별칭 또는 canonical 증거/행별 기대값 연결 확인 필요. 미확정 학설을 현행 운영 미확정으로 승격하지 않음. | [A:275](/workspaces/filune/src/docs/source/A_rev179.md:275) |
| U-O3 | REVIEW | 정성 판단·표현/운영 절차·이력/별칭 또는 canonical 증거/행별 기대값 연결 확인 필요. 미확정 학설을 현행 운영 미확정으로 승격하지 않음. | [A:327](/workspaces/filune/src/docs/source/A_rev179.md:327) |
| U-O4 | REVIEW | 정성 판단·표현/운영 절차·이력/별칭 또는 canonical 증거/행별 기대값 연결 확인 필요. 미확정 학설을 현행 운영 미확정으로 승격하지 않음. | [A:395](/workspaces/filune/src/docs/source/A_rev179.md:395) |
| U-O5 | REVIEW | 정성 판단·표현/운영 절차·이력/별칭 또는 canonical 증거/행별 기대값 연결 확인 필요. 미확정 학설을 현행 운영 미확정으로 승격하지 않음. | [A:402](/workspaces/filune/src/docs/source/A_rev179.md:402) |
| U-O6 | REVIEW | 정성 판단·표현/운영 절차·이력/별칭 또는 canonical 증거/행별 기대값 연결 확인 필요. 미확정 학설을 현행 운영 미확정으로 승격하지 않음. | [A:396](/workspaces/filune/src/docs/source/A_rev179.md:396) |
| U-O7 | REVIEW | 정성 판단·표현/운영 절차·이력/별칭 또는 canonical 증거/행별 기대값 연결 확인 필요. 미확정 학설을 현행 운영 미확정으로 승격하지 않음. | [A:366](/workspaces/filune/src/docs/source/A_rev179.md:366) |
| U-O8 | REVIEW | 정성 판단·표현/운영 절차·이력/별칭 또는 canonical 증거/행별 기대값 연결 확인 필요. 미확정 학설을 현행 운영 미확정으로 승격하지 않음. | [A:367](/workspaces/filune/src/docs/source/A_rev179.md:367) |

## 첫 vertical slice 추천: CS-005

추천은 구현 계획에 대한 판단이며 명리 규칙 추가가 아니다. 원국 천간합이 없고, 비겁월 특수 구조가 아니며, 조후 대상도 아니다(C C-10-1). CS-109의 비겁월·원국 합거·S4 중심 월운, CS-126의 2027.7 교운, CS-127의 월간–시간 합·다대일·조후·상신 재분류보다 초기 확인 범위가 작다. 동일 범위의 의존성 수를 수학적으로 최소화했다는 뜻은 아니다.

첫 범위는 CS-005의 원국 구조·현재 己未 원국 변화와 2027.1 辛丑 월운의 운끼리 합 우선 및 상신 丙 유지로 한정하는 것을 추천한다. 최종 월운 천간 유리 우세 / 지지 유불리 공존은 C-10-2 고정값이며 범용 등급 산출식으로 일반화하지 않는다. 새 운영자 승인이 필요하다고 원문에 지정된 사례는 아니지만 실행별 승인 정책은 여전히 확인 대상이다.

필요 Rule ID 목록(구현 계획 후보, 각 항목 원문은 mapping-A):

C-01, C-02, C-03, C-04, C-05, C-06, C-07, C-08, C-09, C-10, C-11, C-12, I-01, I-02, I-02a, I-03, I-04, I-04-1, I-04a, I-04c, I-05, I-06, I-07, I-08a, I-10, I-11, I-13, I-14, OP-T01, OP-T02, OP-T03, OP-T04, OP-T07, OP-T08, OP-T09, OP-T10, OP-T12, OP-Z01, OP-Z02, OP-Z03, OP-Z04, OP-Z05, OP-Z07, OP-Z09, OP-Z10, OP-Z11, OP-Z12, OP-Z13, OP-L01, OP-L02, OP-L03, OP-P01, OP-P02, OP-P03, OP-P04, OP-P05, I-04b

I-04b는 비적용 대상임을 검증하기 위해 목록에 포함. I-13은 교운기 병기 여부 확인용. OP-T11 교운 다대일과 OP-R01~03 궁합/관계 승인 범위는 이 첫 slice에 추가하지 않는다. 질적 상신·병 판정은 REVIEW가 남아 있어 전체 slice가 즉시 READY라는 의미는 아니다.

CT→RT→NT 경로: CT-01~07 계산/경계 단위(이 CS의 실제 입력과 동일하다고 보지 않음) → RT-09 묘고 자동 개고 금지 + D H-5-2의 합 상태 구조 검증 → H-3-1 관계 기대값 → NT-01~09 중 NT-02/NT-08의 투출·합거 구조 검증 → 계층 4 CS-005 C-10 고정 회귀 → ST. NT는 CS-005를 바꿔 만든 기대 명식이 아니라 원문 신규 명식이다. 1월 운끼리 합 우선의 CS-005 고정값은 C-10-2이고, 기존 RT-01(CS-126)과 같은 규칙 연결은 문서에 명시된 OP-T10 관련성으로만 참조한다.

## 구현 전 사람 확인 항목

1. Canonical 타입은 legacy 계산 정책이며 문서 C-03/OP-P02를 자동 충족하지 않는다. 날짜별 역사 시차·독립 계산 증거·출생 출처·지장간 체계·상위 원국 변화 상태의 공급 계약 확인.
2. OP-L03의 질적 단계와 상신·병·구응의 역할 판단에는 범용 기계적 임계값이 없다. 사례 고정값을 새 공식으로 바꾸지 말 것.
3. OP-Z11의 크게 약화, I-06/OP-P01 거리 등 정성 강도의 데이터 표현 확인.
4. 문서 상태와 실행 OperatorReview 세 상태의 대응은 문서상 직접 정의 없음. 전부 auto-approved 또는 blocked로 동일시하지 말 것.
5. C/25-7 행별 직접 rule ID가 없는 기대값은 그대로 공란 표기. 신규 직접 연결은 검토 후 승인된 문서 근거만 추가.
6. B 한국어 Renderer 전용. Access는 표현 범위 후보이며 권한 schema는 별도 결정.
7. 원문 C의 굵은 표시 설명과 실제 강조 없음, B 색인/절 순서, 25-7의 이전 rev16과 보고서 rev16 구별.
8. 문서 A의 U-N4는 학설 연구 BLOCKED이고 운영 I-07은 생극 기준으로 유지. U-O7/U-O8은 A-8에서 해결돼 승인 대기 현행 규칙으로 구현하지 않음.

## case 직접 참조 집계

| case | 고유 A inventory 직접 참조 수 |
| --- | --- |
| CS-005 | 31 |
| CS-109 | 41 |
| CS-126 | 31 |
| CS-127 | 24 |
