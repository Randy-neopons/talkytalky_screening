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
            <div className='flex flex-1 flex-col items-center gap-[30px] whitespace-pre bg-accent3 py-10'>
                <span className='font-bold text-head-2'>{partNameEn}</span>
                <div className='flex flex-col gap-[10px]'>
                    {partName.split('\n').map((part, i) => (
                        <span key={i} className='whitespace-pre-wrap text-center font-bold text-head-3'>
                            {part}
                        </span>
                    ))}
                </div>
            </div>
            <div className='flex items-center justify-center py-5 text-head-2'>총 {questionCount}문항</div>
        </li>
    );
};

export default function SpeechMotorMainPage() {
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
            <ul className='mt-[60px] flex flex-row flex-wrap items-center justify-center gap-10 xl:gap-5'>
                {partList.map((v, i) => (
                    <PartListItem key={i} partNameEn={v.partNameEn} partName={v.partName} questionCount={v.questionCount} />
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
