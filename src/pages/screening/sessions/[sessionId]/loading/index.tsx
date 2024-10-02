import { useCallback, useEffect, useRef, useState, type ReactElement } from 'react';
import type { GetServerSideProps } from 'next';
import Image from 'next/image';
import { useRouter } from 'next/router';

import { useTimerActions } from '@/stores/timerStore';
import Container from '@/components/common/Container';
import ScreeningAppLayout from '@/components/screening/ScreeningAppLayout';
import { generateScreeningTestResultAPI } from '@/api/screening';

import analyzingImg from 'public/static/images/analyzing.gif';

import type { NextPageWithLayout } from '@/types/types';

// 간이언어평가 완료 페이지
const ScreeningResultLoadingPage: NextPageWithLayout = () => {
    const router = useRouter();

    const { setTestStart } = useTimerActions();

    useEffect(() => {
        setTestStart && setTestStart(false);
    }, [setTestStart]);

    useEffect(() => {
        const sessionId = Number(router.query.sessionId);
        const generateResult = async () => {
            await generateScreeningTestResultAPI({ sessionId });
            router.push(`/screening/sessions/${sessionId}/result`);
        };

        generateResult().catch(err => {
            console.error(err);
        });
    }, [router]);

    return (
        <Container>
            <Image src={analyzingImg} alt='analyze' className='mt-[140px] xl:mt-[180px]' width={260} height={260} />
            <h1 className='mt-10 font-jalnan text-head-1'>검사결과 분석중...</h1>
        </Container>
    );
};

ScreeningResultLoadingPage.getLayout = function getLayout(page: ReactElement) {
    return <ScreeningAppLayout>{page}</ScreeningAppLayout>;
};

export default ScreeningResultLoadingPage;

export const getServerSideProps: GetServerSideProps = async context => {
    try {
        const sessionId = Number(context.query.sessionId);
        if (!sessionId) {
            return {
                redirect: {
                    destination: '/das',
                    permanent: true,
                },
            };
        }

        return {
            props: {},
        };
    } catch (err) {
        return {
            redirect: {
                destination: '/das',
                permanent: true,
            },
        };
    }
};
