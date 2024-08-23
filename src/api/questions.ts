import axios from 'axios';

import { API_URL } from '@/utils/const';

import type { Answer, TestInfoFormValues } from '@/types/types';

axios.defaults.baseURL = API_URL;

const makeHeaders = (accessToken: string) => {
    const token = accessToken;
    return { Authorization: `Bearer ${token}` };
};

// 세션 목록
export async function getSessionListAPI({ jwt }: { jwt: string }) {
    const response = await axios.get('/assessment/sessions', {
        headers: makeHeaders(jwt),
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
export async function createSessionAPI({ testInfo, subtestIds, jwt }: { testInfo: TestInfoFormValues; subtestIds: string[]; jwt: string }) {
    const response = await axios.post(
        '/assessment/session',
        {
            testInfo,
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
        testInfo: {
            testDate: string;
            patientName: string;
            patientGender: string;
            patientBirthdate: string;
            brainLesions: string[];
            medicalHistory: string;
            patientMemo: string;
        };
        testScore: {
            score: number;
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
