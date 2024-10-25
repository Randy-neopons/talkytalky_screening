import { useCallback, useState, type ChangeEventHandler } from 'react';
import Image from 'next/image';

import styles from './FontSizeButton.module.css';

import fontSizeIcon from 'public/static/images/font-size-icon.png';

type FontSizeButtonProps = {
    fontSize: number;
    handleChangeFontSize: ChangeEventHandler<HTMLInputElement>;
};

// 폰트 크기 조절 버튼 (모달 포함)
export function FontSizeButton({ fontSize, handleChangeFontSize }: FontSizeButtonProps) {
    const [modalOpen, setModalOpen] = useState(false);
    const handleOpenModal = useCallback(() => {
        setModalOpen(true);
    }, []);
    const handleCloseModal = useCallback(() => {
        setModalOpen(false);
    }, []);

    return (
        <div className='relative flex items-center'>
            <button type='button' onClick={handleOpenModal}>
                <Image src={fontSizeIcon} alt='font-icon' className='h-auto w-15' />
            </button>
            <div
                className='absolute bottom-0 left-20 flex w-[250px] flex-col items-center justify-center overflow-hidden rounded-[10px] bg-white'
                style={{ display: modalOpen ? 'flex' : 'none' }}
                // onClick={handleCloseModal}
            >
                <div className='relative w-full bg-accent1 p-2'>
                    <h6 className='text-center font-bold text-white text-body-2'>글씨 크기 조절</h6>
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
                <div className='w-full px-3 pb-5 pt-2.5'>
                    <div className='mb-[10px] flex w-full justify-between'>
                        <span>기본</span>
                        <span>크게</span>
                    </div>
                    <div className='relative flex h-[18px] w-full items-center'>
                        <div className='relative flex w-full items-center justify-between'>
                            <div className='absolute h-[1px] w-full bg-neutral7'></div>
                            <div className='h-[10px] w-[10px] rounded-full bg-accent3'></div>
                            <div className='h-[10px] w-[10px] rounded-full bg-accent3'></div>
                            <div className='h-[10px] w-[10px] rounded-full bg-accent3'></div>
                        </div>
                        <input
                            type='range'
                            name='font'
                            min={1}
                            max={3}
                            step={1}
                            className={styles.slider}
                            value={fontSize}
                            onChange={handleChangeFontSize}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
