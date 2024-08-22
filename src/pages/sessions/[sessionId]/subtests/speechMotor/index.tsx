import { useCallback, useEffect, useMemo, useState, type ChangeEventHandler, type MouseEventHandler } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import ReactTextareaAutosize from 'react-textarea-autosize';
import type { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';

import { useCurrentSubTest, useSubtests, useTestActions } from '@/stores/testStore';
import CheckBox from '@/components/common/CheckBox';
import Container from '@/components/common/Container';
import useAudioRecorder from '@/hooks/useAudioRecorder';
import { getQuestionAndAnswerListAPI, updateSessionAPI } from '@/api/questions';

import subtestStyles from '../SubTests.module.css';

import type { Answer, QuestionAnswer, Recording } from '@/types/types';

// 소검사 ID
const CURRENT_SUBTEST_ID = 4;

// 소검사 내 파트별 문항 index 정보
// TODO: part title도 DB에서 가져오기
const partIndexList = [
    { start: 0, end: 10, subtitle: '휴식 시', partTitle: 'AMR' },
    { start: 10, end: 20, subtitle: '휴식 시', partTitle: 'SMR' },
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
        <button type='button' onClick={isRecording ? handleStop : handleStart}>
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
        <button type='button' onClick={isPlaying ? handlePause : handlePlay} disabled={disabled}>
            {isPlaying ? <PauseIcon /> : <PlayIcon disabled={disabled} />}
        </button>
    );
};

