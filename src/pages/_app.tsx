import '@/styles/globals.css';
import { useEffect, useState } from 'react';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';

import { HydrationBoundary, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import nProgress from 'nprogress';

import AppLayout from '@/components/AppLayout';
import { ModalProvider } from '@/components/common/Modal/context';

import type { NextPageWithLayout } from '@/types/types';

nProgress.configure({ showSpinner: false, speed: 1000 });

type AppPropsWithLayout = AppProps & {
    Component: NextPageWithLayout;
};

export default function App({ Component, pageProps }: AppPropsWithLayout) {
    const [queryClient] = useState(() => new QueryClient());
    const router = useRouter();

    const getLayout =
        Component.getLayout ??
        (page => (
            <AppLayout isLoggedIn={pageProps.isLoggedIn} progress={pageProps.progress}>
                {page}
            </AppLayout>
        ));

    // 페이지 전환 시 필요한 이벤트
    useEffect(() => {
        // 페이지 전환 시작
        const start = (url: string) => {
            nProgress.start();
        };

        // 페이지 전환 종료
        const end = () => {
            // nprogress
            nProgress.done();
        };

        router.events.on('routeChangeStart', start);
        router.events.on('routeChangeComplete', end);
        router.events.on('routeChangeError', end);

        return () => {
            router.events.off('routeChangeStart', start);
            router.events.off('routeChangeComplete', end);
            router.events.off('routeChangeError', end);
        };
    }, [router]);

    return (
        <QueryClientProvider client={queryClient}>
            <HydrationBoundary state={pageProps.dehydratedState}>
                <ModalProvider>{getLayout(<Component {...pageProps} />)}</ModalProvider>
            </HydrationBoundary>
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
}
