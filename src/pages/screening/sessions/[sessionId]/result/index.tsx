import { Fragment, useCallback, useEffect, type ReactElement, type ReactNode } from 'react';
import type { GetServerSideProps } from 'next';
import Image from 'next/image';
import { useRouter } from 'next/router';

import { isAxiosError } from 'axios';

import { useTimerActions } from '@/stores/timerStore';
import Container from '@/components/common/Container';
import ScreeningAppLayout from '@/components/screening/ScreeningAppLayout';
import { getScreeningTestResultAPI } from '@/api/screening';

import levelIndicatorImg from 'public/static/images/level-indicator-img.png';

import type { ScreeningEvaluationResults } from '@/types/screening';
import type { NextPageWithLayout } from '@/types/types';

// 유창성 레벨 그래프
const LevelGraph = ({ level }: { level: number }) => {
    const percent = 3.5 + level * 15.4;

    return (
        <>
            <div className='relative w-full'>
                {/* 그래프 배경 */}
                <svg
                    xmlns='http://www.w3.org/2000/svg'
                    preserveAspectRatio='none'
                    viewBox='0 0 835 136'
                    fill='none'
                    className='h-[94px] w-full overflow-hidden xl:h-[136px]'
                >
                    <path
                        d='M16.5373 135.168C10.2633 135.277 4.67048 135.265 0 135.168H16.5373C52.4995 134.539 110.84 129.914 146.125 114.482C161.073 108.9 201.328 92.0231 242.769 69.1703C268.282 54.559 326.114 22.8738 353.329 13.0234C370.338 5.30733 414.871 -7.07125 456.931 5.14316C469.043 8.59074 500.691 20.2141 530.38 39.1267C553.574 53.9022 610.942 87.7873 654.856 105.124C681.441 114.82 738.738 131.295 792.698 135.168H835C821.589 136.34 807.265 136.213 792.698 135.168H16.5373Z'
                        fill='url(#paint0_linear_13694_7653)'
                    />
                    <defs>
                        <linearGradient
                            id='paint0_linear_13694_7653'
                            x1='417.5'
                            y1='0'
                            x2='417.5'
                            y2='266.171'
                            gradientUnits='userSpaceOnUse'
                        >
                            <stop stopColor='#6C7BF0' />
                            <stop offset='1' stopColor='white' stopOpacity='0' />
                        </linearGradient>
                    </defs>
                </svg>

                {/* 그래프 border */}
                <div className='absolute bottom-0 h-[1px] w-full bg-neutral6'></div>

                {/* 보조선 */}
                <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='4'
                    viewBox={`0 0 4 135`}
                    fill='none'
                    className='absolute bottom-0 left-1/2 h-[94px] -translate-x-1/2 xl:h-[135px]'
                >
                    <path opacity='0.3' d='M2 0V135' stroke='#6979F8' strokeWidth='3' strokeDasharray='6 6' />
                </svg>
                <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='4'
                    viewBox={`0 0 4 91`}
                    fill='none'
                    className='absolute bottom-0 left-[34.6%] h-[63px] -translate-x-1/2 xl:h-[91px]'
                >
                    <path opacity='0.3' d='M2 0V91' stroke='#6979F8' strokeWidth='3' strokeDasharray='6 6' />
                </svg>
                <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='4'
                    viewBox={`0 0 4 91`}
                    fill='none'
                    className='absolute bottom-0 left-[65.4%] h-[63px] -translate-x-1 xl:h-[91px]'
                >
                    <path opacity='0.3' d='M2 0V91' stroke='#6979F8' strokeWidth='3' strokeDasharray='6 6' />
                </svg>

                {/* 내 레벨 */}
                <Image
                    src={levelIndicatorImg}
                    alt='my-level'
                    className='absolute -bottom-2 h-auto w-[77px] -translate-x-1/2 xl:-bottom-[10px] xl:w-[94px]'
                    style={{ left: `${percent}%` }}
                />
            </div>

            {/* 단계 */}
            <div className='relative mt-[10px] w-full xl:mt-[14px]'>
                {[1, 2, 3, 4, 5].map(level => (
                    <span
                        key={level}
                        className='absolute -translate-x-1/2 font-bold text-body-2'
                        style={{ left: `${3.5 + level * 15.4}%` }}
                    >
                        {level}단계
                    </span>
                ))}
            </div>
        </>
    );
};

