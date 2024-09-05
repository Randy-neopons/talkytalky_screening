import '@/styles/globals.css';
import { useState } from 'react';
import type { AppProps } from 'next/app';

import { HydrationBoundary, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import AppLayout from '@/components/AppLayout';

import type { NextPageWithLayout } from '@/types/types';

type AppPropsWithLayout = AppProps & {
    Component: NextPageWithLayout;
};

export default function App({ Component, pageProps }: AppPropsWithLayout) {
    const [queryClient] = useState(() => new QueryClient());

    const getLayout =
        Component.getLayout ??
        (page => (
            <AppLayout isLoggedIn={pageProps.isLoggedIn} progress={pageProps.progress}>
                {page}
            </AppLayout>
        ));

    return (
        <QueryClientProvider client={queryClient}>
            <HydrationBoundary state={pageProps.dehydratedState}>{getLayout(<Component {...pageProps} />)}</HydrationBoundary>
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
}
