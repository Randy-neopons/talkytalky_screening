import { useEffect, useRef, useState, type ChangeEventHandler, type ReactNode } from 'react';

import { MikeIcon, PauseIcon, PlayIcon, StopIcon } from '@/components/common/icons';

import styles from './Buttons.module.scss';

// 주위에 테두리 효과 주기
export const RoundedBox = ({ isShining, children }: { isShining?: boolean; children: ReactNode }) => {
    // 주변에 음파 퍼지는 효과
    if (isShining) {
        return (
            <div className='flex items-center justify-center rounded-full border-[9px] border-transparent'>
                <div className='absolute h-[60px] w-[60px] animate-ping rounded-full bg-accent1/50'></div>
                <div className='z-20 flex items-center justify-center rounded-full bg-accent1'>{children}</div>
            </div>
        );
    }

    return (
        <div className='overflow-hidden rounded-full border-[9px] border-accent1/10'>
            <div className='flex items-center justify-center bg-accent1'>{children}</div>
        </div>
    );
};

// 녹음, 재생, 정지, 일시정지 버튼 렌더링
export const RecordButtonWithTime = ({
    isRecording,
    volume,
    handleStartRecording,
    handleStopRecording,
}: {
    isRecording: boolean;
    volume: number;
    handleStartRecording: () => Promise<void>;
    handleStopRecording: () => void;
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
        let lastTime: number | null = null;

        const animate = (timestamp: number) => {
            if (lastTime === null) {
                lastTime = timestamp;
            }
            const delta = timestamp - lastTime; // 프레임 마다 증가량 (ms)

            if (volumeRef.current > 30) {
                setProgress(prev => Math.min(30, prev + delta / 1000)); // 초 단위로 더하기
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
    }, []);

    if (isRecording) {
        return (
            <div className={styles.circleProgressWrap}>
                <button
                    type='button'
                    className={styles.roundButton}
                    onClick={handleStopRecording}
                    style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
                >
                    <StopIcon width={50} height={50} />
                </button>
                <svg className={styles.circleProgress} width='94' height='94' viewBox='0 0 94 94' onClick={handleStopRecording}>
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

    return (
        <RoundedBox>
            <button type='button' className={styles.roundButton} onClick={handleStartRecording}>
                <MikeIcon width={50} height={50} />
            </button>
        </RoundedBox>
    );
};

// 녹음, 재생, 정지, 일시정지 버튼 렌더링
export const AudioButton = ({
    audioUrl,
    isRecording,
    isPlaying,
    volume,
    handleStartRecording,
    handleStopRecording,
    handlePause,
    handlePlay,
}: {
    audioUrl?: string | null;
    isRecording: boolean;
    isPlaying: boolean;
    volume?: number;
    handleStartRecording: () => Promise<void>;
    handleStopRecording: () => void;
    handlePause: () => void;
    handlePlay: () => void;
}) => {
    // 녹음 버튼 빛나게 하기
    const [buttonShining, setButtonShining] = useState(false);

    // 녹음 버튼 누르고 목소리를 처음 냈을 때 shining
    useEffect(() => {
        if (isRecording && volume && volume > 20) {
            setButtonShining(true);
        }
    }, [isRecording, volume]);

    // 녹음 종료 시 shining 종료
    useEffect(() => {
        if (!isRecording) {
            setButtonShining(false);
        }
    }, [isRecording]);

    if (isRecording) {
        return (
            <RoundedBox isShining={buttonShining}>
                <button type='button' className={styles.roundButton} onClick={handleStopRecording}>
                    <StopIcon width={50} height={50} />
                </button>
            </RoundedBox>
        );
    }

    if (audioUrl) {
        if (isPlaying) {
            return (
                <RoundedBox>
                    <button type='button' className={styles.roundButton} onClick={handlePause}>
                        <PauseIcon width={50} height={50} />
                    </button>
                    <div className='h-9 w-[2px] bg-white'></div>
                    <button type='button' className={styles.roundButton} onClick={handleStartRecording}>
                        <MikeIcon width={50} height={50} />
                    </button>
                </RoundedBox>
            );
        }

        return (
            <RoundedBox>
                <button type='button' className={styles.roundButton} onClick={handlePlay}>
                    <PlayIcon width={50} height={50} />
                </button>
                <div className='h-9 w-[2px] bg-white'></div>
                <button type='button' className={styles.roundButton} onClick={handleStartRecording}>
                    <MikeIcon width={50} height={50} />
                </button>
            </RoundedBox>
        );
    }

    return (
        <RoundedBox>
            <button type='button' className={styles.roundButton} onClick={handleStartRecording}>
                <MikeIcon width={50} height={50} />
            </button>
        </RoundedBox>
    );
};

// 라디오 버튼
export const RadioButton = ({
    name,
    label,
    value,
    onChange,
    checked,
}: {
    name: string;
    label: string;
    value: string;
    onChange: ChangeEventHandler<HTMLInputElement>;
    checked?: boolean;
}) => {
    return (
        <div className='flex'>
            <input type='radio' className='appearance-none' name={name} id={value} value={value} onChange={onChange} checked={checked} />
            <label htmlFor={value} className={styles.radioLabel}>
                {label}
                <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none'>
                    <rect x='1' y='1' width='22' height='22' rx='11' stroke='#CED4DA' strokeWidth='2' />
                    <circle cx='12' cy='12' r='7' fill='#CED4DA' />
                </svg>
            </label>
        </div>
    );
};
