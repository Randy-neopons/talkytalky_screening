import { useCallback } from 'react';
import type { GetServerSideProps } from 'next';
import Image from 'next/image';
import { useRouter } from 'next/router';

import { getCookie } from 'cookies-next';

import Container from '@/components/common/Container';

import completeImg from 'public/static/images/complete-img.png';

// Stress Testing 문항 페이지
export default function CompletePage() {
    const router = useRouter();

    // 결과 확인 페이지로 이동
    const handleClickResult = useCallback(() => {
        try {
            const sessionId = Number(router.query.sessionId);
            router.push(`/das/sessions/${sessionId}/result`);
        } catch (err) {
            console.error(err);
        }
    }, [router]);

    return (
        <Container>
            <Image src={completeImg} alt='complete' className='mt-[200px] xl:mt-[180px]' width={86} height={116} />
            <h1 className='mt-10 font-jalnan text-head-1'>검사가 완료되었습니다.</h1>
            <span className='mt-[10px] text-body-2'>검사결과는 언제든지 다시확인하실 수 있습니다.</span>
            <div>
                <button type='button' className='mt-20 btn btn-large btn-contained' onClick={handleClickResult}>
                    결과 확인하기
                </button>
            </div>
        </Container>
    );
}

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

        const accessToken = getCookie('jwt', context);
        if (!accessToken || accessToken === 'undefined') {
            return {
                props: {
                    isLoggedIn: false,
                },
            };
        }

        return {
            props: { isLoggedIn: true },
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