// SPEECH II 문항 페이지
export default function SpeechMotorPage({ questionList }: { questionList: QuestionAnswer[]; recordingList: Recording[] }) {
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
    } = useAudioRecorder();
    const {
        isRecording: isRecording2,
        isPlaying: isPlaying2,
        audioUrl: audioUrl2,
        audioBlob: audioBlob2,
        handleStartRecording: handleStartRecording2,
        handleStopRecording: handleStopRecording2,
        handlePlay: handlePlay2,
        handlePause: handlePause2,
    } = useAudioRecorder();
    const {
        isRecording: isRecording3,
        isPlaying: isPlaying3,
        audioUrl: audioUrl3,
        audioBlob: audioBlob3,
        handleStartRecording: handleStartRecording3,
        handleStopRecording: handleStopRecording3,
        handlePlay: handlePlay3,
        handlePause: handlePause3,
    } = useAudioRecorder();
    const {
        isRecording: isRecording4,
        isPlaying: isPlaying4,
        audioUrl: audioUrl4,
        audioBlob: audioBlob4,
        handleStartRecording: handleStartRecording4,
        handleStopRecording: handleStopRecording4,
        handlePlay: handlePlay4,
        handlePause: handlePause4,
    } = useAudioRecorder();

    // 현재 소검사, 선택한 소검사 정보
    const currentSubtest = useCurrentSubTest();
    const subtests = useSubtests();
    const { setCurrentSubtest } = useTestActions();

    // 문항 전부 정상으로 체크
    const [checkAll, setCheckAll] = useState(false);

    // 소검사 내 현재 파트 정보
    const [currentPartId, setCurrentPartId] = useState(1);
    const { start, end, subtitle, partTitle } = useMemo(() => partIndexList[currentPartId - 1], [currentPartId]);

    // react-hook-form
    const { control, register, setValue, handleSubmit } = useForm<{
        recordings: Recording[];
        answers: Answer[];
    }>({
        defaultValues: {
            recordings: [
                { filePath: null, repeatCount: null },
                { filePath: null, repeatCount: null },
                { filePath: null, repeatCount: null },
                { filePath: null, repeatCount: null },
            ],
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

    // 폼 데이터 제출
    const handleSubmitData = useCallback(
        async ({ sessionId, data }: { sessionId: number; data: any }) => {
            const formData = new FormData();
            formData.append('audio', audioBlob1 || 'null');
            formData.append('audio', audioBlob2 || 'null');
            formData.append('audio', audioBlob3 || 'null');
            formData.append('audio', audioBlob4 || 'null');
            formData.append('recordings', JSON.stringify(data.recordings));

            formData.append('currentPartId', `${currentPartId}`);
            formData.append('answers', JSON.stringify(data.answers));

            await updateSessionAPI({ sessionId, formData });
        },
        [audioBlob1, audioBlob2, audioBlob3, audioBlob4, currentPartId],
    );

    // 폼 제출 후 redirect
    const handleOnSubmit = useCallback(
        async (data: any) => {
            try {
                const sessionId = Number(router.query.sessionId);
                await handleSubmitData({ sessionId, data });

                const currentSubtestIndex = subtests.findIndex(v => v.subtestId === `${CURRENT_SUBTEST_ID}`);
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
        [handleSubmitData, router, subtests],
    );

    // 녹음 파일 로컬 주소 form 세팅
    useEffect(() => {
        audioUrl1 && setValue(`recordings.0.filePath`, audioUrl1);
    }, [audioUrl1, setValue]);

    useEffect(() => {
        audioUrl2 && setValue(`recordings.1.filePath`, audioUrl2);
    }, [audioUrl2, setValue]);

    useEffect(() => {
        audioUrl3 && setValue(`recordings.2.filePath`, audioUrl3);
    }, [audioUrl3, setValue]);

    useEffect(() => {
        audioUrl4 && setValue(`recordings.3.filePath`, audioUrl4);
    }, [audioUrl4, setValue]);

    return (
        <Container>
            <h2 className='flex items-center font-jalnan text-accent1 text-head-2'>SPEECH Motor : 말운동평가</h2>
            <form onSubmit={handleSubmit(handleOnSubmit)} className={`${subtestStyles['subtest-form']}`}>
                <h1 className='whitespace-pre-line text-center font-jalnan text-head-1'>{partTitle}</h1>

                {currentPartId === 1 ? (
                    <table className={`${subtestStyles['recording-table']}`}>
                        <thead>
                            <tr className='bg-accent1 text-white text-body-2'>
                                <th className='rounded-tl-base'>SMR 측정 (5초)</th>
                                <th></th>
                                <th>녹음</th>
                                <th>재생</th>
                                <th className='rounded-tr-base'>반복횟수</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td rowSpan={3}>
                                    숨을 크게 들어 마신 뒤, &apos;파&apos; 를 가능한 빨리 규칙적으로 반복해서 말해보세요. (&apos;타&apos; 와
                                    &apos;카&apos; 도 동일하게 시행)
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
                                <td>
                                    <input className='outline-none' {...register(`recordings.0.repeatCount`)} />
                                </td>
                            </tr>
                            <tr>
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
                                <td>
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
                                <td>
                                    <input className='outline-none' {...register(`recordings.2.repeatCount`)} />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                ) : (
                    <table className={`${subtestStyles['recording-table']}`}>
                        <thead>
                            <tr className='bg-accent1 text-white text-body-2'>
                                <th className='rounded-tl-base'>AMR 측정 (5초)</th>
                                <th></th>
                                <th>녹음</th>
                                <th>재생</th>
                                <th className='rounded-tr-base'>반복횟수</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td align='center'>
                                    &apos;퍼-터-커&apos;를 가능한 한 빨리, 규칙적으로 <br />
                                    반복해서 말해보세요.
                                </td>
                                <td className={`${subtestStyles['button']}`}>퍼터커</td>
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
                                <td className={`${subtestStyles['button']}`}>
                                    <input className='w-full outline-none' {...register(`recordings.3.repeatCount`)} />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                )}

                <table className={`${subtestStyles['question-table']}`}>
                    <thead>
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
                    <tbody>
                        {fields.slice(start, end).map((item, i) => (
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
        const responseData = await getQuestionAndAnswerListAPI({ sessionId, subtestId: CURRENT_SUBTEST_ID });
        const questionList = responseData.questions;
        const recordingList = responseData.recordings;

        return {
            props: {
                testSession,
                questionList,
                recordingList,
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
