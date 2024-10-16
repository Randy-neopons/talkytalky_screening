import { useCallback, useState, type ReactNode } from 'react';
import type { GetServerSideProps } from 'next';
import Image from 'next/image';
import { useRouter } from 'next/router';

import { isAxiosError } from 'axios';
import { deleteCookie, getCookie } from 'cookies-next';

import { useTestTime } from '@/stores/timerStore';
import { TALKYTALKY_URL } from '@/utils/const';
import { AudioButton } from '@/components/common/Buttons';
import Container from '@/components/common/Container';
import { InfoIcon, PrintIcon } from '@/components/common/icons';
import useAudioRecorder from '@/hooks/useAudioRecorder';
import { getAnswersCountAPI, updateSessionAPI } from '@/api/das';

import styles from '../SubTests.module.css';

import conversationImg from 'public/static/images/conversation-img.png';

// 소검사 ID
const CURRENT_SUBTEST_ID = 3;
const PART_ID_START = 10;

export default function ConversationPage() {
    const router = useRouter();

    const { audioBlob, audioUrl, isPlaying, isRecording, handlePause, handlePlay, handleStartRecording, handleStopRecording } =
        useAudioRecorder();

    const [partId, setPartId] = useState(PART_ID_START);

    const testTime = useTestTime();

    // 다음 클릭
    const handleClickPrev = useCallback(
        (data: any) => {
            try {
                // TODO: 중간 저장 API

                const sessionId = Number(router.query.sessionId);
                router.push(`/das/sessions/${sessionId}/subtests/speechTwo/description`);
            } catch (err) {
                console.error(err);
            }
        },
        [router],
    );

    // 폼 데이터 제출
    const handleSubmitData = useCallback(
        async ({ sessionId }: { sessionId: number }) => {
            try {
                const formData = new FormData();
                formData.append('audio1', audioBlob || 'null');
                formData.append('recordings', JSON.stringify([{ filePath: null, repeatCount: null }]));

                formData.append('testTime', `${testTime}`);
                formData.append('currentPartId', `${partId}`);

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
        [audioBlob, partId, testTime],
    );

    const handleClickNext = useCallback(async () => {
        try {
            const sessionId = Number(router.query.sessionId);
            await handleSubmitData({ sessionId });

            router.push(`/das/sessions/${sessionId}/subtests/speechTwo/questions`);
        } catch (err) {
            console.error(err);
        }
    }, [handleSubmitData, router]);

    return (
        <Container>
            <div className={`${styles['title']}`}>
                <h1 className='flex items-center whitespace-pre-line text-center font-jalnan text-head-1'>{'대화하기'}</h1>
                <button>
                    <InfoIcon bgColor='#6979F8' color='#FFFFFF' width={44} height={44} />
                </button>
                <div className={`${styles['tooltip-content']} bg-accent3`}>
                    <b>치료사 지시문</b>
                    <br />
                    “오늘(또는 요즘에) 무슨 일을 하셨는지 얘기해 주세요. 될 수 있는 대로 문장으로 설명해 주세요. 시간은 1분 드릴게요.”
                </div>
            </div>
            <button className='ml-auto mt-8 flex items-center gap-[6px] rounded-[10px] border border-neutral7 bg-white px-5 py-2.5'>
                <PrintIcon color={'#212529'} />
                인쇄하기
            </button>

            <Image src={conversationImg} alt='conversation' className='mt-5 h-auto w-[1000px] rounded-base' />

            <div className='mt-20 flex w-full flex-nowrap items-center'>
                <div className='mx-auto flex gap-[45px]'>
                    {/* <button type='button'>
                        <Image src={memoIcon} alt='memo-icon' className='h-auto w-15' />
                    </button> */}

                    <AudioButton
                        audioUrl={audioUrl}
                        isRecording={isRecording}
                        isPlaying={isPlaying}
                        handleStartRecording={handleStartRecording}
                        handleStopRecording={handleStopRecording}
                        handlePause={handlePause}
                        handlePlay={handlePlay}
                    />

                    {/* <button type='button' className='invisible'>
                        <Image src={fontSizeIcon} alt='font-icon' className='h-auto w-15' />
                    </button> */}
                </div>
            </div>
            <div className='mt-20 flex gap-5'>
                <button type='button' className='btn btn-large btn-outlined' onClick={handleClickPrev}>
                    이전
                </button>
                <button key='noSubmit' type='button' className='btn btn-large btn-contained' onClick={handleClickNext}>
                    다음
                </button>
            </div>
        </Container>
    );
}

export const getServerSideProps: GetServerSideProps = async context => {
    try {
        const sessionId = Number(context.query.sessionId);
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

        return {
            props: {
                isLoggedIn: true,
                progress,
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
