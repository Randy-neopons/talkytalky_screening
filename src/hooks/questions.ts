import { useQuery } from '@tanstack/react-query';

import { getConductedSubtestsAPI, getQuestionAndAnswerListAPI } from '@/api/questions';

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

export const conductedSubtestsQueryKey = 'subtests';
export const useConductedSubtestsQuery = ({ sessionId, jwt }: { sessionId: number; jwt: string }) => {
    return useQuery<{
        result: boolean;
        subtests: { subtestId: Number; subtestTitle: String; pathname: string }[];
    }>({
        queryKey: [conductedSubtestsQueryKey, sessionId, jwt],
        queryFn: () => getConductedSubtestsAPI({ sessionId, jwt }),
        enabled: !!sessionId && !!jwt,
    });
};
