import dayjs from 'dayjs';
import { create } from 'zustand';

import type { TestInfoFormValues } from '@/types/types';

// 검사 파트 목록
export const partList = [
    { partId: 1, subtestId: '1' },
    { partId: 2, subtestId: '1' },
    { partId: 3, subtestId: '1' },
    { partId: 4, subtestId: '1' },
    { partId: 5, subtestId: '2' },
    { partId: 6, subtestId: '2' },
    { partId: 7, subtestId: '2' },
    { partId: 8, subtestId: '3' },
    { partId: 9, subtestId: '3' },
    { partId: 10, subtestId: '3' },
    { partId: 11, subtestId: '3' },
    { partId: 12, subtestId: '4' },
    { partId: 13, subtestId: '4' },
    { partId: 14, subtestId: '5' },
];

// 소검사 목록
export const subtestList = [
    { subtestId: '1', subtestTitle: 'SPEECH MECHANISM : 말기제 평가', pathname: 'speechMechanism' },
    { subtestId: '2', subtestTitle: 'SPEECH I : 영역별 말평가', pathname: 'speechOne' },
    { subtestId: '3', subtestTitle: 'SPEECH II : 종합적 말평가', pathname: 'speechTwo' },
    { subtestId: '4', subtestTitle: 'SPEECH MOTOR : 말운동 평가', pathname: 'speechMotor' },
    { subtestId: '5', subtestTitle: '피로도 검사 포함', pathname: 'stressTest' },
];

// 검사 store
const useTestStore = create<{
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
export const useTestInfo = () => useTestStore(state => state.testInfo);
export const useSubtests = () => useTestStore(state => state.subtests);
export const useCurrentSubTest = () => useTestStore(state => state.currentSubtest);
export const useTestActions = () => useTestStore(state => state.actions);
