import { Fragment, useCallback, useState } from 'react';
import ReactTextareaAutosize from 'react-textarea-autosize';
import type { GetServerSideProps } from 'next';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { getCookie } from 'cookies-next';
import dayjs from 'dayjs';

import { CheckBoxGroupItem } from '@/components/common/CheckBox';
import Container from '@/components/common/Container';
import { PrintIcon } from '@/components/common/icons';
import { useUserQuery } from '@/hooks/user';
import { getTestInfoAPI, getTestResultAPI } from '@/api/das';

import styles from './TestResultPage.module.css';

const TestTotalScoreGraph = dynamic(() => import('@/components/das/TestTotalScoreGraph'), { ssr: false });
const TestScoreBarGraph = dynamic(() => import('@/components/das/TestScoreBarGraph'), { ssr: false });
const SubtestScoreGraph = dynamic(() => import('@/components/das/SubtestScoreGraph'), { ssr: false });

const brainLesionOptions = [
    { value: 'bilateralUpperMotorNeuron', label: '양측상부운동신경손상' },
    { value: 'unilateralUpperMotorNeuron', label: '일측상부운동신경손상' },
    { value: 'lowerMotorNeuron', label: '하부운동신경손상' },
    { value: 'cerebellarControlCircuit', label: '소뇌조절회로' },
    { value: 'basalGangliaControlCircuit', label: '기저핵조절회로' },
    { value: 'unknown', label: '특정할 수 없음' },
    { value: 'normal', label: '정상 소견' },
];

const answerOptions = [
    { value: 'normal', label: '정상' },
    { value: 'mild', label: '경도' },
    { value: 'moderate', label: '심도' },
    { value: 'unknown', label: '평가불가' },
];

const typeOptions = [
    { value: 'spastic', label: '경직형(spastic)' },
    { value: 'flaccid', label: '이완형(flaccid)' },
    { value: 'ataxic', label: '실조형(ataxic)' },
    { value: 'hypokinetic', label: '과소운동형(hypokinetic)' },
    { value: 'hyperkinetic', label: '과다운동형(hyperkinetic)' },
    { value: 'UUMN', label: '일측상부운동신경형(UUMN)' },
    { value: 'mixed', label: '혼합형(mixed)' },
];

const genderOptionList = [
    { value: 'male', label: '남' },
    { value: 'female', label: '여' },
];

const subtestResultList = [
    {
        subtestIds: [1],
        subtestTitle: 'SPEECH MECHANISM : 말기제 평가',
        graphTitle: 'SPEECH\nMECHANISM',
        pathname: 'speechMechanism',
        color: '#20C997',
    },
    {
        subtestIds: [2, 3],
        subtestTitle: 'SPEECH I : 영역별 말평가 / SPEECH II : 종합적 말평가',
        graphTitle: 'SPEECH',
        pathname: 'speech',
        color: '#FFA26B',
    },
    // {
    //     subtestIds: [4],
    //     subtestTitle: 'SPEECH MOTOR : 말운동 평가',
    //     graphTitle: 'SPEECH\nMOTOR',
    //     pathname: 'speechMotor',
    //     color: '#0084F4',
    // },
];

const makeTotalScoreGraphData = (
    testResultList: {
        pathname: string;
        subtestTitle: string;
        graphTitle: string;
        color: string;
        totalScore: number;
        maxScore: number;
        partList: {
            score: number;
            maxScore: number;
            partId: number;
            partTitle: string;
            subtestId: number;
            subtestTitle: string;
        }[];
    }[],
) => {
    const { score, maxScore } = testResultList.reduce(
        (accum, curr) => {
            return {
                score: accum.score + curr.totalScore,
                maxScore: accum.maxScore + curr.maxScore,
            };
        },
        { score: 0, maxScore: 0 },
    );

    return [
        {
            id: 'total',
            data: [{ x: 'score', y: score, maxValue: maxScore, color: '#6979F8' }],
        },
    ];
};

