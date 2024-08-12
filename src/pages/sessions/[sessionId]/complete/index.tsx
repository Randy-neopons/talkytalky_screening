import { useCallback, useEffect, useMemo, useState, type ChangeEventHandler } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import ReactTextareaAutosize from 'react-textarea-autosize';
import type { GetServerSideProps } from 'next';
import Image from 'next/image';
import { useRouter } from 'next/router';

import { subtestList } from '@/stores/testInfoStore';
import CheckBox from '@/components/common/CheckBox';
import Container from '@/components/common/Container';
import { getQuestionListAPI, getUnassessableQuestionListAPI } from '@/api/questions';

import completeImg from 'public/static/images/complete-img.png';

// Stress Testing 문항 페이지
export default function CompletePage() {
    // console.log('questionList', questionList);
    const router = useRouter();

    // 폼 제출
    const handleClickResult = useCallback(() => {
        try {
            const sessionId = Number(router.query.sessionId);
            router.push(`/sessions/${sessionId}/result`);
        } catch (err) {
            console.error(err);
        }
    }, [router]);

    return (
        <Container>
            <Image src={completeImg} alt='complete' className='mt-[200px] xl:mt-[260px]' width={86} height={116} />
            <h1 className='mt-10 font-jalnan text-head-1'>검사가 완료되었습니다.</h1>
            <span className='mt-[10px] text-body-2'>검사결과는 언제든지 다시확인하실 수 있습니다.</span>
            <div>
                <button type='button' className='mt-20 btn btn-large btn-contained' onClick={handleClickResult}>
                    결과 확인하기
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
        const responseData = await getUnassessableQuestionListAPI(sessionId);
        const questionList = responseData.questions;

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
