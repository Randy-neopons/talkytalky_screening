import dynamic from 'next/dynamic';

import dayjs from 'dayjs';

import { answerOptions, brainLesionOptions, dominantHandOptions, genderOptions, hearingAidsUseOptions, typeOptions } from '@/utils/const';
import { CheckBoxGroupItem } from '@/components/common/CheckBox';
import { useUserQuery } from '@/hooks/user';
import type { TestInfo } from '@/api/das';

import styles from './PrintView.module.scss';

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
        className='mr-1 rounded border bg-white peer-checked:border-none peer-checked:bg-neutral3'
        xmlns='http://www.w3.org/2000/svg'
        width='14'
        height='14'
        viewBox='0 0 24 24'
        fill='none'
    >
        <path d='M7 12L11 16L17 8' stroke='white' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
    </svg>
);

export const SubtestScore = ({
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
        <div className='mt-7.5 w-full'>
            <h2 className='text-xs font-bold text-black'>{subtestTitle}</h2>
            <div className='mt-2.5 flex w-full gap-7.5 border-b border-t border-b-neutral7 border-t-black bg-white px-5 py-3.5'>
                <div className='h-[100px] w-[100px] flex-none text-center'>
                    <TestTotalScoreGraphPrintView
                        data={[
                            {
                                id,
                                data: [{ x: 'abc', y: totalScore, color: '#AAB2BB' }],
                            },
                        ]}
                        maxScore={maxScore}
                    />
                    {/* <button className='mt-5 underline text-body-2' onClick={() => {}}>
                        경도/심도 항목
                    </button> */}
                </div>
                <div className='flex flex-1 flex-col gap-1.5'>
                    {partList.map((part, i) => (
                        <div key={i}>
                            <div className='ml-1 mr-2 flex justify-between'>
                                <span className='text-[8px] text-neutral3'>{part.partTitle}</span>
                                <span className='text-[8px] text-neutral3'>
                                    {part.score}점 / 총 {part.maxScore}점
                                </span>
                            </div>
                            <div className='relative mt-1 h-1 w-full bg-[#D9D9D9]'>
                                <div
                                    className={`absolute left-0 h-full rounded-full`}
                                    style={{ width: `${(100 * part.score) / part.maxScore}%`, backgroundColor: '#AAB2BB' }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

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
                <div className='flex h-[842px] w-[595px] flex-col bg-white p-7.5 text-black'>
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
            <div className={styles.contentPage}>
                <div className={styles.printHeader}>
                    <h3 className='mt-2.5'>
                        <span className='font-bold text-[#192A88]'>마비말장애 평가시스템</span>
                        <span className='ml-2 text-[#6E757E]'>Dysarthria Assessment System</span>
                        <span className='absolute right-0'>{testInfo.patientName}님</span>
                    </h3>
                </div>
                <div className='h-full w-full'>
                    <div className='w-full'>
                        <div className='relative flex w-full'>
                            <h3 className='mb-1 text-xs font-bold'>TOTAL SCORE</h3>
                            <span className='absolute bottom-0 right-0 text-[8px] text-neutral4'>*모든점수는 100점 만점을 기준으로함</span>
                        </div>
                        <table className='mt-1.5 w-full text-center text-[8px]'>
                            <thead>
                                <tr className='border-t border-black font-bold'>
                                    <th className='bg-neutral6 py-[7px]'>TOTAL SCORE</th>
                                    <th className='bg-neutral8 py-[7px]'>SPEECH MECHANISM</th>
                                    <th className='bg-neutral8 py-[7px]'>SPEECH</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className='bg-[#F9F9F9]'>
                                    <td className='py-[7px]' width='33%'>
                                        100점
                                    </td>
                                    <td className='py-[7px]' width='33%'>
                                        100점
                                    </td>
                                    <td className='py-[7px]' width='33%'>
                                        100점
                                    </td>
                                </tr>
                            </tbody>
                        </table>
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

                    {speechMotorResults.length > 0 && (
                        <div className='mt-7.5 w-full'>
                            <h2 className='text-xs font-bold'>SPEECH MOTOR : 말운동 평가</h2>
                            <table className='mt-2.5 w-full overflow-hidden border-b border-b-neutral7 text-[8px]'>
                                <thead>
                                    <tr className='border-t border-t-black'>
                                        <th className='bg-neutral8 py-[7px] font-bold' align='center' colSpan={2}>
                                            AMR & SMR
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {speechMotorResults.map((v, i) => (
                                        <tr key={i}>
                                            <td className='border-t border-neutral7 bg-white py-[7px] pl-[15px]' width='87%'>
                                                {v.questionText}
                                            </td>
                                            <td className='border-l border-t border-neutral7 bg-white py-[7px]' align='center' width='13%'>
                                                {v.value}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {mildAndModerateAnswers.length > 0 && (
                        <div className='mt-7.5 w-full'>
                            <h2 className='text-xs font-bold'>경도 & 심도 체크항목</h2>
                            <table className='mt-2.5 w-full overflow-hidden border-b border-t border-b-neutral7 border-t-black text-[8px]'>
                                <thead>
                                    <tr className=''>
                                        <th className='bg-neutral8 py-[7px] font-bold' align='center'>
                                            영역
                                        </th>
                                        <th className='bg-neutral8 py-[7px] font-bold' align='center'>
                                            질문
                                        </th>
                                        <th className='bg-neutral8 py-[7px] font-bold' align='center'>
                                            답변
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {mildAndModerateAnswers.map((v, i) => (
                                        <tr key={i} className=''>
                                            <td className='border-t border-neutral7 bg-white py-[7px]' align='center' width='13%'>
                                                {v.partTitle}
                                            </td>
                                            <td className='border-l border-t border-neutral7 bg-white py-[7px] pl-[15px]' width='74%'>
                                                {v.questionText}
                                            </td>
                                            <td className='border-l border-t border-neutral7 bg-white py-[7px]' align='center' width='13%'>
                                                {answerOptions.find(answer => answer.value === v.answer)?.label}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className='mt-7.5 w-full'>
                        <h2 className='text-xs font-bold'>마비말장애 유형</h2>
                        <div className='mt-2.5 flex break-after-avoid flex-row flex-wrap gap-x-5 gap-y-3'>
                            {typeOptions.map(type => (
                                <div key={type.value} className='flex'>
                                    <label className='flex cursor-pointer items-center text-[8px]'>
                                        <input type='checkbox' className='peer hidden' checked={types?.includes(type.value)} readOnly />
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
                        <div className='mt-2.5 flex min-h-[94px] flex-row flex-wrap gap-x-5 gap-y-3 border-b border-t border-b-neutral8 border-t-black px-[15px] py-2.5 text-[8px]'>
                            {opinion || '없음'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
