import { useCallback, useEffect, useState, type ReactElement } from 'react';
import type { GetServerSideProps } from 'next';
import Image from 'next/image';
import { useRouter } from 'next/router';

import { useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';

import { useTestTime, useTimerActions } from '@/stores/timerStore';
import { AudioButton } from '@/components/common/Buttons';
import Container from '@/components/common/Container';
import { VolumeIcon } from '@/components/common/icons';
import ScreeningAppLayout from '@/components/screening/ScreeningAppLayout';
import { screeningTestSessionQueryKey, useScreeningRecordingQuery } from '@/hooks/screening';
import useAudioRecorder from '@/hooks/useAudioRecorder';
import { completeScreeningSessionAPI, getScreeningTestSessionAPI, getWordAndRecordingListAPI, uploadRecordingAPI } from '@/api/screening';

import type { Word } from '@/types/screening';
import type { NextPageWithLayout } from '@/types/types';

// 간이언어평가 녹음 페이지
const ScreeningRecordingPage: NextPageWithLayout<{
    age: number;
    ageGroup: string;
    wordList: Word[];
    wordNo: number;
}> = ({ age, ageGroup, wordList, wordNo }) => {
    const router = useRouter(); // next router
    const queryClient = useQueryClient();

    const testTime = useTestTime();

    const [currentWordNo, setCurrentWordNo] = useState(wordNo || 0); //  0부터 시작

    const {
        audioBlob,
        audioUrl,
        volume,
        isPlaying,
        isRecording,
        setAudioUrl,
        setAudioBlob,
        handlePause,
        handlePlay,
        handleStartRecording,
        handleStopRecording,
    } = useAudioRecorder(wordList[currentWordNo].filePath);

    const { setAudioUrl: setTtsUrl, handlePlay: handlePlayTts } = useAudioRecorder(wordList[currentWordNo].audioSrc);

    const { data: recordingData } = useScreeningRecordingQuery({
        sessionId: Number(router.query.sessionId),
        wordId: wordList[currentWordNo].wordId,
    });

    const { setTestStart } = useTimerActions();

    // 이전 파트로
    const handleClickPrev = useCallback(() => {
        if (currentWordNo > 0) {
            setCurrentWordNo(prev => prev - 1);
            setAudioBlob(null);
        }
        typeof window !== 'undefined' && window.scrollTo(0, 0); // 스크롤 초기화
    }, [currentWordNo, setAudioBlob]);

    useEffect(() => {
        setTtsUrl(wordList[currentWordNo].audioSrc);
    }, [currentWordNo, setTtsUrl, wordList]);

    useEffect(() => {
        setAudioUrl(recordingData?.filePath);
    }, [recordingData?.filePath, setAudioUrl]);

    // 다음 파트로
    const handleClickNext = useCallback(async () => {
        try {
            const sessionId = Number(router.query.sessionId);
            const ageGroup = String(router.query.ageGroup);
            const wordId = wordList[currentWordNo].wordId;
            const wordText = wordList[currentWordNo].wordText;
            const currentPathname = `/screening/sessions/${sessionId}/recording?wordNo=${currentWordNo}`;

            if (audioBlob) {
                const formData = new FormData();
                formData.append('wordId', wordId.toString());
                formData.append('wordText', wordText);
                formData.append('age', age.toString());
                formData.append('audio', audioBlob);
                formData.append('currentPathname', currentPathname);
                formData.append('currentTime', testTime.toString());

                await uploadRecordingAPI({ sessionId, formData });

                queryClient.refetchQueries({ queryKey: [screeningTestSessionQueryKey, sessionId] });
            }

            if (currentWordNo < wordList.length - 1) {
                setCurrentWordNo(prev => prev + 1);
                setAudioBlob(null);
            } else {
                // 세션 완료
                await completeScreeningSessionAPI({ sessionId });
                // 분석중 페이지로 이동
                router.push(`/screening/sessions/${sessionId}/loading`);
            }
            typeof window !== 'undefined' && window.scrollTo(0, 0); // 스크롤 초기화
        } catch (err) {
            console.error(err);
        }
    }, [age, audioBlob, currentWordNo, queryClient, router, setAudioBlob, testTime, wordList]);

    useEffect(() => {
        setTestStart && setTestStart(true);
    }, [setTestStart]);

    return (
        <Container>
            <h1 className='mb-15 font-jalnan text-head-1 xl:mb-20'>이름맞히기</h1>
            <div className='relative mb-[50px] flex w-full justify-center overflow-hidden rounded-[15px] bg-white py-2 shadow-base xl:py-[22px]'>
                <div className='relative h-[200px] w-full sm:h-[400px]'>
                    {wordList[currentWordNo].imgSrc && (
                        <Image
                            src={wordList[currentWordNo].imgSrc}
                            alt={wordList[currentWordNo].wordText}
                            fill
                            style={{ objectFit: 'contain' }}
                        />
                    )}
                </div>
                {ageGroup < '6' && (
                    <button
                        className='absolute bottom-5 right-5 flex h-fit drop-shadow-[2px_2px_2px_rgba(0,0,0,0.25)]'
                        onClick={handlePlayTts}
                    >
                        <VolumeIcon width={60} height={60} />
                    </button>
                )}
            </div>
            <div className='mx-auto mb-15 xl:mb-20'>
                <AudioButton
                    audioUrl={audioUrl}
                    isRecording={isRecording}
                    isPlaying={isPlaying}
                    handleStartRecording={handleStartRecording}
                    handleStopRecording={handleStopRecording}
                    handlePause={handlePause}
                    handlePlay={handlePlay}
                    volume={volume}
                />
            </div>
            <div className='flex flex-wrap justify-center gap-5'>
                <button
                    type='button'
                    className='btn btn-large btn-outlined disabled:btn-outlined-disabled'
                    onClick={handleClickPrev}
                    disabled={currentWordNo === 0}
                >
                    이전
                </button>
                <button
                    type='button'
                    className='btn btn-large btn-contained disabled:btn-contained-disabled'
                    onClick={handleClickNext}
                    disabled={!audioUrl}
                >
                    다음
                </button>
            </div>
        </Container>
    );
};

ScreeningRecordingPage.getLayout = function getLayout(page: ReactElement) {
    return <ScreeningAppLayout>{page}</ScreeningAppLayout>;
};

export default ScreeningRecordingPage;

export const getServerSideProps: GetServerSideProps = async context => {
    try {
        const sessionId = Number(context.query.sessionId);
        const wordNo = Number(context.query.wordNo);

        const testInfoResponse = await getScreeningTestSessionAPI({ sessionId });
        const testInfo = testInfoResponse.testInfo;
        const ageGroup = testInfo.ageGroup;
        // 만 나이 계산
        const age = dayjs().diff(testInfo.testeeBirthdate, 'year');

        // TODO: ageGroup으로 questionAnswerList 받아오기

        const wordsResponse = await getWordAndRecordingListAPI({ sessionId, ageGroup });
        const wordList = await wordsResponse.words;

        // 잘못된 질문 번호면 0으로 리셋
        if (!wordList[wordNo]) {
            return {
                props: {
                    age,
                    ageGroup,
                    wordList,
                    wordNo: 0,
                },
            };
        }

        return {
            props: {
                age,
                ageGroup,
                wordList,
                wordNo,
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
