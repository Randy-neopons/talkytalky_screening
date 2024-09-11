import { useCallback, useEffect, useMemo, type ReactElement } from 'react';
import type { GetServerSideProps } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { getCookie, setCookie } from 'cookies-next';

import { useTimerActions } from '@/stores/timerStore';
import { TALKYTALKY_URL } from '@/utils/const';
import Container from '@/components/common/Container';
import { useModal } from '@/components/common/Modal/context';
import ScreeningAppLayout from '@/components/screening/ScreeningAppLayout';
import { useUserQuery } from '@/hooks/user';

import testResultIcon from 'public/static/images/test-result-icon.png';
import testStartIcon from 'public/static/images/test-start-icon.png';

import type { NextPageWithLayout } from '@/types/types';

// 선별검사 메인
const ScreeningHome: NextPageWithLayout = () => {
    const router = useRouter();

    const { data: user } = useUserQuery(); // 세션 유지되는지 조회

    const { handleOpenModal } = useModal();

    // 시작하기 클릭
    const handleClickStart = useCallback(() => {
        if (user) {
            router.push(`/screening/personalInfo`);
            return;
        }

        // 비회원검사하기 버튼 누르면 바로 이동
        const onCancel = () => {
            router.push('/screening/personalInfo');
        };

        // 로그인 버튼 누르면 로그인 페이지로 이동
        const onOk = () => {
            window.location.href = `${TALKYTALKY_URL}/login`;
        };

        // 모달 열기
        handleOpenModal({
            content: '비회원으로 이용하실 경우\n추후에 결과를 재확인 하실 수 없습니다.',
            onCancel,
            onOk,
            cancelText: '비회원검사하기',
            okText: '로그인',
        });
    }, [handleOpenModal, router, user]);

    // 결과 보기 클릭
    const handleClickResult = useCallback(() => {
        if (user) {
            // 로그인 되어있으면 세션으로 이동
            router.push(`/screening/sessions`);
        } else {
            // 아니면 로그인 페이지로 이동
            window.location.href = `${TALKYTALKY_URL}/login`;
        }
    }, [router, user]);

    const screeningHomeMenuList = useMemo(
        () => [
            {
                key: 'test-start',
                title: '테스트 시작하기',
                imgSrc: testStartIcon,
                description: '환자의 기본정보 입력 후 연령 구간에 맞는 간이언어평가를 진행할 수 있습니다.',
                onClick: handleClickStart,
                buttonText: '시작하기',
            },
            {
                key: 'test-result',
                title: '테스트 결과보기',
                imgSrc: testResultIcon,
                description: (
                    <>
                        평가 후, 결과보기를 통해 인지발달 평가와 발화능력평가에 대한 보고서가 제공됩니다.
                        <br />
                        또한 사용자 맞춤형 피드백이 제공되며 필요시 전문가 상담 및 정밀 평가를 진행할 수 있습니다.
                    </>
                ),
                onClick: handleClickResult,
                buttonText: '결과보기',
            },
        ],
        [handleClickResult, handleClickStart],
    );

    return (
        <Container>
            <h1 className='font-jalnan text-head-1'>간이언어평가</h1>
            <p className='mt-[10px] break-keep text-center font-noto text-body-2'>
                의사소통장애(Communication disorder)는 발화, 인지의 문제로 인하여 의사소통에 어려움을 겪는 상태를 말합니다.{' '}
                <br className='hidden xl:inline' />
                간이언어평가는 개인의 발화 능력과 언어적 이해 및 표현 능력의 발달 수준을 간략하게 평가하여{' '}
                <br className='hidden xl:inline' />
                <span className='font-bold text-accent1'>언어 발달 지연이나 인지능력의 이상 여부를 신속히 식별</span>하고 추가적인 정밀
                평가나 치료 개입의 필요성을 판단하는 데 중점을 둔 검사입니다.
            </p>
            <ul className='gap-7.5 mt-15 flex flex-wrap justify-center'>
                {screeningHomeMenuList.map(v => (
                    <li
                        key={v.key}
                        className='py-7.5 float-left flex h-[467px] w-[300px] flex-col flex-nowrap items-center rounded-[20px] bg-white px-6 shadow-base xl:h-[440px] xl:w-[477px] xl:items-start xl:px-[58px]'
                    >
                        <Image src={v.imgSrc} alt='test-start' width={120} height={100} />
                        <span className='mt-5 font-bold leading-normal text-accent1 text-head-2 xl:leading-tight'>{v.title}</span>
                        <span className='mt-[10px] break-keep text-center text-neutral4 text-body-2 xl:mt-2 xl:text-left'>
                            {v.description}
                        </span>
                        <button
                            className='px-auto mt-auto flex items-center justify-center btn btn-small btn-contained xl:mr-auto'
                            onClick={v.onClick}
                        >
                            {v.buttonText}
                        </button>
                    </li>
                ))}
            </ul>
        </Container>
    );
};

ScreeningHome.getLayout = function getLayout(page: ReactElement) {
    return <ScreeningAppLayout>{page}</ScreeningAppLayout>;
};

export default ScreeningHome;

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
