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
import { MemoIcon, MikeIcon, PauseIcon, PlayIcon, StopIcon } from '@/components/icons';
import { useConductedSubtestsQuery, useQuestionsAndAnswersQuery } from '@/hooks/das';
import useAudioRecorder from '@/hooks/useAudioRecorder';
import { getAnswersCountAPI, getQuestionAndAnswerListAPI, updateSessionAPI } from '@/api/das';

import subtestStyles from '../SubTests.module.css';

import type { Answer, QuestionAnswer, Recording } from '@/types/das';

// 소검사 ID
const CURRENT_SUBTEST_ID = 3;
const PART_ID_START = 11;

// 소검사 내 파트별 문항 index 정보
// TODO: part title도 DB에서 가져오기
const partIndexList = [
    { start: 0, end: 6, subtitle: '호흡 & 음성', partTitle: '호흡 / 음성', partTitleEn: 'Respiration / Phonation', partId: 11 },
    { start: 6, end: 8, subtitle: '공명', partTitle: '공명', partTitleEn: 'Resonance', partId: 12 },
    { start: 8, end: 11, subtitle: '조음', partTitle: '조음', partTitleEn: 'Articulation', partId: 13 },
    { start: 11, end: 18, subtitle: '운율', partTitle: '운율', partTitleEn: 'Prosody', partId: 14 },
];

