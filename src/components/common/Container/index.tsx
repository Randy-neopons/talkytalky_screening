import type { ReactNode } from 'react';

export default function Container({ children }: { children: ReactNode }) {
    return <div className='container mx-auto flex flex-col flex-nowrap items-center pt-[60px] xl:pt-20'>{children}</div>;
}
