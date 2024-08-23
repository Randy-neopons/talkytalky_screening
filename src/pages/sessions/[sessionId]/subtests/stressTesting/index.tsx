import { useCallback, useEffect, useMemo, useState, type ChangeEventHandler } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import ReactTextareaAutosize from 'react-textarea-autosize';
import type { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';

import { isAxiosError } from 'axios';
import { deleteCookie, getCookie } from 'cookies-next';

import { TALKYTALKY_URL } from '@/utils/const';
import Container from '@/components/common/Container';
import { getQuestionAndAnswerListAPI, updateSessionAPI } from '@/api/questions';

import subtestStyles from '../SubTests.module.css';

import type { Answer, QuestionAnswer } from '@/types/types';

// 소검사 ID
const CURRENT_SUBTEST_ID = 5;

// 소검사 내 파트별 문항 index 정보
// TODO: part title도 DB에서 가져오기
const partIndexList = [
    { start: 0, split: 1, end: 6, subtitle1: '피로도검사', subtitle2: '음질', partTitle: 'Aspiration (호흡)\nPhonation (음성)' },
];

// Stress Testing 문항 페이지
export default function StressTestingPage({ questionList }: { questionList: QuestionAnswer[] }) {
    const router = useRouter();

    // 문항 전부 정상으로 체크
    const [checkAll1, setCheckAll1] = useState(false);

    // 소검사 내 현재 파트 정보
    const [currentPartId, setCurrentPartId] = useState(1);
    const { start, split, end, subtitle1, subtitle2, partTitle } = useMemo(() => partIndexList[currentPartId - 1], [currentPartId]);

    // react-hook-form
    const { control, register, setValue, handleSubmit } = useForm<{
        answers: Answer[];
    }>({
        defaultValues: {
            answers: questionList?.map(({ questionId, questionText, partId, subtestId }) => ({
                questionId,
                questionText,
                partId,
                subtestId,
                answer: undefined,
                comment: undefined,
            })),
        },
    });
    const { fields } = useFieldArray({ name: 'answers', control });

    // 모두 정상 체크
    const handleChangeCheckAll1 = useCallback<ChangeEventHandler<HTMLInputElement>>(
        e => {
            if (e.target.checked === true) {
                Array.from({ length: split - start }, (v, i) => start + i).map(v => {
                    setValue(`answers.${v}.answer`, 'normal');
                });
            }

            setCheckAll1(e.target.checked);
        },
        [setValue, split, start],
    );

    // 이전 파트로
    const handleClickPrev = useCallback(() => {
        setCheckAll1(false);
        currentPartId > 1 && setCurrentPartId(partId => partId - 1);
        typeof window !== 'undefined' && window.scrollTo(0, 0);
    }, [currentPartId]);

    // 폼 데이터 제출
    const handleSubmitData = useCallback(
        async ({ sessionId, data }: { sessionId: number; data: any }) => {
            try {
                const formData = new FormData();
                formData.append('currentPartId', `${currentPartId}`);
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
        [currentPartId],
    );

    // 폼 제출 후 redirect
    const handleOnSubmit = useCallback(
        async (data: any) => {
            try {
                const sessionId = Number(router.query.sessionId);
                await handleSubmitData({ sessionId, data });

                router.push(`/sessions/${sessionId}/unassessable`);
            } catch (err) {
                console.error(err);
            }
        },
        [handleSubmitData, router],
    );

    useEffect(() => {
        return () => {};
    }, []);

    return (
        <Container>
            <h1 className='whitespace-pre-line text-center font-jalnan text-head-1'>Stress Testing</h1>
            <span className='text-center text-body-2'>본 검사는 중증 근무력증 선별검사로 필요시에만 실시합니다.</span>
            <form onSubmit={handleSubmit(handleOnSubmit)} className={`${subtestStyles['subtest-form']}`}>
                <table className={`${subtestStyles['question-table']}`}>
                    <thead>
                        <tr className='bg-accent1 text-white text-body-2'>
                            <th className='rounded-tl-base'></th>
                            <th>{subtitle1}</th>
                            <th>정상</th>
                            <th>경도</th>
                            <th>심도</th>
                            <th>평가불가</th>
                            <th className='rounded-tr-base'>메모</th>
                        </tr>
                    </thead>
                    <tbody>
                        {fields.slice(start, split).map((item, i) => (
                            <tr key={item.id}>
                                <td className={`${subtestStyles['num']}`}>{i + 1}</td>
                                <td className='whitespace-pre-line px-5'>{item.questionText}</td>
                                <td className={`${subtestStyles['option']}`}>
                                    <input type='radio' {...register(`answers.${start + i}.answer`)} value='normal' />
                                </td>
                                <td className={`${subtestStyles['option']}`}>
                                    <input type='radio' {...register(`answers.${start + i}.answer`)} value='mild' />
                                </td>
                                <td className={`${subtestStyles['option']}`}>
                                    <input type='radio' {...register(`answers.${start + i}.answer`)} value='moderate' />
                                </td>
                                <td className={`${subtestStyles['option']}`}>
                                    <input type='radio' {...register(`answers.${start + i}.answer`)} value='unknown' />
                                </td>
                                <td className='p-0 text-center'>
                                    <Controller
                                        control={control}
                                        name={`answers.${start + i}.comment`}
                                        render={({ field }) => (
                                            <ReactTextareaAutosize
                                                className={`${subtestStyles.textarea}`}
                                                minRows={1}
                                                onChange={field.onChange}
                                                onBlur={field.onBlur}
                                                value={field.value || ''}
                                            />
                                        )}
                                    />
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
                destination: '/',
                permanent: true,
            },
        };
    }
};
