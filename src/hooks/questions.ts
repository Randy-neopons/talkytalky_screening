import { useQuery } from '@tanstack/react-query';
import { getCookie } from 'cookies-next';

import { getConductedSubtestsAPI, getQuestionAndAnswerListAPI, getSessionListAPI } from '@/api/das';

// 질문 목록
export const questionsQueryKey = 'questions';
export const useQuestionsQuery = ({ sessionId, subtestId, jwt }: { sessionId: number; subtestId: number; jwt: string }) => {
    return useQuery<{
        result: boolean;
        questions: { questionId: number; questionText: string; answerType: string; partId: number; subtestId: number }[];
    }>({
        queryKey: [questionsQueryKey, sessionId, subtestId, jwt],
        queryFn: () => getQuestionAndAnswerListAPI({ sessionId, subtestId, jwt }),
    });
};

// 수행한 소검사
export const conductedSubtestsQueryKey = 'subtests';
export const useConductedSubtestsQuery = ({ sessionId, jwt }: { sessionId: number; jwt: string }) => {
    return useQuery<{
        result: boolean;
        subtests: { subtestId: number; subtestTitle: string; pathname: string }[];
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
