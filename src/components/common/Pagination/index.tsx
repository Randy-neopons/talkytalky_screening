import { useCallback, type Dispatch, type SetStateAction } from 'react';

import { ChevronLeftIcon, ChevronRightIcon } from '@/components/common/icons';

// 현재 페이지 좌우로 페이지 번호 생성
const makePages = ({ currentPage, lastPage }: { currentPage: number; lastPage: number }) => {
    // pagination 시작
    let startPage = currentPage - 2;
    while (startPage <= 0) {
        startPage += 1;
    }

    // pagination 마지막
    const endPage = Math.min(startPage + 4, lastPage);

    // startPage ~ endPage 사이의 정수
    const pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

    return pages;
};

// 페이지네이션 컴포넌트
export default function Pagination({
    currentPage,
    setCurrentPage,
    lastPage,
}: {
    currentPage: number;
    setCurrentPage: Dispatch<SetStateAction<number>>;
    lastPage: number;
}) {
    const handleClickPrev = useCallback(() => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
        }
    }, [currentPage, setCurrentPage]);

    const handleClickNext = useCallback(() => {
        if (currentPage < lastPage) {
            setCurrentPage(prev => prev + 1);
        }
    }, [currentPage, lastPage, setCurrentPage]);

    const handleClickPage = useCallback(
        (page: number) => () => {
            setCurrentPage(page);
        },
        [setCurrentPage],
    );

    return (
        <div className='flex gap-7.5'>
            <button onClick={handleClickPrev} disabled={currentPage <= 1}>
                <ChevronLeftIcon color={currentPage <= 1 ? '#DEE2E6' : 'black'} />
            </button>
            <ul className='flex gap-[45px]'>
                {makePages({ currentPage, lastPage }).map(page => (
                    <li key={page}>
                        <button
                            className='font-bold text-body-1'
                            style={{ color: currentPage === page ? '#6979F8' : '#868E96' }}
                            onClick={handleClickPage(page)}
                        >
                            {page}
                        </button>
                    </li>
                ))}
            </ul>
            <button onClick={handleClickNext} disabled={currentPage >= lastPage}>
                <ChevronRightIcon color={currentPage >= lastPage ? '#DEE2E6' : 'black'} />
            </button>
        </div>
    );
}
