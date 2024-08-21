import { useQuery } from '@tanstack/react-query';

import { getQuestionAndAnswerListAPI } from '@/api/questions';

export const questionsQueryKey = 'questions';
export const useQuestionsQuery = ({ sessionId, subtestId }: { sessionId: number; subtestId: number }) => {
    return useQuery<{
        result: Boolean;
        questions: { questionId: number; questionText: string; answerType: string; partId: number; subtestId: number }[];
    }>({
        queryKey: [questionsQueryKey, sessionId, subtestId],
        queryFn: () => getQuestionAndAnswerListAPI({ sessionId, subtestId }),
    });
};
