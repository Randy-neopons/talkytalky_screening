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
        partNameEn: 'AMR',
        partName: '교대운동속도',
        questionCount: 10,
    },
    {
        partNameEn: 'SMR',
        partName: '일련운동속도',
        questionCount: 10,
    },
    {
        partNameEn: 'STRESS TESTING',
        partName: '피로도 검사(선택)',
        questionCount: 1,
    },
];

const PartListItem = ({ partNameEn, partName, questionCount }: { partNameEn: string; partName: string; questionCount: number }) => {
    return (
        <li className='flex w-[236px] flex-col overflow-hidden rounded-base shadow-base xl:w-[320px]'>
            <div className='flex flex-1 flex-col items-center gap-7.5 whitespace-pre bg-accent3 py-10'>
                <span className='font-bold text-head-2'>{partNameEn}</span>
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

export default function SpeechMotorMainPage() {
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

    const handleClickNext = useCallback(() => {
        console.log(router.asPath);
        router.push(`${router.asPath}/questions`); // 검사 ID로 이동
    }, [router]);

    return (
        <Container>
            <h1 className='flex items-center font-jalnan text-head-1'>
                SPEECH MOTOR : 말운동평가
                {/* <span className={`${styles['tooltip']}`}>
                    <Image src={infoIcon} alt='info' className={`ml-[10px] inline-block`} />
                    <div className={`${styles['tooltip-content']} bg-white`}>
                        말기제평가는 안면/턱/혀/기타 등 말산출과 관련한 구조와 해당 기능을 평가합니다. (총 35개 항목) <br />
                        해당 항목에 대해 문제가 없을 경우 &apos;정상&apos;에, 문제가 있을 경우, &apos;경도&apos; 또는 &apos;심도&apos; 에
                        체크해주세요. 평가 불가한 상황에서는 &apos;평가불가&apos;에 체크하고 필요 시, 메모란을 이용해주세요.
                        <br />
                        <br />
                        &apos;모두정상&apos; 체크 시, &apos;정상&apos; 에 모두 체크표시 됨.
                    </div>
                </span> */}
            </h1>
            <ul className='mt-15 flex flex-row flex-wrap items-center justify-center gap-10 xl:gap-5'>
                {partList.map((v, i) => (
                    <PartListItem key={i} partNameEn={v.partNameEn} partName={v.partName} questionCount={v.questionCount} />
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
