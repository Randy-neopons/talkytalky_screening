import { useCallback, useEffect, useMemo, useState, type ChangeEventHandler } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import ReactTextareaAutosize from 'react-textarea-autosize';
import type { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';

import { isAxiosError } from 'axios';
import { deleteCookie, getCookie } from 'cookies-next';

import { useCurrentSubTest, useSubtests, useTestActions } from '@/stores/testStore';
import { useTestTime } from '@/stores/timerStore';
import { TALKYTALKY_URL } from '@/utils/const';
import CheckBox from '@/components/common/CheckBox';
import Container from '@/components/common/Container';
import { useConductedSubtestsQuery, useQuestionsAndAnswersQuery } from '@/hooks/das';
import { updateSessionAPI } from '@/api/das';

import subtestStyles from '../SubTests.module.scss';

import type { Answer, QuestionAnswer } from '@/types/das';

// 소검사 ID
const CURRENT_SUBTEST_ID = 1; // SpeechMechanism
const PART_ID_START = 1;

// 소검사 내 파트별 문항 index 정보
// TODO: part title도 DB에서 가져오기
const partIndexList = [
    {
        start: 0,
        split: 3, // subtitle 기준으로 나눔
        end: 8,
        subtitle1: '휴식시',
        subtitle2: '활동시',
        partTitle: '안면',
        partTitleEn: 'Facial',
        partId: 1,
    },
    {
        start: 0,
        split: 1,
        end: 6,
        subtitle1: '휴식시',
        subtitle2: '활동시',
        partTitle: '아랫턱 근육',
        partTitleEn: 'Jaw',
        partId: 2,
    },
    {
        start: 0,
        split: 5,
        end: 12,
        subtitle1: '휴식시',
        subtitle2: '활동시',
        partTitle: '혀',
        partTitleEn: 'Tongue',
        partId: 3,
    },
    {
        start: 0,
        split: 1,
        end: 6,
        subtitle1: '휴식시',
        subtitle2: '활동시',
        partTitle: '연구개 / 인두 / 후두',
        partTitleEn: 'Velar / Pharynx / Larynx',
        partId: 4,
    },
];

// 말기제평가 페이지
export default function SpeechMechanismQuestionsPage({
    questionList,
    currentPartId,
}: {
    questionList: QuestionAnswer[];
    currentPartId: number | null;
}) {
    const router = useRouter();

    // 현재 소검사, 선택한 소검사 정보
    const { data: subtestsData } = useConductedSubtestsQuery({ sessionId: Number(router.query.sessionId), jwt: getCookie('jwt') || '' });
    const testTime = useTestTime();

    // 문항 전부 정상으로 체크
    const [checkAll1, setCheckAll1] = useState(false);
    const [checkAll2, setCheckAll2] = useState(false);

    // 소검사 내 현재 파트 정보
    const [partId, setPartId] = useState(currentPartId || PART_ID_START);
    const { start, split, end, subtitle1, subtitle2, partTitle, partTitleEn } = useMemo(
        () => partIndexList.find(v => v.partId === partId) || partIndexList[0],
        [partId],
    );

    // 질문 DB 답도 같이 저장
    const { data: qnaData } = useQuestionsAndAnswersQuery({
        sessionId: Number(router.query.sessionId), // 테스트 마다 sesseion
        subtestId: CURRENT_SUBTEST_ID, // 소검사 종류
        partId,
        // start,
        // end: end - 1,
        jwt: getCookie('jwt') || '',
    });

    // react-hook-form
    const {
        control,
        register,
        setValue,
        handleSubmit,
        formState: { isDirty, isValid },
        getValues,
    } = useForm<{
        answers: Answer[];
    }>();
    const { fields } = useFieldArray({ name: 'answers', control });

    // 모두 정상 체크
    const handleChangeCheckAll1 = useCallback<ChangeEventHandler<HTMLInputElement>>(
        e => {
            if (e.target.checked === true) {
                Array.from({ length: split }, (v, i) => i).map(v => {
                    setValue(`answers.${v}.answer`, 'normal', { shouldValidate: true });
                });
            }

            setCheckAll1(e.target.checked);
        },
        [setValue, split],
    );

    // 모두 정상 체크
    const handleChangeCheckAll2 = useCallback<ChangeEventHandler<HTMLInputElement>>(
        e => {
            if (e.target.checked === true) {
                Array.from({ length: end - split }, (v, i) => split - start + i).map(v => {
                    setValue(`answers.${v}.answer`, 'normal', { shouldValidate: true });
                });
            }

            setCheckAll2(e.target.checked);
        },
        [end, setValue, split, start],
    );

    // 라디오 버튼 변경 핸들러1
    const handleRadioChange1 = () => {
        const answers = getValues('answers');
        const isAllNormal = answers.slice(0, split).every(answer => answer.answer === 'normal');
        setCheckAll1(isAllNormal);
    };

    // 라디오 버튼 변경 핸들러2
    const handleRadioChange2 = () => {
        const answers = getValues('answers');
        const isAllNormal = answers.slice(split).every(answer => answer.answer === 'normal');
        setCheckAll2(isAllNormal);
    };

    // 다음 파트로
    // const handleClickNext = useCallback(() => {
    //     setCheckAll1(false);
    //     setCheckAll2(false);
    //     partId < partIndexList[partIndexList.length - 1].partId && setPartId(partId => partId + 1);
    //     typeof window !== 'undefined' && window.scrollTo(0, 0); // 스크롤 초기화
    // }, [partId]);

    // 폼 데이터 제출
    const handleSubmitData = useCallback(
        async ({ sessionId, data }: { sessionId: number; data: any }) => {
            try {
                // 세션 갱신
                const accessToken = getCookie('jwt') as string;
                await updateSessionAPI({
                    sessionId,
                    testTime,
                    currentPartId: partId,
                    answers: data.answers,
                    jwt: accessToken,
                });
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

    // 이전 파트로
    const handleClickPrev = useCallback(async () => {
        try {
            const data = getValues();
            const sessionId = Number(router.query.sessionId);
            await handleSubmitData({ sessionId, data });

            setCheckAll1(false);
            setCheckAll2(false);

            if (partId > PART_ID_START) {
                setPartId(partId => partId - 1);
                typeof window !== 'undefined' && window.scrollTo(0, 0);
            } else {
                router.push(`/das/sessions/${sessionId}/subtests/speechMechanism`);
            }
        } catch (err) {
            console.error(err);
        }
    }, [getValues, handleSubmitData, partId, router]);

    // 폼 제출
    const handleClickNext = useCallback(
        async (data: any) => {
            try {
                const sessionId = Number(router.query.sessionId);
                await handleSubmitData({ sessionId, data });

                if (partId < partIndexList[partIndexList.length - 1].partId) {
                    // 검사할 파트가 남았으면 계속 진행
                    setCheckAll1(false);
                    setCheckAll2(false);
                    setPartId(partId => partId + 1);
                    typeof window !== 'undefined' && window.scrollTo(0, 0); // 스크롤 초기화
                } else {
                    // 검사할 파트가 없으면

                    // 소검사 확인
                    const subtests = subtestsData?.subtests;
                    if (!subtests) {
                        throw new Error('수행할 소검사가 없습니다');
                    }

                    // 다음 진행할 소검사
                    const currentSubtestIndex = subtests.findIndex(v => v.subtestId === CURRENT_SUBTEST_ID);
                    const nextSubtestItem = subtests?.[currentSubtestIndex + 1];

                    if (nextSubtestItem) {
                        // 다음 소검사가 있으면 이동
                        if (nextSubtestItem.subtestId === 5) {
                            router.push(`/das/sessions/${sessionId}/subtests/${nextSubtestItem.pathname}/questions`);
                        } else {
                            router.push(`/das/sessions/${sessionId}/subtests/${nextSubtestItem.pathname}`);
                        }
                    } else {
                        // 다음 소검사가 없으면 평가불가 문항으로 이동
                        router.push(`/das/sessions/${sessionId}/unassessable`);
                    }
                }
            } catch (err) {
                console.error(err);
            }
        },
        [handleSubmitData, partId, router, subtestsData?.subtests],
    );

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

    return (
        <Container>
            <form onSubmit={handleSubmit(handleClickNext)} className={`${subtestStyles.subtestForm}`}>
                <h1 className='whitespace-pre-line text-center font-jalnan text-head-1'>{partTitleEn}</h1>
                <h2 className='whitespace-pre-line text-center font-jalnan text-head-2'>{partTitle}</h2>

                <table className={subtestStyles.questionTable}>
                    <thead>
                        <tr className={subtestStyles.yesNo}>
                            <th colSpan={2}></th>
                            <th>예</th>
                            <th colSpan={2}>아니오</th>
                            <th>기타</th>
                        </tr>
                        <tr className={subtestStyles.option}>
                            <th></th>
                            <th>{subtitle1}</th>
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
                                <td className={subtestStyles.text}>{item.questionText}</td>
                                <td className={subtestStyles.option}>
                                    <input
                                        type='radio'
                                        {...register(`answers.${i}.answer`, { required: true, onChange: handleRadioChange1 })}
                                        value='normal'
                                    />
                                </td>
                                <td className={subtestStyles.option}>
                                    <input
                                        type='radio'
                                        {...register(`answers.${i}.answer`, { required: true, onChange: handleRadioChange1 })}
                                        value='mild'
                                    />
                                </td>
                                <td className={subtestStyles.option}>
                                    <input
                                        type='radio'
                                        {...register(`answers.${i}.answer`, { required: true, onChange: handleRadioChange1 })}
                                        value='moderate'
                                    />
                                </td>
                                <td className={subtestStyles.option}>
                                    <input
                                        type='radio'
                                        {...register(`answers.${i}.answer`, { required: true, onChange: handleRadioChange1 })}
                                        value='unknown'
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

                {(qnaData?.questions?.length || 0) - split >= 0 && (
                    <>
                        <table className={subtestStyles.questionTable}>
                            <thead>
                                <tr className={subtestStyles.yesNo}>
                                    <th colSpan={2}></th>
                                    <th>예</th>
                                    <th colSpan={2}>아니오</th>
                                    <th>기타</th>
                                </tr>
                                <tr className={subtestStyles.option}>
                                    <th></th>
                                    <th>{subtitle2}</th>
                                    <th>정상</th>
                                    <th>경도</th>
                                    <th>심도</th>
                                    <th>평가불가</th>
                                </tr>
                            </thead>
                            <tbody>
                                {fields.slice(split).map((item, i) => (
                                    <tr key={item.id}>
                                        <td className={subtestStyles.num}>{split + i + 1}</td>
                                        <td className={subtestStyles.text}>{item.questionText}</td>
                                        <td className={subtestStyles.option}>
                                            <input
                                                type='radio'
                                                {...register(`answers.${split + i}.answer`, {
                                                    required: true,
                                                    onChange: handleRadioChange2,
                                                })}
                                                value='normal'
                                            />
                                        </td>
                                        <td className={subtestStyles.option}>
                                            <input
                                                type='radio'
                                                {...register(`answers.${split + i}.answer`, {
                                                    required: true,
                                                    onChange: handleRadioChange2,
                                                })}
                                                value='mild'
                                            />
                                        </td>
                                        <td className={subtestStyles.option}>
                                            <input
                                                type='radio'
                                                {...register(`answers.${split + i}.answer`, {
                                                    required: true,
                                                    onChange: handleRadioChange2,
                                                })}
                                                value='moderate'
                                            />
                                        </td>
                                        <td className={subtestStyles.option}>
                                            <input
                                                type='radio'
                                                {...register(`answers.${split + i}.answer`, {
                                                    required: true,
                                                    onChange: handleRadioChange2,
                                                })}
                                                value='unknown'
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
                    <button type='button' className='mt-20 btn btn-large btn-outlined' onClick={handleClickPrev}>
                        이전
                    </button>

                    <button
                        key='submit'
                        type='submit'
                        className='ml-5 mt-20 btn btn-large btn-contained disabled:btn-contained-disabled'
                        disabled={!isValid}
                    >
                        다음
                    </button>
                </div>
            </form>
        </Container>
    );
}

// SSR
export const getServerSideProps: GetServerSideProps = async context => {
    try {
        const sessionId = Number(context.query.sessionId);
        const currentPartId = context.query.currentPartId ? Number(context.query.currentPartId) : null;

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

        return {
            props: {
                isLoggedIn: true,
                currentPartId, // 이어하기 위해 현재까지 진행한 파트 ID
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
