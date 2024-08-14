import { Fragment, useCallback, useState } from 'react';
import type { GetServerSideProps } from 'next';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/router';

import dayjs from 'dayjs';

import Container from '@/components/common/Container';
import { PrintIcon } from '@/components/icons';
import { getTestResultAPI } from '@/api/questions';

import styles from './TestResultPage.module.css';

const TestTotalScoreGraph = dynamic(() => import('@/components/TestTotalScoreGraph'), { ssr: false });
const TestScoreBarGraph = dynamic(() => import('@/components/TestScoreBarGraph'), { ssr: false });
const SubtestScoreGraph = dynamic(() => import('@/components/SubtestScoreGraph'), { ssr: false });

const barData = [
    {
        country: 'AD',
        'hot dog': 27,
        'hot dogColor': 'hsl(327, 70%, 50%)',
        burger: 2,
        burgerColor: 'hsl(47, 70%, 50%)',
        sandwich: 168,
        sandwichColor: 'hsl(265, 70%, 50%)',
        kebab: 33,
        kebabColor: 'hsl(192, 70%, 50%)',
        fries: 17,
        friesColor: 'hsl(163, 70%, 50%)',
        donut: 185,
        donutColor: 'hsl(307, 70%, 50%)',
    },
    {
        country: 'AE',
        'hot dog': 153,
        'hot dogColor': 'hsl(331, 70%, 50%)',
        burger: 181,
        burgerColor: 'hsl(281, 70%, 50%)',
        sandwich: 71,
        sandwichColor: 'hsl(26, 70%, 50%)',
        kebab: 62,
        kebabColor: 'hsl(128, 70%, 50%)',
        fries: 73,
        friesColor: 'hsl(183, 70%, 50%)',
        donut: 89,
        donutColor: 'hsl(145, 70%, 50%)',
    },
    {
        country: 'AF',
        'hot dog': 108,
        'hot dogColor': 'hsl(144, 70%, 50%)',
        burger: 81,
        burgerColor: 'hsl(130, 70%, 50%)',
        sandwich: 150,
        sandwichColor: 'hsl(346, 70%, 50%)',
        kebab: 74,
        kebabColor: 'hsl(47, 70%, 50%)',
        fries: 121,
        friesColor: 'hsl(13, 70%, 50%)',
        donut: 109,
        donutColor: 'hsl(170, 70%, 50%)',
    },
    {
        country: 'AG',
        'hot dog': 25,
        'hot dogColor': 'hsl(225, 70%, 50%)',
        burger: 173,
        burgerColor: 'hsl(342, 70%, 50%)',
        sandwich: 157,
        sandwichColor: 'hsl(84, 70%, 50%)',
        kebab: 70,
        kebabColor: 'hsl(12, 70%, 50%)',
        fries: 128,
        friesColor: 'hsl(278, 70%, 50%)',
        donut: 189,
        donutColor: 'hsl(41, 70%, 50%)',
    },
    {
        country: 'AI',
        'hot dog': 79,
        'hot dogColor': 'hsl(249, 70%, 50%)',
        burger: 80,
        burgerColor: 'hsl(337, 70%, 50%)',
        sandwich: 160,
        sandwichColor: 'hsl(194, 70%, 50%)',
        kebab: 94,
        kebabColor: 'hsl(4, 70%, 50%)',
        fries: 121,
        friesColor: 'hsl(21, 70%, 50%)',
        donut: 70,
        donutColor: 'hsl(243, 70%, 50%)',
    },
    {
        country: 'AL',
        'hot dog': 24,
        'hot dogColor': 'hsl(301, 70%, 50%)',
        burger: 64,
        burgerColor: 'hsl(37, 70%, 50%)',
        sandwich: 82,
        sandwichColor: 'hsl(135, 70%, 50%)',
        kebab: 29,
        kebabColor: 'hsl(164, 70%, 50%)',
        fries: 166,
        friesColor: 'hsl(204, 70%, 50%)',
        donut: 170,
        donutColor: 'hsl(337, 70%, 50%)',
    },
    {
        country: 'AM',
        'hot dog': 10,
        'hot dogColor': 'hsl(288, 70%, 50%)',
        burger: 63,
        burgerColor: 'hsl(42, 70%, 50%)',
        sandwich: 143,
        sandwichColor: 'hsl(274, 70%, 50%)',
        kebab: 23,
        kebabColor: 'hsl(1, 70%, 50%)',
        fries: 18,
        friesColor: 'hsl(24, 70%, 50%)',
        donut: 183,
        donutColor: 'hsl(143, 70%, 50%)',
    },
];

const genderOptionList = [
    { value: 'male', label: '남' },
    { value: 'female', label: '여' },
];

