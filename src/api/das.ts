import axios from 'axios';

import { API_URL } from '@/utils/const';

import type { Answer, TestInfoFormValues, TestSession } from '@/types/das';

axios.defaults.baseURL = API_URL;

const makeHeaders = (accessToken: string) => {
    const token = accessToken;
    return { Authorization: `Bearer ${token}` };
};

// 검사 정보 조회
export async function getTestInfoAPI({ sessionId, jwt }: { sessionId: number; jwt: string }) {
    const response = await axios.get<{
        result: string;
        testInfo: {
            testDate: string;
            patientName: string;
            patientGender: string;
            patientBirthdate: string;
            brainLesions: string[];
            medicalHistory: string;
            patientMemo: string;
        };
    }>(`/assessment/session/${sessionId}`, { headers: makeHeaders(jwt) });
    return response.data;
}

// 검사 정보 업데이트
export async function updateTestInfoAPI({ sessionId, testInfo, jwt }: { sessionId: number; testInfo: any; jwt: string }) {
    const response = await axios.patch(`/assessment/session/${sessionId}/testInfo`, { testInfo }, { headers: makeHeaders(jwt) });

    return response.data;
}

// 세션 목록
export async function getSessionListAPI({
    keyword,
    page,
    pageSize,
    jwt,
}: {
    keyword?: string;
    page?: number;
    pageSize?: number;
    jwt: string;
}) {
    const response = await axios.get<{
        result: boolean;
        sessions: TestSession[];
        count: number;
    }>('/assessment/sessions', {
        headers: makeHeaders(jwt),
        params: {
            keyword,
            page,
            pageSize,
        },
    });
    return response.data;
}

// 문항 목록 조회
export async function getQuestionAndAnswerListAPI({ sessionId, subtestId, jwt }: { sessionId: number; subtestId: number; jwt: string }) {
    const response = await axios.get(`/assessment/session/${sessionId}/questions`, {
        headers: makeHeaders(jwt),
        params: { subtestId },
    });
    return response.data;
}

// 평가불가 문항 목록 조회
export async function getUnassessableQuestionListAPI({ sessionId, jwt }: { sessionId: number; jwt: string }) {
    const response = await axios.get<{
        result: boolean;
        questions: Answer[];
    }>(`/assessment/session/${sessionId}/unassessable`, {
        headers: makeHeaders(jwt),
    });
    return response.data;
}

// 세션 생성
export async function createSessionAPI({
    testInfo,
    currentPartId,
    subtestIds,
    jwt,
}: {
    testInfo: TestInfoFormValues;
    currentPartId: number;
    subtestIds: string[];
    jwt: string;
}) {
    const response = await axios.post(
        '/assessment/session',
        {
            testInfo,
            currentPartId,
            subtestIds,
        },
        { headers: makeHeaders(jwt) },
    );

    return response.data;
}

// 세션 업데이트
export async function updateSessionAPI({ sessionId, formData, jwt }: { sessionId: number; formData: FormData; jwt: string }) {
    const response = await axios.patch(`/assessment/session/${sessionId}`, formData, { headers: makeHeaders(jwt) });

    return response.data;
}

// 세션 완료
export async function completeSessionAPI({ sessionId, jwt }: { sessionId: number; jwt: string }) {
    const response = await axios.patch(`/assessment/session/${sessionId}/complete`, {}, { headers: makeHeaders(jwt) });

    return response.data;
}

// 세션 결과 보기
export async function getTestResultAPI({ sessionId, jwt }: { sessionId: number; jwt: string }) {
    const response = await axios.get<{
        testScore: {
            score: number;
            maxScore: number;
            partId: number;
            partTitle: string;
            subtestId: number;
            subtestTitle: string;
        }[];
    }>(`/assessment/session/${sessionId}/result`, {
        headers: makeHeaders(jwt),
    });

    return response.data;
}

export async function getAnswersCountAPI({ sessionId, jwt }: { sessionId: number; jwt: string }) {
    const response = await axios.get<{ totalCount: number; notNullCount: number }>(`/assessment/session/${sessionId}/answersCount`, {
        headers: makeHeaders(jwt),
    });

    return response.data;
}

export async function getConductedSubtestsAPI({ sessionId, jwt }: { sessionId: number; jwt: string }) {
    const response = await axios.get<{ result: boolean; subtests: { subtestId: number; subtestTitle: string; pathname: string }[] }>(
        `/assessment/session/${sessionId}/conductedSubtests`,
        {
            headers: makeHeaders(jwt),
        },
    );

    return response.data;
}
