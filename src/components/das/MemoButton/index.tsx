import { useCallback, useState, type ChangeEventHandler } from 'react';
import Image from 'next/image';

import memoIcon from 'public/static/images/memo-icon.png';

type MemoButtonProps = {
    memo: string;
    handleChangeMemo: ChangeEventHandler<HTMLTextAreaElement>;
};

// 메모 버튼 (모달 포함)
export function MemoButton({ memo, handleChangeMemo }: MemoButtonProps) {
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
                <Image src={memoIcon} alt='memo-icon' className='h-auto w-15' />
            </button>
            <div
                className='absolute bottom-0 right-20 flex h-[250px] w-[300px] flex-col items-center overflow-hidden rounded-[10px] bg-white'
                style={{ display: modalOpen ? 'flex' : 'none' }}
            >
                <div className='relative w-full bg-accent1 p-2'>
                    <h6 className='text-center font-bold text-white text-body-2'>메모</h6>
                    <button className='absolute right-2 top-1/2 -translate-y-1/2' onClick={handleCloseModal}>
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
                    <textarea className='h-full w-full' name='memo' value={memo} onChange={handleChangeMemo} />
                </div>
            </div>
        </div>
    );
}
