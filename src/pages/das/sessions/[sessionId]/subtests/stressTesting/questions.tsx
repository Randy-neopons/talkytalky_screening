import { useCallback, useEffect, useMemo, useState, type ChangeEventHandler } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import ReactTextareaAutosize from 'react-textarea-autosize';
import type { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';

import { isAxiosError } from 'axios';
import { deleteCookie, getCookie } from 'cookies-next';

import { useTestTime, useTimerActions } from '@/stores/timerStore';
import { TALKYTALKY_URL } from '@/utils/const';
import Container from '@/components/common/Container';
import { useQuestionsAndAnswersQuery } from '@/hooks/das';
import { getQuestionAndAnswerListAPI, updateSessionAPI } from '@/api/das';

import subtestStyles from '../SubTests.module.scss';

import type { Answer, QuestionAnswer } from '@/types/das';

// 소검사 ID
const CURRENT_SUBTEST_ID = 5;
const PART_ID_START = 14;

// 소검사 내 파트별 문항 index 정보
// TODO: part title도 DB에서 가져오기
const partIndexList = [
    {
        start: 0,
        split: 1,
        end: 6,
        subtitle1: '피로도 검사',
        subtitle2: '음질',
        partTitle: 'Respiration (호흡)\nPhonation (발성)',
        partId: 14,
    },
];

// Stress Testing 문항 페이지
export default function StressTestingQuestionsPage({ questionList }: { questionList: QuestionAnswer[] }) {
    const router = useRouter();

    const testTime = useTestTime();
    const { setTestStart } = useTimerActions();

    // 문항 전부 정상으로 체크
    const [checkAll1, setCheckAll1] = useState(false);

    // 소검사 내 현재 파트 정보
    const [partId, setPartId] = useState(PART_ID_START);
    const { start, split, end, subtitle1, subtitle2, partTitle } = useMemo(
        () => partIndexList.find(v => v.partId === partId) || partIndexList[0],
        [partId],
    );

    // react-hook-form
    const { control, register, setValue, handleSubmit } = useForm<{
        answers: Answer[];
    }>({
        defaultValues: {
            answers: questionList?.map(({ questionId, questionText, partId, subtestId, answer, comment }) => ({
                questionId,
                questionText,
                partId,
                subtestId,
                answer,
                comment,
            })),
        },
    });
    const { fields } = useFieldArray({ name: 'answers', control });

    const { data: qnaData } = useQuestionsAndAnswersQuery({
        sessionId: Number(router.query.sessionId),
        subtestId: CURRENT_SUBTEST_ID,
        // partId,
        // start,
        // end,
        jwt: getCookie('jwt') || '',
    });

    useEffect(() => {
        if (qnaData?.questions) {
            setValue(
                'answers',
                qnaData.questions.map(({ questionId, questionText, partId, subtestId, answer, comment }) => ({
                    questionId,
                    questionText,
                    partId,
                    subtestId,
                    answer,
                    comment,
                })),
            );
        }
    }, [qnaData, setValue]);

    // 모두 정상 체크
    const handleChangeCheckAll1 = useCallback<ChangeEventHandler<HTMLInputElement>>(
        e => {
            if (e.target.checked === true) {
                Array.from({ length: split - start }, (v, i) => start + i).map(v => {
                    setValue(`answers.${v}.answer`, 'normal', { shouldValidate: true });
                });
            }

            setCheckAll1(e.target.checked);
        },
        [setValue, split, start],
    );

    // 이전 파트로
    const handleClickPrev = useCallback(() => {
        setCheckAll1(false);
        partId > PART_ID_START && setPartId(partId => partId - 1);
        typeof window !== 'undefined' && window.scrollTo(0, 0);
    }, [partId]);

    // 폼 데이터 제출
    const handleSubmitData = useCallback(
        async ({ sessionId, data }: { sessionId: number; data: any }) => {
            try {
                const formData = new FormData();
                formData.append('testTime', `${testTime}`);
                formData.append('currentPartId', `${partId}`);
                formData.append('answers', JSON.stringify(data.answers));

                // 세션 갱신
                const accessToken = getCookie('jwt') as string;
                await updateSessionAPI({ sessionId, formData, jwt: accessToken });
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
        },
        [partId, testTime],
    );

    // 폼 제출 후 redirect
    const handleOnSubmit = useCallback(
        async (data: any) => {
            try {
                const sessionId = Number(router.query.sessionId);
                await handleSubmitData({ sessionId, data });

                router.push(`/das/sessions/${sessionId}/unassessable`);
            } catch (err) {
                console.error(err);
            }
        },
        [handleSubmitData, router],
    );

    useEffect(() => {
        setTestStart(true);
    }, [setTestStart]);

    return (
        <Container>
            <h1 className='whitespace-pre-line text-center font-jalnan text-head-1'>Stress Testing</h1>
            <span className='text-center text-body-2'>본 검사는 중증 근무력증 선별검사로 필요시에만 실시합니다.</span>
            <form onSubmit={handleSubmit(handleOnSubmit)} className={`${subtestStyles['subtest-form']}`}>
                <table className={subtestStyles.questionTable}>
                    <thead data-title='피로도 검사'>
                        <tr className={subtestStyles.yesNo}>
                            <th colSpan={2}></th>
                            <th>예</th>
                            <th colSpan={2}>아니오</th>
                            <th>기타</th>
                        </tr>
                        <tr className={subtestStyles.option}>
                            <th></th>
                            <th>피로도 검사</th>
                            <th>정상</th>
                            <th>경도</th>
                            <th>심도</th>
                            <th>평가불가</th>
                        </tr>
                    </thead>
                    <tbody>
                        {fields.slice(0, split).map((item, i) => (
                            <tr key={item.id}>
                                <td className={subtestStyles.num}>{i + 1}</td>
                                <td className='whitespace-pre-line px-5'>{item.questionText}</td>
                                <td className={subtestStyles.option}>
                                    <input type='radio' {...register(`answers.${start + i}.answer`)} value='normal' />
                                </td>
                                <td className={subtestStyles.option}>
                                    <input type='radio' {...register(`answers.${start + i}.answer`)} value='mild' />
                                </td>
                                <td className={subtestStyles.option}>
                                    <input type='radio' {...register(`answers.${start + i}.answer`)} value='moderate' />
                                </td>
                                <td className={subtestStyles.option}>
                                    <input type='radio' {...register(`answers.${start + i}.answer`)} value='unknown' />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div>
                    <button type='button' className='mt-20 btn btn-large btn-outlined' onClick={handleClickPrev}>
                        이전
                    </button>
                    <button type='submit' className='ml-5 mt-20 btn btn-large btn-contained'>
                        다음
                    </button>
                </div>
            </form>
        </Container>
    );
}

export const getServerSideProps: GetServerSideProps = async context => {
    try {
        const sessionId = Number(context.query.sessionId);
        if (!sessionId) {
            return {
                redirect: {
                    destination: '/das',
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
        const responseData = await getQuestionAndAnswerListAPI({ sessionId, subtestId: CURRENT_SUBTEST_ID, jwt: accessToken });
        const questionList = responseData.questions;

        return {
            props: {
                isLoggedIn: true,
                questionList,
            },
        };
    } catch (err) {
        return {
            redirect: {
                destination: '/das',
                permanent: true,
            },
        };
    }
};
