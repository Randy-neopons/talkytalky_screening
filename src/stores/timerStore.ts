import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// 검사 store
const useTimerStore = create<{
    testTime: number;
    testStart: boolean;
    actions: {
        addSecond: () => void;
        setTestStart: (start: boolean) => void;
        reset: () => void;
    };
}>()(
    persist(
        (set, get) => ({
            testTime: 0, // 검사 시간
            testStart: false, // 검사 시작/종료
            actions: {
                addSecond: () => set({ testTime: get().testTime + 1 }), // 1초씩 증가
                setTestStart: start => set({ testStart: start }), // 검사 시작/종료 제어
                reset: () => set({ testTime: 0 }),
            },
        }),
        {
            name: 'test-time',
            storage: createJSONStorage(() => sessionStorage),
            partialize: state => ({ testTime: state.testTime, testStart: state.testStart }), // actions 안에 묶은 경우엔 이렇게 해야 비즈니스 로직은 storage에 저장 안됨.
        },
    ),
);
export const useTestTime = () => useTimerStore(state => state.testTime);
export const useTestStart = () => useTimerStore(state => state.testStart);
export const useTimerActions = () => useTimerStore(state => state.actions);
