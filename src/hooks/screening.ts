import { useQuery } from '@tanstack/react-query';

import { getScreeningAnswerAPI, getScreeningRecordingAPI, getScreeningTestSessionAPI } from '@/api/screening';

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
