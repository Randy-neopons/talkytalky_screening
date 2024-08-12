import { useCallback, useMemo, useState, type ChangeEventHandler } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import ReactTextareaAutosize from 'react-textarea-autosize';
import type { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';

import { useCurrentSubTest, useSubtests, useTestInfoActions } from '@/stores/testInfoStore';
import CheckBox from '@/components/common/CheckBox';
import Container from '@/components/common/Container';
import { MikeIcon, PlayIcon, StopIcon } from '@/components/icons';
import { getQuestionListAPI, updateSessionAPI } from '@/api/questions';

import subtestStyles from '../SubTests.module.css';

// 소검사 ID
const CURRENT_SUBTEST_ID = 3;

// 소검사 내 파트별 문항 index 정보
// TODO: part title도 DB에서 가져오기
const partIndexList = [
    { start: 0, end: 6, subtitle: '호흡 & 음성', partTitle: 'Aspiration (호흡)\nPhonation (음성)' },
    { start: 6, end: 8, subtitle: '공명', partTitle: 'Resonance (공명)' },
    { start: 8, end: 11, subtitle: '조음', partTitle: 'Articulation (조음)' },
    { start: 11, end: 18, subtitle: '운율', partTitle: 'Prosody (운율)' },
];

// SPEECH II 문항 페이지
export default function SpeechTwoPage({
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
    const [checkAll, setCheckAll] = useState(false);

    // 소검사 내 현재 파트 정보
    const [currentPartId, setCurrentPartId] = useState(1);
    const { start, end, subtitle, partTitle } = useMemo(() => partIndexList[currentPartId - 1], [currentPartId]);

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
    const handleChangeCheckAll = useCallback<ChangeEventHandler<HTMLInputElement>>(
        e => {
            if (e.target.checked === true) {
                Array.from({ length: end - start }, (v, i) => start + i).map(v => {
                    setValue(`answers.${v}.answer`, 'normal');
                });
            }

            setCheckAll(e.target.checked);
        },
        [setValue, end, start],
    );

    // 이전 파트로
    const handleClickPrev = useCallback(() => {
        setCheckAll(false);
        currentPartId > 1 && setCurrentPartId(partId => partId - 1);
        typeof window !== 'undefined' && window.scrollTo(0, 0);
    }, [currentPartId]);

    // 다음 파트로
    const handleClickNext = useCallback(() => {
        setCheckAll(false);
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
            <h2 className='flex items-center font-jalnan text-accent1 text-head-2'>SPEECH II : 종합적 말평가</h2>
            <form onSubmit={handleSubmit(handleOnSubmit)} className='flex w-full flex-col flex-nowrap items-center px-5 xl:px-0'>
                <h1 className='whitespace-pre-line text-center font-jalnan text-head-1'>{partTitle}</h1>

                <ul className='mt-20 flex flex-row flex-nowrap gap-5'>
                    <li className='h-40 w-80 overflow-hidden rounded-base bg-white shadow-base'>
                        <div className='flex h-12 w-full items-center justify-center bg-accent1'>
                            <span className='font-bold text-white text-body-2'>문단읽기</span>
                        </div>
                        <div className='flex w-full justify-center gap-5 py-[35px]'>
                            <button type='button' className='flex h-10 w-10 items-center justify-center rounded-full bg-accent1'>
                                <StopIcon />
                            </button>
                            <button type='button' className='flex h-10 w-10 items-center justify-center rounded-full bg-accent1'>
                                <PlayIcon />
                            </button>
                            <button type='button' className='flex h-10 w-10 items-center justify-center rounded-full bg-accent1'>
                                <MikeIcon />
                            </button>
                        </div>
                    </li>
                    <li className='h-40 w-80 overflow-hidden rounded-base bg-white shadow-base'>
                        <div className='flex h-12 w-full items-center justify-center bg-accent1'>
                            <span className='font-bold text-white text-body-2'>그림 설명하기</span>
                        </div>
                        <div className='flex w-full justify-center gap-5 py-[35px]'>
                            <button type='button' className='flex h-10 w-10 items-center justify-center rounded-full bg-accent1'>
                                <StopIcon />
                            </button>
                            <button type='button' className='flex h-10 w-10 items-center justify-center rounded-full bg-accent1'>
                                <PlayIcon />
                            </button>
                        </div>
                    </li>
                    <li className='h-40 w-80 overflow-hidden rounded-base bg-white shadow-base'>
                        <div className='flex h-12 w-full items-center justify-center bg-accent1'>
                            <span className='font-bold text-white text-body-2'>대화하기</span>
                        </div>
                        <div className='flex w-full justify-center gap-5 py-[35px]'>
                            <button type='button' className='flex h-10 w-10 items-center justify-center rounded-full bg-accent1'>
                                <StopIcon />
                            </button>
                            <button type='button' className='flex h-10 w-10 items-center justify-center rounded-full bg-accent1'>
                                <PlayIcon />
                            </button>
                        </div>
                    </li>
                </ul>

                <table className={`${subtestStyles['table']}`}>
                    <thead className={`${subtestStyles['table-head']}`}>
                        <tr className='bg-accent1 text-white text-body-2'>
                            <th className='rounded-tl-base'></th>
                            <th>{subtitle}</th>
                            <th>정상</th>
                            <th>경도</th>
                            <th>심도</th>
                            <th>평가불가</th>
                            <th className='rounded-tr-base'>메모</th>
                        </tr>
                    </thead>
                    <tbody className={`${subtestStyles['table-body']}`}>
                        {fields.slice(start, end).map((item, i) => (
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
                    <CheckBox name='all' checked={checkAll} onChange={handleChangeCheckAll}>
                        모두 정상
                    </CheckBox>
                </div>

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
