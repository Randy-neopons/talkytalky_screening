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
        therapistUserId: 0,
        testDate: dayjs().format('YYYY-MM-DD'),
        patientName: '',
        patientGender: 'female',
        patientBirthdate: dayjs().format('YYYY-MM-DD'),
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
