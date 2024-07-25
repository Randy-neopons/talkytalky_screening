import { useCallback, useMemo, useState, type ChangeEventHandler } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import ReactTextareaAutosize from 'react-textarea-autosize';
import type { GetServerSideProps } from 'next';

import CheckBox from '@/components/common/CheckBox';
import Container from '@/components/common/Container';
import { getQuestionListAPI } from '@/api/questions';

import startStyles from './Start.module.css';

// 소검사 ID
const CURRENT_SUBTEST_ID = 1;

// 소검사 내 파트별 문항 index 정보
// TODO: part title도 DB에서 가져오기
const partIndexList = [
    { start: 0, split: 6, end: 12, subtitle1: '휴식시', subtitle2: '활동시', partTitle: 'Facial (안면)' },
    { start: 12, split: 13, end: 18, subtitle1: '휴식시', subtitle2: '활동시', partTitle: 'Jaw (턱)' },
    { start: 18, split: 23, end: 30, subtitle1: '휴식시', subtitle2: '활동시', partTitle: 'Tongue (혀)' },
    { start: 30, split: 35, end: 35, subtitle1: '활동시', partTitle: 'Velar (연구개)\nPharynx (인두)\nLarynx (후두)' },
];

// 말기제평가 페이지
export default function SpeechMechanismStartPage({
    questionList,
}: {
    questionList: { questionId: number; questionText: string; answerType: string; partId: number; subtestId: number }[];
}) {
    // 문항 전부 정상으로 체크
    const [checkAll1, setCheckAll1] = useState(false);
    const [checkAll2, setCheckAll2] = useState(false);

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

    // 모두 정상 체크
    const handleChangeCheckAll2 = useCallback<ChangeEventHandler<HTMLInputElement>>(
        e => {
            if (e.target.checked === true) {
                Array.from({ length: end - split }, (v, i) => split + i).map(v => {
                    console.log(v);
                    setValue(`answers.${v}.answer`, 'normal');
                });
            }

            setCheckAll2(e.target.checked);
        },
        [end, setValue, split],
    );

    // 다음 파트로
    const handleClickNext = useCallback(() => {
        currentPartId < partIndexList.length && setCurrentPartId(currentPartId => currentPartId + 1);
        typeof window !== 'undefined' && window.scrollTo(0, 0); // 스크롤 초기화
    }, [currentPartId]);

    // 폼 제출
    const handleOnSubmit = useCallback((data: any) => {
        console.log(data);
    }, []);

    return (
        <Container>
            <h2 className='flex items-center font-jalnan text-accent1 text-head-2'>SPEECH MECHANISM : 말기제평가</h2>
            <form onSubmit={handleSubmit(handleOnSubmit)} className='flex w-full flex-col flex-nowrap items-center px-5 xl:px-0'>
                <h1 className='whitespace-pre-line text-center font-jalnan text-head-1'>{partTitle}</h1>

                <table className={`${startStyles['table']}`}>
                    <thead className={`${startStyles['table-head']}`}>
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
                    <tbody className={`${startStyles['table-body']}`}>
                        {fields.slice(start, split).map((item, i) => (
                            <tr key={item.id}>
                                <td>{i + 1}</td>
                                <td>{item.questionText}</td>
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
                                                className={`${startStyles.textarea}`}
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
                <div className='flex w-full justify-end'>
                    <CheckBox name='all' checked={checkAll1} onChange={handleChangeCheckAll1}>
                        모두 정상
                    </CheckBox>
                </div>

                {end - split > 0 && (
                    <>
                        <table className={`${startStyles['table']}`}>
                            <thead className={`${startStyles['table-head']}`}>
                                <tr className='bg-accent2 text-white text-body-2'>
                                    <th className='rounded-tl-base'></th>
                                    <th>{subtitle2}</th>
                                    <th>정상</th>
                                    <th>경도</th>
                                    <th>심도</th>
                                    <th>평가불가</th>
                                    <th className='rounded-tr-base'>메모</th>
                                </tr>
                            </thead>
                            <tbody className={`${startStyles['table-body']}`}>
                                {fields.slice(split, end).map((item, i) => (
                                    <tr key={item.id}>
                                        <td>{split - start + i + 1}</td>
                                        <td>{item.questionText}</td>
                                        <td className='text-center'>
                                            <input type='radio' {...register(`answers.${split + i}.answer`)} value='normal' />
                                        </td>
                                        <td className='text-center'>
                                            <input type='radio' {...register(`answers.${split + i}.answer`)} value='mild' />
                                        </td>
                                        <td className='text-center'>
                                            <input type='radio' {...register(`answers.${split + i}.answer`)} value='moderate' />
                                        </td>
                                        <td className='text-center'>
                                            <input type='radio' {...register(`answers.${split + i}.answer`)} value='unknown' />
                                        </td>
                                        <td className='p-0 text-center'>
                                            <Controller
                                                control={control}
                                                name={`answers.${split + i}.memo`}
                                                render={({ field }) => (
                                                    <ReactTextareaAutosize
                                                        className={`${startStyles.textarea}`}
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
                        <div className='flex w-full justify-end'>
                            <CheckBox name='all' checked={checkAll2} onChange={handleChangeCheckAll2}>
                                모두 정상
                            </CheckBox>
                        </div>
                    </>
                )}

                <button type='button' className='mt-20 btn btn-large btn-contained' onClick={handleClickNext}>
                    다음
                </button>
            </form>
        </Container>
    );
}

// SSR
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
        const responseData = await getQuestionListAPI(CURRENT_SUBTEST_ID);
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