// 결과 설명
const ResultSection = ({ title, description }: { title: string; description: ReactNode }) => {
    return (
        <div className='mb-15 w-full overflow-hidden rounded-base drop-shadow-[0px_4px_8px_rgba(0,0,0,0.08)]'>
            <div className='bg-accent3 py-[15px]'>
                <p className='text-center font-bold text-body-2'>{title}</p>
            </div>
            <div className='whitespace-pre-wrap break-keep bg-white px-[40px] py-[42px] text-center xl:px-[94px]'>
                <div className='text-body-1'>{description}</div>
            </div>
        </div>
    );
};

type Description =
    | ScreeningEvaluationResults['wordProductionAssessment']['errorAnalysis']['frequentErrorPatterns']
    | ScreeningEvaluationResults['wordProductionAssessment']['errorAnalysis']['mainErrorTypes']
    | ScreeningEvaluationResults['overallEvaluation']
    | string;

const isFrequentErrorPatterns = (
    description: Description | null,
): description is ScreeningEvaluationResults['wordProductionAssessment']['errorAnalysis']['frequentErrorPatterns'] => {
    return (
        (description as ScreeningEvaluationResults['wordProductionAssessment']['errorAnalysis']['frequentErrorPatterns'])?.[0]?.pattern !==
        undefined
    );
};

const isMainErrorTypes = (
    description: Description | null,
): description is ScreeningEvaluationResults['wordProductionAssessment']['errorAnalysis']['mainErrorTypes'] => {
    return (
        (description as ScreeningEvaluationResults['wordProductionAssessment']['errorAnalysis']['mainErrorTypes'])?.[0]?.type !== undefined
    );
};

// 커스텀 타입 가드
const isOverallEvaluation = (description: Description | null): description is ScreeningEvaluationResults['overallEvaluation'] => {
    return (description as ScreeningEvaluationResults['overallEvaluation'])?.recommendations !== undefined;
};

// 간이언어평가 완료 페이지
const ScreeningResultPage: NextPageWithLayout<{
    age: number;
    level: number;
    sectionList: {
        title: string;
        description: Description | null;
    }[];
}> = ({ age, level, sectionList }) => {
    const router = useRouter();

    const { setTestStart } = useTimerActions();

    useEffect(() => {
        setTestStart && setTestStart(false);
    }, [setTestStart]);

    return (
        <Container>
            <h1 className='mb-15 break-keep text-center font-jalnan text-head-1 xl:mb-20'>간이언어평가 검사 결과</h1>
            {age < 7 && (
                <div className='mb-15 flex w-full flex-col items-center overflow-hidden rounded-base bg-white px-[40px] py-10 drop-shadow-[0px_4px_8px_rgba(0,0,0,0.08)] xl:px-[82px]'>
                    <h2 className='text-noto mb-7.5 break-keep text-center font-bold text-head-3'>
                        우리 아이의 유창성(명료도)레벨은 <span className='text-accent1'>{level}단계</span>입니다.
                    </h2>

                    {/* 유창성 레벨 그래프 */}
                    <LevelGraph level={level} />
                </div>
            )}

            {/* 검사 결과 */}
            {sectionList.map((v, i) => {
                const description = isFrequentErrorPatterns(v.description)
                    ? makeErrorPatterns(v.description)
                    : isMainErrorTypes(v.description)
                      ? makeMainErrorTypes(v.description)
                      : isOverallEvaluation(v.description)
                        ? makeSummary(v.description)
                        : v.description || '없음';

                return <ResultSection key={i} title={v.title} description={description} />;
            })}

            {/* 무료 상담 버튼 */}
            <button className='mt-5 w-full max-w-[450px] py-[18px] btn btn-contained'>
                <p className='font-noto text-[14px]'>우리아이의 언어발달이 고민이라면?</p>
                <p className='font-jalnan text-[14px] text-head-2'>무료상담 신청하기</p>
            </button>
        </Container>
    );
};

ScreeningResultPage.getLayout = function getLayout(page: ReactElement) {
    return <ScreeningAppLayout>{page}</ScreeningAppLayout>;
};

export default ScreeningResultPage;

const makeErrorPatterns = (
    errorPatterns: ScreeningEvaluationResults['wordProductionAssessment']['errorAnalysis']['frequentErrorPatterns'],
) => {
    if (errorPatterns?.[0]?.pattern === '해당 없음') {
        return errorPatterns?.[0]?.description;
    }

    return errorPatterns.map((errorPatternItem, i) => (
        <div key={i} className='mb-3 text-left'>
            <p>
                <b>{errorPatternItem.pattern}</b>
            </p>
            <ul className='mt-2'>
                <li className='list-inside list-disc'>{errorPatternItem.description}</li>
                <li className='list-inside list-disc'>예시: {errorPatternItem.example}</li>
            </ul>
        </div>
    ));
};

