import {
    useMemo,
    type ReactNode,
    useCallback,
    type MouseEventHandler,
    useEffect,
    useState,
    type CSSProperties,
    useRef,
    type ChangeEventHandler,
} from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';

import WavesurferPlayer, { useWavesurfer } from '@wavesurfer/react';
import axios from 'axios';
import { getCookie } from 'cookies-next';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.js';
import TimelinePlugin from 'wavesurfer.js/dist/plugins/timeline.js';

import { CheckIcon, MikeIcon, StopIcon } from '@/components/common/icons';
import { useUpsertRecordingMutation } from '@/hooks/das';
import useAudioRecorder from '@/hooks/useAudioRecorder';
import { upsertRecordingAPI } from '@/api/das';

import styles from './VolumeModal.module.scss';

const axiosInstance = axios.create({ baseURL: '' });

// 녹음, 재생, 정지, 일시정지 버튼 렌더링
export const RecordButtonWithTime = ({
    isRecording,
    volume,
    step,
    handleStart,
    handleStop,
}: {
    isRecording: boolean;
    volume: number;
    step: 'ready' | 'recording' | 'complete';
    handleStart: () => Promise<void>;
    handleStop: () => void;
}) => {
    // 녹음 버튼 빛나게 하기
    const [speaking, setSpeaking] = useState(false);

    // 녹음 버튼 누르고 목소리를 처음 냈을 때 shining
    useEffect(() => {
        if (isRecording && volume && volume > 20) {
            setSpeaking(true);
        }
    }, [isRecording, volume]);

    // 녹음 종료 시 shining 종료
    useEffect(() => {
        if (!isRecording) {
            setSpeaking(false);
        }
    }, [isRecording]);

    const RADIUS = 41;
    const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

    const [progress, setProgress] = useState(0);
    const animationFrameIdRef = useRef<number | null>(null);
    const volumeRef = useRef(volume);

    // 실시간 볼륨 저장
    useEffect(() => {
        volumeRef.current = volume;
    }, [volume]);

    // 애니메이션
    useEffect(() => {
        if (isRecording) {
            let lastTime: number | null = null;

            const animate = (timestamp: number) => {
                if (lastTime === null) {
                    lastTime = timestamp;
                }
                const delta = timestamp - lastTime; // 프레임 마다 증가량 (ms)

                if (volumeRef.current > 20) {
                    setProgress(prev => Math.min(20, prev + delta / 1000)); // 초 단위로 더하기
                }

                lastTime = timestamp; // 기존 프레임 저장
                animationFrameIdRef.current = requestAnimationFrame(animate);
            };

            animationFrameIdRef.current = requestAnimationFrame(animate);

            return () => {
                if (animationFrameIdRef.current) {
                    cancelAnimationFrame(animationFrameIdRef.current);
                }
            };
        } else {
            setProgress(0);
        }
    }, [isRecording]);

    if (step === 'recording') {
        return (
            <div className={styles.circleProgressWrap}>
                <button
                    type='button'
                    className={styles.roundButton}
                    style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
                >
                    <StopIcon width={50} height={50} />
                </button>
                <svg className={styles.circleProgress} width='94' height='94' viewBox='0 0 94 94' onClick={handleStop}>
                    <circle className={styles.frame} cx='47' cy='47' r={'41'} strokeWidth='12' />
                    <circle
                        className={styles.bar}
                        cx='47'
                        cy='47'
                        r={'41'}
                        strokeWidth='12'
                        style={{ strokeDashoffset: CIRCUMFERENCE * (1 - progress / 30), strokeDasharray: CIRCUMFERENCE }}
                    />
                </svg>
            </div>
        );
    }

    if (step === 'complete') {
        return (
            <button type='button' className={styles.roundButton}>
                <CheckIcon color='white' width={50} height={50} />
            </button>
        );
    }

    return (
        <button type='button' className={styles.roundButton} onClick={handleStart}>
            <MikeIcon width={50} height={50} />
        </button>
    );
};

