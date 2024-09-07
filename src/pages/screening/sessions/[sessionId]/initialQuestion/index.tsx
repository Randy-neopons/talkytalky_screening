import { useCallback, useMemo, useState, type ChangeEventHandler, type ReactElement } from 'react';
import type { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';

import { RadioButton } from '@/components/common/Buttons';
import Container from '@/components/common/Container';
import ScreeningAppLayout from '@/components/screening/ScreeningAppLayout';
import { useUserQuery } from '@/hooks/user';

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

    // 이전 파트로
    const handleClickPrev = useCallback(() => {
        if (currentQuestionNo > 0) {
            setCurrentQuestionNo(prev => prev - 1);
        }
        typeof window !== 'undefined' && window.scrollTo(0, 0); // 스크롤 초기화
    }, [currentQuestionNo]);

    // 다음 파트로
    const handleClickNext = useCallback(() => {
        // TODO: 정답 업로드 (액세스 토큰 없이 가능)
        // sessionId, questionId, answer로 업로드
        const sessionId = Number(router.query.sessionId);
        const ageGroup = String(router.query.ageGroup);

        if (currentQuestionNo < questionAnswerList.length - 1) {
            setCurrentQuestionNo(prev => prev + 1);
        } else {
            // 녹음 페이지로 이동
            router.push(`/screening/sessions/${sessionId}/recording?ageGroup=${ageGroup}`);
        }
        typeof window !== 'undefined' && window.scrollTo(0, 0); // 스크롤 초기화
    }, [currentQuestionNo, questionAnswerList, router]);

    const ageGroupTitle = useMemo(() => ageGroupList.find(v => v.status === ageGroup)?.desc, [ageGroup]);

    const [answer, setAnswer] = useState<string | null>(questionAnswerList[currentQuestionNo]?.answer || null);

    const handleOnChange = useCallback<ChangeEventHandler<HTMLInputElement>>(e => {
        setAnswer(e.target.value);
        console.log(e.target.checked);
    }, []);

    return (
        <Container>
            <h1 className='mb-20 font-jalnan text-head-1'>초기질문</h1>
            <div className='mb-20 w-full overflow-hidden rounded-[15px] shadow-base'>
                <div className='bg-accent1 py-3'>
                    <h2 className='text-center font-bold text-white text-body-2'>{ageGroupTitle}</h2>
                </div>
                <div className='bg-white px-[180px] py-[50px] text-center'>
                    <p className='mb-[10px] font-noto font-[900] text-head-2'>{`Q${currentQuestionNo + 1}. ${questionAnswerList[currentQuestionNo]?.questionText}`}</p>
                    <p className='mb-[50px] break-keep font-noto text-head-3'>{questionAnswerList[currentQuestionNo]?.questionDesc}</p>
                    <RadioButton name='answer' value='Y' label='예' onChange={handleOnChange} checked={answer === 'Y'} />
                    <RadioButton name='answer' value='N' label='아니오' onChange={handleOnChange} checked={answer === 'N'} />
                </div>
            </div>
            <div>
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
                    className='ml-5 btn btn-large btn-contained disabled:btn-contained-disabled'
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
        const ageGroup = typeof context.query.ageGroup === 'string' ? context.query.ageGroup : '1';
        const questionNo = Number(context.query.questionNo);

        // TODO: ageGroup으로 questionAnswerList 받아오기

        const questionAnswerList = [
            {
                questionId: 1,
                questionText: '다른 사람의 표정을 구별하여 반응한다',
                questionDesc: '(예: 아빠가 화난 표정을 하면 유아도 심각한 표정을, 엄마가 놀라는 표정을 하면 유아도 놀란 표정을 짓는다)',
                answer: 'Y',
            },
            {
                questionId: 2,
                questionText: '지속적인 반복음에 반응을 보인다',
                questionDesc: '(예: 청소기, 세탁기 등의 소리)',
            },
            {
                questionId: 3,
                questionText: '금지를 의미하는 단어 "안돼" 라는 어조에 반응한다',
            },
        ];

        // 잘못된 질문 번호면 0으로 리셋
        if (!questionAnswerList[questionNo]) {
            return {
                props: {
                    ageGroup,
                    questionAnswerList,
                    questionNo: 0,
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
        return {
            redirect: {
                destination: '/',
                permanent: true,
            },
        };
    }
};
