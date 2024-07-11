import type { ReactNode } from 'react';

export default function Container({ children }: { children: ReactNode }) {
    return (
        <div className='xy:pt-20 container relative mx-auto flex flex-col flex-nowrap items-center py-[60px] lg:max-w-[768px] xl:max-w-[1000px]'>
            {children}
        </div>
    );
}
