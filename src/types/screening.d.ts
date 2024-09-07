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
