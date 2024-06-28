import type { ReactNode } from 'react';

export default function Container({ children }: { children: ReactNode }) {
    return <div className='container mx-auto pt-[60px] xl:pt-20 flex flex-col flex-nowrap items-center'>{children}</div>;
}
