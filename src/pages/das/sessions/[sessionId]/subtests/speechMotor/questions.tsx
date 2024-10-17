import { useCallback, useEffect, useMemo, useState, type ChangeEventHandler, type MouseEventHandler } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import ReactTextareaAutosize from 'react-textarea-autosize';
import type { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';

import { isAxiosError } from 'axios';
import { deleteCookie, getCookie } from 'cookies-next';

import { useCurrentSubTest } from '@/stores/testStore';
import { useTestTime, useTimerActions } from '@/stores/timerStore';
import { TALKYTALKY_URL } from '@/utils/const';
import CheckBox from '@/components/common/CheckBox';
import Container from '@/components/common/Container';
import { WaveformButton } from '@/components/das/WaveformButton';
import { useConductedSubtestsQuery, useQuestionsAndAnswersQuery } from '@/hooks/das';
import useAudioRecorder from '@/hooks/useAudioRecorder';
import { getAnswersCountAPI, getQuestionAndAnswerListAPI, updateSessionAPI } from '@/api/das';

import subtestStyles from '../SubTests.module.css';

import type { Answer, QuestionAnswer, Recording } from '@/types/das';

// 소검사 ID
const CURRENT_SUBTEST_ID = 4;
const PART_ID_START = 15;

// 소검사 내 파트별 문항 index 정보
// TODO: part title도 DB에서 가져오기
const partIndexList = [
    { start: 0, end: 10, subtitle: '휴식 시', partTitle: 'AMR', partTitleKo: '교대운동속도', partId: 15 },
    { start: 10, end: 20, subtitle: '휴식 시', partTitle: 'SMR', partTitleKo: '일련운동속도', partId: 16 },
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

// SPEECH II 문항 페이지
export default function SpeechMotorQuestionsPage({
    questionList,
    recordingList,
    currentPartId,
}: {
    questionList: QuestionAnswer[];
    recordingList: Recording[];
    currentPartId: number | null;
}) {
    const router = useRouter();

    // 파타카 녹음
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
    const {
        isRecording: isRecording4,
        isPlaying: isPlaying4,
        audioUrl: audioUrl4,
        audioBlob: audioBlob4,
        handleStartRecording: handleStartRecording4,
        handleStopRecording: handleStopRecording4,
        handlePlay: handlePlay4,
        handlePause: handlePause4,
    } = useAudioRecorder(recordingList[3]?.filePath);

    // 현재 소검사, 선택한 소검사 정보
    const { data: subtestsData } = useConductedSubtestsQuery({ sessionId: Number(router.query.sessionId), jwt: getCookie('jwt') || '' });
    const testTime = useTestTime();
    const { setTestStart } = useTimerActions();
    const currentSubtest = useCurrentSubTest();

    // 문항 전부 정상으로 체크
    const [checkAll, setCheckAll] = useState(false);

    // 소검사 내 현재 파트 정보
    const [partId, setPartId] = useState(currentPartId || PART_ID_START);
    const { start, end, subtitle, partTitle, partTitleKo } = useMemo(
        () => partIndexList.find(v => v.partId === partId) || partIndexList[0],
        [partId],
    );

    // react-hook-form
    const { control, register, setValue, handleSubmit, getValues } = useForm<{
        recordings: Recording[];
        answers: Answer[];
    }>();

    const { data: qnaData } = useQuestionsAndAnswersQuery({
        sessionId: Number(router.query.sessionId),
        subtestId: CURRENT_SUBTEST_ID,
        start,
        end: end - 1,
        jwt: getCookie('jwt') || '',
    });

    useEffect(() => {
        if (qnaData?.recordings) {
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

    // 폼 데이터 제출
    const handleSubmitData = useCallback(
        async ({ sessionId, data }: { sessionId: number; data: any }) => {
            try {
                const formData = new FormData();
                formData.append('audio1', audioBlob1 || 'null');
                formData.append('audio2', audioBlob2 || 'null');
                formData.append('audio3', audioBlob3 || 'null');
                formData.append('audio4', audioBlob4 || 'null');
                formData.append('recordings', JSON.stringify(data.recordings));

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
        [audioBlob1, audioBlob2, audioBlob3, audioBlob4, partId, testTime],
    );

    // 이전 파트로
    const handleClickPrev = useCallback(async () => {
        try {
            const data = getValues();
            const sessionId = Number(router.query.sessionId);
            await handleSubmitData({ sessionId, data });

            setCheckAll(false);

            if (partId > PART_ID_START) {
                setPartId(partId => partId - 1);
                typeof window !== 'undefined' && window.scrollTo(0, 0);
            } else {
                router.push(`/das/sessions/${sessionId}/subtests/speechMotor`);
            }
        } catch (err) {
            console.error(err);
        }
    }, [getValues, handleSubmitData, partId, router]);

    // 폼 제출 후 redirect
    const handleClickNext = useCallback(
        async (data: any) => {
            try {
                const sessionId = Number(router.query.sessionId);
                await handleSubmitData({ sessionId, data });

                if (partId < partIndexList[partIndexList.length - 1].partId) {
                    setPartId(partId => partId + 1);
                    typeof window !== 'undefined' && window.scrollTo(0, 0); // 스크롤 초기화
                } else {
                    const subtests = subtestsData?.subtests;
                    if (!subtests) {
                        throw new Error('수행할 소검사가 없습니다');
                    }
                    const currentSubtestIndex = subtests.findIndex(v => v.subtestId === CURRENT_SUBTEST_ID);
                    const nextSubtestItem = subtests[currentSubtestIndex + 1];
                    if (nextSubtestItem) {
                        if (nextSubtestItem.subtestId === 5) {
                            router.push(`/das/sessions/${sessionId}/subtests/${nextSubtestItem.pathname}/questions`);
                        } else {
                            router.push(`/das/sessions/${sessionId}/subtests/${nextSubtestItem.pathname}`);
                        }
                    } else {
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
        setTestStart(true);
    }, [setTestStart]);

    // 녹음 파일 로컬 주소 form 세팅
    useEffect(() => {
        console.log(audioUrl1);
        audioUrl1 && setValue(`recordings.0.filePath`, audioUrl1);
    }, [audioUrl1, setValue]);

    useEffect(() => {
        console.log(audioUrl2);
        audioUrl2 && setValue(`recordings.1.filePath`, audioUrl2);
    }, [audioUrl2, setValue]);

    useEffect(() => {
        console.log(audioUrl3);
        audioUrl3 && setValue(`recordings.2.filePath`, audioUrl3);
    }, [audioUrl3, setValue]);

    useEffect(() => {
        console.log(audioUrl4);
        audioUrl4 && setValue(`recordings.3.filePath`, audioUrl4);
    }, [audioUrl4, setValue]);

    return (
        <Container>
            <form onSubmit={handleSubmit(handleClickNext)} className={`${subtestStyles['subtest-form']}`}>
                <h2 className='whitespace-pre-line text-center font-jalnan text-head-2'>{partTitle}</h2>
                <h3 className='whitespace-pre-line text-center font-jalnan text-head-3'>{partTitleKo}</h3>

                {partId === PART_ID_START ? (
                    <table className={`${subtestStyles['recording-table']}`}>
                        <thead data-title='AMR 측정' data-caption='*반복횟수란 1초당 각 음절을 반복한 횟수를 의미함'>
                            <tr>
                                <th>AMR 측정 (5초)</th>
                                <th></th>
                                <th>녹음</th>
                                <th>재생</th>
                                <th>파형</th>
                                <th className='rounded-tr-base'>반복횟수</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td rowSpan={3} className='rounded-bl-base text-center'>
                                    숨을 크게 들어 마신 뒤, &apos;파&apos; 를 가능한 빨리
                                    <br /> 규칙적으로 반복해서 말해보세요. <br />
                                    (&apos;타&apos; 와 &apos;카&apos; 도 동일하게 시행)
                                </td>
                                <td className={`${subtestStyles['button']}`}>파</td>
                                <td className={`${subtestStyles['button']}`}>
                                    <RecordButton
                                        isRecording={isRecording1}
                                        handleStart={handleStartRecording1}
                                        handleStop={handleStopRecording1}
                                    />
                                </td>
                                <td className={`${subtestStyles['button']}`}>
                                    <PlayButton
                                        isPlaying={isPlaying1}
                                        handlePlay={handlePlay1}
                                        handlePause={handlePause1}
                                        disabled={!audioUrl1}
                                    />
                                </td>
                                <td className='text-center'>
                                    <WaveformButton audioBlob={audioBlob1} audioUrl={audioUrl1} />
                                </td>
                                <td className={`${subtestStyles['repeat-count']}`}>
                                    <input className='outline-none' {...register(`recordings.0.repeatCount`)} />
                                </td>
                            </tr>
                            <tr className={`${subtestStyles['repeat-count']}`}>
                                <td className={`${subtestStyles['button']}`}>타</td>
                                <td className={`${subtestStyles['button']}`}>
                                    <RecordButton
                                        isRecording={isRecording2}
                                        handleStart={handleStartRecording2}
                                        handleStop={handleStopRecording2}
                                    />
                                </td>
                                <td className={`${subtestStyles['button']}`}>
                                    <PlayButton
                                        isPlaying={isPlaying2}
                                        handlePlay={handlePlay2}
                                        handlePause={handlePause2}
                                        disabled={!audioUrl2}
                                    />
                                </td>
                                <td className='text-center'>
                                    <WaveformButton audioBlob={audioBlob2} audioUrl={audioUrl2} />
                                </td>
                                <td className={`${subtestStyles['repeat-count']}`}>
                                    <input className='outline-none' {...register(`recordings.1.repeatCount`)} />
                                </td>
                            </tr>
                            <tr>
                                <td className={`${subtestStyles['button']}`}>카</td>
                                <td className={`${subtestStyles['button']}`}>
                                    <RecordButton
                                        isRecording={isRecording3}
                                        handleStart={handleStartRecording3}
                                        handleStop={handleStopRecording3}
                                    />
                                </td>
                                <td className={`${subtestStyles['button']}`}>
                                    <PlayButton
                                        isPlaying={isPlaying3}
                                        handlePlay={handlePlay3}
                                        handlePause={handlePause3}
                                        disabled={!audioUrl3}
                                    />
                                </td>
                                <td className='text-center'>
                                    <WaveformButton audioBlob={audioBlob3} audioUrl={audioUrl3} />
                                </td>
                                <td className={`${subtestStyles['repeat-count']}`}>
                                    <input className='outline-none' {...register(`recordings.2.repeatCount`)} />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                ) : (
                    <table className={`${subtestStyles['recording-table']}`}>
                        <thead
                            data-title='SMR 측정'
                            data-caption={`*반복횟수란 1초당 각 음절을 반복한 횟수를 의미함('파타카'모두를 반복한 횟수가 아님)`}
                        >
                            <tr>
                                <th>SMR 측정 (5초)</th>
                                <th></th>
                                <th>녹음</th>
                                <th>재생</th>
                                <th>파형</th>
                                <th className='rounded-tr-base'>반복횟수</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td align='center' className='rounded-bl-base'>
                                    &apos;파-타-카&apos;를 가능한 한 빨리, 규칙적으로 <br />
                                    반복해서 말해보세요.
                                </td>
                                <td className={`${subtestStyles['button']}`}>파타카</td>
                                <td className={`${subtestStyles['button']}`}>
                                    <RecordButton
                                        isRecording={isRecording4}
                                        handleStart={handleStartRecording4}
                                        handleStop={handleStopRecording4}
                                    />
                                </td>
                                <td className={`${subtestStyles['button']}`}>
                                    <PlayButton
                                        isPlaying={isPlaying4}
                                        handlePlay={handlePlay4}
                                        handlePause={handlePause4}
                                        disabled={!audioUrl4}
                                    />
                                </td>
                                <td className='text-center'>
                                    <WaveformButton audioBlob={audioBlob4} audioUrl={audioUrl4} />
                                </td>
                                <td className={`${subtestStyles['repeat-count']}`}>
                                    <input className='w-full outline-none' {...register(`recordings.3.repeatCount`)} />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                )}

                <div>
                    <button type='button' className='mt-20 btn btn-large btn-outlined' onClick={handleClickPrev}>
                        이전
                    </button>

                    <button key='submit' type='submit' className='ml-5 mt-20 btn btn-large btn-contained'>
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
        return {
            redirect: {
                destination: '/das',
                permanent: true,
            },
        };
    }
};
