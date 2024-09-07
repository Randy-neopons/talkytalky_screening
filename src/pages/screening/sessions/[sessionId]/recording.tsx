import { useCallback, useState, type ReactElement } from 'react';
import type { GetServerSideProps } from 'next';
import Image from 'next/image';
import { useRouter } from 'next/router';

import { AudioButton, RoundedBox } from '@/components/common/Buttons';
import Container from '@/components/common/Container';
import { VolumeIcon } from '@/components/icons';
import ScreeningAppLayout from '@/components/screening/ScreeningAppLayout';
import useAudioRecorder from '@/hooks/useAudioRecorder';

import appleImg from 'public/static/images/words/사과.png';

import type { Word } from '@/types/screening';
import type { NextPageWithLayout } from '@/types/types';

// 간이언어평가 녹음 페이지
const ScreeningRecordingPage: NextPageWithLayout<{
    wordList: Word[];
    wordNo: number;
}> = ({ wordList, wordNo }) => {
    const router = useRouter(); // next router

    const { audioBlob, audioUrl, isPlaying, isRecording, handlePause, handlePlay, handleStartRecording, handleStopRecording } =
        useAudioRecorder();

    const [currentWordNo, setCurrentWordNo] = useState(wordNo || 0); //  0부터 시작

    // 이전 파트로
    const handleClickPrev = useCallback(() => {
        if (currentWordNo > 0) {
            setCurrentWordNo(prev => prev - 1);
        }
        typeof window !== 'undefined' && window.scrollTo(0, 0); // 스크롤 초기화
    }, [currentWordNo]);

    // 다음 파트로
    const handleClickNext = useCallback(async () => {
        try {
            const sessionId = Number(router.query.sessionId);
            const ageGroup = String(router.query.ageGroup);

            if (currentWordNo < wordList.length - 1) {
                // TODO: recording 업로드
                setCurrentWordNo(prev => prev + 1);
            } else {
                // 결과 페이지로 이동
            }
            typeof window !== 'undefined' && window.scrollTo(0, 0); // 스크롤 초기화
        } catch (err) {
            console.error(err);
        }
    }, [currentWordNo, wordList, router]);

    return (
        <Container>
            <h1 className='mb-20 font-jalnan text-head-1'>이름맞히기</h1>
            <div className='relative mb-[50px] flex w-full justify-center overflow-hidden rounded-[15px] bg-white py-[22px] shadow-base'>
                <Image src={wordList[wordNo].imgSrc} alt={wordList[wordNo].wortText} width={400} height={400} />
                <button className='absolute bottom-5 right-5 flex h-fit drop-shadow-[2px_2px_2px_rgba(0,0,0,0.25)]' onClick={() => {}}>
                    <VolumeIcon width={60} height={60} />
                </button>
            </div>
            <div className='mx-auto mb-20'>
                <RoundedBox>
                    <AudioButton
                        audioUrl={audioUrl}
                        isRecording={isRecording}
                        isPlaying={isPlaying}
                        handleStartRecording={handleStartRecording}
                        handleStopRecording={handleStopRecording}
                        handlePause={handlePause}
                        handlePlay={handlePlay}
                    />
                </RoundedBox>
            </div>
            <div>
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
                    className='ml-5 btn btn-large btn-contained disabled:btn-contained-disabled'
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
        const ageGroup = String(context.query.ageGroup);
        const wordNo = Number(context.query.wordNo);

        // TODO: ageGroup으로 questionAnswerList 받아오기

        const wordList = [
            {
                wordId: 1,
                wordText: '피아노',
                imgSrc: appleImg.src,
            },
            {
                wordId: 2,
                wordText: '피망',
                imgSrc: appleImg.src,
            },
            {
                wordId: 3,
                wordText: '모자',
                imgSrc: appleImg.src,
            },
        ];

        // 잘못된 질문 번호면 0으로 리셋
        if (!wordList[wordNo]) {
            return {
                props: {
                    wordList,
                    wordNo: 0,
                },
            };
        }

        return {
            props: {
                wordList,
                wordNo,
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
