import { useCallback, useMemo, useState, type ChangeEventHandler, type ReactElement, type ReactNode } from 'react';
import { Controller, useForm, useWatch, type Control } from 'react-hook-form';
import type { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';

import { ErrorMessage } from '@hookform/error-message';
import { isAxiosError } from 'axios';
import { getCookie } from 'cookies-next';
import dayjs from 'dayjs';

import Container from '@/components/common/Container';
import Select from '@/components/common/Select';
import ScreeningAppLayout from '@/components/screening/ScreeningAppLayout';
import { useUserQuery } from '@/hooks/user';

import styles from './initialQuestion.module.css';

import type { ScreeningTestInfo } from '@/types/screening';
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

const genderOptions = [
    { value: 'female', label: '여' },
    { value: 'male', label: '남' },
];

const Label = ({ children, htmlFor, required }: { children: ReactNode; htmlFor: string; required?: boolean }) => {
    return (
        <label htmlFor={htmlFor} className='mb-4 mt-10 block font-noto font-bold text-black text-head-2'>
            {children}
            {required && <span className='text-red1'>*</span>}
        </label>
    );
};

const ErrorText = ({ children }: { children: ReactNode }) => {
    return <p className='mt-1 text-red1 text-body-2'>{children}</p>;
};

type QuestionAnswer = {
    questionId: number;
    questionText: string;
    questionDesc?: string;
    answer?: string | null;
};

const AnswerButton = ({
    name,
    label,
    value,
    onChange,
    checked,
}: {
    name: string;
    label: string;
    value: string;
    onChange: ChangeEventHandler<HTMLInputElement>;
    checked?: boolean;
}) => {
    return (
        <div>
            <input type='radio' className='appearance-none' name={name} id={value} value={value} onChange={onChange} checked={checked} />
            <label htmlFor={value} className={styles['radio-label']}>
                {label}
                <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none'>
                    <rect x='1' y='1' width='22' height='22' rx='11' stroke='#CED4DA' strokeWidth='2' />
                    <circle cx='12' cy='12' r='7' fill='#CED4DA' />
                </svg>
            </label>
        </div>
    );
};

const ScreeningInitialQuestionPage: NextPageWithLayout<{
    questionAnswerList: QuestionAnswer[];
    questionNo: number;
}> = ({ questionAnswerList, questionNo }) => {
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

        if (currentQuestionNo < questionAnswerList.length - 1) {
            setCurrentQuestionNo(prev => prev + 1);
        } else {
            // TODO: 녹음 페이지 URl로 보내기
            router.push('url');
        }
        typeof window !== 'undefined' && window.scrollTo(0, 0); // 스크롤 초기화
    }, [currentQuestionNo, questionAnswerList, router]);

    const ageGroup = router.query.ageGroup;

    const ageGroupTitle = useMemo(() => ageGroupList.find(v => v.status === String(router.query.ageGroup))?.desc, [router]);

    const [answer, setAnswer] = useState<string | null>(questionAnswerList[currentQuestionNo]?.answer || null);

    const handleOnChange = useCallback<ChangeEventHandler<HTMLInputElement>>(e => {
        setAnswer(e.target.value);
        console.log(e.target.checked);
    }, []);

    return (
        <Container>
            <h1 className='font-jalnan text-head-1'>초기질문</h1>
            <div className='my-20 w-full overflow-hidden rounded-[15px] shadow-base'>
                <div className='bg-accent1 py-3'>
                    <h2 className='text-center font-bold text-white text-body-2'>{ageGroupTitle}</h2>
                </div>
                <div className='bg-white px-[180px] py-[50px] text-center'>
                    <p className='mb-[10px] font-noto font-[900] text-head-2'>{`Q${questionNo + 1}. ${questionAnswerList[currentQuestionNo]?.questionText}`}</p>
                    <p className='mb-[50px] break-keep font-noto text-head-3'>{questionAnswerList[currentQuestionNo]?.questionDesc}</p>
                    <AnswerButton name='answer' value='Y' label='예' onChange={handleOnChange} checked={answer === 'Y'} />
                    <AnswerButton name='answer' value='N' label='아니오' onChange={handleOnChange} checked={answer === 'N'} />
                </div>
            </div>
            <div>
                <button
                    type='button'
                    className='disabled:btn-outlined-disabled btn btn-large btn-outlined'
                    onClick={handleClickPrev}
                    disabled={currentQuestionNo === 0}
                >
                    이전
                </button>
                <button
                    key='noSubmit'
                    type='button'
                    className='disabled:btn-contained-disabled ml-5 btn btn-large btn-contained'
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
        const ageGroup = String(context.query.ageGroup);
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
                    questionAnswerList,
                    questionNo: 0,
                },
            };
        }

        return {
            props: {
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
