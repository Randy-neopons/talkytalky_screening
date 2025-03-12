import { useMemo } from 'react';
import dynamic from 'next/dynamic';

import cx from 'classnames';
import dayjs from 'dayjs';

import { answerOptions, brainLesionOptions, dominantHandOptions, genderOptions, hearingAidsUseOptions, typeOptions } from '@/utils/const';
import type { TestInfo, TestScore } from '@/api/das';

import styles from './PrintView.module.scss';
import { SubtestScoreGraphPrintView } from '../SubtestScoreGraph';
import { SubtestScoreLineGraphPrintView } from '../SubtestScoreLineGraph';

import type { Recording } from '@/types/das';

const CheckBoxIcon = () => (
    <svg
        className='mr-1 rounded border bg-white peer-checked:border-none peer-checked:bg-[#192A88]'
        xmlns='http://www.w3.org/2000/svg'
        width='14'
        height='14'
        viewBox='0 0 24 24'
        fill='none'
    >
        <path d='M7 12L11 16L17 8' stroke='white' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
    </svg>
);

// 소검사 인쇄용 양식 (원그래프 + 막대 그래프)
const SubtestScorePrintView = ({
    id,
    subtestTitle,
    subtestTitleEn,
    totalScore,
    maxScore,
    color,
    partList,
}: {
    id: string;
    subtestTitle: string;
    subtestTitleEn: string;
    totalScore: number;
    maxScore: number;
    color: string;
    partList: {
        partTitle: string;
        partTitleEn: string;
        score: number;
        maxScore: number;
    }[];
}) => {
    return (
        <div className='flex w-full gap-5 rounded-lg border border-neutral8 bg-white py-3 pl-5 pr-2.5'>
            <div className='w-[100px] flex-none text-center'>
                {/* 원 그래프 */}
                <SubtestScoreGraphPrintView
                    data={[
                        {
                            id,
                            data: [{ x: 'abc', y: totalScore, color }],
                        },
                    ]}
                    maxScore={maxScore}
                />
                {/* <button className='mt-5 underline text-body-2' onClick={() => {}}>
                        경도/심도 항목
                    </button> */}
            </div>
            <div className='flex flex-1 flex-col gap-3.5'>
                {/* 막대 그래프 */}
                <SubtestScoreLineGraphPrintView
                    data={[
                        {
                            id: 'score',
                            data: partList.map(part => {
                                const partTitleList = part.partTitle.split(',');
                                const partTitleEnList = part.partTitleEn.split(',');
                                const title = partTitleList.map((v, i) => `${v}(${partTitleEnList[i]})`).join('\n');
                                const score = Math.floor((part.score / part.maxScore) * 100);

                                return { x: part.partTitle, y: score, color };
                            }),
                        },
                    ]}
                    color={color}
                />
            </div>
        </div>
    );
};

