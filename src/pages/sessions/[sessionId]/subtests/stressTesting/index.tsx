import { useCallback, useMemo, useState, type ChangeEventHandler } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import ReactTextareaAutosize from 'react-textarea-autosize';
import type { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';

import Container from '@/components/common/Container';
import { getQuestionListAPI } from '@/api/questions';

import subtestStyles from '../SubTests.module.css';

// 소검사 ID
const CURRENT_SUBTEST_ID = 5;

// 소검사 내 파트별 문항 index 정보
// TODO: part title도 DB에서 가져오기
const partIndexList = [
    { start: 0, split: 1, end: 6, subtitle1: '피로도검사', subtitle2: '음질', partTitle: 'Aspiration (호흡)\nPhonation (음성)' },
];

// Stress Testing 문항 페이지
export default function StressTestingPage({
    questionList,
}: {
    questionList: { questionId: number; questionText: string; answerType: string; partId: number; subtestId: number }[];
}) {
    const router = useRouter();

    // 문항 전부 정상으로 체크
    const [checkAll1, setCheckAll1] = useState(false);

    // 소검사 내 현재 파트 정보
    const [currentPartId, setCurrentPartId] = useState(1);
    const { start, split, end, subtitle1, subtitle2, partTitle } = useMemo(() => partIndexList[currentPartId - 1], [currentPartId]);

    // react-hook-form
    const { control, register, setValue, handleSubmit } = useForm<{
        answers: { questionId: number; questionText: string; answer?: string; memo?: string }[];
    }>({
        defaultValues: {
            answers: questionList?.map(({ questionId, questionText, partId, subtestId }) => ({
                questionId,
                questionText,
                partId,
                subtestId,
                answer: undefined,
                memo: undefined,
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

    // 다음 파트로
    const handleClickNext = useCallback(() => {
        setCheckAll1(false);
        currentPartId < partIndexList.length && setCurrentPartId(partId => partId + 1);
        typeof window !== 'undefined' && window.scrollTo(0, 0); // 스크롤 초기화
    }, [currentPartId]);

    // 폼 제출
    const handleOnSubmit = useCallback(
        (data: any) => {
            console.log(data);

            try {
                // TODO: 중간 저장 API

                const sessionId = Number(router.query.sessionId);
                router.push(`/sessions/${sessionId}/unassessable`);
            } catch (err) {
                console.error(err);
            }
        },
        [router],
    );

    return (
        <Container>
            <h1 className='whitespace-pre-line text-center font-jalnan text-head-1'>Stress Testing</h1>
            <span className='text-center text-body-2'>본 검사는 중증 근무력증 선별검사로 필요시에만 실시합니다.</span>
            <form onSubmit={handleSubmit(handleOnSubmit)} className='flex w-full flex-col flex-nowrap items-center px-5 xl:px-0'>
                <table className={`${subtestStyles['table']}`}>
                    <thead className={`${subtestStyles['table-head']}`}>
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
                    <tbody className={`${subtestStyles['table-body']}`}>
                        {fields.slice(start, split).map((item, i) => (
                            <tr key={item.id}>
                                <td>{i + 1}</td>
                                <td className='whitespace-pre-line'>{item.questionText}</td>
                                <td className='text-center'>
                                    <input type='radio' {...register(`answers.${start + i}.answer`)} value='normal' />
                                </td>
                                <td className='text-center'>
                                    <input type='radio' {...register(`answers.${start + i}.answer`)} value='mild' />
                                </td>
                                <td className='text-center'>
                                    <input type='radio' {...register(`answers.${start + i}.answer`)} value='moderate' />
                                </td>
                                <td className='text-center'>
                                    <input type='radio' {...register(`answers.${start + i}.answer`)} value='unknown' />
                                </td>
                                <td className='p-0 text-center'>
                                    <Controller
                                        control={control}
                                        name={`answers.${start + i}.memo`}
                                        render={({ field }) => (
                                            <ReactTextareaAutosize
                                                className={`${subtestStyles.textarea}`}
                                                minRows={1}
                                                onChange={field.onChange}
                                                onBlur={field.onBlur}
                                                value={field.value}
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
        const responseData = await getQuestionListAPI({ subtestId: CURRENT_SUBTEST_ID });
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
