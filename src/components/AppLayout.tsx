import type { ReactNode } from 'react';

import { ClockIcon } from './icons';

export default function AppLayout({ children }: { children: ReactNode }) {
    return (
        <>
            <header className='fixed left-0 top-0 z-10 flex h-20 w-full items-center justify-center bg-accent1'>
                <div className='flex w-full max-w-screen-md justify-between px-5 xl:max-w-screen-xl xl:px-[140px]'>
                    <span className='mr-auto font-bold text-neutral11 text-head-2'>말운동 평가</span>
                    <div className='flex items-center gap-5 xl:gap-[30px]'>
                        <span className='text-neutral11 text-head-2'>진행률 13%</span>
                        <svg xmlns='http://www.w3.org/2000/svg' width='2' height='24' viewBox='0 0 2 24' fill='none'>
                            <path d='M1 1V23' stroke='white' strokeWidth='2' strokeLinecap='round' />
                        </svg>
                        <div className='flex items-center gap-2 xl:gap-[10px]'>
                            <ClockIcon />
                            <span className='text-neutral11 text-head-2'>00:18:52</span>
                        </div>
                    </div>
                </div>
            </header>
            <main className='pt-20'>{children}</main>
        </>
    );
}
