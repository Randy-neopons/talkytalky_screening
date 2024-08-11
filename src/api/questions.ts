import axios from 'axios';

import type { TestInfoFormValues } from '@/types/types';
axios.defaults.baseURL = 'http://localhost:5400/api/v1';

// 문항 목록 조회
export async function getQuestionListAPI(subtestId: number) {
    const response = await axios.get('/assessment/questions', { params: { subtestId } });
    return response.data;
}

// 평가불가 문항 목록 조회
export async function getUnassessableQuestionListAPI(sessionId: number) {
    const response = await axios.get(`/assessment/session/${sessionId}/unassessable`);
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
