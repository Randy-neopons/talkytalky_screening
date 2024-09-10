import type { ReactNode } from 'react';

export default function Container({ children }: { children: ReactNode }) {
    return (
        <div className='py-15 container relative mx-auto flex flex-col flex-nowrap items-center px-5 lg:max-w-[768px] xl:max-w-[1000px] xl:px-0 xl:pt-20'>
            {children}
        </div>
    );
}
