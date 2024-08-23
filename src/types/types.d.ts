export interface TestInfoFormValues {
    testDate: string;
    patientName: string;
    patientGender: string;
    patientBirthdate: string;
    brainLesions: string[];
    medicalHistory?: string;
    patientMemo?: string;
}

// 질문 + 정답
export type QuestionAnswer = {
    questionId: number;
    questionText: string;
    subtestId: number;
    subtestTitle: string;
    partId: number;
    partTitle: string;
    answer: string | null;
    comment: string | null;
};

// 정답
export type Answer = Pick<QuestionAnswer, 'questionId' | 'questionText' | 'answer' | 'comment'>;

// 녹음
export type Recording = {
    filePath: string | null;
    repeatCount: number | null;
};

export type TestSession = {
    testSessionId: number;
    testDate: string;
    patientName: string;
    patientBirthdate: string;
    patientGender: string;
    currentPartId: number;
    status: string;
    regDate: string;
};
