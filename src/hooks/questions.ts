import { useQuery } from '@tanstack/react-query';

import { getQuestionAndAnswerListAPI } from '@/api/questions';

export const questionsQueryKey = 'questions';
export const useQuestionsQuery = ({ sessionId, subtestId, jwt }: { sessionId: number; subtestId: number; jwt: string }) => {
    return useQuery<{
        result: Boolean;
        questions: { questionId: number; questionText: string; answerType: string; partId: number; subtestId: number }[];
    }>({
        queryKey: [questionsQueryKey, sessionId, subtestId, jwt],
        queryFn: () => getQuestionAndAnswerListAPI({ sessionId, subtestId, jwt }),
    });
};