export default function VolumeModal({
    title,
    content,

    recordingId,
    partId,
    filePath,
    modalOpen,
    handleCloseModal,
    onSuccess,
}: {
    title: string;
    content: string;

    recordingId?: number;
    partId: number;
    filePath?: string;
    modalOpen: boolean;
    handleCloseModal: () => void;
    onSuccess: (filePath: string) => void;
}) {
    const router = useRouter();

    const handleClickOverlay = useCallback<MouseEventHandler<HTMLDivElement>>(
        e => {
            e.preventDefault();
            handleCloseModal();
        },
        [handleCloseModal],
    );

    const [repeatCount, setRepeatCount] = useState<number | null>(0);

    // 파타카 녹음
    const { isRecording, isPlaying, audioUrl, audioBlob, handleStartRecording, handleStopRecording, handlePlay, handlePause, volume } =
        useAudioRecorder(filePath);

    const [step, setStep] = useState<'ready' | 'recording' | 'complete'>('ready');
    const { mutateAsync } = useUpsertRecordingMutation({ onSuccess });

    useEffect(() => {
        if (audioBlob) {
            const sessionId = Number(router.query.sessionId);
            const accessToken = getCookie('jwt') as string;
            mutateAsync({ sessionId, audioBlob, recordingId, partId, jwt: accessToken }).then(res => {
                toast(
                    <div className='flex items-center justify-center text-body-2'>
                        <CheckIcon color='white' />
                        자동저장되었습니다.
                    </div>,
                );

                setStep('complete');
                setTimeout(() => {
                    setStep('ready');
                }, 2000);
            });
        }
    }, [audioBlob, partId, recordingId, router.query.sessionId, mutateAsync]);

    const modalStyle: CSSProperties = useMemo(
        () =>
            modalOpen
                ? {
                      width: '100%',
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  }
                : {
                      width: 0,
                      backgroundColor: 'rgba(0,0,0,0)',
                  },
        [modalOpen],
    );

    const modalBoxStyle: CSSProperties = useMemo(
        () =>
            modalOpen
                ? {
                      display: 'flex',
                  }
                : {
                      display: 'none',
                  },
        [modalOpen],
    );

    const [modalRoot, setModalRoot] = useState<Element | null>(null);

    const barActiveRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (document) {
            setModalRoot(document.getElementById('modal-root'));
        }
    }, []);

    if (!modalRoot) return null;

    return createPortal(
        <>
            <div
                className='fixed inset-0 z-[97] block h-full transition-colors duration-300 ease-linear'
                onClick={handleClickOverlay}
                style={modalStyle}
            />
            <div
                className='fixed left-1/2 top-1/2 z-[99] hidden w-full max-w-[calc(100%-40px)] -translate-x-1/2 -translate-y-1/2 flex-col items-center overflow-y-hidden rounded-[10px] bg-white sm:w-auto sm:min-w-[620px] sm:max-w-none'
                style={modalBoxStyle}
            >
                <div className='relative w-full bg-accent1 p-2'>
                    <h6 className='text-center font-bold text-white text-body-2'>{title}</h6>
                    <button type='button' className='absolute right-2 top-1/2 -translate-y-1/2' onClick={handleCloseModal}>
                        <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                            <path
                                fillRule='evenodd'
                                clipRule='evenodd'
                                d='M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z'
                                fill='white'
                            />
                        </svg>
                    </button>
                </div>

                <div className='relative flex h-full w-full flex-col items-center px-5 py-7.5'>
                    <p className='mb-7.5'>{content}</p>
                    <div className={styles.volumeBar}>
                        <div ref={barActiveRef} className={styles.volumeBarActive} style={{ width: `${volume}%` }}></div>
                    </div>

                    <RecordButtonWithTime
                        isRecording={isRecording}
                        volume={volume}
                        step={step}
                        handleStart={async () => {
                            await handleStartRecording();
                            setStep('recording');
                        }}
                        handleStop={handleStopRecording}
                    />
                </div>
            </div>
        </>,
        modalRoot,
    );
}
