import dayjs from 'dayjs';
import { create } from 'zustand';

import type { TestInfoFormValues } from '@/types/types';

export const subtestList = [
    { subtestId: '1', subtestTitle: 'SPEECH MECHANISM : 말기제 평가', pathname: 'speechMechanism' },
    { subtestId: '2', subtestTitle: 'SPEECH I : 영역별 말평가', pathname: 'speech1' },
    { subtestId: '3', subtestTitle: 'SPEECH II : 종합적 말평가', pathname: 'speech2' },
    { subtestId: '4', subtestTitle: 'SPEECH MOTOR : 말운동 평가', pathname: 'speechMotor' },
    { subtestId: '5', subtestTitle: '피로도 검사 포함', pathname: 'stressTest' },
];

const useTestInfoStore = create<{
    testInfo: TestInfoFormValues;
    subtests: typeof subtestList;
    currentSubtest: string;
    actions: {
        setTestInfo: (newInfo: TestInfoFormValues) => void;
        setCurrentSubtest: (subtest: string) => void;
        setSubtests: (newTests: typeof subtestList) => void;
    };
}>(set => ({
    testInfo: {
        therapistUserId: 178,
        testDate: dayjs().format('YYYY-MM-DD'),
        patientName: '',
        patientGender: 'female',
        patientBirthdate: dayjs().format('YYYY-MM-DD'),
        brainLesions: [],
        medicalHistory: '',
        memo: '',
    },
    currentSubtest: '1',
    subtests: [],
    actions: {
        setTestInfo: newInfo => set({ testInfo: newInfo }),
        setCurrentSubtest: subtest => set({ currentSubtest: subtest }),
        setSubtests: newTests => set({ subtests: newTests }),
    },
}));
export const useTestInfo = () => useTestInfoStore(state => state.testInfo);
export const useSubtests = () => useTestInfoStore(state => state.subtests);
export const useCurrentSubTest = () => useTestInfoStore(state => state.currentSubtest);
export const useTestInfoActions = () => useTestInfoStore(state => state.actions);
