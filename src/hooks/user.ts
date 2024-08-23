import { useQuery } from '@tanstack/react-query';
import { getCookie } from 'cookies-next';

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
    });
};