const defaultTestInfo = {
    therapistUserId: 178,
    testDate: '2024-08-02',
    patientName: '조대형',
    patientGender: 'male',
    patientBirthdate: '1990-08-24',
    brainLesions: [],
    medicalHistory: '',
    memo: '',
};

const user = {
    therapistUserId: 178,
    testerName: '김검사',
};

const SubtestScore = ({
    id,
    subtestTitle,
    averageScore,
    color,
    partList,
}: {
    id: string;
    subtestTitle: string;
    averageScore: number;
    color: string;
    partList: {
        partTitle: string;
        partScore: number;
        maxScore: number;
    }[];
}) => {
    return (
        <div className='mt-20 w-full'>
            <h2 className='font-bold text-black text-head-2'>{subtestTitle}</h2>
            <div className='mt-[30px] flex w-full gap-[60px] rounded-base bg-white px-[50px] pb-[50px] pt-10 shadow-base'>
                <div className='w-40 flex-none text-center xl:w-[200px]'>
                    <SubtestScoreGraph
                        data={[
                            {
                                id,
                                data: [{ x: 'abc', y: averageScore, color }],
                            },
                        ]}
                    />
                    <button className='mt-5 underline text-body-2' onClick={() => {}}>
                        평가항목 리스트
                    </button>
                </div>
                <div className='flex flex-1 flex-col gap-3.5'>
                    {partList.map((part, i) => (
                        <div key={i}>
                            <div className='ml-1 mr-2 flex justify-between'>
                                <span className='text-neutral3 text-body-2'>{part.partTitle}</span>
                                <span className='text-neutral3 text-body-2'>
                                    {part.partScore}/{part.maxScore}
                                </span>
                            </div>
                            <div className='relative mt-1.5 h-5 w-full rounded-full bg-[#D9D9D9] xl:mt-2'>
                                <div
                                    className={`absolute left-0 h-full rounded-full`}
                                    style={{ width: `${(100 * part.partScore) / part.maxScore}%`, backgroundColor: color }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Stress Testing 문항 페이지
export default function TestResultPage({
    testInfo,
}: {
    testInfo: {
        testDate: string;
    };
}) {
    const router = useRouter(); // next router

    // 폼 제출
    const handleClickNext = useCallback(
        (data: any) => {
            console.log(data);

            try {
                // TODO: 중간 저장 API

                const sessionId = Number(router.query.sessionId);
                router.push(`/sessions/${sessionId}/result`);
            } catch (err) {
                console.error(err);
            }
        },
        [router],
    );

    return (
        <Container>
            <div className='relative w-full'>
                <Link href={'/personalInfo'} className='absolute bottom-0 left-2 underline'>
                    개인정보 수정
                </Link>
                <h1 className='text-center font-jalnan text-head-1'>말운동평가 검사 결과</h1>
                <button className='absolute bottom-0 right-2 flex items-center gap-1'>
                    <PrintIcon color={'#212529'} />
                    <u>인쇄하기</u>
                </button>
            </div>
            <table className='mt-[50px] w-full overflow-hidden rounded-base'>
                <tbody>
                    <tr>
                        <td className='bg-accent3 py-[18px] font-bold' align='center' width='25%'>
                            환자명
                        </td>
                        <td className='border-l border-neutral6 bg-accent3 py-[18px] font-bold' align='center' width='25%'>
                            성별
                        </td>
                        <td className='border-l border-neutral6 bg-accent3 py-[18px] font-bold' align='center' width='25%'>
                            생년월일
                        </td>
                        <td className='border-l border-neutral6 bg-accent3 py-[18px] font-bold' align='center' width='25%'>
                            검사자
                        </td>
                    </tr>
                    <tr>
                        <td className='bg-white py-[18px]' align='center'>
                            {defaultTestInfo.patientName}
                        </td>
                        <td className='border-l border-neutral6 bg-white py-[18px]' align='center'>
                            {genderOptionList.find(v => v.value === defaultTestInfo.patientGender)?.label}
                        </td>
                        <td className='border-l border-neutral6 bg-white py-[18px]' align='center'>
                            {dayjs(defaultTestInfo.patientBirthdate).format('YYYY.MM.DD')}
                        </td>
                        <td className='border-l border-neutral6 bg-white py-[18px]' align='center'>
                            {user.testerName}
                        </td>
                    </tr>
                    <tr>
                        <td className='bg-accent3 py-[18px] font-bold' align='center' width='25%'>
                            신경학적 진단명
                        </td>
                        <td className='border-l border-neutral6 bg-accent3 py-[18px] font-bold' align='center' width='25%'>
                            병력
                        </td>
                        <td className='border-l border-neutral6 bg-accent3 py-[18px] font-bold' align='center' width='25%'>
                            개인관련정보
                        </td>
                        <td className='border-l border-neutral6 bg-accent3 py-[18px] font-bold' align='center' width='25%'>
                            검사일자
                        </td>
                    </tr>
                    <tr>
                        <td className='bg-white py-[18px]' align='center'>
                            {defaultTestInfo.brainLesions.join(',')}
                        </td>
                        <td className='border-l border-neutral6 bg-white py-[18px]' align='center'>
                            {defaultTestInfo.medicalHistory}
                        </td>{' '}
                        <td className='border-l border-neutral6 bg-white py-[18px]' align='center'>
                            {defaultTestInfo.memo}
                        </td>
                        <td className='border-l border-neutral6 bg-white py-[18px]' align='center'>
                            {dayjs(defaultTestInfo.testDate).format('YYYY.MM.DD')}
                        </td>
                    </tr>
                </tbody>
            </table>

            <div className='mt-20 w-full'>
                <h2 className='font-bold text-black text-head-2'>TOTAL SCORE</h2>
                <div className='mt-[30px] flex gap-[30px]'>
                    <div className='flex h-[295px] min-w-[280px] items-center justify-center rounded-base bg-white shadow-base xl:h-[346px] xl:w-[390px]'>
                        <TestTotalScoreGraph
                            data={[
                                {
                                    id: 'total',
                                    data: [{ x: 'abc', y: 210, color: '#6979F8' }],
                                },
                            ]}
                        />
                    </div>
                    <div className='h-[295px] w-full rounded-base bg-white shadow-base xl:h-[346px] xl:w-[580px]'>
                        <TestScoreBarGraph data={barData} />
                    </div>
                </div>
            </div>

            <SubtestScore
                id='speechMechanism'
                subtestTitle='SPEECH MECHANISM : 말기제 평가'
                averageScore={90}
                color={'#20C997'}
                partList={[
                    {
                        partTitle: '안면(Facial)',
                        partScore: 12,
                        maxScore: 24,
                    },
                    {
                        partTitle: '턱(Jaw)',
                        partScore: 4,
                        maxScore: 24,
                    },
                    {
                        partTitle: '혀(Tongue)',
                        partScore: 20,
                        maxScore: 24,
                    },
                    {
                        partTitle: '연구개(Velar)/인두(Pharynx)/후두(Larynx)',
                        partScore: 8,
                        maxScore: 24,
                    },
                ]}
            />
            <SubtestScore
                id='speech'
                subtestTitle='SPEECH I : 영역별 말평가 / SPEECH II : 종합적 말평가'
                averageScore={20}
                color={'#FFA26B'}
                partList={[
                    {
                        partTitle: '호흡(Respiration)',
                        partScore: 12,
                        maxScore: 24,
                    },
                    {
                        partTitle: '발성(Phonation)',
                        partScore: 4,
                        maxScore: 24,
                    },
                    {
                        partTitle: '공명(Resonance)',
                        partScore: 20,
                        maxScore: 24,
                    },
                    {
                        partTitle: '조음(Articulation)',
                        partScore: 8,
                        maxScore: 24,
                    },
                    {
                        partTitle: '운율(Prosody)',
                        partScore: 8,
                        maxScore: 24,
                    },
                ]}
            />
            <SubtestScore
                id='speechMotor'
                subtestTitle='SPEECH MECHANISM : 말기제 평가'
                averageScore={80}
                color={'#0084F4'}
                partList={[
                    {
                        partTitle: '교대운동속도(AMR)',
                        partScore: 12,
                        maxScore: 24,
                    },
                    {
                        partTitle: '일련운동속도(SMR)',
                        partScore: 4,
                        maxScore: 24,
                    },
                ]}
            />

            <div className='mt-20'>
                <Link href='/' className='inline-flex items-center justify-center btn btn-large btn-outlined'>
                    홈
                </Link>
                <button type='button' className='ml-5 btn btn-large btn-contained' onClick={() => {}}>
                    다음
                </button>
            </div>
        </Container>
    );
}

export const getServerSideProps: GetServerSideProps = async context => {
    const sessionId = Number(context.query.sessionId);

    if (!sessionId) {
        return {
            redirect: {
                destination: '/',
                permanent: true,
            },
        };
    }

    try {
        // TODO: sessionId 통해 시험 세션 정보 얻음
        const testSession = {
            sessionId,
            subtests: [],
        };

        // 소검사 문항 정보 fetch
        const responseData = await getTestResultAPI({ sessionId });
        const testInfo = responseData.testInfo;

        return {
            props: {
                testSession,
                testInfo,
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
