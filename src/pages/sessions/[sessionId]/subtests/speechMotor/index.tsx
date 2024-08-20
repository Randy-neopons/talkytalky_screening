import { useCallback, useMemo, useState, type ChangeEventHandler, type MouseEventHandler } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import ReactTextareaAutosize from 'react-textarea-autosize';
import type { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';

import { useCurrentSubTest, useSubtests, useTestActions } from '@/stores/testStore';
import CheckBox from '@/components/common/CheckBox';
import Container from '@/components/common/Container';
import useAudioRecorder from '@/hooks/useAudioRecorder';
import { getQuestionListAPI, updateSessionAPI } from '@/api/questions';

import subtestStyles from '../SubTests.module.css';

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
            <g clip-path='url(#clip0_13783_7609)'>
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
        <button type='button' className='mx-12' onClick={isRecording ? handleStop : handleStart}>
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
        <button type='button' className='mx-12' onClick={isPlaying ? handlePause : handlePlay} disabled={disabled}>
            {isPlaying ? <PauseIcon /> : <PlayIcon disabled={disabled} />}
        </button>
    );
};

// SPEECH II 문항 페이지
export default function SpeechMotorPage({
    questionList,
}: {
    questionList: { questionId: number; questionText: string; answerType: string; partId: number; subtestId: number }[];
}) {
    const router = useRouter();

    // 파타카 녹음
    const {
        isRecording: isRecording1,
        isPlaying: isPlaying1,
        audioUrl: audioUrl1,
        handleStartRecording: handleStartRecording1,
        handleStopRecording: handleStopRecording1,
        handlePlay: handlePlay1,
        handlePause: handlePause1,
    } = useAudioRecorder();
    const {
        isRecording: isRecording2,
        isPlaying: isPlaying2,
        audioUrl: audioUrl2,
        handleStartRecording: handleStartRecording2,
        handleStopRecording: handleStopRecording2,
        handlePlay: handlePlay2,
        handlePause: handlePause2,
    } = useAudioRecorder();
    const {
        isRecording: isRecording3,
        isPlaying: isPlaying3,
        audioUrl: audioUrl3,
        handleStartRecording: handleStartRecording3,
        handleStopRecording: handleStopRecording3,
        handlePlay: handlePlay3,
        handlePause: handlePause3,
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
            <h2 className='flex items-center font-jalnan text-accent1 text-head-2'>SPEECH Motor : 말운동평가</h2>
            <form onSubmit={handleSubmit(handleOnSubmit)} className='flex w-full flex-col flex-nowrap items-center px-5 xl:px-0'>
                <h1 className='whitespace-pre-line text-center font-jalnan text-head-1'>{partTitle}</h1>

                {currentPartId === 1 ? (
                    <table className={`${subtestStyles['table']}`}>
                        <thead className={`${subtestStyles['table-head']}`}>
                            <tr className='bg-accent1 text-white text-body-2'>
                                <th className='rounded-tl-base'>SMR 측정 (5초)</th>
                                <th></th>
                                <th>녹음</th>
                                <th>재생</th>
                                <th className='rounded-tr-base'>반복횟수</th>
                            </tr>
                        </thead>
                        <tbody className={`${subtestStyles['table-body']}`}>
                            <tr>
                                <td rowSpan={3}>
                                    숨을 크게 들어 마신 뒤, &apos;파&apos; 를 가능한 빨리 규칙적으로 반복해서 말해보세요. (&apos;타&apos; 와
                                    &apos;카&apos; 도 동일하게 시행)
                                </td>
                                <td>파</td>
                                <td>
                                    <RecordButton
                                        isRecording={isRecording1}
                                        handleStart={handleStartRecording1}
                                        handleStop={handleStopRecording1}
                                    />
                                </td>
                                <td>
                                    <PlayButton
                                        isPlaying={isPlaying1}
                                        handlePlay={handlePlay1}
                                        handlePause={handlePause1}
                                        disabled={!audioUrl1}
                                    />
                                </td>
                                <td>
                                    <input className='outline-none' />
                                </td>
                            </tr>
                            <tr>
                                <td>타</td>
                                <td>
                                    <RecordButton
                                        isRecording={isRecording2}
                                        handleStart={handleStartRecording2}
                                        handleStop={handleStopRecording2}
                                    />
                                </td>
                                <td>
                                    <PlayButton
                                        isPlaying={isPlaying2}
                                        handlePlay={handlePlay2}
                                        handlePause={handlePause2}
                                        disabled={!audioUrl2}
                                    />
                                </td>
                                <td>
                                    <input className='outline-none' />
                                </td>
                            </tr>
                            <tr>
                                <td>카</td>
                                <td>
                                    <RecordButton
                                        isRecording={isRecording3}
                                        handleStart={handleStartRecording3}
                                        handleStop={handleStopRecording3}
                                    />
                                </td>
                                <td>
                                    <PlayButton
                                        isPlaying={isPlaying3}
                                        handlePlay={handlePlay3}
                                        handlePause={handlePause3}
                                        disabled={!audioUrl3}
                                    />
                                </td>
                                <td>
                                    <input className='outline-none' />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                ) : (
                    <table className={`${subtestStyles['table']}`}>
                        <thead className={`${subtestStyles['table-head']}`}>
                            <tr className='bg-accent1 text-white text-body-2'>
                                <th className='rounded-tl-base'>AMR 측정 (5초)</th>
                                <th></th>
                                <th>녹음</th>
                                <th>재생</th>
                                <th className='rounded-tr-base'>반복횟수</th>
                            </tr>
                        </thead>
                        <tbody className={`${subtestStyles['table-body']}`}>
                            <tr>
                                <td>&apos;퍼-터-커&apos;를 가능한 한 빨리, 규칙적으로 반복해서 말해보세요.</td>
                                <td>퍼터커</td>
                                <td>
                                    <RecordIcon />
                                </td>
                                <td>
                                    <PlayIcon />
                                </td>
                                <td>
                                    <input />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                )}

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
