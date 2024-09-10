import { useQuery } from '@tanstack/react-query';
import { getCookie } from 'cookies-next';

import { getTestInfoAPI } from '@/api/questions';
import { getLoggedInUser } from '@/api/user';

// 로그인 유저 조회 쿼리
export const userQueryKey = 'user';
export const useUserQuery = () => {
    const accessToken = getCookie('jwt') || '';

    return useQuery<{
        result: string;
        data: any;
    }>({
        queryKey: [userQueryKey, accessToken],
        queryFn: () => getLoggedInUser({ jwt: accessToken }),
        enabled: !!accessToken,
    });
};

// 테스트 세션 정보 조회 쿼리
export const testSessionQueryKey = 'testSession';
export const useTestSessionQuery = ({ sessionId, jwt }: { sessionId: number; jwt: string }) => {
    return useQuery<{
        result: string;
        testInfo: {
            testDate: string;
            patientName: string;
            patientGender: string;
            patientBirthdate: string;
            brainLesions: string[];
            medicalHistory: string;
            patientMemo: string;
        };
    }>({
        queryKey: [userQueryKey, sessionId, jwt],
        queryFn: () => getTestInfoAPI({ sessionId, jwt }),
        enabled: !!sessionId && !!jwt,
    });
};

// 테스트 세션 정보 조회 쿼리
export const testSessionQueryKey = 'testSession';
export const useTestSessionQuery = ({ sessionId, jwt }: { sessionId: number; jwt: string }) => {
    return useQuery<{
        result: string;
        testInfo: {
            testDate: string;
            patientName: string;
            patientGender: string;
            patientBirthdate: string;
            brainLesions: string[];
            medicalHistory: string;
            patientMemo: string;
        };
    }>({
        queryKey: [userQueryKey, sessionId, jwt],
        queryFn: () => getTestInfoAPI({ sessionId, jwt }),
        enabled: !!sessionId && !!jwt,
    });
};
