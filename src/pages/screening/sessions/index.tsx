import { useCallback, useState, type ChangeEventHandler, type ReactElement } from 'react';
import type { GetServerSideProps } from 'next';
import Image from 'next/image';
import { useRouter } from 'next/router';

import { isAxiosError } from 'axios';
import { getCookie } from 'cookies-next';
import dayjs from 'dayjs';

import Container from '@/components/common/Container';
import ScreeningAppLayout from '@/components/screening/ScreeningAppLayout';
import { getSessionListAPI } from '@/api/questions';

import searchIcon from 'public/static/images/search-icon.png';

import type { ScreeningTestSession } from '@/types/screening';
import type { NextPageWithLayout } from '@/types/types';

// 간이언어평가 내역
const ScreeningSessionListPage: NextPageWithLayout<{ sessionList: ScreeningTestSession[] }> = ({ sessionList }) => {
    const router = useRouter(); // next router

    const [searchInput, setSearchInput] = useState('');
    const handleChangeSearchInput = useCallback<ChangeEventHandler<HTMLInputElement>>(e => {
        setSearchInput(e.target.value);
    }, []);

    // 이어하기
    const handleClickContinue = useCallback(
        (sessionId: number, currentPathname: string) => () => {
            if (currentPathname) {
                router.push(`/screening/sessions/${sessionId}/${currentPathname}`);
            }
        },
        [router],
    );

    // 결과보기
    const handleClickResult = useCallback(
        (sessionId: number) => () => {
            router.push(`/screening/sessions/${sessionId}/result`);
        },
        [router],
    );

    return (
        <Container>
            <div className='relative w-full'>
                <h1 className='text-center font-jalnan text-head-1'>검사 내역</h1>
                <div className='absolute right-0 top-0 border-b border-neutral2 py-2'>
                    <input className='bg-transparent' placeholder='이름 검색하기' value={searchInput} onChange={handleChangeSearchInput} />
                    <Image src={searchIcon} alt='search' className='absolute right-0 top-1/2 -translate-y-1/2' width={24} height={24} />
                </div>
            </div>

            <ul className='mt-20 flex w-full flex-col gap-[30px]'>
                {sessionList.map(v => (
                    <li key={v.testSessionId} className='flex items-center justify-between rounded-base bg-white p-[30px] shadow-base'>
                        <div className='flex gap-[10px]'>
                            <div className='flex items-center gap-[10px]'>
                                <span className='font-jalnan text-black text-head-2'>{v.testeeName}님</span>
                                <span className='text-black text-body-2'>
                                    {dayjs(v.testeeBirthdate).format('YYYY.MM.DD')} (만 {dayjs().diff(dayjs(v.testeeBirthdate), 'year')}
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
                                    onClick={handleClickContinue(v.testSessionId, v.currentPathname)}
                                >
                                    이어하기
                                </button>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
        </Container>
    );
};

ScreeningSessionListPage.getLayout = function getLayout(page: ReactElement) {
    return <ScreeningAppLayout>{page}</ScreeningAppLayout>;
};

export default ScreeningSessionListPage;

export const getServerSideProps: GetServerSideProps = async context => {
    try {
        // const accessToken = getCookie('jwt', context);
        // if (!accessToken || accessToken === 'undefined') {
        //     return {
        //         props: {
        //             isLoggedIn: false,
        //         },
        //     };
        // }

        // 세션 목록 fetch
        // const responseData = await getSessionListAPI({ jwt: accessToken });
        // const sessionList = responseData.sessions;

        const sessionList = [
            {
                testSessionId: 1,
                testeeName: '조대형',
                testeeBirthdate: '1992-07-24',
                regDate: '2024-05-18',
                status: '3',
                progress: 90,
            },
            {
                testSessionId: 2,
                testeeName: '조대형',
                testeeBirthdate: '1992-07-24',
                regDate: '2024-05-18',
                status: '3',
                progress: 100,
            },
        ];

        return {
            props: {
                isLoggedIn: true,
                sessionList,
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
                destination: '/',
                permanent: true,
            },
        };
    }
};
