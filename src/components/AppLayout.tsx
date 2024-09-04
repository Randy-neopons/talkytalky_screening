import { useEffect, type ReactNode } from 'react';
import Head from 'next/head';

import { useTestStart } from '@/stores/timerStore';
import { TALKYTALKY_URL } from '@/utils/const';
import { useUserQuery } from '@/hooks/user';

import Timer from './common/Timer';

export default function AppLayout({ isLoggedIn, progress, children }: { isLoggedIn?: boolean; progress?: number; children: ReactNode }) {
    const { data: user, error } = useUserQuery();
    const testStart = useTestStart();

    useEffect(() => {
        if (error || !isLoggedIn) {
            alert('로그인이 필요합니다.\n토키토키 로그인 페이지로 이동합니다.');
            window.location.href = `${TALKYTALKY_URL}/login`;
            return;
        }
    }, [error, isLoggedIn]);

    return (
        isLoggedIn && (
            <>
                <Head>
                    <title>말운동평가</title>
                    <meta name='description' content='Dysarthria Assessment System' />
                    <link rel='icon' href='/favicon.ico' />
                </Head>
                <header className='fixed left-0 top-0 z-10 flex h-20 w-full items-center justify-center bg-accent1'>
                    <div className='flex w-full max-w-screen-md justify-between px-5 xl:max-w-screen-xl xl:px-[140px]'>
                        <span className='mr-auto font-bold text-neutral11 text-head-2'>말운동 평가</span>
                        {testStart && (
                            <div className='flex items-center gap-5 xl:gap-[30px]'>
                                {progress !== undefined && progress !== null && (
                                    <>
                                        <span className='text-neutral11 text-head-2'>진행률 {progress}%</span>
                                        <svg xmlns='http://www.w3.org/2000/svg' width='2' height='24' viewBox='0 0 2 24' fill='none'>
                                            <path d='M1 1V23' stroke='white' strokeWidth='2' strokeLinecap='round' />
                                        </svg>
                                    </>
                                )}

                                <Timer />
                            </div>
                        )}
                    </div>
                </header>
                <main className='pt-20'>{children}</main>
            </>
        )
    );
}
