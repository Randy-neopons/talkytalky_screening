import { useCallback, useMemo, useState, type ChangeEventHandler } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import ReactTextareaAutosize from 'react-textarea-autosize';
import type { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';

import { useCurrentSubTest, useSubtests, useTestInfoActions } from '@/stores/testInfoStore';
import CheckBox from '@/components/common/CheckBox';
import Container from '@/components/common/Container';
import { getQuestionListAPI, updateSessionAPI } from '@/api/questions';

import subtestStyles from '../SubTests.module.css';

// 소검사 ID
const CURRENT_SUBTEST_ID = 2;

// 소검사 내 파트별 문항 index 정보
// TODO: part title도 DB에서 가져오기
const partIndexList = [
    { start: 0, split: 1, end: 6, subtitle1: '잠복시간', subtitle2: '음질', partTitle: 'Aspiration (호흡)\nPhonation (음성)' },
    { start: 6, split: 11, end: 14, subtitle1: '음도', subtitle2: '강도', partTitle: 'Aspiration (호흡)\nPhonation (음성)' },
    { start: 14, split: 18, end: 22, subtitle1: '과다비성', subtitle2: '비강누출', partTitle: 'Resonance (공명)' },
    { start: 22, split: 27, end: 27, subtitle1: '따라하기', partTitle: 'Articulation (조음)' },
];

// SPEECH I 문항 페이지
export default function SpeechOnePage({
    questionList,
}: {
    questionList: { questionId: number; questionText: string; answerType: string; partId: number; subtestId: number }[];
}) {
    const router = useRouter();

    // 현재 소검사, 선택한 소검사 정보
    const currentSubtest = useCurrentSubTest();
    const subtests = useSubtests();
    const { setCurrentSubtest } = useTestInfoActions();

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

    // 이전 파트로
    const handleClickPrev = useCallback(() => {
        setCheckAll1(false);
        setCheckAll2(false);
        currentPartId > 1 && setCurrentPartId(partId => partId - 1);
        typeof window !== 'undefined' && window.scrollTo(0, 0);
    }, [currentPartId]);

    // 다음 파트로
    const handleClickNext = useCallback(() => {
        setCheckAll1(false);
        setCheckAll2(false);
        currentPartId < partIndexList.length && setCurrentPartId(partId => partId + 1);
        typeof window !== 'undefined' && window.scrollTo(0, 0); // 스크롤 초기화
    }, [currentPartId]);

    // 폼 제출
    const handleOnSubmit = useCallback(
        async (data: any) => {
            console.log(data);

            try {
                const sessionId = Number(router.query.sessionId);
                await updateSessionAPI({ sessionId, currentPartId });

                const currentSubtestIndex = subtests.findIndex(v => v.subtestId === currentSubtest);

                const nextSubtest = subtests[currentSubtestIndex + 1];
                router.push(`/sessions/${sessionId}/subTests/${nextSubtest.pathname}`);
            } catch (err) {
                console.error(err);
            }
        },
        [currentPartId, currentSubtest, router, subtests],
    );

    return (
        <Container>
            <h2 className='flex items-center font-jalnan text-accent1 text-head-2'>SPEECH I : 영역별 말평가</h2>
            <form onSubmit={handleSubmit(handleOnSubmit)} className='flex w-full flex-col flex-nowrap items-center px-5 xl:px-0'>
                <h1 className='whitespace-pre-line text-center font-jalnan text-head-1'>{partTitle}</h1>

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
                <div className='flex w-full justify-end'>
                    <CheckBox name='all' checked={checkAll1} onChange={handleChangeCheckAll1}>
                        모두 정상
                    </CheckBox>
                </div>

                {end - split > 0 && (
                    <>
                        <table className={`${subtestStyles['table']}`}>
                            <thead className={`${subtestStyles['table-head']}`}>
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
                            <tbody className={`${subtestStyles['table-body']}`}>
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
                        <div className='flex w-full justify-end'>
                            <CheckBox name='all' checked={checkAll2} onChange={handleChangeCheckAll2}>
                                모두 정상
                            </CheckBox>
                        </div>
                    </>
                )}

                <div>
                    {currentPartId > 1 && (
                        <button type='button' className='mt-20 btn btn-large btn-outlined' onClick={handleClickPrev}>
                            이전
                        </button>
                    )}
                    {/* key 설정을 해야 다른 컴포넌트로 인식하여 type이 명확히 구분됨 */}
                    {currentPartId < partIndexList.length ? (
                        <button key='noSubmit' type='button' className='ml-5 mt-20 btn btn-large btn-contained' onClick={handleClickNext}>
                            다음
                        </button>
                    ) : (
                        <button key='submit' type='submit' className='ml-5 mt-20 btn btn-large btn-contained'>
                            다음 검사로
                        </button>
                    )}
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
