import { useCallback } from 'react';
import type { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';

import { getCookie } from 'cookies-next';
import dayjs from 'dayjs';

import { PersonalInfoForm } from '@/pages/das/personalInfo';
import Container from '@/components/common/Container';
import { useUserQuery } from '@/hooks/user';
import { getTestInfoAPI, updateTestInfoAPI } from '@/api/das';

import type { TestInfoFormValues } from '@/types/das';

type FormValues = Omit<TestInfoFormValues, 'testDate' | 'patientBirthdate'> & {
    testYear: string;
    testMonth: string;
    testDay: string;
    birthYear: string;
    birthMonth: string;
    birthDay: string;
};

export default function PersonalInfoEditPage({
    testInfo,
}: {
    testInfo: {
        testDate: string;
        patientName: string;
        patientGender: string;
        patientBirthdate: string;
        brainLesions: string[];
        medicalHistory: string;
        patientMemo: string;
    };
}) {
    const router = useRouter();
    const { data: user } = useUserQuery();

    const onSubmit = useCallback(
        async (data: FormValues) => {
            console.log(data);
            const { testYear, testMonth, testDay, birthYear, birthMonth, birthDay, ...rest } = data;

            const testDate = dayjs(new Date(Number(testYear), Number(testMonth) - 1, Number(testDay))).format('YYYY-MM-DD');
            const patientBirthdate = dayjs(new Date(Number(birthYear), Number(birthMonth) - 1, Number(birthDay))).format('YYYY-MM-DD');

            const formValues = {
                ...rest,
                therapistUserId: user?.data.therapistUserId,
                testDate,
                patientBirthdate,
            };

            const sessionId = Number(router.query.sessionId);
            const accessToken = getCookie('jwt') as string;
            await updateTestInfoAPI({ sessionId, testInfo: formValues, jwt: accessToken });
            router.push(`/das/sessions/${router.query.sessionId}/result`); // 결과 화면으로
        },
        [router, user?.data.therapistUserId],
    );

    return (
        <Container>
            <h1 className='font-jalnan text-head-1'>기본정보 수정</h1>
            <PersonalInfoForm userInfo={user?.data} testInfo={testInfo} onSubmit={onSubmit} />
        </Container>
    );
}

export const getServerSideProps: GetServerSideProps = async context => {
    try {
        const accessToken = getCookie('jwt', context);
        const sessionId = Number(context.query.sessionId);
        if (!accessToken || accessToken === 'undefined') {
            return {
                props: {
                    isLoggedIn: false,
                },
            };
        }

        const { testInfo } = await getTestInfoAPI({ sessionId, jwt: accessToken });

        return {
            props: {
                isLoggedIn: true,
                testInfo,
            },
        };
    } catch (err) {
        return {
            redirect: {
                destination: '/das',
                permanent: true,
            },
        };
    }
};
