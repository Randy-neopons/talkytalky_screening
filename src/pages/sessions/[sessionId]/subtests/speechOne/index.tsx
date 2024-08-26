import { useCallback, useMemo, useState, type ChangeEventHandler } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import ReactTextareaAutosize from 'react-textarea-autosize';
import type { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';

import { isAxiosError } from 'axios';
import { deleteCookie, getCookie } from 'cookies-next';

import { useCurrentSubTest, useSubtests, useTestActions } from '@/stores/testStore';
import { TALKYTALKY_URL } from '@/utils/const';
import CheckBox from '@/components/common/CheckBox';
import Container from '@/components/common/Container';
import { useConductedSubtestsQuery } from '@/hooks/questions';
import { getAnswersCountAPI, getQuestionAndAnswerListAPI, updateSessionAPI } from '@/api/questions';

import subtestStyles from '../SubTests.module.css';

import type { Answer, QuestionAnswer } from '@/types/types';

// 소검사 ID
const CURRENT_SUBTEST_ID = 2;
const CURRENT_PART_ID_START = 5;

// 소검사 내 파트별 문항 index 정보
// TODO: part title도 DB에서 가져오기
const partIndexList = [
    { start: 0, split: 1, end: 6, subtitle1: '잠복시간', subtitle2: '음질', partTitle: 'Aspiration (호흡)\nPhonation (음성)', partId: 5 },
    { start: 6, split: 11, end: 14, subtitle1: '음도', subtitle2: '강도', partTitle: 'Aspiration (호흡)\nPhonation (음성)', partId: 5 },
    { start: 14, split: 18, end: 22, subtitle1: '과다비성', subtitle2: '비강누출', partTitle: 'Resonance (공명)', partId: 6 },
    { start: 22, split: 27, end: 27, subtitle1: '따라하기', partTitle: 'Articulation (조음)', partId: 7 },
];

// SPEECH I 문항 페이지
export default function SpeechOnePage({ questionList }: { questionList: QuestionAnswer[] }) {
    const router = useRouter();

    // 현재 소검사, 선택한 소검사 정보
    const currentSubtest = useCurrentSubTest();
    const { data: subtestsData } = useConductedSubtestsQuery({ sessionId: Number(router.query.sessionId), jwt: getCookie('jwt') || '' });
    const { setCurrentSubtest } = useTestActions();

    // 문항 전부 정상으로 체크
    const [checkAll1, setCheckAll1] = useState(false);
    const [checkAll2, setCheckAll2] = useState(false);

    // 소검사 내 현재 파트 정보
    const [currentPartId, setCurrentPartId] = useState(CURRENT_PART_ID_START);
    const { start, split, end, subtitle1, subtitle2, partTitle } = useMemo(
        () => partIndexList.find(v => v.partId === currentPartId) || partIndexList[0],
        [currentPartId],
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
        currentPartId > CURRENT_PART_ID_START && setCurrentPartId(partId => partId - 1);
        typeof window !== 'undefined' && window.scrollTo(0, 0);
    }, [currentPartId]);

    // 다음 파트로
    const handleClickNext = useCallback(() => {
        setCheckAll1(false);
        setCheckAll2(false);
        currentPartId < partIndexList[partIndexList.length - 1].partId && setCurrentPartId(partId => partId + 1);
        typeof window !== 'undefined' && window.scrollTo(0, 0); // 스크롤 초기화
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
                console.error(err);
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

                const subtests = subtestsData?.subtests;
                if (!subtests) {
                    throw new Error('수행할 소검사가 없습니다');
                }
                const currentSubtestIndex = subtests.findIndex(v => v.subtestId === CURRENT_SUBTEST_ID);
                const nextSubtest = subtests[currentSubtestIndex + 1];
                if (nextSubtest) {
                    router.push(`/sessions/${sessionId}/subtests/${nextSubtest.pathname}`);
                } else {
                    router.push(`/sessions/${sessionId}/unassessable`);
                }
            } catch (err) {
                console.error(err);
            }
        },
        [handleSubmitData, router, subtestsData],
    );

    return (
        <Container>
            <h2 className='flex items-center font-jalnan text-accent1 text-head-2'>SPEECH I : 영역별 말평가</h2>
            <form onSubmit={handleSubmit(handleOnSubmit)} className={`${subtestStyles['subtest-form']}`}>
                <h1 className='whitespace-pre-line text-center font-jalnan text-head-1'>{partTitle}</h1>

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
                                <td className={`${subtestStyles['text']}`}>{item.questionText}</td>
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
                <div className='flex w-full justify-end'>
                    <CheckBox name='all' checked={checkAll1} onChange={handleChangeCheckAll1}>
                        모두 정상
                    </CheckBox>
                </div>

                {end - split > 0 && (
                    <>
                        <table className={`${subtestStyles['question-table']}`}>
                            <thead>
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
                            <tbody>
                                {fields.slice(split, end).map((item, i) => (
                                    <tr key={item.id}>
                                        <td className={`${subtestStyles['num']}`}>{split - start + i + 1}</td>
                                        <td className={`${subtestStyles['text']}`}>{item.questionText}</td>
                                        <td className={`${subtestStyles['option']}`}>
                                            <input type='radio' {...register(`answers.${split + i}.answer`)} value='normal' />
                                        </td>
                                        <td className={`${subtestStyles['option']}`}>
                                            <input type='radio' {...register(`answers.${split + i}.answer`)} value='mild' />
                                        </td>
                                        <td className={`${subtestStyles['option']}`}>
                                            <input type='radio' {...register(`answers.${split + i}.answer`)} value='moderate' />
                                        </td>
                                        <td className={`${subtestStyles['option']}`}>
                                            <input type='radio' {...register(`answers.${split + i}.answer`)} value='unknown' />
                                        </td>
                                        <td className='p-0 text-center'>
                                            <Controller
                                                control={control}
                                                name={`answers.${split + i}.comment`}
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
                        <div className='flex w-full justify-end'>
                            <CheckBox name='all' checked={checkAll2} onChange={handleChangeCheckAll2}>
                                모두 정상
                            </CheckBox>
                        </div>
                    </>
                )}

                <div>
                    {currentPartId > CURRENT_PART_ID_START && (
                        <button type='button' className='mt-20 btn btn-large btn-outlined' onClick={handleClickPrev}>
                            이전
                        </button>
                    )}
                    {/* key 설정을 해야 다른 컴포넌트로 인식하여 type이 명확히 구분됨 */}
                    {currentPartId < partIndexList[partIndexList.length - 1].partId ? (
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

        // 검사 시작할 때마다 진행률 불러오기
        const { totalCount, notNullCount } = await getAnswersCountAPI({ sessionId, jwt: accessToken });
        const progress = (notNullCount / totalCount) * 100;

        // 소검사 문항 정보 fetch
        const responseData = await getQuestionAndAnswerListAPI({ sessionId, subtestId: CURRENT_SUBTEST_ID, jwt: accessToken });
        const questionList = responseData.questions;

        return {
            props: {
                isLoggedIn: true,
                questionList,
                progress,
            },
        };
    } catch (err) {
        console.error(err);

        return {
            redirect: {
                destination: '/',
                permanent: true,
            },
        };
    }
};
