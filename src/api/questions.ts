import axios from 'axios';

import type { Answer, TestInfoFormValues } from '@/types/types';
axios.defaults.baseURL = 'http://localhost:5400/api/v1';

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
export async function getQuestionListAPI({ subtestId }: { subtestId: number }) {
    const response = await axios.get('/assessment/questions', { params: { subtestId } });
    return response.data;
}

// 평가불가 문항 목록 조회
export async function getUnassessableQuestionListAPI({ sessionId }: { sessionId: number }) {
    const response = await axios.get<{
        result: boolean;
        questions: Answer[];
    }>(`/assessment/session/${sessionId}/unassessable`);
    return response.data;
}

// 세션 생성
export async function createSessionAPI({ testInfo, subtestIds }: { testInfo: TestInfoFormValues; subtestIds: string[] }) {
    const response = await axios.post('/assessment/session', {
        testInfo,
        subtestIds,
    });

    return response.data;
}

// 세션 업데이트
export async function updateSessionAPI({ sessionId, currentPartId }: { sessionId: number; currentPartId: number }) {
    const response = await axios.patch(`/assessment/session/${sessionId}`, { currentPartId });

    return response.data;
}

// 세션 결과 보기
export async function getTestResultAPI({ sessionId }: { sessionId: number }) {
    const response = await axios.get<{
        testInfo: {
            therapistUserId: number;
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
    }>(`/assessment/session/${sessionId}/result`);

    return response.data;
}
