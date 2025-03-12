import { useCallback, useEffect, useMemo, type ReactNode } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

import { getCookie } from 'cookies-next';

import { useCurrentSubTest, useTestActions } from '@/stores/testStore';
import { useTestStart } from '@/stores/timerStore';
import { TALKYTALKY_URL } from '@/utils/const';
import { useModal } from '@/components/common/Modal/context';
import Timer from '@/components/common/Timer';
import { useConductedSubtestsQuery } from '@/hooks/das';
import { useUserQuery } from '@/hooks/user';

import { ChevronRightIcon } from '../common/icons';

export default function AppLayout({ isLoggedIn, progress, children }: { isLoggedIn?: boolean; progress?: number; children: ReactNode }) {
    const router = useRouter();

    const { data: user, error } = useUserQuery();
    const testStart = useTestStart();
    const currentSubtest = useCurrentSubTest();
    const { setCurrentSubtest } = useTestActions();
    const { modalOpen, handleOpenModal, handleCloseModal } = useModal();

    // 홈으로 버튼
    const onClickHome = useCallback(() => {
        if (['/das', '/das/sessions', '/das/sessions/[sessionId]/result'].includes(router.pathname)) {
            router.push('/das');
            return;
        }

        handleOpenModal({
            title: '검사를 종료하시겠습니까?',
            content: '지금까지 진행한 검사는 결과페이지에서 이어하실 수 있습니다.',
            cancelText: '아니오',
            okText: '네',
            onOk: () => {
                router.push('/das');
            },
        });

        // if (window.confirm('검사를 종료하시겠습니까?')) {
        //     router.push('/das');
        // }
    }, [handleOpenModal, router]);

    const { data: subtestsData } = useConductedSubtestsQuery({ sessionId: Number(router.query.sessionId), jwt: getCookie('jwt') || '' });

    useEffect(() => {
        if (error || !isLoggedIn) {
            alert('로그인이 필요합니다.\n토키토키 로그인 페이지로 이동합니다.');
            window.location.href = `${TALKYTALKY_URL}/login`;
            return;
        }
    }, [error, isLoggedIn]);

    // 현재 소검사 설정
    useEffect(() => {
        const pathnames = router.pathname.split('/');
        const pathnameIndex = pathnames.findIndex(v => v === 'subtests');
        console.log(pathnameIndex);
        // 소검사 페이지가 아니면 초기화
        if (pathnameIndex === -1) {
            setCurrentSubtest(null);
        }

        const subtestPathname = pathnames[pathnameIndex + 1];
        console.log(subtestPathname);
        const subtest = subtestsData?.subtests?.find(v => v.pathname === subtestPathname) || null;
        console.log(subtestsData);
        setCurrentSubtest(subtest);
    }, [router, setCurrentSubtest, subtestsData]);

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
                        <div className='flex items-center gap-2'>
                            <button className='font-bold text-neutral11 text-head-2' onClick={onClickHome}>
                                <span className='hidden xl:inline'>마비말장애 평가 시스템 (DAS)</span>
                                <span className='xl:hidden'>DAS</span>
                            </button>

                            {currentSubtest && (
                                <>
                                    <ChevronRightIcon />
                                    <h1 className='text-white text-head-2'>
                                        {currentSubtest.subtestTitleEn} : {currentSubtest.subtestTitle}
                                    </h1>
                                </>
                            )}
                        </div>
                        {testStart && (
                            <div className='flex items-center gap-5 xl:gap-7.5'>
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
