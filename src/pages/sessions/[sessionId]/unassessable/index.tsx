import { useCallback, useMemo, useState, type ChangeEventHandler } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import ReactTextareaAutosize from 'react-textarea-autosize';
import type { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';

import CheckBox from '@/components/common/CheckBox';
import Container from '@/components/common/Container';
import { getQuestionListAPI, getUnassessableQuestionListAPI } from '@/api/questions';

const subtestList = [
    { subtestId: 1, subtestTitle: 'SPEECH MECHANISM : 말기제 평가' },
    { subtestId: 2, subtestTitle: 'SPEECH I : 영역별 말평가' },
    { subtestId: 3, subtestTitle: 'SPEECH II : 종합적 말평가' },
    { subtestId: 4, subtestTitle: 'SPEECH MOTOR : 말운동 평가' },
    { subtestId: 5, subtestTitle: 'Stress Testing' },
];

// Stress Testing 문항 페이지
export default function UnassessableQuestionsPage({
    questionList,
}: {
    questionList: {
        answerId: number;
        questionId: number;
        questionText: string;
        subtestId: number;
        subtestTitle: string;
        partId: number;
        partTitle: string;
    }[];
}) {
    const router = useRouter();

    // 문항 전부 정상으로 체크
    const [checkAll1, setCheckAll1] = useState(false);

    // 소검사 내 현재 파트 정보
    const [currentPartId, setCurrentPartId] = useState(1);

    // 이전 파트로
    const handleClickPrev = useCallback(() => {
        setCheckAll1(false);
        currentPartId > 1 && setCurrentPartId(partId => partId - 1);
        typeof window !== 'undefined' && window.scrollTo(0, 0);
    }, [currentPartId]);

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
            <h1 className='whitespace-pre-line text-center font-jalnan text-head-1'>평가불가에 체크한 항목</h1>
            {subtestList.map(subtest => (
                <div key={subtest.subtestId} className='mt-20 w-full rounded-base bg-white px-10 pb-5 pt-[27px] text-head-2'>
                    <h2 className='font-bold text-accent1 text-head-2'>{subtest.subtestTitle}</h2>
                    {questionList
                        .filter(question => question.subtestId === subtest.subtestId)
                        .map(question => (
                            <div key={question.answerId}>{question.questionText}</div>
                        ))}
                </div>
            ))}
            <div>
                <button type='button' className='ml-5 mt-20 btn btn-large btn-contained' onClick={() => {}}>
                    건너뛰기
                </button>
            </div>
        </Container>
    );
}

export const getServerSideProps: GetServerSideProps = async context => {
    const sessionId = Number(context.query.sessionId);

    // if (!sessionId) {
    //     return {
    //         redirect: {
    //             destination: '/',
    //             permanent: true,
    //         },
    //     };
    // }

    try {
        // TODO: sessionId 통해 시험 세션 정보 얻음
        const testSession = {
            sessionId,
            subtests: [],
        };

        // 소검사 문항 정보 fetch
        const responseData = await getUnassessableQuestionListAPI(sessionId);
        console.log(responseData);
        const questionList = responseData.questions;

        console.log('questionList', questionList);

        return {
            props: {
                testSession,
                questionList,
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
