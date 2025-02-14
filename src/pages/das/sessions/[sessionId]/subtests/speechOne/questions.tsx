import { useCallback, useEffect, useMemo, useState, type ChangeEventHandler, type KeyboardEventHandler } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import ReactTextareaAutosize from 'react-textarea-autosize';
import type { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';

import { isAxiosError } from 'axios';
import { deleteCookie, getCookie } from 'cookies-next';

import { useCurrentSubTest, useSubtests, useTestActions } from '@/stores/testStore';
import { useTestTime, useTimerActions } from '@/stores/timerStore';
import { TALKYTALKY_URL } from '@/utils/const';
import CheckBox from '@/components/common/CheckBox';
import Container from '@/components/common/Container';
import { WaveformButton } from '@/components/das/WaveformButton';
import { useConductedSubtestsQuery, useQuestionsAndAnswersQuery } from '@/hooks/das';
import useAudioRecorder from '@/hooks/useAudioRecorder';
import { getAnswersCountAPI, getQuestionAndAnswerListAPI, updateSessionAPI } from '@/api/das';

import subtestStyles from '../SubTests.module.scss';

import type { Answer, QuestionAnswer, Recording } from '@/types/das';

// 소검사 ID
const CURRENT_SUBTEST_ID = 2;
const PART_ID_START = 5;

// 소검사 내 파트별 문항 index 정보
// TODO: part title도 DB에서 가져오기
const partIndexList = [
    {
        start: 0,
        split: 6,
        end: 6,
        subtitle1: '음질',
        subtitle2: '음질',
        partTitle: '호흡 / 발성',
        partTitleEn: 'Respiration / Phonation',
        partId: 5,
        page: 0,
    },
    {
        start: 6,
        split: 10,
        end: 10,
        subtitle1: '음도',
        subtitle2: '음도',
        partTitle: '호흡 / 발성',
        partTitleEn: 'Respiration / Phonation',
        partId: 5,
        page: 1,
    },
    {
        start: 10,
        split: 12,
        end: 12,
        subtitle1: '강도',
        subtitle2: '강도',
        partTitle: '호흡 / 발성',
        partTitleEn: 'Respiration / Phonation',
        partId: 5,
        page: 2,
    },
    {
        start: 0,
        split: 4,
        end: 8,
        subtitle1: '과다비성',
        subtitle2: '비강누출',
        partTitle: '공명',
        partTitleEn: 'Resonance',
        partId: 6,
        page: 0,
    },
    {
        start: 0,
        split: 5,
        end: 5,
        subtitle1: '자음정확성',
        partTitle: '조음',
        partTitleEn: 'Articulation',
        partId: 7,
        page: 0,
    },
];

const RecordIcon = () => {
    return (
        <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none'>
            <circle cx='12' cy='12' r='8' fill='#FF647C' />
        </svg>
    );
};

const StopRecordIcon = () => {
    return (
        <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none'>
            <rect x='5' y='5' width='14' height='14' rx='2' fill='#FF647C' />
        </svg>
    );
};

const PlayIcon = ({ disabled }: { disabled?: boolean }) => {
    return (
        <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none'>
            <g clipPath='url(#clip0_13783_7609)'>
                <path
                    d='M20 10.2679C21.3333 11.0377 21.3333 12.9623 20 13.7321L8 20.6603C6.66667 21.4301 5 20.4678 5 18.9282L5 5.0718C5 3.5322 6.66667 2.56995 8 3.33975L20 10.2679Z'
                    fill={disabled ? 'gray' : '#6979F8'}
                />
            </g>
            <defs>
                <clipPath id='clip0_13783_7609'>
                    <rect width='24' height='24' fill='white' />
                </clipPath>
            </defs>
        </svg>
    );
};

const PauseIcon = () => {
    return (
        <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none'>
            <rect x='5' y='3' width='5' height='18' rx='1' fill='#6979F8' />
            <rect x='14' y='3' width='5' height='18' rx='1' fill='#6979F8' />
        </svg>
    );
};

const RecordButton = ({
    isRecording,
    handleStop,
    handleStart,
}: {
    isRecording: boolean;
    handleStop: () => void;
    handleStart: () => void;
}) => {
    return (
        <button type='button' className='m-auto flex' onClick={isRecording ? handleStop : handleStart}>
            {isRecording ? <StopRecordIcon /> : <RecordIcon />}
        </button>
    );
};

const PlayButton = ({
    isPlaying,
    handlePause,
    handlePlay,
    disabled,
}: {
    isPlaying: boolean;
    handlePause: () => void;
    handlePlay: () => void;
    disabled?: boolean;
}) => {
    return (
        <button type='button' className='m-auto flex' onClick={isPlaying ? handlePause : handlePlay} disabled={disabled}>
            {isPlaying ? <PauseIcon /> : <PlayIcon disabled={disabled} />}
        </button>
    );
};

// SPEECH I 문항 페이지
export default function SpeechOneQuestionsPage({
    questionList,
    recordingList,
    currentPartId,
}: {
    questionList: QuestionAnswer[];
    recordingList: Recording[];
    currentPartId: number | null;
}) {
    const router = useRouter();

    // MPT 측정 녹음
    const {
        isRecording: isRecording1,
        isPlaying: isPlaying1,
        audioUrl: audioUrl1,
        audioBlob: audioBlob1,
        handleStartRecording: handleStartRecording1,
        handleStopRecording: handleStopRecording1,
        handlePlay: handlePlay1,
        handlePause: handlePause1,
    } = useAudioRecorder(recordingList[0]?.filePath);
    const {
        isRecording: isRecording2,
        isPlaying: isPlaying2,
        audioUrl: audioUrl2,
        audioBlob: audioBlob2,
        handleStartRecording: handleStartRecording2,
        handleStopRecording: handleStopRecording2,
        handlePlay: handlePlay2,
        handlePause: handlePause2,
    } = useAudioRecorder(recordingList[1]?.filePath);
    const {
        isRecording: isRecording3,
        isPlaying: isPlaying3,
        audioUrl: audioUrl3,
        audioBlob: audioBlob3,
        handleStartRecording: handleStartRecording3,
        handleStopRecording: handleStopRecording3,
        handlePlay: handlePlay3,
        handlePause: handlePause3,
    } = useAudioRecorder(recordingList[2]?.filePath);

    // 현재 소검사, 선택한 소검사 정보
    const { data: subtestsData } = useConductedSubtestsQuery({ sessionId: Number(router.query.sessionId), jwt: getCookie('jwt') || '' });
    const testTime = useTestTime();
    const { setTestStart } = useTimerActions();
    const currentSubtest = useCurrentSubTest();

    // 문항 전부 정상으로 체크
    const [checkAll1, setCheckAll1] = useState(false);
    const [checkAll2, setCheckAll2] = useState(false);

    // 소검사 내 현재 파트 정보
    const [partId, setPartId] = useState(currentPartId || PART_ID_START);
    // SPEECH I에서 Respiration & Phonation은 문항이 많아 한 파트가 여러 페이지를 차지함.
    // 다른 파트는 다 1페이지 구성임.
    const [page, setPage] = useState(0);

    const { start, split, end, subtitle1, subtitle2, partTitle, partTitleEn } = useMemo(
        () => partIndexList.find(v => v.partId === partId && v.page === page) || partIndexList[0],
        [page, partId],
    );

    const { data: qnaData } = useQuestionsAndAnswersQuery({
        sessionId: Number(router.query.sessionId),
        subtestId: CURRENT_SUBTEST_ID,
        partId,
        start,
        end: end - 1,
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
        recordings: Recording[];
        answers: Answer[];
    }>();
    const { fields } = useFieldArray({ name: 'answers', control });

    // 모두 정상 체크
    const handleChangeCheckAll1 = useCallback<ChangeEventHandler<HTMLInputElement>>(
        e => {
            if (e.target.checked === true) {
                Array.from({ length: split - start }, (v, i) => i).map(v => {
                    setValue(`answers.${v}.answer`, 'normal', { shouldValidate: true });
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
                Array.from({ length: end - split }, (v, i) => split - start + i).map(v => {
                    console.log(v);
                    setValue(`answers.${v}.answer`, 'normal', { shouldValidate: true });
                });
            }

            setCheckAll2(e.target.checked);
        },
        [end, setValue, split, start],
    );

    // // 이전 파트로
    // const handleClickPrev = useCallback(() => {
    //     setCheckAll1(false);
    //     setCheckAll2(false);
    //     partId > PART_ID_START && setPartId(partId => partId - 1);
    //     typeof window !== 'undefined' && window.scrollTo(0, 0);
    // }, [partId]);

    // 다음 파트로
    // const handleClickNext = useCallback(() => {
    //     setCheckAll1(false);
    //     setCheckAll2(false);

    //     if (partId === PART_ID_START && page < 3) {
    //         setPage(page => page + 1);
    //     } else {
    //         if (partId < partIndexList[partIndexList.length - 1].partId) {
    //             setPartId(partId => partId + 1);
    //             setPage(0);
    //         }
    //     }

    //     typeof window !== 'undefined' && window.scrollTo(0, 0); // 스크롤 초기화
    // }, [page, partId]);

    // 폼 데이터 제출
    const handleSubmitData = useCallback(
        async ({ sessionId, data }: { sessionId: number; data: any }) => {
            try {
                const formData = new FormData();
                formData.append('audio1', audioBlob1 || 'null');
                formData.append('audio2', audioBlob2 || 'null');
                formData.append('audio3', audioBlob3 || 'null');
                formData.append('recordings', JSON.stringify(data.recordings));

                // console.log(data.recordings);

                formData.append('testTime', `${testTime}`);
                formData.append('currentPartId', `${partId}`);
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
        [audioBlob1, audioBlob2, audioBlob3, partId, testTime],
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
            } else if (partId === PART_ID_START && page > 0) {
                setPage(page => page - 1);
                typeof window !== 'undefined' && window.scrollTo(0, 0);
            } else {
                router.push(`/das/sessions/${sessionId}/subtests/speechOne`);
            }
        } catch (err) {
            console.error(err);
        }
    }, [getValues, handleSubmitData, page, partId, router]);

    // 폼 제출 후 redirect
    const handleClickNext = useCallback(
        async (data: any) => {
            try {
                const sessionId = Number(router.query.sessionId);
                await handleSubmitData({ sessionId, data });

                setCheckAll1(false);
                setCheckAll2(false);

                if (partId === PART_ID_START && page < 2) {
                    setPage(page => page + 1);
                    console.log('here1');
                } else {
                    if (partId < partIndexList[partIndexList.length - 1].partId) {
                        console.log('here2');
                        setPartId(partId => partId + 1);
                        setPage(0);
                    } else {
                        console.log('here3');
                        const subtests = subtestsData?.subtests;
                        if (!subtests) {
                            throw new Error('수행할 소검사가 없습니다');
                        }
                        // 다음 진행할 소검사
                        const currentSubtestIndex = subtests.findIndex(v => v.subtestId === CURRENT_SUBTEST_ID);
                        const nextSubtestItem = subtests[currentSubtestIndex + 1];

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
                }
            } catch (err) {
                console.error(err);
            }
        },
        [handleSubmitData, page, partId, router, subtestsData?.subtests],
    );

    useEffect(() => {
        setTestStart(true);
    }, [setTestStart]);

    useEffect(() => {
        if (qnaData?.recordings) {
            // console.log(qnaData?.recordings);
            setValue('recordings', qnaData.recordings);
        }
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

    const setRepeatCount = useCallback(
        (index: number) => (value: number) => {
            setValue(`recordings.${index}.repeatCount`, value);
        },
        [setValue],
    );

    // 엔터키 submit
    const handleKeyDown = useCallback<KeyboardEventHandler<HTMLInputElement>>(e => {
        if (e.key === 'Enter') {
            e.preventDefault();
        }
    }, []);

    return (
        <Container>
            <form onSubmit={handleSubmit(handleClickNext)} className={`${subtestStyles.subtestForm}`}>
                <input type='hidden' />
                <h1 className='whitespace-pre-line text-center font-jalnan text-head-1'>{partTitleEn}</h1>
                <h2 className='whitespace-pre-line text-center font-jalnan text-head-2'>{partTitle}</h2>

                {partId === PART_ID_START && (
                    <table className={`${subtestStyles.recordingTable}`}>
                        <thead data-title='MPT 측정'>
                            <tr>
                                <th>MPT 측정</th>
                                <th></th>
                                <th>녹음</th>
                                <th>재생</th>
                                <th>파형</th>
                                <th className='rounded-tr-base'>지속시간</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td rowSpan={3} className='rounded-bl-base text-center'>
                                    숨을 크게 들어 마신 뒤, 쉬지 말고 최대한 길게
                                    <br />
                                    편안하게 ‘아~’ 소리를 내보세요.
                                </td>
                                <td className={`${subtestStyles.button}`}>1차</td>
                                <td className={`${subtestStyles.button}`}>
                                    <RecordButton
                                        isRecording={isRecording1}
                                        handleStart={handleStartRecording1}
                                        handleStop={handleStopRecording1}
                                    />
                                </td>
                                <td className={`${subtestStyles.button}`}>
                                    <PlayButton
                                        isPlaying={isPlaying1}
                                        handlePlay={handlePlay1}
                                        handlePause={handlePause1}
                                        disabled={!audioUrl1}
                                    />
                                </td>
                                <td className='text-center'>
                                    <WaveformButton
                                        audioBlob={audioBlob1}
                                        audioUrl={audioUrl1}
                                        setRepeatCount={setRepeatCount(0)}
                                        placeholder='지속시간을 입력해주세요.'
                                    />
                                </td>
                                <td className={`${subtestStyles.repeatCount}`}>
                                    <input
                                        type='number'
                                        className='outline-none'
                                        autoComplete='off'
                                        onKeyDown={handleKeyDown}
                                        {...register(`recordings.0.repeatCount`)}
                                    />
                                    초
                                </td>
                            </tr>
                            <tr>
                                <td className={`${subtestStyles.button}`}>2차</td>
                                <td className={`${subtestStyles.button}`}>
                                    <RecordButton
                                        isRecording={isRecording2}
                                        handleStart={handleStartRecording2}
                                        handleStop={handleStopRecording2}
                                    />
                                </td>
                                <td className={`${subtestStyles.button}`}>
                                    <PlayButton
                                        isPlaying={isPlaying2}
                                        handlePlay={handlePlay2}
                                        handlePause={handlePause2}
                                        disabled={!audioUrl2}
                                    />
                                </td>
                                <td className='text-center'>
                                    <WaveformButton
                                        audioBlob={audioBlob2}
                                        audioUrl={audioUrl2}
                                        setRepeatCount={setRepeatCount(1)}
                                        placeholder='지속시간을 입력해주세요.'
                                    />
                                </td>
                                <td className={`${subtestStyles.repeatCount}`}>
                                    <input
                                        type='number'
                                        className='outline-none'
                                        autoComplete='off'
                                        onKeyDown={handleKeyDown}
                                        {...register(`recordings.1.repeatCount`)}
                                    />
                                    초
                                </td>
                            </tr>
                            <tr>
                                <td className={`${subtestStyles.button}`}>3차</td>
                                <td className={`${subtestStyles.button}`}>
                                    <RecordButton
                                        isRecording={isRecording3}
                                        handleStart={handleStartRecording3}
                                        handleStop={handleStopRecording3}
                                    />
                                </td>
                                <td className={`${subtestStyles.button}`}>
                                    <PlayButton
                                        isPlaying={isPlaying3}
                                        handlePlay={handlePlay3}
                                        handlePause={handlePause3}
                                        disabled={!audioUrl3}
                                    />
                                </td>
                                <td className='text-center'>
                                    <WaveformButton
                                        audioBlob={audioBlob3}
                                        audioUrl={audioUrl3}
                                        setRepeatCount={setRepeatCount(2)}
                                        placeholder='지속시간을 입력해주세요.'
                                    />
                                </td>
                                <td className={`${subtestStyles.repeatCount}`}>
                                    <input
                                        type='number'
                                        className='outline-none'
                                        autoComplete='off'
                                        onKeyDown={handleKeyDown}
                                        {...register(`recordings.2.repeatCount`)}
                                    />
                                    초
                                </td>
                            </tr>
                        </tbody>
                    </table>
                )}
                {split - start > 0 && (
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
                                    <th>{subtitle1}</th>
                                    <th>정상</th>
                                    <th>경도</th>
                                    <th>심도</th>
                                    <th>평가불가</th>
                                </tr>
                            </thead>
                            <tbody>
                                {fields.slice(0, split - start).map((item, i) => (
                                    <tr key={item.id}>
                                        <td className={subtestStyles.num}>{i + 1}</td>
                                        <td className={subtestStyles.text}>{item.questionText}</td>
                                        <td className={subtestStyles.option}>
                                            <input type='radio' {...register(`answers.${i}.answer`, { required: true })} value='normal' />
                                        </td>
                                        <td className={subtestStyles.option}>
                                            <input type='radio' {...register(`answers.${i}.answer`, { required: true })} value='mild' />
                                        </td>
                                        <td className={subtestStyles.option}>
                                            <input type='radio' {...register(`answers.${i}.answer`, { required: true })} value='moderate' />
                                        </td>
                                        <td className={subtestStyles.option}>
                                            <input type='radio' {...register(`answers.${i}.answer`, { required: true })} value='unknown' />
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
                    </>
                )}

                {end - split > 0 && (
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
                                {fields.slice(split - start).map((item, i) => (
                                    <tr key={item.id}>
                                        <td className={subtestStyles.num}>{split - start + i + 1}</td>
                                        <td className={subtestStyles.text}>{item.questionText}</td>
                                        <td className={subtestStyles.option}>
                                            <input
                                                type='radio'
                                                {...register(`answers.${split - start + i}.answer`, { required: true })}
                                                value='normal'
                                            />
                                        </td>
                                        <td className={subtestStyles.option}>
                                            <input
                                                type='radio'
                                                {...register(`answers.${split - start + i}.answer`, { required: true })}
                                                value='mild'
                                            />
                                        </td>
                                        <td className={subtestStyles.option}>
                                            <input
                                                type='radio'
                                                {...register(`answers.${split - start + i}.answer`, { required: true })}
                                                value='moderate'
                                            />
                                        </td>
                                        <td className={subtestStyles.option}>
                                            <input
                                                type='radio'
                                                {...register(`answers.${split - start + i}.answer`, { required: true })}
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

                    <button key='submit' type='submit' className='ml-5 mt-20 btn btn-large btn-contained' disabled={!isValid}>
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

        // 검사 시작할 때마다 진행률 불러오기
        const { totalCount, notNullCount } = await getAnswersCountAPI({ sessionId, jwt: accessToken });
        const progress = Math.ceil((notNullCount / totalCount) * 100);

        // 소검사 문항 정보 fetch
        const responseData = await getQuestionAndAnswerListAPI({ sessionId, subtestId: CURRENT_SUBTEST_ID, jwt: accessToken });
        const questionList = responseData.questions;
        const recordingList = responseData.recordings;

        return {
            props: {
                isLoggedIn: true,
                questionList,
                recordingList,
                progress,
                currentPartId,
            },
        };
    } catch (err) {
        console.error(err);

        return {
            redirect: {
                destination: '/das',
                permanent: true,
            },
        };
    }
};
