export interface TestInfoFormValues {
    therapistUserId: number;
    testDate: string;
    patientName: string;
    patientGender: string;
    patientBirthdate: string;
    brainLesions: string[];
    medicalHistory?: string;
    patientMemo?: string;
}

// 정답
export type Answer = {
    answerId: number;
    questionId: number;
    questionText: string;
    subtestId: number;
    subtestTitle: string;
    partId: number;
    partTitle: string;
};