const makeMainErrorTypes = (mainErrorTypes: ScreeningEvaluationResults['wordProductionAssessment']['errorAnalysis']['mainErrorTypes']) => {
    if (mainErrorTypes?.[0]?.type === '오류 없음') {
        return mainErrorTypes?.[0]?.description;
    }

    return mainErrorTypes.map((errorTypeItem, i) => (
        <div key={i} className='mb-3 text-left'>
            <p>
                <b>{errorTypeItem.type}</b>
            </p>
            <ul className='mt-2'>
                <li className='list-inside list-disc'>{errorTypeItem.description}</li>
            </ul>
        </div>
    ));
};

const keyList = [
    { key: 'languageDevelopmentStatus' as const, title: '언어발달상태' },
    { key: 'wordProductionAnalysis' as const, title: '단어 발화 분석' },
    { key: 'comprehensiveLanguageAssessment' as const, title: '종합 언어능력 평가' },
    { key: 'strengths' as const, title: '강점' },
    { key: 'areasForImprovement' as const, title: '개선 필요 영역' },
    { key: 'recommendations' as const, title: '제안사항' },
];

const makeSummary = (overallEvaluation: ScreeningEvaluationResults['overallEvaluation']) => {
    return keyList.map(
        keyItem =>
            keyItem.key && (
                <div key={keyItem.key} className='mb-3 text-left'>
                    <p>
                        <b>{keyItem.title}</b>
                    </p>
                    <ul className='mt-2'>
                        {overallEvaluation[keyItem.key]?.map((v, evaluationIndex) => (
                            <li key={evaluationIndex} className='list-inside list-disc'>
                                {v}
                            </li>
                        ))}
                    </ul>
                </div>
            ),
    );
};

export const getServerSideProps: GetServerSideProps = async context => {
    try {
        const sessionId = Number(context.query.sessionId);
        if (!sessionId) {
            return {
                redirect: {
                    destination: '/screening',
                    permanent: true,
                },
            };
        }

        // 테스트 결과 불러오기
        const testResultData = await getScreeningTestResultAPI({ sessionId });
        const { age, level, abstract, errorConsonant, errorPattern, errors, responseTime, summary, evaluationResults } = testResultData;

        if (!evaluationResults) {
            const sectionList =
                age < 7
                    ? [
                          { title: '개요', description: abstract || null },
                          { title: '오류자음', description: errorConsonant || null },
                          { title: '오류패턴', description: errorPattern || null },
                          { title: '종합의견', description: summary || null },
                      ]
                    : [
                          { title: '개요', description: abstract || null },
                          { title: '말산출오류', description: errors || null },
                          { title: '첫반응시간', description: responseTime || 0 },
                          { title: '종합의견', description: summary || null },
                      ];

            return {
                props: {
                    age,
                    level,
                    sectionList,
                },
            };
        }

        const sectionList =
            age < 7
                ? [
                      {
                          title: '개요',
                          description: evaluationResults.expressiveReceptiveLanguageAssessment?.analysis.join(' ') || null,
                      },
                      {
                          title: '오류자음',
                          description: evaluationResults.wordProductionAssessment?.errorAnalysis?.frequentErrorPatterns || null,
                      },
                      {
                          title: '오류패턴',
                          description: evaluationResults.wordProductionAssessment?.errorAnalysis?.mainErrorTypes || null,
                      },
                      {
                          title: '종합의견',
                          description: evaluationResults.overallEvaluation || null,
                      },
                  ]
                : [
                      {
                          title: '개요',
                          description: evaluationResults.expressiveReceptiveLanguageAssessment?.analysis.join(' ') || null,
                      },
                      {
                          title: '오류자음',
                          description: evaluationResults.wordProductionAssessment?.errorAnalysis?.frequentErrorPatterns || null,
                      },
                      {
                          title: '오류패턴',
                          description: evaluationResults.wordProductionAssessment?.errorAnalysis?.mainErrorTypes || null,
                      },
                      {
                          title: '첫반응시간',
                          description: evaluationResults.wordProductionAssessment?.summary
                              ? `정확도: ${evaluationResults.wordProductionAssessment?.summary?.accuracy}%, 총 단어: ${evaluationResults.wordProductionAssessment?.summary?.totalWords}개, 평균응답시간: ${evaluationResults.wordProductionAssessment?.summary?.averageResponseTime}초`
                              : '없음',
                      },
                      {
                          title: '종합의견',
                          description: evaluationResults.overallEvaluation || null,
                      },
                  ];

        return {
            props: {
                age,
                level,
                sectionList,
            },
        };
    } catch (err) {
        return {
            redirect: {
                destination: '/screening',
                permanent: true,
            },
        };
    }
};
