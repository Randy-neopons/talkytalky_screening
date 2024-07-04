import type { ReactNode } from 'react';

export default function Container({ children }: { children: ReactNode }) {
    return <div className='xy:pt-20 container mx-auto flex flex-col flex-nowrap items-center py-[60px]'>{children}</div>;
}
