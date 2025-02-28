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

import axios from 'axios';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin, { Region } from 'wavesurfer.js/dist/plugins/regions';

import CheckBox from '@/components/common/CheckBox';

import styles from './WaveformModal.module.scss';

const axiosInstance = axios.create({ baseURL: '' });

export default function WaveformModal({
    audioUrl,
    modalOpen,
    handleCloseModal,
    setRepeatCount: submitRepeatCount,
    setMPT,

    title,
    placeholder,
}: {
    audioUrl?: string;
    modalOpen: boolean;
    handleCloseModal: () => void;
    setRepeatCount?: (value: number) => void;
    setMPT?: (value: number) => void;

    title?: string;
    placeholder?: string;
}) {
    const waveformRef = useRef<HTMLDivElement>(null);
    const wavesurferRef = useRef<WaveSurfer | null>(null);
    const audioRef = useRef<HTMLAudioElement>(null);

    const [startTime, setStartTime] = useState(0);
    const [endTime, setEndTime] = useState(0);

    const create = useCallback(async () => {
        if (waveformRef.current && audioRef.current) {
            const regionsPlugin = RegionsPlugin.create();
            // const WaveSurfer = (await import('wavesurfer.js')).default;
            wavesurferRef.current = WaveSurfer.create({
                container: waveformRef.current,
                height: 233,
                waveColor: '#6979F8',
                barWidth: 2,
                barGap: 1,
                barRadius: 2,
                progressColor: 'rgb(100, 0, 100)',
                url: audioUrl,
                media: audioRef.current ?? undefined,
                mediaControls: true,
                plugins: [regionsPlugin],
            });

            // wavesurferRef.current.registerPlugin(regionsPlugin);

            wavesurferRef.current.on('decode', () => {
                if (wavesurferRef.current) {
                    const duration = wavesurferRef.current.getDuration();

                    setStartTime(duration * 0.1);
                    setEndTime(duration * 0.9);

                    wavesurferRef.current.registerPlugin(regionsPlugin);

                    const singleRegion = regionsPlugin.addRegion({
                        start: duration * 0.1,
                        end: duration * 0.9,
                        color: 'rgba(109, 92, 232, 0.1)',
                        resize: true,
                        drag: true,
                    });

                    regionsPlugin.on('region-updated', obj => {
                        setStartTime(obj.start);
                        setEndTime(obj.end);
                    });
                }
            });
        }
    }, [audioUrl]);

    useEffect(() => {
        create();

        return () => {
            if (wavesurferRef.current) {
                wavesurferRef.current.destroy();
            }
        };
    }, [create]);

    const handleClickOverlay = useCallback<MouseEventHandler<HTMLDivElement>>(
        e => {
            e.preventDefault();
            handleCloseModal();
        },
        [handleCloseModal],
    );

    const [repeatCount, setRepeatCount] = useState<number | null>(0);
    const handleChangeRepeatCount = useCallback<ChangeEventHandler<HTMLInputElement>>(e => {
        setRepeatCount(e.currentTarget.valueAsNumber);
    }, []);

    const handleClickOk = useCallback<MouseEventHandler<HTMLButtonElement>>(
        e => {
            e.preventDefault();

            // MPT 설정
            setMPT && setMPT(Number((endTime - startTime).toFixed(2)));

            // 반복 횟수 설정
            submitRepeatCount && repeatCount && submitRepeatCount(repeatCount);

            // 모달 닫기
            handleCloseModal();
        },
        [endTime, handleCloseModal, repeatCount, setMPT, startTime, submitRepeatCount],
    );

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

    const waveformBgStyle: CSSProperties = useMemo(
        () => ({
            border: '1px solid #CED4DA',
            borderRadius: '10px',
            background:
                'linear-gradient(to bottom, transparent 50px, #CED4DA 50px) 0 0 / 100vw 51px repeat-y, linear-gradient(to right, transparent 47.5px, #CED4DA 47.5px) 0 0 / 48.5px 100vh repeat-x',
        }),
        [],
    );

    // 모달 종료 시 재생 중지
    useEffect(() => {
        if (!modalOpen && audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    }, [modalOpen]);

    const [modalRoot, setModalRoot] = useState<Element | null>(null);

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
                className='fixed left-1/2 top-1/2 z-[99] hidden min-h-[500px] w-full max-w-[calc(100%-40px)] -translate-x-1/2 -translate-y-1/2 flex-col items-center overflow-y-hidden rounded-[10px] bg-white sm:w-auto sm:min-w-[620px] sm:max-w-none'
                style={modalBoxStyle}
            >
                <div className='relative w-full bg-accent1 p-2'>
                    <h6 className='text-center font-bold text-white text-body-2'>{title || '파형'}</h6>
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

                <div className='relative flex h-full w-full flex-col items-center px-8 pb-7.5 pt-4'>
                    <div ref={waveformRef} className='w-full' />
                    <p className='ml-2 mt-4 flex w-full text-left'>발화시간 : {(endTime - startTime).toFixed(2)}초</p>
                    <br />
                    <audio className='-mt-1 w-full' ref={audioRef} />
                    {/* <WavesurferPlayer height={250} url={url} onReady={onReady} plugins={[() => TimelinePlugin.create()]} /> */}
                    {submitRepeatCount && (
                        <input
                            type='number'
                            className='mt-4 h-[44px] w-full rounded-md border border-neutral6 px-[15px] py-3 outline-accent1'
                            placeholder={placeholder}
                            value={repeatCount || ''}
                            onChange={handleChangeRepeatCount}
                        />
                    )}
                    <button className='mt-7.5 btn btn-small btn-contained' onClick={handleClickOk}>
                        완료
                    </button>
                </div>
            </div>
        </>,
        modalRoot,
    );
}
