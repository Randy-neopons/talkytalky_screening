import { useCallback } from 'react';
import type { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';

import { partList, subtestList } from '@/stores/testStore';
import Container from '@/components/common/Container';
import { getUnassessableQuestionListAPI } from '@/api/questions';

import type { QuestionAnswer } from '@/types/types';

// Stress Testing 문항 페이지
export default function UnassessableQuestionsPage({ questionList }: { questionList: QuestionAnswer[] }) {
    const router = useRouter(); // next router

    // 폼 제출
    const handleClickNext = useCallback(
        (data: any) => {
            try {
                // TODO: 중간 저장 API

                const sessionId = Number(router.query.sessionId);
                router.push(`/sessions/${sessionId}/result`);
            } catch (err) {
                console.error(err);
            }
        },
        [router],
    );

    // 이동하기
    const handleClickMove = useCallback(
        (partId: number) => () => {
            try {
                const sessionId = Number(router.query.sessionId);

                const subtestId = partList.find(v => v.partId === partId)?.subtestId;
                const pathname = subtestList.find(v => v.subtestId === subtestId)?.pathname;
                pathname && router.push(`/sessions/${sessionId}/subtests/${pathname}`);
            } catch (err) {
                console.error(err);
            }
        },
        [router],
    );

    return (
        <Container>
            <h1 className='whitespace-pre-line text-center font-jalnan text-head-1'>평가불가에 체크한 항목</h1>
            {subtestList.map(subtest => {
                const filtered = questionList.filter(question => question.subtestId.toString() === subtest.subtestId);

                if (filtered.length > 0) {
                    return (
                        <div key={subtest.subtestId} className='mt-20 w-full rounded-base bg-white px-10 pb-5 pt-[27px] text-head-2'>
                            <h2 className='font-bold text-accent1 text-head-2'>{subtest.subtestTitle}</h2>
                            {filtered.map(question => (
                                <div
                                    key={question.questionId}
                                    className='flex gap-[10px] border-b border-neutral7 py-[13px] text-body-2 last:border-none'
                                >
                                    <div className='w-[120px] flex-none whitespace-pre-line text-right font-bold'>{question.partTitle}</div>
                                    <div className='flex w-[50px] flex-none items-center'>{question.questionId}번</div>
                                    <div className='flex flex-auto items-center justify-between'>
                                        {question.questionText}

                                        <button onClick={handleClickMove(question.partId)} className='underline'>
                                            이동하기
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    );
                }
            })}
            <div>
                <button type='button' className='mt-20 btn btn-large btn-contained' onClick={handleClickNext}>
                    건너뛰기
                </button>
            </div>
        </Container>
    );
}

export const getServerSideProps: GetServerSideProps = async context => {
    const sessionId = Number(context.query.sessionId);

    if (!sessionId) {
        return {
            redirect: {
                destination: '/',
                permanent: true,
            },
        };
    }

    try {
        // TODO: sessionId 통해 시험 세션 정보 얻음
        const testSession = {
            sessionId,
            subtests: [],
        };

        // 소검사 문항 정보 fetch
        const responseData = await getUnassessableQuestionListAPI({ sessionId });
        const questionList = responseData.questions;

        return {
            props: {
                testSession,
                questionList,
            },
        };
    } catch (err) {
        return {
            redirect: {
                destination: '/',
                permanent: true,
            },
        };
    }
};
