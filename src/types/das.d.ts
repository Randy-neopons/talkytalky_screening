// 말운동평가 기본정보입력
export interface TestInfoFormValues {
    testDate: string;
    patientName: string;
    patientGender: string;
    patientBirthdate: string;
    brainLesions: string[]; // 뇌병변
    medicalHistory?: string; // 병력
    patientMemo?: string; // 개인정보
    neurologicalLesion?: string; // 신경학적 병변
    languageDisorder?: string; // 언어장애
    languageDisorderDetail?: {
        kWabAq?: number;
        aphasiaType?: string;
    }; // 언어장애
    cognitiveDisorder?: string; // 인지장애
    cognitiveDisorderDetail?: {
        mmseScore?: number;
    };
}

// 말운동평가 테스트 세션
export type TestSession = {
    testSessionId: number;
    testDate: string;
    patientName: string;
    patientBirthdate: string;
    patientGender: string;
    currentPartId: number;
    progress: number;
    status: string;
    regDate: string;
};

// 말운동평가 질문 + 정답
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

// 말운동평가 정답
export type Answer = Pick<QuestionAnswer, 'questionId' | 'questionText' | 'answer' | 'comment'>;

// 말운동평가 녹음
export type Recording = {
    filePath: string | null;
    repeatCount: number | null;
};

// 소검사
export type Subtest = {
    subtestId: number;
    subtestTitle: string;
    subtestTitleEn: string;
    pathname: string;
};
