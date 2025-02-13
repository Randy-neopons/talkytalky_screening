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

import WavesurferPlayer, { useWavesurfer } from '@wavesurfer/react';
import axios from 'axios';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.js';
import TimelinePlugin from 'wavesurfer.js/dist/plugins/timeline.js';

import styles from './WaveformModal.module.scss';

const axiosInstance = axios.create({ baseURL: '' });

export default function WaveformModal({
    audioBlob,
    audioUrl,
    modalOpen,
    handleCloseModal,
    setRepeatCount: submitRepeatCount,
    placeholder,
}: {
    audioBlob?: Blob | null;
    audioUrl?: string | null;
    modalOpen: boolean;
    handleCloseModal: () => void;
    setRepeatCount: (value: number) => void;
    placeholder?: string;
}) {
    const waveformRef = useRef(null);

    const url = useMemo(
        () => (audioBlob ? URL.createObjectURL(audioBlob) : audioUrl ? `/api/proxy?audioUrl=${audioUrl}` : ''),
        [audioBlob, audioUrl],
    );

    const { wavesurfer, isPlaying, currentTime } = useWavesurfer({
        container: waveformRef,
        height: 250,
        waveColor: '#6979F8',
        barWidth: 2,
        barGap: 1,
        barRadius: 2,
        progressColor: 'rgb(100, 0, 100)',
        // url: '',
        url,
        mediaControls: true,
    });

    useEffect(() => {
        if (wavesurfer) {
            // 타임라인 플러그인을 동적으로 로드
            // import('wavesurfer.js/dist/plugins/timeline.js').then(module => {
            //     const TimelinePlugin = module.default; // default export 사용
            //     wavesurfer.registerPlugin(
            //         TimelinePlugin.create({
            //             height: 20,
            //             timeInterval: 0.1,
            //             primaryLabelInterval: 1,
            //             style: {
            //                 fontFamily: 'Noto Sans KR',
            //                 fontSize: '15px',
            //                 color: '#000000',
            //             },
            //         }),
            //     );
            // });
            // import('wavesurfer.js/dist/plugins/regions.js').then(module => {
            //     const RegionPlugin = module.default;
            //     const regions = RegionPlugin.create();
            //     wavesurfer.registerPlugin(regions);
            //     regions.addRegion({
            //         content: 'abcd',
            //         start: 0,
            //         end: 1,
            //         resize: true,
            //         drag: true,
            //     });
            //     regions.enableDragSelection({ color: 'rgba(255,0,0,0.1)' });
            //     regions.on('region-created', region => {
            //         console.log('created');
            //         const regionList = regions.getRegions();
            //         console.log(regionList);
            //         if (regionList.length > 1) {
            //             region.remove();
            //         }
            //     });
            // });
        }

        // 컴포넌트 언마운트 시 WaveSurfer 인스턴스를 정리합니다.
        return () => {
            if (wavesurfer) {
                wavesurfer.destroy();
            }
        };
    }, [audioBlob, wavesurfer]);

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
            repeatCount && submitRepeatCount(repeatCount);
            // onOk && onOk(e);
            handleCloseModal();
        },
        [handleCloseModal, repeatCount, submitRepeatCount],
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
                    <h6 className='text-center font-bold text-white text-body-2'>파형</h6>
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
                    <div className={styles['waveform-bg']}>
                        <div ref={waveformRef} />

                        {/* <WavesurferPlayer height={250} url={url} onReady={onReady} plugins={[() => TimelinePlugin.create()]} /> */}
                    </div>
                    <input
                        type='number'
                        className='mt-20 h-[44px] w-full rounded-md border border-neutral6 px-[15px] py-3 outline-accent1'
                        placeholder={placeholder}
                        value={repeatCount || ''}
                        onChange={handleChangeRepeatCount}
                    />
                    <button className='mt-7.5 btn btn-large btn-contained' onClick={handleClickOk}>
                        적용하기
                    </button>
                </div>
            </div>
        </>,
        modalRoot,
    );
}
