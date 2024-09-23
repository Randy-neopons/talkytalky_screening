import { useCallback, useState, type ChangeEventHandler, type KeyboardEventHandler } from 'react';
import type { GetServerSideProps } from 'next';
import Image from 'next/image';
import { useRouter } from 'next/router';

import { dehydrate, QueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { getCookie } from 'cookies-next';
import dayjs from 'dayjs';

import { partList, subtestList } from '@/stores/testStore';
import Container from '@/components/common/Container';
import Pagination from '@/components/common/Pagination';
import { sessionsQueryKey, useSessionsQuery } from '@/hooks/questions';
import { getSessionListAPI } from '@/api/das';

import searchIcon from 'public/static/images/search-icon.png';

export default function SessionListPage() {
    const router = useRouter(); // next router

    // filter
    const [keyword, setKeyword] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const { data } = useSessionsQuery({ keyword, page, pageSize });

    // 검색어 input
    const [searchInput, setSearchInput] = useState('');
    const handleChangeSearchInput = useCallback<ChangeEventHandler<HTMLInputElement>>(e => {
        setSearchInput(e.target.value);
    }, []);

    // 엔터 입력 시 실제 검색
    const handleSearchKeyDown = useCallback<KeyboardEventHandler<HTMLInputElement>>(
        e => {
            if (e.key === 'Enter') {
                setKeyword(searchInput);
                setPage(1); // 검색 시 페이지 초기화
            }
        },
        [searchInput],
    );
    const handleClickSearch = useCallback(() => {
        setKeyword(searchInput);
        setPage(1); // 검색 시 페이지 초기화
    }, [searchInput]);

    // 이어하기
    const handleClickContinue = useCallback(
        (sessionId: number, currentPartId: number) => () => {
            if (currentPartId) {
                const subtestId = partList.find(v => v.partId === currentPartId)?.subtestId;
                const subtestItem = subtestList.find(v => v.subtestId === subtestId);

                if (subtestItem) {
                    router.push(`/das/sessions/${sessionId}/subtests/${subtestItem.pathname}/questions?currentPartId=${currentPartId}`);
                }
            } else {
            }
        },
        [router],
    );

    // 결과보기
    const handleClickResult = useCallback(
        (sessionId: number) => () => {
            router.push(`/das/sessions/${sessionId}/result`);
        },
        [router],
    );

    return (
        <Container>
            <div className='relative w-full'>
                <h1 className='text-center font-jalnan text-head-1'>평가 내역</h1>
                <div className='absolute right-0 top-0 border-b border-neutral2 py-2'>
                    <input
                        className='bg-transparent'
                        placeholder='이름 검색하기'
                        value={searchInput}
                        onChange={handleChangeSearchInput}
                        onKeyDown={handleSearchKeyDown}
                    />
                    <button onClick={handleClickSearch}>
                        <Image src={searchIcon} alt='search' className='absolute right-0 top-1/2 -translate-y-1/2' width={24} height={24} />
                    </button>
                </div>
            </div>

            {data?.sessions?.length ? (
                <>
                    <ul className='mt-20 flex w-full flex-col gap-7.5'>
                        {data?.sessions?.map(v => (
                            <li key={v.testSessionId} className='flex items-center justify-between rounded-base bg-white p-7.5 shadow-base'>
                                <div className='flex gap-[10px]'>
                                    <div className='flex items-center gap-[10px]'>
                                        <span className='font-jalnan text-black text-head-2'>{v.patientName}</span>
                                        <span className='text-black text-body-2'>
                                            {dayjs(v.patientBirthdate).format('YYYY.MM.DD')} (만{' '}
                                            {dayjs().diff(dayjs(v.patientBirthdate), 'year')}
                                            세)
                                        </span>
                                    </div>
                                </div>
                                <div className='flex items-center gap-5'>
                                    <span className='text-neutral4 text-body-2'>{dayjs(v.regDate).format('YYYY.MM.DD')}</span>
                                    <div className='flex items-center gap-[6px]'>
                                        <div className='relative h-[14px] w-[94px] rounded-full bg-[#D9D9D9]'>
                                            <div
                                                className={`absolute h-[14px] rounded-full bg-accent1`}
                                                style={{ width: `${(v.progress * 94) / 100}px` }}
                                            ></div>
                                        </div>

                                        <span className='text-neutral4 text-body-2'>{v.progress}%</span>
                                    </div>
                                    {v.status === '3' ? (
                                        <button className='btn btn-small btn-contained' onClick={handleClickResult(v.testSessionId)}>
                                            결과보기
                                        </button>
                                    ) : (
                                        <button
                                            className='btn btn-small btn-outlined'
                                            onClick={handleClickContinue(v.testSessionId, v.currentPartId)}
                                        >
                                            이어하기
                                        </button>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                    <div className='mt-20 flex w-full justify-center'>
                        <Pagination currentPage={page} setCurrentPage={setPage} lastPage={Math.ceil(data.count / pageSize)} />
                    </div>
                </>
            ) : (
                <div className='mt-15 flex h-[115px] w-full items-center justify-center rounded-base bg-white shadow-base xl:mt-20 xl:h-[230px]'>
                    <p className='text-neutral4 text-body-1'>평가내역이 없습니다.</p>
                </div>
            )}
        </Container>
    );
}

export const getServerSideProps: GetServerSideProps = async context => {
    try {
        const accessToken = getCookie('jwt', context);
        if (!accessToken || accessToken === 'undefined') {
            return {
                props: {
                    isLoggedIn: false,
                },
            };
        }

        const queryClient = new QueryClient();
        await queryClient.prefetchQuery({
            queryKey: [sessionsQueryKey],
            queryFn: () => getSessionListAPI({ jwt: accessToken }),
        });

        return {
            props: {
                isLoggedIn: true,
                dehydratedState: dehydrate(queryClient),
            },
        };
    } catch (err) {
        if (isAxiosError(err)) {
            if (err.response?.status === 401) {
                return {
                    props: {
                        isLoggedIn: false,
                    },
                };
            }
        }

        return {
            redirect: {
                destination: '/das',
                permanent: true,
            },
        };
    }
};
