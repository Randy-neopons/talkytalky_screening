import { useCallback, useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { useReactToPrint } from 'react-to-print';
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
import { getAnswersCountAPI, getQuestionAndAnswerListAPI, updateSessionAPI, upsertRecordingAPI } from '@/api/das';

import styles from '../SubTests.module.scss';

import marketImg from 'public/static/images/market-img.png';
import pictureDescImg from 'public/static/images/picture-desc-img.png';

import type { Recording } from '@/types/das';

const TooltipArrowIcon = () => {
    return (
        <svg className={`${styles.tooltipArrow}`} xmlns='http://www.w3.org/2000/svg' width='54' height='54' viewBox='0 0 54 54' fill='none'>
            <path
                d='M24.4019 4.5C25.5566 2.5 28.4434 2.5 29.5981 4.5L47.7846 36C48.9393 38 47.4959 40.5 45.1865 40.5H8.81346C6.50406 40.5 5.06069 38 6.21539 36L24.4019 4.5Z'
                fill='#495057'
            />
        </svg>
    );
};

// 소검사 ID
const CURRENT_SUBTEST_ID = 3;
const PART_ID_START = 9;

type Props = {
    recording: Recording | null;
};

// 그림설명하기 페이지
export default function PictureDescriptionPage({ recording }: Props) {
    const router = useRouter();

    const { audioBlob, audioUrl, isPlaying, isRecording, handlePause, handlePlay, handleStartRecording, handleStopRecording } =
        useAudioRecorder(recording?.filePath);

    const [partId, setPartId] = useState(PART_ID_START);

    const testTime = useTestTime();

    const imageRef = useRef<HTMLImageElement>(null);

    const reactToPrintFn = useReactToPrint({
        contentRef: imageRef,
    });

    // 다음 클릭
    const handleClickPrev = useCallback(
        (data: any) => {
            try {
                // TODO: 중간 저장 API

                const sessionId = Number(router.query.sessionId);
                router.push(`/das/sessions/${sessionId}/subtests/speechTwo`);
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
                // 세션 갱신
                const accessToken = getCookie('jwt') as string;
                await upsertRecordingAPI({
                    sessionId,
                    audioBlob: audioBlob || null,
                    recordingId: recording?.recordingId,
                    partId,
                    jwt: accessToken,
                });
                await updateSessionAPI({ sessionId, answers: [], testTime, currentPartId: partId, jwt: accessToken });
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
        [audioBlob, partId, recording, testTime],
    );

    // 다음 클릭
    const handleClickNext = useCallback(
        async (data: any) => {
            try {
                const sessionId = Number(router.query.sessionId);
                await handleSubmitData({ sessionId });

                router.push(`/das/sessions/${sessionId}/subtests/speechTwo/conversation`);
            } catch (err) {
                console.error(err);
            }
        },
        [handleSubmitData, router],
    );

    const [showTooltip, setShowTooltip] = useState(true);
    const tooltipContentRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (tooltipContentRef.current && !tooltipContentRef.current.contains(event.target as Node)) {
                console.log('here');
                setShowTooltip(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <Container>
            <div className={`${styles.title}`}>
                <h1 className='flex items-center whitespace-pre-line text-center font-jalnan text-head-1'>그림설명하기</h1>
                <div
                    className={`${styles.buttonContainer}`}
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                >
                    <button>
                        <InfoIcon bgColor='#6979F8' color='#FFFFFF' width={44} height={44} />
                    </button>
                    {showTooltip && <TooltipArrowIcon />}
                </div>
                {showTooltip && (
                    <div className={`${styles.tooltipContent}`} ref={tooltipContentRef}>
                        <p>
                            <b>치료사 지시문</b>
                        </p>
                        <p>
                            자, 이 글 보이시나요?(안보인다면 크기 조절하기) 제가 &apos;시작&apos;하면 이 글을 소리내서 자연스럽게
                            읽어주세요.
                        </p>
                    </div>
                )}
            </div>
            <button
                onClick={() => {
                    reactToPrintFn();
                }}
                className='ml-auto mt-8 flex items-center gap-[6px] rounded-[10px] border border-neutral7 bg-white px-5 py-2.5'
            >
                <PrintIcon color={'#212529'} />
                인쇄하기
            </button>
            <Image ref={imageRef} src={marketImg} alt='picture-description' className='mt-5 h-auto w-[1000px] rounded-base' />

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
                        <Image src={fontSizeIcon} alt='memo-icon' className='h-auto w-15' />
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

        const responseData = await getQuestionAndAnswerListAPI({ sessionId, subtestId: CURRENT_SUBTEST_ID, jwt: accessToken });
        const recording = responseData.recordings?.[1] || null;

        // 검사 시작할 때마다 진행률 불러오기
        const { totalCount, notNullCount } = await getAnswersCountAPI({ sessionId, jwt: accessToken });
        const progress = Math.ceil((notNullCount / totalCount) * 100);

        return {
            props: {
                isLoggedIn: true,
                recording,
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
