import { useEffect } from 'react';
import type { GetServerSideProps } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { getCookie, setCookie } from 'cookies-next';

import { useTimerActions } from '@/stores/timerStore';
import Container from '@/components/common/Container';

import testResultIcon from 'public/static/images/test-result-icon.png';
import testStartIcon from 'public/static/images/test-start-icon.png';

export default function Home() {
    const router = useRouter();

    const { setTestStart, reset } = useTimerActions();

    useEffect(() => {
        setTestStart && setTestStart(false);
        reset && reset();
    }, [setTestStart, reset]);

    return (
        <Container>
            <h1 className='font-jalnan text-head-1'>말운동 평가</h1>
            <span className='mt-[10px] text-center font-noto text-body-2'>
                말운동장애(motor speech disorder)란 운동계의 기능 이상에 의해 초래되는 <br className='xl:hidden' />
                말산출장애(마비말장애, 말실행증 등)를 말합니다.
                <br />
                말운동 평가는 말운동 체계의 기능을 알아보기 위해{' '}
                <span className='mt-[10px] font-bold text-accent1'>호흡, 발성, 공명, 조음, 운율 영역을 평가하는 검사</span>로
                <br />
                말실행증보다는 마비말장애 여부를 판단하는 데에 초점을 두고 있습니다.
            </span>
            <ul className='mt-15'>
                <li className='float-left mr-[30px] flex h-[467px] w-[300px] flex-col flex-nowrap items-center rounded-[20px] bg-white px-[58px] py-[30px] shadow-base xl:h-[440px] xl:w-[477px] xl:items-start'>
                    <Image src={testStartIcon} alt='test-start' width={120} height={100} />
                    <span className='mt-5 font-bold leading-normal text-accent1 text-head-2 xl:leading-tight'>테스트 시작하기</span>
                    <span className='mt-[10px] text-center text-neutral4 text-body-2 xl:mt-2 xl:text-left'>
                        환자의 기본정보 입력 후 원하는 소검사를 선택하여 평가를 진행할 수 있습니다.
                    </span>
                    <Link
                        className='px-auto mt-auto flex items-center justify-center btn btn-small btn-contained xl:mr-auto'
                        href='/personalInfo'
                    >
                        시작하기
                    </Link>
                </li>

                <li className='float-left flex h-[467px] w-[300px] flex-col flex-nowrap items-center rounded-[20px] bg-white px-[58px] py-[30px] text-center shadow-base xl:h-[440px] xl:w-[477px] xl:items-start xl:text-left'>
                    <Image src={testResultIcon} alt='test-result' width={120} height={100} />
                    <span className='mt-5 font-bold leading-normal text-accent1 text-head-2 xl:leading-tight'>테스트 결과보기</span>
                    <span className='mt-[10px] text-neutral4 text-body-2 xl:mt-2'>
                        평가 후, 결과보기를 통해 소검사 영역별 점수와 총점이 제공되며 그래프를 통해 환자가 가진 말운동 기능의 영역별
                        강약점을 파악할 수 있습니다.
                        <br />
                        또한 문제를 보인 항목들에 대한 초기점검이 가능합니다.
                    </span>
                    <Link
                        href={`/sessions`}
                        className='mt-auto flex items-center justify-center text-head-1 btn btn-small btn-contained xl:mr-auto'
                    >
                        결과보기
                    </Link>
                </li>
            </ul>
        </Container>
    );
}

export const getServerSideProps: GetServerSideProps = async context => {
    try {
        const newToken = context.query.token;
        if (newToken) {
            setCookie('jwt', context.query.token, { req: context.req, res: context.res, maxAge: 60 * 6 * 24 });
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
            props: {
                isLoggedIn: true,
            },
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
