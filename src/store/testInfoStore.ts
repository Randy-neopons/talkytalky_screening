import dayjs from 'dayjs';
import { create } from 'zustand';

import type { TestInfoFormValues } from '@/types/types';

const useTestInfoStore = create<{
    testInfo: TestInfoFormValues;
    tests: string[];
    actions: {
        setTestInfo: (newInfo: TestInfoFormValues) => void;
        setTests: (newTests: string[]) => void;
    };
}>(set => ({
    testInfo: {
        testerName: '',
        certificateNumber: '',
        testYear: `${dayjs().year()}`,
        testMonth: `${dayjs().month() + 1}`,
        testDay: `${dayjs().date()}`,
        patientName: '',
        gender: 'female',
        birthYear: `${dayjs().year()}`,
        birthMonth: `${dayjs().month() + 1}`,
        birthDay: `${dayjs().date()}`,
        brainLesions: [],
        medicalHistory: '',
        memo: '',
    },
    tests: [],
    actions: {
        setTestInfo: newInfo => set({ testInfo: newInfo }),
        setTests: newTests => set({ tests: newTests }),
    },
}));
export const useTestInfo = () => useTestInfoStore(state => state.testInfo);
export const useTests = () => useTestInfoStore(state => state.tests);
export const useTestInfoActions = () => useTestInfoStore(state => state.actions);
