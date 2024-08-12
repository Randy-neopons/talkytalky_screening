import { useCallback, useEffect, useMemo, useState, type ChangeEventHandler } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import ReactTextareaAutosize from 'react-textarea-autosize';
import type { GetServerSideProps } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';

import dayjs from 'dayjs';

import { subtestList } from '@/stores/testInfoStore';
import CheckBox from '@/components/common/CheckBox';
import Container from '@/components/common/Container';
import { getQuestionListAPI, getTestResultAPI, getUnassessableQuestionListAPI } from '@/api/questions';

import graphImg from 'public/static/images/graph-img.png';

// const subtestList = [
//     { subtestId: 1, subtestTitle: 'SPEECH MECHANISM : 말기제 평가' },
//     { subtestId: 2, subtestTitle: 'SPEECH I : 영역별 말평가' },
//     { subtestId: 3, subtestTitle: 'SPEECH II : 종합적 말평가' },
//     { subtestId: 4, subtestTitle: 'SPEECH MOTOR : 말운동 평가' },
//     { subtestId: 5, subtestTitle: 'Stress Testing' },
// ];

// Stress Testing 문항 페이지
export default function TestResultPage({
    testInfo,
}: {
    testInfo: {
        testDate: string;
    };
}) {
    // console.log('questionList', questionList);
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
            <div className='w-full rounded-t-base bg-accent1 px-5 py-[30px] xl:px-10 xl:pb-10'>
                <h1 className='mb-[22px] text-center font-jalnan text-white text-head-1'>말운동 평가 검사 결과</h1>
                <div className='flex justify-between'>
                    <span className='text-white'>
                        <b>검사일 : </b>
                        {dayjs(testInfo.testDate).format('YYYY년 M월 D일')}
                    </span>
                    <Link href={`/personalInfo`} className='text-white underline'>
                        수정하기
                    </Link>
                </div>
                <ul className='mt-5 flex w-full overflow-hidden rounded-base'>
                    <li className='flex-1 text-center'>
                        <div className='bg-accent2 py-[15px] font-bold text-white'>환자명</div>
                        <div className='bg-white py-[15px]'>말운동</div>
                    </li>
                    <li className='flex-1 text-center'>
                        <div className='bg-accent2 py-[15px] font-bold text-white'>성별</div>
                        <div className='bg-white py-[15px]'>말운동</div>
                    </li>
                    <li className='flex-1 text-center'>
                        <div className='bg-accent2 py-[15px] font-bold text-white'>생년월일</div>
                        <div className='bg-white py-[15px]'>말운동</div>
                    </li>
                </ul>
                <ul className='mt-[30px] flex w-full overflow-hidden rounded-base'>
                    <li className='flex-1 text-center'>
                        <div className='bg-accent2 py-[15px] font-bold text-white'>환자명</div>
                        <div className='bg-white py-[15px]'>말운동</div>
                    </li>
                    <li className='flex-1 text-center'>
                        <div className='bg-accent2 py-[15px] font-bold text-white'>성별</div>
                        <div className='bg-white py-[15px]'>말운동</div>
                    </li>
                    <li className='flex-1 text-center'>
                        <div className='bg-accent2 py-[15px] font-bold text-white'>생년월일</div>
                        <div className='bg-white py-[15px]'>말운동</div>
                    </li>
                </ul>
            </div>

            <div className='m-20 w-full'>
                <h2 className='font-bold text-accent1 text-head-2'>SPEECH MECHANISM : 말기제평가</h2>
                <div className='mt-[50px]'>
                    <div>
                        <span className='font-bold text-black text-head-3'>GRAPH</span>
                        <Image src={graphImg} alt='graph' width={622} height={270} />
                    </div>
                </div>
            </div>

            <div>
                <button type='button' className='mt-20 btn btn-large btn-outlined' onClick={() => {}}>
                    홈
                </button>
                <button type='button' className='ml-5 mt-20 btn btn-large btn-contained' onClick={() => {}}>
                    다음
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
        const responseData = await getTestResultAPI({ sessionId });
        const testInfo = responseData.testInfo;

        return {
            props: {
                testSession,
                testInfo,
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
