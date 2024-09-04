import '@/styles/globals.css';
import { useState } from 'react';
import type { AppProps } from 'next/app';

import { HydrationBoundary, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import AppLayout from '@/components/AppLayout';

export default function App({ Component, pageProps }: AppProps) {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <QueryClientProvider client={queryClient}>
            <HydrationBoundary state={pageProps.dehydratedState}>
                <AppLayout isLoggedIn={pageProps.isLoggedIn} progress={pageProps.progress}>
                    <Component {...pageProps} />
                </AppLayout>
            </HydrationBoundary>
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
}