// 인쇄용 양식
export default function PrintView({
    testerName,
    testInfo,
    speechMechanismResult,
    speechOneResult,
    speechTwoResult,
    speechTotalResult,
    mildAndModerateAnswers,
    speechOneRecordings,
    speechMotorResults,
    types,
    mixedTypeDetail,
    opinion,
    printViewRef,
}: {
    testerName: string;
    testInfo: TestInfo;
    speechMechanismResult: TestScore | null;
    speechOneResult: TestScore | null;
    speechTwoResult: TestScore | null;
    speechTotalResult: TestScore | null;
    mildAndModerateAnswers: any[];
    speechOneRecordings: Recording[];
    speechMotorResults: { questionText: string; value: number }[];
    types: string[];
    mixedTypeDetail: string;
    opinion: string;
    printViewRef: any;
}) {
    const totalScore = useMemo(() => {
        return (speechMechanismResult?.totalScore || 0) + (speechTotalResult?.totalScore || 0);
    }, [speechMechanismResult?.totalScore, speechTotalResult?.totalScore]);

    const maxScore = useMemo(() => {
        return (speechMechanismResult?.maxScore || 0) + (speechTotalResult?.maxScore || 0);
    }, [speechMechanismResult?.maxScore, speechTotalResult?.maxScore]);

    return (
        <div ref={printViewRef}>
            <div className={styles.printView}>
                <div className='flex h-[812px] w-[595px] flex-col p-7.5 text-black'>
                    {/* 표지 페이지 */}
                    <div className={styles.coverPage}>
                        <div className='mt-[100px] text-center'>
                            <h1 className='text-2xl font-bold text-[#192A88]'>마비말장애 평가시스템</h1>
                            <h2 className='text-xl font-bold text-[#192A88]'>Dysarthria Assessment System</h2>
                            <p className='text-[10px] text-neutral4'>연구개발 : 하지완, 김지영, 박기수, 조대형, 네오폰스(주)</p>
                        </div>
                        <p className='mt-15 text-right text-[8px] text-[#6E757E]'>
                            일시 : {dayjs(testInfo.testDate).format('YYYY.MM.DD')}&nbsp;&nbsp;&nbsp;&nbsp;검사자명 : {testerName}
                        </p>
                        <div className='flex gap-2.5'>
                            <div className={styles.infoTable}>
                                <div className={styles.infoRow}>
                                    <div className={styles.infoLabelLeft}>환자명</div>
                                    <div className={styles.infoValue}>{testInfo.patientName}</div>
                                </div>
                                <div className={styles.infoRow}>
                                    <div className={styles.infoLabelLeft}>성별</div>
                                    <div className={styles.infoValue}>
                                        {genderOptions.find(v => v.value === testInfo.patientGender)?.label}
                                    </div>
                                </div>
                                <div className={styles.infoRow}>
                                    <div className={styles.infoLabelLeft}>연령</div>
                                    <div className={styles.infoValue}>
                                        {dayjs(testInfo.patientBirthdate).format('YYYY.MM.DD')} (만
                                        {dayjs().diff(testInfo.patientBirthdate, 'year')}세)
                                    </div>
                                </div>
                            </div>
                            <div className={styles.infoTable}>
                                <div className={styles.infoRow}>
                                    <div className={styles.infoLabelRight}>주로 사용하는 손</div>
                                    <div className={styles.infoValue}>
                                        {dominantHandOptions.find(v => v.value === testInfo.dominantHand)?.label || '없음'}
                                    </div>
                                </div>
                                <div className={styles.infoRow}>
                                    <div className={styles.infoLabelRight}>보청기 사용유무</div>
                                    <div className={styles.infoValue}>
                                        {hearingAidsUseOptions.find(v => v.value === testInfo.hearingAidsUse)?.label || '없음'}
                                    </div>
                                </div>
                                <div className={styles.infoRow}>
                                    <div className={styles.infoLabelRight}>교육년수</div>
                                    <div className={styles.infoValue}>{testInfo.educationYear || '없음'}</div>
                                </div>
                            </div>
                        </div>
                        <div className='mt-10 w-full text-[8px]'>
                            <div className='flex w-full gap-2.5 border-b border-neutral7 py-1.5'>
                                <div className='font-bold text-neutral1'>마비말장애 관련 뇌병변</div>
                                <div className='flex-1'>
                                    {testInfo.brainLesions
                                        ?.map(brainLesion => brainLesionOptions.find(option => option.value === brainLesion)?.label || '')
                                        .join(',') || '없음'}
                                </div>
                            </div>
                            <div className='flex w-full gap-2.5 border-b border-neutral7 py-1.5'>
                                <div className='font-bold text-neutral1'>신경학적 병변 위치 또는 질환명</div>
                                <div className='flex-1'>{testInfo.neurologicalLesion || '없음'}</div>
                            </div>
                            <div className='flex w-full gap-2.5 border-b border-neutral7 py-1.5'>
                                <div className='font-bold text-neutral1'>병력</div>
                                <div className='flex-1'>{testInfo.medicalHistory || '없음'}</div>
                            </div>
                            <div className='flex w-full gap-2.5 border-b border-neutral7 py-1.5'>
                                <div className='font-bold text-neutral1'>개인관련정보</div>
                                <div className='flex-1'>{testInfo.patientMemo || '없음'}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* 인쇄 레이아웃을 위해 table 설정*/}
            <table className={styles.printTable}>
                {/* thead는 페이지 header 역할 */}
                <thead>
                    <tr>
                        <td className={styles.printCell}>
                            <div className='mb-2.5 mt-7.5 h-1 w-full rounded-full bg-[#192A88]'></div>
                            <div className='mb-5 flex w-full justify-between'>
                                <h3 className='text-[12px]'>
                                    <span className='font-bold text-[#192A88]'>마비말장애 평가시스템</span>
                                    <span className='ml-2 text-[#6E757E]'>Dysarthria Assessment System</span>
                                </h3>
                                <span className='text-[12px]'>{testInfo.patientName}님</span>
                            </div>
                        </td>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className={styles.printCell}>
                            <div className='h-full w-full'>
                                <div className='w-full'>
                                    <div className='relative flex w-full'>
                                        <h3 className='mb-1 text-xs font-bold'>TOTAL SCORE</h3>
                                    </div>
                                    <div className={styles.scoreTableBox}>
                                        <table className={styles.scoreTable}>
                                            <thead>
                                                <tr>
                                                    <th className='w-[107px] rounded-tl-md bg-[#192A88] py-[7px] text-white' rowSpan={2}>
                                                        말기제평가
                                                        <br />
                                                        SPEECH MECHANISM
                                                    </th>
                                                    <th colSpan={2} className='bg-[#192A88] py-[7px] text-white'>
                                                        말 평가 SPEECH
                                                    </th>
                                                    <th rowSpan={2} className='bg-[#192A88] py-[7px] text-white'>
                                                        총점
                                                        <br />
                                                        (원점수)
                                                    </th>
                                                    <th rowSpan={2} className='bg-[#192A88] py-[7px] text-white'>
                                                        총점
                                                        <br />
                                                        (환산점수)
                                                    </th>
                                                </tr>
                                                <tr>
                                                    <th className='w-[107px] bg-[#E5E7FA] py-1 text-neutral3'>영역별</th>
                                                    <th className='w-[107px] bg-[#E5E7FA] py-1 text-neutral3'>종합적</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>
                                                        <div className='flex w-full justify-between'>
                                                            <span>안면</span>
                                                            <span>
                                                                {speechMechanismResult?.partList[0]?.score} /{' '}
                                                                {speechMechanismResult?.partList[0]?.maxScore}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className='flex w-full justify-between'>
                                                            <span>호흡&발성</span>
                                                            <span>
                                                                {speechOneResult?.partList[0]?.score || 0} /{' '}
                                                                {speechOneResult?.partList[0]?.maxScore || 0}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className='flex w-full justify-between'>
                                                            <span>호흡&발성</span>{' '}
                                                            <span>
                                                                {speechTwoResult?.partList[0]?.score || 0} /{' '}
                                                                {speechTwoResult?.partList[0]?.maxScore || 0}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td rowSpan={5}>
                                                        <span>
                                                            {totalScore} / {maxScore}
                                                        </span>
                                                    </td>
                                                    <td rowSpan={5}>
                                                        <span>{Math.floor((totalScore / maxScore) * 100)} / 100</span>
                                                    </td>
                                                </tr>
                                                <tr className='bg-[#FFFFFF]'>
                                                    <td>
                                                        <div className='flex w-full justify-between'>
                                                            <span>턱</span>{' '}
                                                            <span>
                                                                {speechMechanismResult?.partList[1]?.score} /{' '}
                                                                {speechMechanismResult?.partList[1]?.maxScore}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className='flex w-full justify-between'>
                                                            <span>공명</span>{' '}
                                                            <span>
                                                                {speechOneResult?.partList[1]?.score} /{' '}
                                                                {speechOneResult?.partList[1]?.maxScore}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className='flex w-full justify-between'>
                                                            <span>공명</span>{' '}
                                                            <span>
                                                                {speechTwoResult?.partList[1]?.score} /{' '}
                                                                {speechTwoResult?.partList[1]?.maxScore}
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                                <tr className='bg-[#FFFFFF]'>
                                                    <td>
                                                        <div className='flex w-full justify-between'>
                                                            <span>혀</span>{' '}
                                                            <span>
                                                                {speechMechanismResult?.partList[2]?.score} /{' '}
                                                                {speechMechanismResult?.partList[2]?.maxScore}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className='flex w-full justify-between'>
                                                            <span>조음</span>{' '}
                                                            <span>
                                                                {speechOneResult?.partList[2]?.score} /{' '}
                                                                {speechOneResult?.partList[2]?.maxScore}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className='flex w-full justify-between'>
                                                            <span>조음</span>{' '}
                                                            <span>
                                                                {speechTwoResult?.partList[2]?.score} /{' '}
                                                                {speechTwoResult?.partList[2]?.maxScore}
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                                <tr className='bg-[#FFFFFF]'>
                                                    <td>
                                                        <div className='flex w-full justify-between'>
                                                            <span>연구개 외</span>{' '}
                                                            <span>
                                                                {speechMechanismResult?.partList[3]?.score} /{' '}
                                                                {speechMechanismResult?.partList[3]?.maxScore}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td></td>
                                                    <td>
                                                        <div className='flex w-full justify-between'>
                                                            <span>운율</span>{' '}
                                                            <span>
                                                                {speechTwoResult?.partList[3]?.score} /{' '}
                                                                {speechTwoResult?.partList[3]?.maxScore}
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                                <tr className='bg-[#FFFFFF]'>
                                                    <td>
                                                        <div className='flex w-full justify-between'>
                                                            <span>Total</span>{' '}
                                                            <span>
                                                                {speechMechanismResult?.totalScore} / {speechMechanismResult?.maxScore}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className='flex w-full justify-between'>
                                                            <span>Total</span>{' '}
                                                            <span>
                                                                {speechOneResult?.totalScore} / {speechOneResult?.maxScore}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className='flex w-full justify-between'>
                                                            <span>Total</span>{' '}
                                                            <span>
                                                                {speechTwoResult?.totalScore} / {speechTwoResult?.maxScore}
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                <p className='mr-[2px] mt-1 text-right text-[8px] text-neutral3'>*정상:2점 / 경도:1점 / 심도:0점</p>

                                {/* SPEECH MECHANISM : 말기제 평가 */}
                                {speechMechanismResult && (
                                    <div className='mt-8'>
                                        <h2 className='mb-2.5 text-[12px] font-bold text-black'>
                                            {speechMechanismResult.subtestTitleEn} : {speechMechanismResult.subtestTitle}
                                        </h2>
                                        {/* 그래프 */}
                                        <SubtestScorePrintView
                                            id='speechMechanism'
                                            subtestTitle={speechMechanismResult.subtestTitle}
                                            subtestTitleEn={speechMechanismResult.subtestTitleEn}
                                            totalScore={speechMechanismResult.totalScore}
                                            maxScore={speechMechanismResult.maxScore}
                                            color={speechMechanismResult.color}
                                            partList={speechMechanismResult.partList}
                                        />
                                    </div>
                                )}

                                {/* SPEECH : 말평가 */}
                                {speechTotalResult && (
                                    <div className='mt-8'>
                                        {/* MPT 지속시간 */}
                                        <h2 className='mb-2.5 text-[12px] font-bold text-black'>
                                            {speechTotalResult.subtestTitleEn} : {speechTotalResult.subtestTitle}
                                        </h2>
                                        <div className='mb-2.5 flex w-full gap-[1px] overflow-hidden rounded-md border border-neutral8 text-[8px]'>
                                            <div className='min-w-[100px] bg-white px-[15px] py-[9px]'>MPT 지속시간(초)</div>
                                            <div className='flex h-7.5 w-full justify-around bg-neutral10 py-[9px]'>
                                                <div className='flex flex-nowrap'>
                                                    1차
                                                    <div className='text-bold w-[90px] border-b border-neutral8 text-center'>
                                                        {speechOneRecordings[0].repeatCount}초
                                                    </div>
                                                </div>
                                                <div className='flex flex-nowrap'>
                                                    2차
                                                    <div className='text-bold w-[90px] border-b border-neutral8 text-center'>
                                                        {speechOneRecordings[1].repeatCount}초
                                                    </div>
                                                </div>
                                                <div className='flex flex-nowrap'>
                                                    3차
                                                    <div className='text-bold w-[90px] border-b border-neutral8 text-center'>
                                                        {speechOneRecordings[2].repeatCount}초
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* 그래프 */}
                                        <SubtestScorePrintView
                                            id='speech'
                                            subtestTitle={speechTotalResult.subtestTitle}
                                            subtestTitleEn={speechTotalResult.subtestTitleEn}
                                            totalScore={speechTotalResult.totalScore}
                                            maxScore={speechTotalResult.maxScore}
                                            color={speechTotalResult.color}
                                            partList={speechTotalResult.partList}
                                        />
                                    </div>
                                )}

                                {/* SPEECH MOTOR : 말운동 평가 */}
                                {speechMotorResults.length > 0 && (
                                    <div className='mt-7.5 w-full'>
                                        <h2 className='text-xs font-bold'>SPEECH MOTOR : 말운동 평가</h2>
                                        <div className='flex gap-3'>
                                            <div className={cx(styles.scoreTableBox, 'h-fit w-full')}>
                                                <table className={styles.scoreTable}>
                                                    <thead>
                                                        <tr>
                                                            <th className='bg-[#192A88] p-1 text-white'>AMR</th>
                                                            <th className='bg-accent3 p-1 text-neutral3'>반복횟수(초당)</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td width='50%'>파</td>
                                                            <td width='50%'>{speechMotorResults[0].value}회</td>
                                                        </tr>
                                                        <tr>
                                                            <td width='50%'>타</td>
                                                            <td width='50%'>{speechMotorResults[1].value}회</td>
                                                        </tr>
                                                        <tr>
                                                            <td width='50%'>카</td>
                                                            <td width='50%'>{speechMotorResults[2].value}회</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                            <div className={cx(styles.scoreTableBox, 'h-fit w-full')}>
                                                <table className={styles.scoreTable}>
                                                    <thead>
                                                        <tr>
                                                            <th className='bg-[#192A88] p-1 text-white'>SMR</th>
                                                            <th className='bg-accent3 p-1 text-neutral3'>반복횟수(초당)</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr className='h-full'>
                                                            <td width='50%' height='63px'>
                                                                파타카
                                                            </td>
                                                            <td width='50%' height='63px'>
                                                                {speechMotorResults[3].value}회
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {mildAndModerateAnswers.length > 0 && (
                                    <div className='mt-7.5 w-full'>
                                        <h2 className='text-xs font-bold'>경도 & 심도 체크항목</h2>
                                        <div className={styles.answerTableBox}>
                                            <table className={styles.answerTable}>
                                                <thead>
                                                    <tr className=''>
                                                        <th className='bg-[#E4E8FD] py-[7px] font-bold' align='center'>
                                                            영역
                                                        </th>
                                                        <th className='bg-[#E4E8FD] py-[7px] font-bold' align='center'>
                                                            질문
                                                        </th>
                                                        <th className='bg-[#E4E8FD] py-[7px] font-bold' align='center'>
                                                            답변
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {mildAndModerateAnswers.map((v, i) => (
                                                        <tr key={i} className=''>
                                                            <td align='center' width='13%'>
                                                                {v.partTitle}
                                                            </td>
                                                            <td width='74%'>{v.questionText}</td>
                                                            <td
                                                                className={cx(
                                                                    'border-l border-t border-neutral8 bg-white py-3',
                                                                    v.answer === 'moderate' ? 'text-red1' : 'text-primary1',
                                                                )}
                                                                align='center'
                                                                width='13%'
                                                            >
                                                                <span className={styles.answer}></span>
                                                                <span className='text-neutral1'>
                                                                    {answerOptions.find(answer => answer.value === v.answer)?.label}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                                <div className='mt-7.5 w-full'>
                                    <h2 className='text-xs font-bold'>마비말장애 유형</h2>
                                    <div className='mt-2.5 flex break-after-avoid flex-row flex-wrap gap-x-5 gap-y-3'>
                                        {typeOptions.map(type => (
                                            <div key={type.value} className='flex'>
                                                <label className='flex cursor-pointer items-center text-[8px]'>
                                                    <input
                                                        type='checkbox'
                                                        className='peer hidden'
                                                        checked={types?.includes(type.value)}
                                                        readOnly
                                                    />
                                                    <CheckBoxIcon />
                                                    {type.label}
                                                </label>
                                                {type.value === 'mixed' && types.includes('mixed') && (
                                                    <input
                                                        className='ml-2.5 w-40 border-b border-[#CED4DA] text-[8px]'
                                                        value={mixedTypeDetail || ''}
                                                        readOnly
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className='mt-7.5 w-full'>
                                    <h2 className='text-xs font-bold'>종합소견</h2>
                                    <div className='mt-2.5 flex min-h-[94px] flex-row flex-wrap gap-x-5 gap-y-3 rounded-lg border border-neutral8 px-[15px] py-2.5 text-[8px]'>
                                        {opinion || '없음'}
                                    </div>
                                </div>
                            </div>
                        </td>
                    </tr>
                </tbody>
                {/* tfoot는 페이지 footer 역할 */}
                <tfoot>
                    <tr>
                        <td className={styles.printCell}>
                            <div className='h-7.5'>&nbsp;</div>
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
}
