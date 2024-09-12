import { useCallback, useEffect, type ReactNode } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

import { useTestStart, useTimerActions } from '@/stores/timerStore';
import { useScreeningTestSessionQuery } from '@/hooks/screening';

import { useModal } from '../common/Modal/context';
import Timer from '../common/Timer';

// 간이언어평가 공통 레이아웃
export default function ScreeningAppLayout({ children }: { children: ReactNode }) {
    const router = useRouter();

    const { data } = useScreeningTestSessionQuery({ sessionId: Number(router.query.sessionId) });
    const testStart = useTestStart();
    const { reset } = useTimerActions();
    const { handleOpenModal } = useModal();

    // 홈으로 버튼
    const onClickHome = useCallback(() => {
        if (router.pathname === '/screening') {
            return;
        }

        // 홈 화면 이동 모달
        handleOpenModal({
            content: '평가를 종료하고 홈 화면으로 이동하시겠습니까?',
            onOk: () => {
                router.push('/screening');
            },
        });
    }, [handleOpenModal, router]);

    // 타이머 리셋
    useEffect(() => {
        if (data) {
            reset(data.testInfo.currentTime);
        }
    }, [data, reset]);

    return (
        <>
            <Head>
                <title>간이언어평가</title>
                <meta name='description' content='Dysarthria Assessment System' />
                <link rel='icon' href='/favicon.ico' />
            </Head>
            <header className='fixed left-0 top-0 z-10 flex h-20 w-full items-center justify-center bg-accent1'>
                <div className='flex w-full max-w-screen-md justify-between px-5 xl:max-w-screen-xl xl:px-[140px]'>
                    <button className='mr-auto font-bold text-neutral11 text-head-2' onClick={onClickHome}>
                        간이언어평가
                    </button>
                    {testStart && (
                        <div className='flex items-center gap-5 xl:gap-7.5'>
                            {data?.testInfo.progress !== undefined && data?.testInfo.progress !== null && (
                                <>
                                    <span className='text-neutral11 text-head-2'>진행률 {data?.testInfo.progress}%</span>
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
    );
}
