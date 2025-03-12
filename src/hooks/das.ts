import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { getCookie } from 'cookies-next';

import { getConductedSubtestsAPI, getQuestionAndAnswerListAPI, getSessionListAPI, upsertRecordingAPI } from '@/api/das';

import type { Subtest } from '@/types/das';

// 질문 목록
export const questionsQueryKey = 'questions';
export const useQuestionsAndAnswersQuery = ({
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
}) => {
    return useQuery({
        queryKey: [questionsQueryKey, sessionId, subtestId, partId, start, end, jwt],
        queryFn: () => getQuestionAndAnswerListAPI({ sessionId, subtestId, partId, start, end, jwt }),
    });
};

export function useUpsertRecordingMutation({ onSuccess }: { onSuccess: (filePath: string) => void }) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: upsertRecordingAPI,
        onError: error => {
            console.error('레코딩 업로드 실패');
        },
        onSuccess: (data, variables, a) => {
            onSuccess(data.filePath);
        },
    });
}

// 수행한 소검사
export const conductedSubtestsQueryKey = 'subtests';
export const useConductedSubtestsQuery = ({ sessionId, jwt }: { sessionId: number; jwt: string }) => {
    return useQuery<{
        result: boolean;
        subtests: Subtest[];
    }>({
        queryKey: [conductedSubtestsQueryKey, sessionId, jwt],
        queryFn: () => getConductedSubtestsAPI({ sessionId, jwt }),
        enabled: !!sessionId && !!jwt,
    });
};

// 세션 목록
export const sessionsQueryKey = 'sessions';
export const useSessionsQuery = ({ keyword, page, pageSize }: { keyword?: string; page: number; pageSize: number }) => {
    const jwt = getCookie('jwt') || '';

    return useQuery({
        queryKey: [sessionsQueryKey, keyword, page, pageSize, jwt],
        queryFn: () => getSessionListAPI({ keyword, page, pageSize, jwt }),
        enabled: !!jwt,
    });
};
