import { useEffect, useRef } from 'react';

import { useTestStart, useTestTime, useTimerActions } from '@/stores/timerStore';
import { ClockIcon } from '@/components/common/icons';

// 타이머
export default function Timer() {
    const testTime = useTestTime(); // 검사 시간
    const testStart = useTestStart(); // 검사 시작, 종료
    const { addSecond, setTestStart } = useTimerActions(); // 검사 시간 제어 함수
    const timerRef = useRef<NodeJS.Timeout | null>(null); // timer

    useEffect(() => {
        if (testStart) {
            timerRef.current = setInterval(() => {
                addSecond();
            }, 1000); // 1초씩 증가
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [addSecond, testStart]);

    return (
        <div className='flex items-center gap-2 xl:gap-[10px]'>
            <ClockIcon />
            <span className='text-neutral11 text-head-2'>
                {Math.floor(testTime / 3600)}:
                {Math.floor((testTime % 3600) / 60)
                    .toString()
                    .padStart(2, '0')}
                :{(testTime % 60).toString().padStart(2, '0')}
            </span>
        </div>
    );
}
