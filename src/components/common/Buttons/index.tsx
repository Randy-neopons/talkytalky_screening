import { useEffect, useState, type ChangeEventHandler, type ReactNode } from 'react';

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
                <button type='button' className={styles['rounded-button']} onClick={handleStopRecording}>
                    <StopIcon width={50} height={50} />
                </button>
            </RoundedBox>
        );
    }

    if (audioUrl) {
        if (isPlaying) {
            return (
                <RoundedBox>
                    <button type='button' className={styles['rounded-button']} onClick={handlePause}>
                        <PauseIcon width={50} height={50} />
                    </button>
                    <div className='h-9 w-[2px] bg-white'></div>
                    <button type='button' className={styles['rounded-button']} onClick={handleStartRecording}>
                        <MikeIcon width={50} height={50} />
                    </button>
                </RoundedBox>
            );
        }

        return (
            <RoundedBox>
                <button type='button' className={styles['rounded-button']} onClick={handlePlay}>
                    <PlayIcon width={50} height={50} />
                </button>
                <div className='h-9 w-[2px] bg-white'></div>
                <button type='button' className={styles['rounded-button']} onClick={handleStartRecording}>
                    <MikeIcon width={50} height={50} />
                </button>
            </RoundedBox>
        );
    }

    return (
        <RoundedBox>
            <button type='button' className={styles['rounded-button']} onClick={handleStartRecording}>
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
            <label htmlFor={value} className={styles['radio-label']}>
                {label}
                <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none'>
                    <rect x='1' y='1' width='22' height='22' rx='11' stroke='#CED4DA' strokeWidth='2' />
                    <circle cx='12' cy='12' r='7' fill='#CED4DA' />
                </svg>
            </label>
        </div>
    );
};
