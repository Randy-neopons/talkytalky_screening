import dynamic from 'next/dynamic';

import cx from 'classnames';
import dayjs from 'dayjs';

import { answerOptions, brainLesionOptions, dominantHandOptions, genderOptions, hearingAidsUseOptions, typeOptions } from '@/utils/const';
import { CheckBoxGroupItem } from '@/components/common/CheckBox';
import { useUserQuery } from '@/hooks/user';
import type { TestInfo } from '@/api/das';

import styles from './PrintView.module.scss';
import SubtestScoreGraph, { SubtestScoreGraphPrintView } from '../SubtestScoreGraph';
import SubtestScoreLineGraph, { SubtestScoreLineGraphPrintView } from '../SubtestScoreLineGraph';

// function svgToPng(svgElement, callback) {
//     // SVG 요소를 문자열로 변환
//     const svgData = new XMLSerializer().serializeToString(svgElement);

//     // SVG 데이터를 base64로 인코딩
//     const svgBase64 = 'data:image/svg+xml;base64,' + btoa(svgData);

//     // 이미지 객체 생성
//     const img = new Image();
//     img.onload = function () {
//         // Canvas에 이미지 그리기
//         const canvas = document.createElement('canvas');
//         canvas.width = svgElement.clientWidth || 300; // 원하는 크기로 조정 가능
//         canvas.height = svgElement.clientHeight || 300;
//         const ctx = canvas.getContext('2d');
//         ctx.drawImage(img, 0, 0);

//         // Canvas에서 PNG 데이터 URL 가져오기
//         const pngDataUrl = canvas.toDataURL('image/png');

//         // 콜백으로 PNG 데이터 URL 반환
//         callback(pngDataUrl);
//     };

//     img.src = svgBase64;
// }

const TestTotalScoreGraphPrintView = dynamic(
    () => import('@/components/das/TestTotalScoreGraph').then(res => res.TestTotalScoreGraphPrintView),
    { ssr: false },
);

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
        <div className='mt-8 w-full'>
            <h2 className='text-[12px] font-bold text-black'>{subtestTitle}</h2>
            {/* SPEECH 일 때만 MPT */}
            {id === 'speech' && (
                <div className='mt-2.5 flex w-full gap-[1px] overflow-hidden rounded-md border border-neutral8 text-[8px]'>
                    <div className='min-w-[100px] bg-white px-[15px] py-[9px]'>MPT 지속시간(초)</div>
                    <div className='flex h-7.5 w-full justify-around bg-neutral10 py-[9px]'>
                        <div className='flex flex-nowrap'>
                            1차
                            <div className='text-bold w-[90px] border-b border-neutral8 text-center'>2초</div>
                        </div>
                        <div className='flex flex-nowrap'>
                            2차
                            <div className='text-bold w-[90px] border-b border-neutral8 text-center'>3초</div>
                        </div>
                        <div className='flex flex-nowrap'>
                            3차
                            <div className='text-bold w-[90px] border-b border-neutral8 text-center'>3초</div>
                        </div>
                    </div>
                </div>
            )}
            <div className='mt-3.5 flex w-full gap-5 rounded-lg border border-neutral8 bg-white py-3 pl-5 pr-2.5'>
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
                        data={[{ id: 'score', data: partList.map(part => ({ x: part.partTitle, y: part.score, color })) }]}
                        color={color}
                    />
                </div>
            </div>
        </div>
    );
};

