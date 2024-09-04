import { useCallback, useEffect } from 'react';
import type { GetServerSideProps } from 'next';
import Image from 'next/image';
import { useRouter } from 'next/router';

import { getCookie } from 'cookies-next';

import { useTimerActions } from '@/stores/timerStore';
import Container from '@/components/common/Container';

import styles from '../SubTests.module.css';

import infoIcon from 'public/static/images/info-icon.png';

const partList = [
    { partName: 'Facial (안면)', questionCount: 12 },
    { partName: 'Jaw (턱)', questionCount: 6 },
    { partName: 'Tongue (혀)', questionCount: 12 },
    { partName: 'Velar (연구개)\nPharynx (인두)\nLarynx (후두)', questionCount: 5 },
];

const PartListItem = ({ partName, questionCount }: { partName: string; questionCount: number }) => {
    return (
        <li className='flex h-[212px] w-[230px] flex-col overflow-hidden rounded-base shadow-base xl:h-[264px]'>
            <div className='flex flex-1 items-center justify-center whitespace-pre bg-accent3 font-bold text-head-3'>{partName}</div>
            <div className='flex h-[76px] flex-none items-center justify-center bg-white text-head-2'>총 {questionCount}문항</div>
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
            <h1 className='flex items-center font-jalnan text-head-1'>
                SPEECH MECHANISM : 말기제평가
                <span className={`${styles['tooltip']}`}>
                    <Image src={infoIcon} alt='info' className={`ml-[10px] inline-block`} />
                    <div className={`${styles['tooltip-content']} bg-white`}>
                        말기제평가는 안면/턱/혀/기타 등 말산출과 관련한 구조와 해당 기능을 평가합니다. (총 35개 항목) <br />
                        해당 항목에 대해 문제가 없을 경우 &apos;정상&apos;에, 문제가 있을 경우, &apos;경도&apos; 또는 &apos;심도&apos; 에
                        체크해주세요. 평가 불가한 상황에서는 &apos;평가불가&apos;에 체크하고 필요 시, 메모란을 이용해주세요.
                        <br />
                        <br />
                        &apos;모두정상&apos; 체크 시, &apos;정상&apos; 에 모두 체크표시 됨.
                    </div>
                </span>
            </h1>
            <ul className='mt-[60px] flex flex-row flex-wrap items-center justify-center gap-10 xl:gap-5'>
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
