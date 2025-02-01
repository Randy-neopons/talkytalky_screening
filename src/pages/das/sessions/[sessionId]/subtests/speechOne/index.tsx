import { useCallback, useEffect } from 'react';
import type { GetServerSideProps } from 'next';
import Image from 'next/image';
import { useRouter } from 'next/router';

import { getCookie } from 'cookies-next';

import { useCurrentSubTest } from '@/stores/testStore';
import { useTimerActions } from '@/stores/timerStore';
import Container from '@/components/common/Container';
import { useConductedSubtestsQuery } from '@/hooks/das';

import styles from '../SubTests.module.css';

import infoIcon from 'public/static/images/info-icon.png';

const partList = [
    {
        subtestName: '영역별 말평가',
        partName: 'Respiration(호흡) / Phonation(발성)\nResonance(공명)\nArticulation(조음)\n ',
        questionCount: 25,
    },
    {
        subtestName: '종합적 말평가',
        partName: 'Respiration(호흡) / Phonation(발성)\nResonance(공명)\nArticulation(조음)\nProsody(운율)',
        questionCount: 25,
    },
];

const PartListItem = ({ subtestName, partName, questionCount }: { subtestName: string; partName: string; questionCount: number }) => {
    return (
        <li className='flex w-[236px] flex-col overflow-hidden rounded-base shadow-base xl:w-[490px]'>
            <div className='flex flex-col items-center gap-7.5 whitespace-pre bg-accent3 px-10 py-10'>
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

    // 현재 소검사, 선택한 소검사 정보
    const { data: subtestsData } = useConductedSubtestsQuery({ sessionId: Number(router.query.sessionId), jwt: getCookie('jwt') || '' });
    const { setTestStart } = useTimerActions();
    const currentSubtest = useCurrentSubTest();

    useEffect(() => {
        setTestStart(true);
    }, [setTestStart]);

    // 이전 버튼 클릭
    const handleClickPrev = useCallback(async () => {
        try {
            const sessionId = Number(router.query.sessionId);

            const subtests = subtestsData?.subtests;
            if (!subtests) {
                throw new Error('수행할 소검사가 없습니다');
            }

            // 이전 소검사
            const currentSubtestIndex = subtests.findIndex(v => v.subtestId === currentSubtest?.subtestId);
            const prevSubtestItem = subtests[currentSubtestIndex - 1];

            if (prevSubtestItem) {
                // 이전 소검사가 있으면 이동
                router.push(`/das/sessions/${sessionId}/subtests/${prevSubtestItem.pathname}`);
            } else {
                // 없으면 홈으로 이동
                if (window.confirm('홈으로 이동하시겠습니까?')) {
                    router.push('/das');
                }
            }
        } catch (err) {
            console.error(err);
        }
    }, [currentSubtest?.subtestId, router, subtestsData?.subtests]);

    // 검사 시작
    const handleClickNext = useCallback(() => {
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
            <div className='mt-20 flex gap-5'>
                <button type='button' className='btn btn-large btn-outlined' onClick={handleClickPrev}>
                    이전 검사로
                </button>
                <button type='button' className='btn btn-large btn-contained' onClick={handleClickNext}>
                    시작하기
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
