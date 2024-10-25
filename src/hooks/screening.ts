import { useQuery } from '@tanstack/react-query';
import { getCookie } from 'cookies-next';

import { getScreeningAnswerAPI, getScreeningRecordingAPI, getScreeningSessionListAPI, getScreeningTestSessionAPI } from '@/api/screening';

// 테스트 세션 정보 조회 쿼리
export const screeningTestSessionQueryKey = 'screeningTestSession';
export const useScreeningTestSessionQuery = ({ sessionId }: { sessionId: number }) => {
    return useQuery<{
        result: string;
        testInfo: {
            talkyUserId: string | null;
            therapistUserId: string | null;
            testeeName: string;
            testeeGender: string;
            testeeBirthdate: string;
            testeeContact: string;
            ageGroup: string;
            currentTime: number;
            progress: number;
        };
    }>({
        queryKey: [screeningTestSessionQueryKey, sessionId],
        queryFn: () => getScreeningTestSessionAPI({ sessionId }),
        enabled: !!sessionId,
    });
};

// 정답 조회 쿼리
export const screeningAnswerQueryKey = 'screeningAnswer';
export const useScreeningAnswerQuery = ({ sessionId, questionId }: { sessionId: number; questionId: number }) => {
    return useQuery({
        queryKey: [screeningAnswerQueryKey, sessionId, questionId],
        queryFn: () => getScreeningAnswerAPI({ sessionId, questionId }),
        enabled: !!sessionId && !!questionId,
    });
};

// 녹음 조회 쿼리
export const screeningRecordingQueryKey = 'screeningRecording';
export const useScreeningRecordingQuery = ({ sessionId, wordId }: { sessionId: number; wordId: number }) => {
    return useQuery({
        queryKey: [screeningRecordingQueryKey, sessionId, wordId],
        queryFn: () => getScreeningRecordingAPI({ sessionId, wordId }),
        enabled: !!sessionId && !!wordId,
    });
};

// 세션 목록 쿼리
export const screeningSessionsQueryKey = 'screeningSessions';
export const useScreeningSessionsQuery = ({ keyword, page, pageSize }: { keyword?: string; page: number; pageSize: number }) => {
    const jwt = getCookie('jwt') || '';

    return useQuery({
        queryKey: [screeningSessionsQueryKey, keyword, page, pageSize, jwt],
        queryFn: () => getScreeningSessionListAPI({ keyword, page, pageSize, jwt }),
        enabled: !!jwt,
    });
};
