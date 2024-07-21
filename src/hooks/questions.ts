import { useQuery } from '@tanstack/react-query';

import { getQuestionListAPI } from '@/api/questions';

export const questionsQueryKey = 'questions';
export const useQuestionsQuery = (subtestId: number) => {
    return useQuery<{
        result: Boolean;
        questions: { questionId: number; questionText: string; answerType: string; partId: number; subtestId: number }[];
    }>({
        queryKey: [questionsQueryKey, subtestId],
        queryFn: () => getQuestionListAPI(subtestId),
    });
};
