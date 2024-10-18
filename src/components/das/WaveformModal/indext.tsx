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
import { AudioVisualizer } from 'react-audio-visualize';
import { createPortal } from 'react-dom';

import axios from 'axios';
const axiosInstance = axios.create({ baseURL: '' });

export default function WaveformModal({
    audioBlob,
    audioUrl,
    modalOpen,
    handleCloseModal,
    setRepeatCount: submitRepeatCount,
}: {
    audioBlob?: Blob | null;
    audioUrl?: string | null;
    modalOpen: boolean;
    handleCloseModal: () => void;
    setRepeatCount: (value: number) => void;
}) {
    const visualizerRef = useRef<HTMLCanvasElement>(null);

    const [blob, setBlob] = useState<Blob | null>(null);

    // blob 세팅
    useEffect(() => {
        if (audioBlob) {
            setBlob(audioBlob);
        } else if (audioUrl) {
            axiosInstance.get(`/api/proxy?audioUrl=${audioUrl}`, { responseType: 'arraybuffer' }).then(res => {
                console.log(res);
                setBlob(new Blob([res.data]));
            });
        }
    }, [audioBlob, audioUrl]);

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
                    <div className='h-[250px] w-[578px]' style={waveformBgStyle}>
                        {blob && (
                            <AudioVisualizer
                                ref={visualizerRef}
                                blob={blob}
                                width={578}
                                height={250}
                                barWidth={1}
                                gap={0}
                                barColor={'#6979F8'}
                            />
                        )}
                    </div>
                    <input
                        type='number'
                        className='mt-5 h-[44px] w-full rounded-md border border-neutral6 px-[15px] py-3 outline-accent1'
                        placeholder='반복횟수를 입력해주세요.'
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
