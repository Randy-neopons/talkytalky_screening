import { useCallback, type ReactNode } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

import { useModal } from '../common/Modal/context';

// 간이언어평가 공통 레이아웃
export default function ScreeningAppLayout({ children }: { children: ReactNode }) {
    const router = useRouter();

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
                </div>
            </header>
            <main className='pt-20'>{children}</main>
        </>
    );
}
