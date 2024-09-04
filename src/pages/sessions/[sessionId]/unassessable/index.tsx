import { useCallback, useEffect } from 'react';
import type { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';

import { isAxiosError } from 'axios';
import { deleteCookie, getCookie } from 'cookies-next';

import { partList, subtestList } from '@/stores/testStore';
import { useTimerActions } from '@/stores/timerStore';
import { TALKYTALKY_URL } from '@/utils/const';
import Container from '@/components/common/Container';
import { completeSessionAPI, getUnassessableQuestionListAPI } from '@/api/questions';

import type { QuestionAnswer } from '@/types/types';

// Stress Testing 문항 페이지
export default function UnassessableQuestionsPage({ questionList }: { questionList: QuestionAnswer[] }) {
    const router = useRouter(); // next router

    const { setTestStart } = useTimerActions();

    // 폼 제출
    const handleClickNext = useCallback(async () => {
        try {
            if (window.confirm('검사를 완료처리 하고 결과를 확인하시겠습니까?')) {
                // 세션 완료 처리
                const accessToken = getCookie('jwt') as string;
                const sessionId = Number(router.query.sessionId);
                await completeSessionAPI({ sessionId, jwt: accessToken });

                router.push(`/sessions/${sessionId}/result`);
            }
        } catch (err) {
            if (isAxiosError(err)) {
                if (err.response?.status === 401) {
                    deleteCookie('jwt');
                    alert('로그인이 필요합니다.\n토키토키 로그인 페이지로 이동합니다.');
                    window.location.href = `${TALKYTALKY_URL}/login`;
                    return;
                }
            }
            console.error(err);
        }
    }, [router]);

    // 이동하기
    const handleClickMove = useCallback(
        (partId: number) => () => {
            try {
                const sessionId = Number(router.query.sessionId);

                const subtestId = partList.find(v => v.partId === partId)?.subtestId;
                const subtestItem = subtestList.find(v => v.subtestId === subtestId);

                if (subtestItem) {
                    router.push(`/sessions/${sessionId}/subtests/${subtestItem.pathname}/questions?currentPartId=${partId}`);
                }
            } catch (err) {
                console.error(err);
            }
        },
        [router],
    );

    useEffect(() => {
        if (setTestStart) {
            setTestStart(false);
        }
    }, [setTestStart]);

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
    try {
        const sessionId = Number(context.query.sessionId);
        if (!sessionId) {
            return {
                redirect: {
                    destination: '/',
                    permanent: true,
                },
            };
        }

        const accessToken = getCookie('jwt', context);
        if (!accessToken || accessToken === 'undefined') {
            return {
                props: {
                    isLoggedIn: false,
                },
            };
        }

        // 소검사 문항 정보 fetch
        const responseData = await getUnassessableQuestionListAPI({ sessionId, jwt: accessToken });
        const questionList = responseData.questions;

        return {
            props: {
                isLoggedIn: true,
                questionList,
            },
        };
    } catch (err) {
        if (isAxiosError(err)) {
            if (err.response?.status === 401) {
                return {
                    redirect: {
                        destination: '/',
                        permanent: true,
                    },
                };
            }
        }
        return {
            redirect: {
                destination: '/',
                permanent: true,
            },
        };
    }
};
