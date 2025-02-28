import '@/styles/globals.css';
import { useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';

import { HydrationBoundary, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import nProgress from 'nprogress';

import { ModalProvider } from '@/components/common/Modal/context';
import AppLayout from '@/components/das/AppLayout';

import type { NextPageWithLayout } from '@/types/types';

import 'react-toastify/dist/ReactToastify.css';

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
                <ToastContainer
                    position='top-center' // 알람 위치 지정
                    autoClose={2000} // 자동 off 시간
                    closeButton={false}
                    hideProgressBar // 진행시간바 숨김
                    closeOnClick // 클릭으로 알람 닫기
                    rtl={false} // 알림 좌우 반전
                    pauseOnFocusLoss // 화면을 벗어나면 알람 정지
                    pauseOnHover // 마우스를 올리면 알람 정지
                    theme='dark'
                    toastStyle={{
                        padding: '10px',
                        borderRadius: '6px',
                        backgroundColor: '#212429',
                        width: 'fit-content',
                        minHeight: 'fit-content',
                    }}
                    // bodyStyle={{ padding: 0, margin: 0 }}
                    style={{
                        width: 'fit-content',
                        height: 'fit-content',
                        padding: 0,
                        top: '64px',
                    }}
                />
            </HydrationBoundary>
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
}
