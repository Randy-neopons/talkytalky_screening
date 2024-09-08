import type { ReactNode } from 'react';
import Head from 'next/head';

// 간이언어평가 공통 레이아웃
export default function ScreeningAppLayout({ children }: { children: ReactNode }) {
    return (
        <>
            <Head>
                <title>간이언어평가</title>
                <meta name='description' content='Dysarthria Assessment System' />
                <link rel='icon' href='/favicon.ico' />
            </Head>
            <header className='fixed left-0 top-0 z-10 flex h-20 w-full items-center justify-center bg-accent1'>
                <div className='flex w-full max-w-screen-md justify-between px-5 xl:max-w-screen-xl xl:px-[140px]'>
                    <span className='mr-auto font-bold text-neutral11 text-head-2'>간이언어평가</span>
                </div>
            </header>
            <main className='pt-20'>{children}</main>
        </>
    );
}
