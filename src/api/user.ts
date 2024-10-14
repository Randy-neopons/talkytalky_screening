import axios from 'axios';

import { API_URL } from '@/utils/const';

axios.defaults.baseURL = API_URL;

const makeHeaders = (accessToken: string) => {
    const token = accessToken;
    return { Authorization: `Bearer ${token}` };
};

// 로그인 유저 조회
export async function getLoggedInUser({ jwt }: { jwt: string }) {
    const response = await axios.get('/info/user', {
        headers: makeHeaders(jwt),
    });
    return response.data;
}
