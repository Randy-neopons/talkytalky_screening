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

import styles from './VolumeModal.module.scss';

const axiosInstance = axios.create({ baseURL: '' });

export default function VolumeModal({
    title,
    content,
    volume,
    modalOpen,
    handleCloseModal,
}: {
    title: string;
    content: string;
    volume?: number;
    modalOpen: boolean;
    handleCloseModal: () => void;
}) {
    const handleClickOverlay = useCallback<MouseEventHandler<HTMLDivElement>>(
        e => {
            e.preventDefault();
            handleCloseModal();
        },
        [handleCloseModal],
    );

    const [repeatCount, setRepeatCount] = useState<number | null>(0);

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

                    <button className='mt-7.5 btn btn-small btn-contained' onClick={handleCloseModal}>
                        완료
                    </button>
                </div>
            </div>
        </>,
        modalRoot,
    );
}
