import axios from 'axios';

import { API_URL } from '@/utils/const';

import type { ScreeningTestInfo } from '@/types/screening';

axios.defaults.baseURL = API_URL;

const makeHeaders = (accessToken: string) => {
    const token = accessToken;
    return { Authorization: `Bearer ${token}` };
};

// 세션 목록
export async function getScreeningSessionListAPI({ jwt }: { jwt: string }) {
    const response = await axios.get('/assessment/screening/sessions', {
        headers: makeHeaders(jwt),
    });
    return response.data;
}

// 검사 정보 조회
export async function getScreeningTestInfoAPI({ sessionId }: { sessionId: number }) {
    const response = await axios.get<{
        result: string;
        testInfo: {
            talkyUserId: string | null;
            therapistUserId: string | null;
            testeeName: string;
            testeeGender: string;
            testeeBirthdate: string;
            ageGroup: string;
        };
    }>(`/assessment/screening/session/${sessionId}`);
    return response.data;
}

// 검사 정보 업데이트
export async function updateScreeningTestInfoAPI({ sessionId, testInfo }: { sessionId: number; testInfo: any; jwt: string }) {
    const response = await axios.patch(`/assessment/screening/session/${sessionId}/testInfo`, { testInfo });

    return response.data;
}

// 문항 목록 조회
export async function getScreeningQuestionAndAnswerListAPI({ sessionId, ageGroup }: { sessionId: number; ageGroup: string }) {
    const response = await axios.get(`/assessment/screening/session/${sessionId}/questions`, {
        params: { ageGroup },
    });
    return response.data;
}

// 단어 목록 조회
export async function getWordAndRecordingListAPI({ sessionId, ageGroup }: { sessionId: number; ageGroup: string }) {
    const response = await axios.get(`/assessment/screening/session/${sessionId}/words`, {
        params: { ageGroup },
    });
    return response.data;
}

// 세션 생성
export async function createScreeningSessionAPI({
    testInfo,
    talkyUserId,
    therapistUserId,
    currentPathname,
    ageGroup,
}: {
    testInfo: ScreeningTestInfo;
    talkyUserId?: number;
    therapistUserId?: number;
    currentPathname: string;
    ageGroup: string;
}) {
    const response = await axios.post('/assessment/screening/session', {
        testInfo,
        talkyUserId,
        therapistUserId,
        currentPathname,
        ageGroup,
    });

    return response.data;
}

// 정답 업로드
export async function uploadAnswerAPI({ sessionId, questionId, answer }: { sessionId: number; questionId: number; answer: string }) {
    const response = await axios.post(`/assessment/screening/session/${sessionId}/answer`, { questionId, answer });

    return response.data;
}

// 정답 업로드
export async function uploadRecordingAPI({ sessionId, formData }: { sessionId: number; formData: FormData }) {
    const response = await axios.post(`/assessment/screening/session/${sessionId}/recording`, formData);

    return response.data;
}

// 세션 업데이트
export async function updateSessionAPI({ sessionId, formData }: { sessionId: number; formData: FormData; jwt: string }) {
    const response = await axios.patch(`/assessment/screening/session/${sessionId}`, formData);

    return response.data;
}

// 세션 완료
export async function completeSessionAPI({ sessionId }: { sessionId: number; jwt: string }) {
    const response = await axios.patch(`/assessment/screening/session/${sessionId}/complete`);

    return response.data;
}

// 세션 결과 보기
export async function getScreeningTestResultAPI({ sessionId }: { sessionId: number }) {
    const response = await axios.get<{
        result: boolean;
        level: number;
        abstract: { content: string };
        errorExplain: { Error_consonant: string; Error_pattern: string };
        summary: { content: string };
    }>(`/assessment/screening/session/${sessionId}/result`);

    return response.data;
}

export async function getAnswersCountAPI({ sessionId }: { sessionId: number }) {
    const response = await axios.get<{ totalCount: number; notNullCount: number }>(
        `/assessment/screening/session/${sessionId}/answersCount`,
    );

    return response.data;
}
