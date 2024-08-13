import { useCallback, useState } from 'react';
import type { GetServerSideProps } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';

import dayjs from 'dayjs';

import Container from '@/components/common/Container';
import { PrintIcon } from '@/components/icons';
import { getTestResultAPI } from '@/api/questions';

import graphImg from 'public/static/images/graph-img.png';

const genderOptionList = [
    { value: 'male', label: '남' },
    { value: 'female', label: '여' },
];

const defaultTestInfo = {
    therapistUserId: 178,
    testDate: '2024-08-02',
    patientName: '조대형',
    patientGender: 'male',
    patientBirthdate: '1990-08-24',
    brainLesions: [],
    medicalHistory: '',
    memo: '',
};

const user = {
    therapistUserId: 178,
    testerName: '김검사',
};

// Stress Testing 문항 페이지
export default function TestResultPage({
    testInfo,
}: {
    testInfo: {
        testDate: string;
    };
}) {
    const router = useRouter(); // next router

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
            <div className='relative w-full'>
                <Link href={'/personalInfo'} className='absolute bottom-0 left-2 underline'>
                    개인정보 수정
                </Link>
                <h1 className='text-center font-jalnan text-head-1'>말운동평가 검사 결과</h1>
                <button className='absolute bottom-0 right-2 flex items-center gap-1'>
                    <PrintIcon color={'#212529'} />
                    <u>인쇄하기</u>
                </button>
            </div>
            <table className='mt-[50px] w-full overflow-hidden rounded-base'>
                <tbody>
                    <tr>
                        <td className='bg-accent3 py-[18px] font-bold' align='center' width='25%'>
                            환자명
                        </td>
                        <td className='border-l border-neutral6 bg-accent3 py-[18px] font-bold' align='center' width='25%'>
                            성별
                        </td>
                        <td className='border-l border-neutral6 bg-accent3 py-[18px] font-bold' align='center' width='25%'>
                            생년월일
                        </td>
                        <td className='border-l border-neutral6 bg-accent3 py-[18px] font-bold' align='center' width='25%'>
                            검사자
                        </td>
                    </tr>
                    <tr>
                        <td className='bg-white py-[18px]' align='center'>
                            {defaultTestInfo.patientName}
                        </td>
                        <td className='border-l border-neutral6 bg-white py-[18px]' align='center'>
                            {genderOptionList.find(v => v.value === defaultTestInfo.patientGender)?.label}
                        </td>
                        <td className='border-l border-neutral6 bg-white py-[18px]' align='center'>
                            {dayjs(defaultTestInfo.patientBirthdate).format('YYYY.MM.DD')}
                        </td>
                        <td className='border-l border-neutral6 bg-white py-[18px]' align='center'>
                            {user.testerName}
                        </td>
                    </tr>
                    <tr>
                        <td className='bg-accent3 py-[18px] font-bold' align='center' width='25%'>
                            신경학적 진단명
                        </td>
                        <td className='border-l border-neutral6 bg-accent3 py-[18px] font-bold' align='center' width='25%'>
                            병력
                        </td>
                        <td className='border-l border-neutral6 bg-accent3 py-[18px] font-bold' align='center' width='25%'>
                            개인관련정보
                        </td>
                        <td className='border-l border-neutral6 bg-accent3 py-[18px] font-bold' align='center' width='25%'>
                            검사일자
                        </td>
                    </tr>
                    <tr>
                        <td className='bg-white py-[18px]' align='center'>
                            {defaultTestInfo.brainLesions.join(',')}
                        </td>
                        <td className='border-l border-neutral6 bg-white py-[18px]' align='center'>
                            {defaultTestInfo.medicalHistory}
                        </td>{' '}
                        <td className='border-l border-neutral6 bg-white py-[18px]' align='center'>
                            {defaultTestInfo.memo}
                        </td>
                        <td className='border-l border-neutral6 bg-white py-[18px]' align='center'>
                            {dayjs(defaultTestInfo.testDate).format('YYYY.MM.DD')}
                        </td>
                    </tr>
                </tbody>
            </table>

            <div className='mt-20 w-full'>
                <h2 className='font-bold text-black text-head-2'>TOTAL SCORE</h2>
                <div className='mt-[30px] flex gap-[30px]'>
                    <div className='h-[346px] w-[390px] rounded-base bg-white shadow-base'></div>
                    <div className='h-[346px] w-[580px] rounded-base bg-white shadow-base'></div>
                </div>
            </div>

            <div className='mt-20 w-full'>
                <h2 className='font-bold text-black text-head-2'>SPEECH MECHANISM : 말기제 평가</h2>
                <div className='mt-[30px] h-[340px] w-full rounded-base bg-white shadow-base'></div>
            </div>

            <div className='mt-20 w-full'>
                <h2 className='font-bold text-black text-head-2'>SPEECH I : 영역별 말평가 / SPEECH II : 종합적 말평가</h2>
                <div className='mt-[30px] h-[340px] w-full rounded-base bg-white shadow-base'></div>
            </div>

            <div className='mt-20 w-full'>
                <h2 className='font-bold text-black text-head-2'>SPEECH MOTOR : 말기제 평가</h2>
                <div className='mt-[30px] h-[340px] w-full rounded-base bg-white shadow-base'></div>
            </div>

            <div className='mt-20'>
                <Link href='/' className='inline-flex items-center justify-center btn btn-large btn-outlined'>
                    홈
                </Link>
                <button type='button' className='ml-5 btn btn-large btn-contained' onClick={() => {}}>
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
