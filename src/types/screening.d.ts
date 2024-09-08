// 간이언어평가 기본정보
export interface ScreeningTestInfo {
    testeeName: string;
    testeeGender?: string;
    testeeBirthdate: string;
    testeePhoneNumber?: string;
}

// 간이언어평가 단어
export interface Word {
    wordId: number;
    wortText: string;
    imgSrc: string;
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
