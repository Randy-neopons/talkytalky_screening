import { useCallback, useEffect } from 'react';
import type { GetServerSideProps } from 'next';
import Image from 'next/image';
import { useRouter } from 'next/router';

import { getCookie } from 'cookies-next';

import { useTimerActions } from '@/stores/timerStore';
import Container from '@/components/common/Container';

import styles from '../SubTests.module.scss';

import infoIcon from 'public/static/images/info-icon.png';

const partList = [
    { partName: 'Facial (안면)', questionCount: 8 },
    { partName: 'Jaw (턱)', questionCount: 5 },
    { partName: 'Tongue (혀)', questionCount: 11 },
    { partName: 'Velar (연구개)\nPharynx (인두)\nLarynx (후두)', questionCount: 6 },
];

const PartListItem = ({ partName, questionCount }: { partName: string; questionCount: number }) => {
    return (
        <li className='flex h-[212px] w-[230px] flex-col overflow-hidden rounded-base shadow-base xl:h-[264px]'>
            <div className='flex flex-1 items-center justify-center whitespace-pre bg-accent3 font-bold text-head-3'>{partName}</div>
            <div className='flex h-[76px] flex-none items-center justify-center bg-white text-head-2'>{questionCount}문항</div>
        </li>
    );
};

export default function SpeechMechanismMainPage() {
    const router = useRouter();

    const { setTestStart } = useTimerActions();

    useEffect(() => {
        setTestStart(true);
    }, [setTestStart]);

    const handleClickNext = useCallback(() => {
        console.log(router.asPath);
        router.push(`${router.asPath}/questions`); // 검사 ID로 이동
    }, [router]);

    return (
        <Container>
            <h1 className='flex items-center font-jalnan text-head-1'>SPEECH MECHANISM : 말기제평가</h1>
            <ul className='mt-15 flex flex-row flex-wrap items-center justify-center gap-10 xl:gap-5'>
                {partList.map((v, i) => (
                    <PartListItem key={i} partName={v.partName} questionCount={v.questionCount} />
                ))}
            </ul>
            <button type='button' className='mt-20 btn btn-large btn-contained' onClick={handleClickNext}>
                다음
            </button>
        </Container>
    );
}

// 페이지가 최초 로드될 때 초기 데이터를 가져오는 역할
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
            props: {
                isLoggedIn: true,
            },
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
