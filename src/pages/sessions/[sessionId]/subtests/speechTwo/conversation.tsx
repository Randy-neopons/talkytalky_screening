import { useCallback, useState } from 'react';
import type { GetServerSideProps } from 'next';
import Image from 'next/image';
import { useRouter } from 'next/router';

import { isAxiosError } from 'axios';
import { deleteCookie, getCookie } from 'cookies-next';

import { useTestTime } from '@/stores/timerStore';
import { TALKYTALKY_URL } from '@/utils/const';
import Container from '@/components/common/Container';
import { InfoIcon } from '@/components/icons';
import useAudioRecorder from '@/hooks/useAudioRecorder';
import { getAnswersCountAPI, updateSessionAPI } from '@/api/questions';

import styles from '../SubTests.module.css';

import conversationImg from 'public/static/images/conversation-img.png';
import fontSizeIcon from 'public/static/images/font-size-icon.png';
import memoIcon from 'public/static/images/memo-icon.png';
import playRecordIcon from 'public/static/images/play-record-icon.png';
import recordIcon from 'public/static/images/record-icon.png';
import stopIcon from 'public/static/images/stop-icon.png';

// 소검사 ID
const CURRENT_SUBTEST_ID = 3;
const CURRENT_PART_ID_START = 8;

export default function ConversationPage() {
    const router = useRouter();

    const { audioBlob, audioUrl, isRecording, handlePlay, handleStartRecording, handleStopRecording } = useAudioRecorder();

    const [currentPartId, setCurrentPartId] = useState(CURRENT_PART_ID_START);

    const testTime = useTestTime();

    // 다음 클릭
    const handleClickPrev = useCallback(
        (data: any) => {
            try {
                // TODO: 중간 저장 API

                const sessionId = Number(router.query.sessionId);
                router.push(`/sessions/${sessionId}/subtests/speechTwo/description`);
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
                formData.append('currentPartId', `${currentPartId}`);

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
        [audioBlob, currentPartId, testTime],
    );

    const handleClickNext = useCallback(async () => {
        try {
            const sessionId = Number(router.query.sessionId);
            await handleSubmitData({ sessionId });

            router.push(`/sessions/${sessionId}/subtests/speechTwo/questions`);
        } catch (err) {
            console.error(err);
        }
    }, [handleSubmitData, router]);

    return (
        <Container>
            <h2 className='font-jalnan text-accent1 text-head-2'>SPEECH II : 종합적 말평가</h2>
            <h1 className='flex items-center whitespace-pre-line text-center font-jalnan text-head-1'>
                {'대화하기'}
                <span className={`${styles['tooltip']}`}>
                    <button>
                        <InfoIcon color='#6979F8' width={40} height={40} />
                    </button>
                    <div className={`${styles['tooltip-content']} bg-accent3`}>
                        <b>치료사 지시문</b>
                        <br />
                        “오늘(또는 요즘에) 무슨 일을 하셨는지 예기해주세요. 될 수 있는대로 문자으로 설명해주세요. 시간은 1분 드릴게요.”
                    </div>
                </span>
            </h1>
            <div className='ml-auto mt-8 flex items-center gap-[6px]'>
                <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none'>
                    <rect x='2.5' y='7.5' width='19' height='9' rx='0.5' stroke='#212529' />
                    <path d='M6.5 3C6.5 2.72386 6.72386 2.5 7 2.5H17C17.2761 2.5 17.5 2.72386 17.5 3V7.5H6.5V3Z' stroke='#212529' />
                    <path
                        d='M6 13C6 12.4477 6.44772 12 7 12H17C17.5523 12 18 12.4477 18 13V19C18 19.5523 17.5523 20 17 20H7C6.44772 20 6 19.5523 6 19V13Z'
                        fill='#212529'
                    />
                    <path d='M8 14H16' stroke='#F5F7FC' strokeLinecap='round' />
                    <path d='M8 16H16' stroke='#F5F7FC' strokeLinecap='round' />
                    <path d='M8 18H12' stroke='#F5F7FC' strokeLinecap='round' />
                </svg>
                인쇄하기
            </div>
            <div className='mt-5 rounded-[20px] bg-white px-[65px] py-5'>
                <Image src={conversationImg} alt='conversation' />
            </div>

            <div className='mt-20 flex w-full flex-nowrap items-center'>
                <div className='mx-auto flex gap-[45px]'>
                    {/* <button type='button'>
                        <Image src={memoIcon} alt='memo-icon' className='h-auto w-[60px]' />
                    </button> */}
                    <button type='button' onClick={isRecording ? handleStopRecording : audioUrl ? handlePlay : handleStartRecording}>
                        {isRecording ? (
                            <Image src={stopIcon} alt='stop-icon' className='h-auto w-[100px]' />
                        ) : audioUrl ? (
                            <Image src={playRecordIcon} alt='play-record-icon' className='h-auto w-[100px]' />
                        ) : (
                            <Image src={recordIcon} alt='record-icon' className='h-auto w-[100px]' />
                        )}
                    </button>
                    {/* <button type='button' className='invisible'>
                        <Image src={fontSizeIcon} alt='memo-icon' className='h-auto w-[60px]' />
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

        return {
            props: {
                isLoggedIn: true,
                progress,
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
