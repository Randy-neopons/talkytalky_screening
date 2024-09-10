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
    {
        subtestName: '영역별 말평가',
        partName: 'Respiration(호흡) / Phonation(음성)\nResonance(공명)\nArticulation(조음)\n ',
        questionCount: 27,
    },
    {
        subtestName: '종합적 말평가',
        partName: 'Respiration(호흡) / Phonation(음성)\nResonance(공명)\nArticulation(조음)\nProsody(운율)',
        questionCount: 21,
    },
];

const PartListItem = ({ subtestName, partName, questionCount }: { subtestName: string; partName: string; questionCount: number }) => {
    return (
        <li className='flex w-[236px] flex-col overflow-hidden rounded-base shadow-base xl:w-[490px]'>
            <div className='flex flex-col items-center gap-[30px] whitespace-pre bg-accent3 px-10 py-10'>
                <span className='font-bold text-head-2'>{subtestName}</span>
                <div className='flex flex-col gap-[10px]'>
                    {partName.split('\n').map((part, i) => (
                        <span key={i} className='whitespace-pre-wrap text-center font-bold text-head-3'>
                            {part}
                        </span>
                    ))}
                </div>
            </div>
            <div className='flex items-center justify-center bg-white py-5 text-head-2'>총 {questionCount}문항</div>
        </li>
    );
};

export default function SpeechMainPage() {
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
            <h1 className='flex items-center font-jalnan text-head-1'>SPEECH : 말평가</h1>
            <ul className='mt-15 flex flex-row flex-wrap items-center justify-center gap-10 xl:gap-5'>
                {partList.map((v, i) => (
                    <PartListItem key={i} subtestName={v.subtestName} partName={v.partName} questionCount={v.questionCount} />
                ))}
            </ul>
            <button type='button' className='mt-20 btn btn-large btn-contained' onClick={handleClickNext}>
                시작하기
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