// SPEECH II 문항 페이지
export default function SpeechTwoQuestionsPage({
    questionList,
    recordingList,
    currentPartId,
}: {
    questionList: QuestionAnswer[];
    recordingList: Recording[];
    currentPartId: number | null;
}) {
    const router = useRouter();

    // 현재 소검사, 선택한 소검사 정보
    const { data: subtestsData } = useConductedSubtestsQuery({ sessionId: Number(router.query.sessionId), jwt: getCookie('jwt') || '' });
    const testTime = useTestTime();

    // 문항 전부 정상으로 체크
    const [checkAll, setCheckAll] = useState(false);

    // 소검사 내 현재 파트 정보
    const [partId, setPartId] = useState(currentPartId || PART_ID_START);
    const { start, end, subtitle, partTitle, partTitleEn } = useMemo(
        () => partIndexList.find(v => v.partId === partId) || partIndexList[0],
        [partId],
    );

    // react-hook-form
    const { control, register, setValue, handleSubmit } = useForm<{
        answers: Answer[];
    }>();
    const { fields } = useFieldArray({ name: 'answers', control });

    const { data: qnaData } = useQuestionsAndAnswersQuery({
        sessionId: Number(router.query.sessionId),
        subtestId: CURRENT_SUBTEST_ID,
        start,
        end: end - 1,
        jwt: getCookie('jwt') || '',
    });

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

    // 문단,그림,대화 녹음
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

    // 모두 정상 체크
    const handleChangeCheckAll = useCallback<ChangeEventHandler<HTMLInputElement>>(
        e => {
            if (e.target.checked === true) {
                Array.from({ length: end - start }, (v, i) => i).map(v => {
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
        partId > PART_ID_START && setPartId(partId => partId - 1);
        typeof window !== 'undefined' && window.scrollTo(0, 0);
    }, [partId]);

    // 폼 데이터 제출
    const handleSubmitData = useCallback(
        async ({ sessionId, data }: { sessionId: number; data: any }) => {
            try {
                const formData = new FormData();
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
        [partId, testTime],
    );

    // 폼 제출
    const handleClickNext = useCallback(
        async (data: any) => {
            try {
                const sessionId = Number(router.query.sessionId);
                await handleSubmitData({ sessionId, data });

                if (partId < partIndexList[partIndexList.length - 1].partId) {
                    // 검사할 파트가 남았으면 계속 진행
                    setCheckAll(false);
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
            } catch (err) {
                console.error(err);
            }
        },
        [handleSubmitData, partId, router, subtestsData?.subtests],
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
            } catch (err) {
                console.error(err);
            }
        },
        [handleSubmitData, router, subtestsData],
    );

    return (
        <Container>
            <h2 className='flex items-center font-noto font-bold text-accent1 text-head-2'>SPEECH II : 종합적 말평가</h2>
            <form onSubmit={handleSubmit(handleClickNext)} className={`${subtestStyles['subtest-form']}`}>
                <h1 className='whitespace-pre-line text-center font-jalnan text-head-1'>{partTitleEn}</h1>
                <h2 className='whitespace-pre-line text-center font-jalnan text-head-2'>{partTitle}</h2>

                <ul className='mt-20 flex flex-row flex-nowrap gap-5'>
                    <li className='h-40 w-80 overflow-hidden rounded-base bg-white shadow-base'>
                        <div className='flex h-12 w-full items-center justify-center bg-accent3'>
                            <span className='font-bold text-neutral3 text-body-2'>문단읽기</span>
                        </div>
                        <div className='flex w-full justify-center gap-5 py-[35px]'>
                            {/* <button
                                type='button'
                                className='flex h-10 w-10 items-center justify-center rounded-full bg-accent1'
                                onClick={handlePause1}
                            >
                                <MemoIcon width={24} height={24} />
                            </button> */}
                            <button
                                type='button'
                                className='flex h-10 w-10 items-center justify-center rounded-full bg-accent1'
                                onClick={isPlaying1 ? handlePause1 : handlePlay1}
                            >
                                {isPlaying1 ? <PauseIcon width={36} height={36} /> : <PlayIcon width={36} height={36} />}
                            </button>
                        </div>
                    </li>
                    <li className='h-40 w-80 overflow-hidden rounded-base bg-white shadow-base'>
                        <div className='flex h-12 w-full items-center justify-center bg-accent3'>
                            <span className='font-bold text-neutral3 text-body-2'>그림 설명하기</span>
                        </div>
                        <div className='flex w-full justify-center gap-5 py-[35px]'>
                            {/* <button
                                type='button'
                                className='flex h-10 w-10 items-center justify-center rounded-full bg-accent1'
                                onClick={handlePause2}
                            >
                                <MemoIcon width={24} height={24} />
                            </button> */}
                            <button
                                type='button'
                                className='flex h-10 w-10 items-center justify-center rounded-full bg-accent1'
                                onClick={isPlaying2 ? handlePause2 : handlePlay2}
                            >
                                {isPlaying2 ? <PauseIcon width={36} height={36} /> : <PlayIcon width={36} height={36} />}
                            </button>
                        </div>
                    </li>
                    <li className='h-40 w-80 overflow-hidden rounded-base bg-white shadow-base'>
                        <div className='flex h-12 w-full items-center justify-center bg-accent3'>
                            <span className='font-bold text-neutral3 text-body-2'>대화하기</span>
                        </div>
                        <div className='flex w-full justify-center gap-5 py-[35px]'>
                            {/* <button
                                type='button'
                                className='flex h-10 w-10 items-center justify-center rounded-full bg-accent1'
                                onClick={handlePause3}
                            >
                                <MemoIcon width={24} height={24} />
                            </button> */}
                            <button
                                type='button'
                                className='flex h-10 w-10 items-center justify-center rounded-full bg-accent1'
                                onClick={isPlaying3 ? handlePause3 : handlePlay3}
                            >
                                {isPlaying3 ? <PauseIcon width={36} height={36} /> : <PlayIcon width={36} height={36} />}
                            </button>
                        </div>
                    </li>
                </ul>

                <table className={`${subtestStyles['question-table']}`}>
                    <thead data-title={subtitle}>
                        <tr>
                            <th></th>
                            <th>{subtitle}</th>
                            <th>정상</th>
                            <th>경도</th>
                            <th>심도</th>
                            <th>평가불가</th>
                            <th className='rounded-tr-base'>메모</th>
                        </tr>
                    </thead>
                    <tbody>
                        {fields.map((item, i) => (
                            <tr key={item.id}>
                                <td className={`${subtestStyles['num']}`}>{i + 1}</td>
                                <td className={`${subtestStyles['text']}`}>{item.questionText}</td>
                                <td className={`${subtestStyles['option']}`}>
                                    <input type='radio' {...register(`answers.${i}.answer`)} value='normal' />
                                </td>
                                <td className={`${subtestStyles['option']}`}>
                                    <input type='radio' {...register(`answers.${i}.answer`)} value='mild' />
                                </td>
                                <td className={`${subtestStyles['option']}`}>
                                    <input type='radio' {...register(`answers.${i}.answer`)} value='moderate' />
                                </td>
                                <td className={`${subtestStyles['option']}`}>
                                    <input type='radio' {...register(`answers.${i}.answer`)} value='unknown' />
                                </td>
                                <td className={`${subtestStyles['comment']}`}>
                                    <Controller
                                        control={control}
                                        name={`answers.${i}.comment`}
                                        render={({ field }) => (
                                            <ReactTextareaAutosize
                                                className={`${subtestStyles['textarea-no-border']}`}
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
                    {partId > PART_ID_START && (
                        <button type='button' className='mt-20 btn btn-large btn-outlined' onClick={handleClickPrev}>
                            이전
                        </button>
                    )}

                    <button key='submit' type='submit' className='ml-5 mt-20 btn btn-large btn-contained'>
                        다음 검사
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
