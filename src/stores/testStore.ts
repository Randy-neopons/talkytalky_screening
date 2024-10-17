import dayjs from 'dayjs';
import { create } from 'zustand';

import type { Subtest, TestInfoFormValues } from '@/types/das';

// 검사 파트 목록
export const partList = [
    { partId: 1, subtestId: 1 },
    { partId: 2, subtestId: 1 },
    { partId: 3, subtestId: 1 },
    { partId: 4, subtestId: 1 },
    { partId: 5, subtestId: 2 },
    { partId: 6, subtestId: 2 },
    { partId: 7, subtestId: 2 },
    { partId: 8, subtestId: 3 },
    { partId: 9, subtestId: 3 },
    { partId: 10, subtestId: 3 },
    { partId: 11, subtestId: 3 },
    { partId: 12, subtestId: 3 },
    { partId: 13, subtestId: 3 },
    { partId: 14, subtestId: 3 },
    { partId: 15, subtestId: 4 },
    { partId: 16, subtestId: 4 },
    { partId: 17, subtestId: 5 },
];

// 소검사 목록
export const subtestList: Subtest[] = [
    { subtestId: 1, subtestTitle: 'SPEECH MECHANISM : 말기제평가', subtestTitleEn: 'SPEECH MECHANISM', pathname: 'speechMechanism' },
    { subtestId: 2, subtestTitle: 'SPEECH I : 영역별 말평가', subtestTitleEn: 'SPEECH I', pathname: 'speechOne' },
    { subtestId: 3, subtestTitle: 'SPEECH II : 종합적 말평가', subtestTitleEn: 'SPEECH II', pathname: 'speechTwo' },
    { subtestId: 4, subtestTitle: 'SPEECH MOTOR : 말운동 평가', subtestTitleEn: 'SPEECH MOTOR', pathname: 'speechMotor' },
    { subtestId: 5, subtestTitle: '피로도 검사 포함', subtestTitleEn: 'SPEECH MOTOR', pathname: 'stressTesting' },
];

// 검사 store
const useTestStore = create<{
    testInfo: TestInfoFormValues;
    subtests: Subtest[];
    currentSubtest: Subtest | null;
    progress: number;
    actions: {
        setTestInfo: (newInfo: TestInfoFormValues) => void;
        setCurrentSubtest: (subtest: Subtest | null) => void;
        setSubtests: (newTests: Subtest[]) => void;
        setProgress: (newProgress: number) => void;
    };
}>(set => ({
    testInfo: {
        testDate: dayjs().format('YYYY-MM-DD'),
        patientName: '',
        patientGender: '',
        patientBirthdate: '',
        brainLesions: [],
        medicalHistory: '',
        patientMemo: '',
    },
    currentSubtest: null,
    subtests: [],
    progress: 0,
    actions: {
        setTestInfo: newInfo => set({ testInfo: newInfo }),
        setCurrentSubtest: subtest => set({ currentSubtest: subtest }),
        setSubtests: newTests => set({ subtests: newTests }),
        setProgress: newProgress => set({ progress: newProgress }),
    },
}));
export const useTestInfo = () => useTestStore(state => state.testInfo);
export const useSubtests = () => useTestStore(state => state.subtests);
export const useCurrentSubTest = () => useTestStore(state => state.currentSubtest);
export const useProgress = () => useTestStore(state => state.progress);
export const useTestActions = () => useTestStore(state => state.actions);
