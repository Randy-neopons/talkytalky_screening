import { useCallback, useEffect, useMemo, useState, type ChangeEventHandler, type ReactElement } from 'react';
import type { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';

import { RadioButton } from '@/components/common/Buttons';
import Container from '@/components/common/Container';
import ScreeningAppLayout from '@/components/screening/ScreeningAppLayout';
import { useUserQuery } from '@/hooks/user';
import { getScreeningQuestionAndAnswerListAPI, getScreeningTestInfoAPI, uploadAnswerAPI } from '@/api/screening';

import type { NextPageWithLayout } from '@/types/types';

const ageGroupList = [
    { desc: '만3세 미만', status: '1' },
    { desc: '만3~4세', status: '2' },
    { desc: '만4~5세', status: '3' },
    { desc: '만5~6세', status: '4' },
    { desc: '만6~7세', status: '5' },
    { desc: '학령기', status: '6' },
    { desc: '성인', status: '7' },
];

type QuestionAnswer = {
    questionId: number;
    questionText: string;
    questionDesc?: string;
    answer?: string | null;
};

const ScreeningInitialQuestionPage: NextPageWithLayout<{
    ageGroup: string;
    questionAnswerList: QuestionAnswer[];
    questionNo: number;
}> = ({ ageGroup, questionAnswerList, questionNo }) => {
    const router = useRouter(); // next router
    const { data: user } = useUserQuery();

    const [currentQuestionNo, setCurrentQuestionNo] = useState(questionNo || 0); //  0부터 시작

    const [answer, setAnswer] = useState<string | null>(questionAnswerList[currentQuestionNo]?.answer || null);

    useEffect(() => {
        setAnswer(questionAnswerList[currentQuestionNo]?.answer || null);
    }, [currentQuestionNo, questionAnswerList]);

    const handleOnChange = useCallback<ChangeEventHandler<HTMLInputElement>>(e => {
        setAnswer(e.target.value);
    }, []);

    // 이전 파트로
    const handleClickPrev = useCallback(() => {
        if (currentQuestionNo > 0) {
            setCurrentQuestionNo(prev => prev - 1);
        }
        typeof window !== 'undefined' && window.scrollTo(0, 0); // 스크롤 초기화
    }, [currentQuestionNo]);

    // 다음 파트로
    const handleClickNext = useCallback(async () => {
        try {
            // TODO: 정답 업로드 (액세스 토큰 없이 가능)
            // sessionId, questionId, answer로 업로드
            const sessionId = Number(router.query.sessionId);
            const ageGroup = String(router.query.ageGroup);
            const currentPathname = `/screening/sessions/${sessionId}/initialQuestion?questionNo=${currentQuestionNo}`;

            if (!answer) {
                throw new Error('정답이 없습니다.');
            }

            await uploadAnswerAPI({
                sessionId,
                questionId: questionAnswerList[currentQuestionNo].questionId,
                answer,
                currentPathname,
            });

            if (currentQuestionNo < questionAnswerList.length - 1) {
                setCurrentQuestionNo(prev => prev + 1);
            } else {
                // 녹음 페이지로 이동
                router.push(`/screening/sessions/${sessionId}/recording?ageGroup=${ageGroup}`);
            }
            typeof window !== 'undefined' && window.scrollTo(0, 0); // 스크롤 초기화
        } catch (err) {
            console.error(err);
        }
    }, [answer, currentQuestionNo, questionAnswerList, router]);

    const ageGroupTitle = useMemo(() => ageGroupList.find(v => v.status === ageGroup)?.desc, [ageGroup]);

    return (
        <Container>
            <h1 className='mb-15 font-jalnan text-head-1 xl:mb-20'>초기질문</h1>
            <div className='mb-20 w-full overflow-hidden rounded-[15px] shadow-base'>
                <div className='bg-accent1 py-3'>
                    <h2 className='text-center font-bold text-white text-body-2'>{ageGroupTitle}</h2>
                </div>
                <div className='px-7.5 bg-white py-[50px] text-center sm:px-[77px] xl:px-[180px]'>
                    <p className='mb-[10px] break-keep font-noto font-[900] text-head-2'>{`Q${currentQuestionNo + 1}. ${questionAnswerList[currentQuestionNo]?.questionText}`}</p>
                    <p className='mb-[50px] break-keep font-noto text-head-3'>{questionAnswerList[currentQuestionNo]?.questionDesc}</p>
                    <div className='flex flex-col gap-5'>
                        <RadioButton name='answer' value='Y' label='예' onChange={handleOnChange} checked={answer === 'Y'} />
                        <RadioButton name='answer' value='N' label='아니오' onChange={handleOnChange} checked={answer === 'N'} />
                    </div>
                </div>
            </div>
            <div className='flex flex-wrap justify-center gap-5'>
                <button
                    type='button'
                    className='btn btn-large btn-outlined disabled:btn-outlined-disabled'
                    onClick={handleClickPrev}
                    disabled={currentQuestionNo === 0}
                >
                    이전
                </button>
                <button
                    type='button'
                    className='btn btn-large btn-contained disabled:btn-contained-disabled'
                    onClick={handleClickNext}
                    disabled={!answer}
                >
                    다음
                </button>
            </div>
        </Container>
    );
};

ScreeningInitialQuestionPage.getLayout = function getLayout(page: ReactElement) {
    return <ScreeningAppLayout>{page}</ScreeningAppLayout>;
};

export default ScreeningInitialQuestionPage;

export const getServerSideProps: GetServerSideProps = async context => {
    try {
        const sessionId = Number(context.query.sessionId);
        const questionNo = Number(context.query.questionNo);

        const testInfoResponse = await getScreeningTestInfoAPI({ sessionId });
        const testInfo = testInfoResponse.testInfo;
        const ageGroup = testInfo.ageGroup;
        const progress = testInfo.progress;

        // questionAnswerList 받아오기
        const responseData = await getScreeningQuestionAndAnswerListAPI({ sessionId, ageGroup });
        const questionAnswerList = responseData.questions;

        // 잘못된 질문 번호면 0으로 리셋
        if (!questionAnswerList[questionNo]) {
            return {
                props: {
                    ageGroup,
                    questionAnswerList,
                    questionNo: 0,
                    progress,
                },
            };
        }

        return {
            props: {
                ageGroup,
                questionAnswerList,
                questionNo,
            },
        };
    } catch (err) {
        console.error(err);
        return {
            redirect: {
                destination: '/screening',
                permanent: true,
            },
        };
    }
};
