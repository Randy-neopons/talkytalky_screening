import { useCallback, type ReactElement } from 'react';
import type { GetServerSideProps } from 'next';
import Image from 'next/image';
import { useRouter } from 'next/router';

import Container from '@/components/common/Container';
import ScreeningAppLayout from '@/components/screening/ScreeningAppLayout';

import completeImg from 'public/static/images/complete-img.png';

import type { NextPageWithLayout } from '@/types/types';

// 간이언어평가 완료 페이지
const ScreeningCompletePage: NextPageWithLayout = () => {
    const router = useRouter();

    // 결과 확인 페이지로 이동
    const handleClickResult = useCallback(() => {
        try {
            const sessionId = Number(router.query.sessionId);
            router.push(`/screening/sessions/${sessionId}/result`);
        } catch (err) {
            console.error(err);
        }
    }, [router]);

    return (
        <Container>
            <Image src={completeImg} alt='complete' className='mt-[140px] xl:mt-[180px]' width={86} height={116} />
            <h1 className='mt-10 font-jalnan text-head-1'>평가가 완료되었습니다.</h1>
            <button type='button' className='mt-[60px] btn btn-large btn-contained xl:mt-20' onClick={handleClickResult}>
                결과 확인
            </button>
        </Container>
    );
};

ScreeningCompletePage.getLayout = function getLayout(page: ReactElement) {
    return <ScreeningAppLayout>{page}</ScreeningAppLayout>;
};

export default ScreeningCompletePage;

export const getServerSideProps: GetServerSideProps = async context => {
    try {
        const sessionId = Number(context.query.sessionId);
        if (!sessionId) {
            return {
                redirect: {
                    destination: '/',
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
                destination: '/',
                permanent: true,
            },
        };
    }
};