// 인쇄용 양식
export default function PrintView({
    testerName,
    testInfo,
    testResultList,
    mildAndModerateAnswers,
    speechMotorResults,
    types,
    mixedTypeDetail,
    opinion,
    printViewRef,
}: {
    testerName: string;
    testInfo: TestInfo;
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
    speechMotorResults: { questionText: string; value: string }[];
    types: string[];
    mixedTypeDetail: string;
    opinion: string;
    printViewRef: any;
}) {
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
                                        {dominantHandOptions.find(v => v.value === testInfo.dominantHand)?.label}
                                    </div>
                                </div>
                                <div className={styles.infoRow}>
                                    <div className={styles.infoLabelRight}>보청기 사용유무</div>
                                    <div className={styles.infoValue}>
                                        {hearingAidsUseOptions.find(v => v.value === testInfo.hearingAidsUse)?.label}
                                    </div>
                                </div>
                                <div className={styles.infoRow}>
                                    <div className={styles.infoLabelRight}>교육년수</div>
                                    <div className={styles.infoValue}>{testInfo.educationYear}</div>
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
                                                            <span>{testResultList[0].partList[0].score} / 16</span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className='flex w-full justify-between'>
                                                            <span>호흡&발성</span>
                                                            <span>{testResultList[1].partList[0]?.score} / 24</span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className='flex w-full justify-between'>
                                                            <span>호흡&발성</span> <span>/ 16</span>
                                                        </div>
                                                    </td>
                                                    <td rowSpan={5}>
                                                        <span>/110</span>
                                                    </td>
                                                    <td rowSpan={5}>
                                                        <span>/10</span>
                                                    </td>
                                                </tr>
                                                <tr className='bg-[#FFFFFF]'>
                                                    <td>
                                                        <div className='flex w-full justify-between'>
                                                            <span>턱</span> <span>/ 16</span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className='flex w-full justify-between'>
                                                            <span>공명</span> <span>/ 16</span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className='flex w-full justify-between'>
                                                            <span>공명</span> <span>/ 4</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                                <tr className='bg-[#FFFFFF]'>
                                                    <td>
                                                        <div className='flex w-full justify-between'>
                                                            <span>혀</span> <span>/ 16</span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className='flex w-full justify-between'>
                                                            <span>조음</span> <span>/ 16</span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className='flex w-full justify-between'>
                                                            <span>조음</span> <span>/ 4</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                                <tr className='bg-[#FFFFFF]'>
                                                    <td>
                                                        <div className='flex w-full justify-between'>
                                                            <span>연구개 외</span> <span>/ 16</span>
                                                        </div>
                                                    </td>
                                                    <td></td>
                                                    <td>
                                                        <div className='flex w-full justify-between'>
                                                            <span>운율</span> <span>/ 20</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                                <tr className='bg-[#FFFFFF]'>
                                                    <td>
                                                        <div className='flex w-full justify-between'>
                                                            <span>Total</span> <span>/ 16</span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className='flex w-full justify-between'>
                                                            <span>Total</span> <span>/ 16</span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className='flex w-full justify-between'>
                                                            <span>Total</span> <span>/ 4</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                {/* 소검사별 결과 */}
                                {testResultList.map(v => {
                                    return (
                                        v.partList.length > 0 && (
                                            <SubtestScorePrintView
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

                                {speechMotorResults.length > 0 && (
                                    <div className='mt-7.5 w-full'>
                                        <h2 className='text-xs font-bold'>SPEECH MOTOR : 말운동 평가</h2>
                                        <div className='flex gap-3'>
                                            <div className={cx(styles.scoreTableBox, 'w-full')}>
                                                <table className={styles.scoreTable}>
                                                    <thead>
                                                        <tr>
                                                            <th className='bg-[#192A88] p-1 text-white'>AMR</th>
                                                            <th className='bg-accent3 p-1 text-neutral3'>반복횟수(초당)</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {speechMotorResults.map((v, i) => (
                                                            <tr key={i}>
                                                                <td width='50%'>{v.questionText}</td>
                                                                <td width='50%'>{v.value}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                            <div className={cx(styles.scoreTableBox, 'w-full')}>
                                                <table className={styles.scoreTable}>
                                                    <thead>
                                                        <tr>
                                                            <th className='bg-[#192A88] p-1 text-white'>SMR</th>
                                                            <th className='bg-accent3 p-1 text-neutral3'>반복횟수(초당)</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {speechMotorResults.map((v, i) => (
                                                            <tr key={i}>
                                                                <td width='50%'>{v.questionText}</td>
                                                                <td width='50%'>{v.value}</td>
                                                            </tr>
                                                        ))}
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
                                                            <td align='center' width='13%'>
                                                                {answerOptions.find(answer => answer.value === v.answer)?.label}
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
