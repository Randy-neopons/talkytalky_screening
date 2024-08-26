import { useCallback, useState, type ChangeEventHandler } from 'react';
import type { GetServerSideProps } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { isAxiosError } from 'axios';
import { getCookie } from 'cookies-next';
import dayjs from 'dayjs';

import { partList, subtestList } from '@/stores/testStore';
import Container from '@/components/common/Container';
import { getSessionListAPI } from '@/api/questions';

import searchIcon from 'public/static/images/search-icon.png';

import type { TestSession } from '@/types/types';

const sessionList = [
    {
        sessionId: 1,
        patientName: '조대형',
        patientBirthdate: '1992-07-24',
        regDate: '2024-05-18',
        progress: 45,
        currentPartId: 3,
    },
    {
        sessionId: 3,
        patientName: '조대형',
        patientBirthdate: '1992-07-24',
        regDate: '2024-05-18',
        progress: 100,
        currentPartId: 3,
    },
];

export default function SessionListPage({ sessionList }: { sessionList: TestSession[] }) {
    const router = useRouter(); // next router

    const [searchInput, setSearchInput] = useState('');
    const handleChangeSearchInput = useCallback<ChangeEventHandler<HTMLInputElement>>(e => {
        setSearchInput(e.target.value);
    }, []);

    // 이어하기
    const handleClickContinue = useCallback(
        (sessionId: number, currentPartId: number) => () => {
            const subtestId = partList.find(v => v.partId === currentPartId)?.subtestId;
            const pathname = subtestList.find(v => v.subtestId === subtestId)?.pathname;
            console.log(sessionId, currentPartId);
            console.log('pathname', pathname);
            pathname && router.push(`/sessions/${sessionId}/subtests/${pathname}`);
        },
        [router],
    );

    // 결과보기
    const handleClickResult = useCallback(
        (sessionId: number) => () => {
            router.push(`/sessions/${sessionId}/result`);
        },
        [router],
    );

    return (
        <Container>
            <div className='relative w-full'>
                <h1 className='text-center font-jalnan text-head-1'>평가 내역</h1>
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
                                <span className='font-jalnan text-black text-head-2'>{v.patientName}</span>
                                <span className='text-black text-body-2'>
                                    {dayjs(v.patientBirthdate).format('YYYY.MM.DD')} (만 {dayjs().diff(dayjs(v.patientBirthdate), 'year')}
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

        // 세션 목록 fetch
        const responseData = await getSessionListAPI({ jwt: accessToken });
        const sessionList = responseData.sessions;

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
