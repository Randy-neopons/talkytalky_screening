import type { ReactNode } from 'react';

export default function Container({ children }: { children: ReactNode }) {
    return (
        <div className='container relative mx-auto flex w-full flex-col flex-nowrap items-center px-5 py-15 lg:max-w-[768px] xl:max-w-[1000px] xl:px-0 xl:pt-20'>
            {children}
        </div>
    );
}