const makeScoreBarGraphData = (
    testResultList: {
        pathname: string;
        subtestTitle: string;
        graphTitle: string;
        color: string;
        totalScore: number;
        maxScore: number;
        partList: {
            score: number;
            maxScore: number;
            partId: number;
            partTitle: string;
            subtestId: number;
            subtestTitle: string;
        }[];
    }[],
) => {
    return testResultList.map(v => ({
        graphTitle: v.graphTitle,
        score: Math.floor((v.totalScore / v.maxScore) * 100),
    }));
};

const SubtestScore = ({
    id,
    subtestTitle,
    totalScore,
    maxScore,
    color,
    partList,
}: {
    id: string;
    subtestTitle: string;
    totalScore: number;
    maxScore: number;
    color: string;
    partList: {
        partTitle: string;
        score: number;
        maxScore: number;
    }[];
}) => {
    return (
        <div className='mt-20 w-full'>
            <h2 className='font-bold text-black text-head-2'>{subtestTitle}</h2>
            <div className='mt-7.5 flex w-full gap-15 rounded-base bg-white px-[50px] pb-[50px] pt-10 shadow-base'>
                <div className='w-40 flex-none text-center xl:w-[200px]'>
                    <SubtestScoreGraph
                        data={[
                            {
                                id,
                                data: [{ x: 'abc', y: totalScore, color }],
                            },
                        ]}
                        maxScore={maxScore}
                    />
                    <button className='mt-5 underline text-body-2' onClick={() => {}}>
                        경도/심도 항목
                    </button>
                </div>
                <div className='flex flex-1 flex-col gap-3.5'>
                    {partList.map((part, i) => (
                        <div key={i}>
                            <div className='ml-1 mr-2 flex justify-between'>
                                <span className='text-neutral3 text-body-2'>{part.partTitle}</span>
                                <span className='text-neutral3 text-body-2'>
                                    {part.score}점 / 총 {part.maxScore}점
                                </span>
                            </div>
                            <div className='relative mt-1.5 h-5 w-full rounded-full bg-[#D9D9D9] xl:mt-2'>
                                <div
                                    className={`absolute left-0 h-full rounded-full`}
                                    style={{ width: `${(100 * part.score) / part.maxScore}%`, backgroundColor: color }}
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
    testResultList,
    mildAndModerateAnswers,
}: {
    testInfo: {
        testDate: string;
        patientName: string;
        patientGender: string;
        patientBirthdate: string;
        neurologicalLesion: string;
        brainLesions: string[];
        medicalHistory: string;
        patientMemo: string;
    };
    testResultList: {
        pathname: string;
        subtestTitle: string;
        graphTitle: string;
        color: string;
        totalScore: number;
        maxScore: number;
        partList: {
            score: number;
            maxScore: number;
            partId: number;
            partTitle: string;
            subtestId: number;
            subtestTitle: string;
        }[];
    }[];
    mildAndModerateAnswers: any[];
}) {
    const router = useRouter(); // next router

    const { data: user } = useUserQuery();

    const [types, setTypes] = useState<string[]>([]);

    return (
        <Container>
            <div className='relative flex w-full flex-col gap-1'>
                <h1 className='text-center font-jalnan text-head-1'>마비말장애 평가시스템 결과 보고서</h1>
                <h2 className='text-center font-jalnan text-head-2'>Dysarthria Assessment System (DAS)</h2>
                <p className='text-center text-neutral4 text-body-2'>연구개발 : 하지완, 김지영, 박기수, 조대형, 네오폰스(주)</p>
            </div>
            <div className='mt-10 flex w-full justify-between'>
                <Link
                    href={`/das/sessions/${router.query.sessionId}/editInfo`}
                    className='flex items-center gap-[6px] rounded-[10px] border border-neutral7 bg-white px-5 py-2.5'
                >
                    개인정보 수정
                </Link>
                <button className='flex items-center gap-[6px] rounded-[10px] border border-neutral7 bg-white px-5 py-2.5'>
                    <PrintIcon color={'#212529'} />
                    인쇄하기
                </button>
            </div>

            <table className='mt-5 w-full overflow-hidden rounded-base'>
                <tbody>
                    <tr>
                        <td className='bg-accent3 py-[18px] font-bold' align='center' width='20%'>
                            환자명
                        </td>
                        <td className='border-neutral6 bg-accent3 py-[18px] font-bold' align='center' width='20%'>
                            성별
                        </td>
                        <td className='border-neutral6 bg-accent3 py-[18px] font-bold' align='center' width='20%'>
                            생년월일
                        </td>
                        <td className='border-neutral6 bg-accent3 py-[18px] font-bold' align='center' width='20%'>
                            검사일
                        </td>
                        <td className='border-neutral6 bg-accent3 py-[18px] font-bold' align='center' width='20%'>
                            검사자
                        </td>
                    </tr>
                    <tr>
                        <td className='bg-white py-[18px]' align='center'>
                            {testInfo.patientName}
                        </td>
                        <td className='border-l border-neutral6 bg-white py-[18px]' align='center'>
                            {genderOptionList.find(v => v.value === testInfo.patientGender)?.label}
                        </td>
                        <td className='border-l border-neutral6 bg-white py-[18px]' align='center'>
                            {dayjs(testInfo.patientBirthdate).format('YYYY.MM.DD')}
                        </td>
                        <td className='border-l border-neutral6 bg-white py-[18px]' align='center'>
                            {user?.data?.fullName}
                        </td>
                        <td className='border-l border-neutral6 bg-white py-[18px]' align='center'>
                            {dayjs(testInfo.testDate).format('YYYY.MM.DD')}
                        </td>
                    </tr>
                </tbody>
            </table>
            <table className='mt-5 w-full overflow-hidden rounded-base'>
                <tbody>
                    <tr>
                        <td className='bg-accent3 py-[18px] font-bold' align='center' width='50%'>
                            마비말장애 관련 뇌병변
                        </td>
                        <td className='border-neutral6 bg-accent3 py-[18px] font-bold' align='center' width='50%'>
                            신경학적 병변 위치 또는 질환명
                        </td>
                    </tr>
                    <tr>
                        <td className='bg-white py-[18px]' align='center'>
                            {testInfo.neurologicalLesion}
                        </td>
                        <td className='border-l border-neutral6 bg-white py-[18px]' align='center'>
                            {testInfo.brainLesions
                                .map(brainLesion => brainLesionOptions.find(option => option.value === brainLesion)?.label || '')
                                .join(',')}
                        </td>
                    </tr>
                </tbody>
            </table>
            <table className='mt-5 w-full overflow-hidden rounded-base'>
                <tbody>
                    <tr>
                        <td className='border-neutral6 bg-accent3 py-[18px] font-bold' align='center'>
                            병력
                        </td>
                    </tr>
                    <tr>
                        <td className='bg-white py-[18px]' align='center'>
                            {testInfo.medicalHistory}
                        </td>
                    </tr>
                </tbody>
            </table>
            <table className='mt-5 w-full overflow-hidden rounded-base'>
                <tbody>
                    <tr>
                        <td className='border-neutral6 bg-accent3 py-[18px] font-bold' align='center'>
                            개인관련정보
                        </td>
                    </tr>
                    <tr>
                        <td className='bg-white py-[18px]' align='center'>
                            {testInfo.patientMemo}
                        </td>
                    </tr>
                </tbody>
            </table>

            <div className='mt-20 w-full'>
                <h2 className='font-bold text-black text-head-2'>TOTAL SCORE</h2>
                <div className='mt-7.5 flex gap-7.5'>
                    <div className='flex h-[295px] min-w-[280px] items-center justify-center rounded-base bg-white shadow-base xl:h-[346px] xl:w-[390px]'>
                        <TestTotalScoreGraph
                            data={makeTotalScoreGraphData(testResultList)}
                            maxScore={testResultList.reduce((accum, curr) => accum + curr.maxScore, 0)}
                        />
                    </div>
                    <div className='h-[295px] w-full rounded-base bg-white shadow-base xl:h-[346px] xl:w-[580px]'>
                        <TestScoreBarGraph data={makeScoreBarGraphData(testResultList)} />
                    </div>
                </div>
            </div>

            {/* 소검사별 결과 */}
            {testResultList.map(v => {
                return (
                    v.partList.length > 0 && (
                        <SubtestScore
                            id={v.pathname}
                            key={v.pathname}
                            subtestTitle={v.subtestTitle}
                            totalScore={v.totalScore}
                            maxScore={v.maxScore}
                            color={v.color}
                            partList={v.partList}
                        />
                    )
                );
            })}

            {mildAndModerateAnswers.length > 0 && (
                <div className='mt-20 w-full'>
                    <h2>경도 & 심도 체크항목</h2>
                    <table className='mt-5 w-full overflow-hidden rounded-base'>
                        <thead>
                            <tr>
                                <th className='bg-accent3 py-3 font-bold' align='center'>
                                    영역
                                </th>
                                <th className='bg-accent3 py-3 font-bold' align='center'>
                                    질문
                                </th>
                                <th className='bg-accent3 py-3 font-bold' align='center'>
                                    답변
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {mildAndModerateAnswers.map((v, i) => (
                                <tr key={i} className=''>
                                    <td className='border-t border-neutral8 bg-white py-3' align='center' width='15%'>
                                        {v.partTitle}
                                    </td>
                                    <td className='border-l border-t border-neutral8 bg-white py-3' align='center' width='70%'>
                                        {v.questionText}
                                    </td>
                                    <td className='border-l border-t border-neutral8 bg-white py-3' align='center' width='15%'>
                                        {answerOptions.find(answer => answer.value === v.answer)?.label}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className='mt-20 w-full'>
                <h2 className='font-bold text-head-2'>마비말장애 유형</h2>
                <div className='mt-7.5 w-full rounded-base bg-white p-8'>
                    {typeOptions.map(type => (
                        <CheckBoxGroupItem key={type.value} name='types' value={type.value} values={types} setValues={setTypes}>
                            {type.label}
                        </CheckBoxGroupItem>
                    ))}
                </div>
            </div>

            <div className='mt-20 w-full'>
                <h2 className='font-bold text-head-2'>종합소견</h2>
                <div className='mt-7.5 w-full rounded-base bg-white p-8'>
                    <ReactTextareaAutosize className='min-h-[200px] w-full' />
                </div>
            </div>

            <div className='mt-20'>
                <Link href='/das' className='inline-flex items-center justify-center btn btn-large btn-outlined'>
                    홈
                </Link>
                <button type='button' className='ml-5 btn btn-large btn-contained' onClick={() => {}}>
                    저장
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

        const { testInfo } = await getTestInfoAPI({ sessionId, jwt: accessToken });

        // 소검사 문항 정보 fetch
        const { testScore, mildAndModerateAnswers } = await getTestResultAPI({ sessionId, jwt: accessToken });

        const testResultList = subtestResultList.map(v => {
            const partList = testScore
                .filter(score => v.subtestIds.includes(score.subtestId))
                .map(score => {
                    const partTitles = score.partTitle.split(',');
                    const partTitleEns = score.partTitleEn.split(',');
                    const partTitle = partTitles.map((title, i) => `${title}(${partTitleEns[i]})`).join('/');

                    return { ...score, partTitle };
                });
            const { totalScore, maxScore } = partList.reduce(
                (accum, curr) => {
                    const totalScore = accum.totalScore + curr.score;
                    const maxScore = accum.maxScore + curr.maxScore;
                    return { totalScore, maxScore };
                },
                { totalScore: 0, maxScore: 0 },
            );

            return {
                pathname: v.pathname,
                subtestTitle: v.subtestTitle,
                graphTitle: v.graphTitle,
                totalScore,
                maxScore,
                color: v.color,
                partList,
            };
        });

        return {
            props: {
                isLoggedIn: true,
                testResultList,
                testInfo,
                mildAndModerateAnswers,
            },
        };
    } catch (err) {
        console.error(err);
        return {
            redirect: {
                destination: '/das',
                permanent: true,
            },
        };
    }
};
