import { useCallback, type ReactElement, type ReactNode } from 'react';
import { Controller, useForm, useWatch, type Control } from 'react-hook-form';
import type { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';

import { ErrorMessage } from '@hookform/error-message';
import { getCookie } from 'cookies-next';
import dayjs from 'dayjs';

import Container from '@/components/common/Container';
import Select from '@/components/common/Select';
import ScreeningAppLayout from '@/components/screening/ScreeningAppLayout';
import { useUserQuery } from '@/hooks/user';

import styles from './PersonalInfo.module.css';

import type { ScreeningTestInfo } from '@/types/screening';
import type { NextPageWithLayout } from '@/types/types';

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

const ScreeningInitialQuestionPage: NextPageWithLayout = () => {
    const router = useRouter(); // next router
    const { data: user } = useUserQuery();

    // 이전 파트로
    const handleClickPrev = useCallback(() => {
        partId > PART_ID_START && setPartId(partId => partId - 1);
        typeof window !== 'undefined' && window.scrollTo(0, 0);
    }, [partId]);

    // 다음 파트로
    const handleClickNext = useCallback(() => {
        partId < partIndexList[partIndexList.length - 1].partId && setPartId(partId => partId + 1);
        typeof window !== 'undefined' && window.scrollTo(0, 0); // 스크롤 초기화
    }, [partId]);

    // 폼 제출
    // 폼 데이터 제출
    const handleSubmitData = useCallback(
        async ({ sessionId, data }: { sessionId: number; data: any }) => {
            try {
                const formData = new FormData();
                formData.append('testTime', `${testTime}`);
                formData.append('currentPartId', `${partId}`);
                formData.append('answers', JSON.stringify(data.answers));

                // 세션 갱신
                const accessToken = getCookie('jwt') as string;
                await updateSessionAPI({ sessionId, formData, jwt: accessToken });
            } catch (err) {
                if (isAxiosError(err)) {
                    if (err.response?.status === 401) {
                        deleteCookie('jwt');
                        alert('로그인이 필요합니다.\n토키토키 로그인 페이지로 이동합니다.');
                        window.location.href = `${TALKYTALKY_URL}/login`;
                        return;
                    }
                }
                console.error(err);
            }
        },
        [partId, testTime],
    );

    // 폼 제출
    const handleOnSubmit = useCallback(
        async (data: any) => {
            try {
                const sessionId = Number(router.query.sessionId);
                await handleSubmitData({ sessionId, data });

                const subtests = subtestsData?.subtests;
                if (!subtests) {
                    throw new Error('수행할 소검사가 없습니다');
                }
                const currentSubtestIndex = subtests.findIndex(v => v.subtestId === CURRENT_SUBTEST_ID);
                const nextSubtestItem = subtests?.[currentSubtestIndex + 1];
                if (nextSubtestItem) {
                    if (nextSubtestItem.subtestId === 5) {
                        router.push(`/sessions/${sessionId}/subtests/${nextSubtestItem.pathname}/questions`);
                    } else {
                        router.push(`/sessions/${sessionId}/subtests/${nextSubtestItem.pathname}`);
                    }
                } else {
                    router.push(`/sessions/${sessionId}/unassessable`);
                }
            } catch (err) {
                console.error(err);
            }
        },
        [handleSubmitData, router, subtestsData],
    );

    return (
        <Container>
            <h1 className='font-jalnan text-head-1'>기본정보 입력</h1>
        </Container>
    );
};

ScreeningInitialQuestionPage.getLayout = function getLayout(page: ReactElement) {
    return <ScreeningAppLayout>{page}</ScreeningAppLayout>;
};

export default ScreeningInitialQuestionPage;

export const getServerSideProps: GetServerSideProps = async context => {
    try {
        const accessToken = getCookie('jwt', context);
        if (!accessToken || accessToken === 'undefined') {
            return {
                props: {
                    isLoggedIn: false,
                },
            };
        }

        return {
            props: {
                isLoggedIn: true,
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
