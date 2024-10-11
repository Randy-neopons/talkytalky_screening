// 간이언어평가 기본정보
export interface ScreeningTestInfo {
    testeeName: string;
    testeeGender?: string;
    testeeBirthdate: string;
    testeeContact?: string;
}

// 간이언어평가 단어
export interface Word {
    wordId: number;
    wordText: string;
    imgSrc: string;
    imgSrc?: string | null;
    audioSrc?: string | null;
    filePath?: string | null;
}

// 간이언어평가 테스트 세션
export type ScreeningTestSession = {
    testSessionId: number;
    testeeName: string;
    testeeBirthdate: string;
    testeeGender: string;
    currentPathname: string;
    progress: number;
    status: string;
    regDate: string;
};

// 간이언어평가 결과
export type ScreeningEvaluationResults = {
    overview: {
        subject: string;
        assessmentItems: string[];
        assessmentDate: string;
    };
    expressiveReceptiveLanguageAssessment: {
        surveyResults: { question: string; response: string }[];

        analysis: string[];
    };
    wordProductionAssessment: {
        summary: {
            totalWords: number;
            accuracy: number;
            averageResponseTime: number;
        };
        errorAnalysis: {
            mainErrorTypes: { type: string; description: string }[];
            frequentErrorPatterns: { pattern: string; description: string; example: string; interpretation: string }[];
        };
    };
    overallEvaluation: {
        languageDevelopmentStatus: string[];
        wordProductionAnalysis: string[];
        comprehensiveLanguageAssessment: string[];
        strengths: string[];
        areasForImprovement: string[];
        recommendations: string[];
    };
    precautions: string;
};
