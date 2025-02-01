import axios from 'axios';

import { API_URL } from '@/utils/const';

import type { Answer, Subtest, TestInfoFormValues, TestSession } from '@/types/das';

const axiosInstance = axios.create({ baseURL: API_URL });

const makeHeaders = (accessToken: string) => {
    const token = accessToken;
    return { Authorization: `Bearer ${token}` };
};

// 검사 정보 조회
export async function getTestInfoAPI({ sessionId, jwt }: { sessionId: number; jwt: string }) {
    const response = await axiosInstance.get<{
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
    const response = await axiosInstance.patch(`/assessment/session/${sessionId}/testInfo`, { testInfo }, { headers: makeHeaders(jwt) });

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
    const response = await axiosInstance.get<{
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
export async function getQuestionAndAnswerListAPI({
    sessionId,
    subtestId,
    partId,
    start,
    end,
    jwt,
}: {
    sessionId: number;
    subtestId: number;
    partId?: number;
    start?: number;
    end?: number;
    jwt: string;
}) {
    const response = await axiosInstance.get<{
        result: boolean;
        questions: {
            questionId: number;
            questionText: string;
            answerType: string;
            partId: number;
            subtestId: number;
            answer: string;
            comment: string;
        }[];
        recordings: {
            recordingId: number;
            filePath: string;
            partId: number;
            repeatCount: number;
        }[];
    }>(`/assessment/session/${sessionId}/questions`, {
        headers: makeHeaders(jwt),
        params: { subtestId, partId, start, end },
    });
    return response.data;
}

// 평가불가 문항 목록 조회
export async function getUnassessableQuestionListAPI({ sessionId, jwt }: { sessionId: number; jwt: string }) {
    const response = await axiosInstance.get<{
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
    subtestIds: number[];
    jwt: string;
}) {
    const response = await axiosInstance.post(
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
    const response = await axiosInstance.patch(`/assessment/session/${sessionId}`, formData, { headers: makeHeaders(jwt) });

    return response.data;
}

// 세션 완료
export async function completeSessionAPI({ sessionId, jwt }: { sessionId: number; jwt: string }) {
    const response = await axiosInstance.patch(`/assessment/session/${sessionId}/complete`, {}, { headers: makeHeaders(jwt) });

    return response.data;
}

// 세션 결과 보기
export async function getTestResultAPI({ sessionId, jwt }: { sessionId: number; jwt: string }) {
    const response = await axiosInstance.get<{
        testScore: {
            score: number;
            minusScore: number;
            maxScore: number;
            partId: number;
            partTitle: string;
            partTitleEn: string;
            subtestId: number;
            subtestTitle: string;
        }[];
        mildAndModerateAnswers: any[];
        speechMotorResults: { questionText: string; value: string }[];
        dysarthriaTypes?: string[];
        mixedDysarthriaTypeDetail?: string;
        opinion?: string;
    }>(`/assessment/session/${sessionId}/result`, {
        headers: makeHeaders(jwt),
    });

    return response.data;
}

export async function updateTestResultAPI({
    sessionId,
    data,
    jwt,
}: {
    sessionId: number;
    data: {
        dysarthriaTypes?: string[];
        mixedDysarthriaTypeDetail?: string;
        opinion?: string;
    };
    jwt: string;
}) {
    const response = await axiosInstance.patch(`/assessment/session/${sessionId}/result`, data, { headers: makeHeaders(jwt) });

    return response.data;
}

export async function getAnswersCountAPI({ sessionId, jwt }: { sessionId: number; jwt: string }) {
    const response = await axiosInstance.get<{ totalCount: number; notNullCount: number }>(
        `/assessment/session/${sessionId}/answersCount`,
        {
            headers: makeHeaders(jwt),
        },
    );

    return response.data;
}

export async function getConductedSubtestsAPI({ sessionId, jwt }: { sessionId: number; jwt: string }) {
    const response = await axiosInstance.get<{
        result: boolean;
        subtests: Subtest[];
    }>(`/assessment/session/${sessionId}/conductedSubtests`, {
        headers: makeHeaders(jwt),
    });

    return response.data;
}
