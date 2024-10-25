import { useCallback, useEffect, useRef, useState } from 'react';
import { AudioVisualizer } from 'react-audio-visualize';

import axios from 'axios';

import WaveformModal from '../WaveformModal/indext';
const axiosInstance = axios.create({ baseURL: '' });

type WaveformButtonProps = {
    audioBlob?: Blob | null;
    audioUrl?: string | null;
    setRepeatCount: (value: number) => void;
};

// 파형 보기 버튼 (모달 포함)
export function WaveformButton({ audioBlob, audioUrl, setRepeatCount }: WaveformButtonProps) {
    const visualizerRef = useRef<HTMLCanvasElement>(null);

    // 모달 열기/닫기
    const [modalOpen, setModalOpen] = useState(false);
    const handleOpenModal = useCallback(() => {
        setModalOpen(true);
    }, []);
    const handleCloseModal = useCallback(() => {
        setModalOpen(false);
    }, []);

    const [blob, setBlob] = useState<Blob | null>(null);

    // blob 세팅
    // useEffect(() => {
    //     if (audioBlob) {
    //         setBlob(audioBlob);
    //     } else if (audioUrl) {
    //         axiosInstance.get(`/api/proxy?audioUrl=${audioUrl}`, { responseType: 'arraybuffer' }).then(res => {
    //             console.log(res);
    //             setBlob(new Blob([res.data]));
    //         });
    //     }
    // }, [audioBlob, audioUrl]);

    return (
        <div className='relative flex items-center justify-center'>
            <button type='button' className='underline' onClick={handleOpenModal}>
                보기
            </button>

            <WaveformModal
                audioBlob={audioBlob}
                audioUrl={audioUrl}
                modalOpen={modalOpen}
                handleCloseModal={handleCloseModal}
                setRepeatCount={setRepeatCount}
            />

            {/* <div
                className='absolute -bottom-1/2 right-20 flex h-[400px] w-[400px] translate-y-1/2 flex-col items-center overflow-hidden rounded-[10px] bg-white'
                style={{ display: modalOpen ? 'flex' : 'none' }}
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
                <div className='relative h-full w-full px-3 pb-5 pt-2.5'>
                    {blob && (
                        <AudioVisualizer
                            ref={visualizerRef}
                            blob={blob}
                            width={376}
                            height={300}
                            barWidth={1}
                            gap={0}
                            barColor={'#6979F8'}
                        />
                    )}
                </div>
            </div> */}
        </div>
    );
}
