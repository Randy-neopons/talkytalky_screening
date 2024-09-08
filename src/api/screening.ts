import axios from 'axios';

import { API_URL } from '@/utils/const';

axios.defaults.baseURL = API_URL;

const makeHeaders = (accessToken: string) => {
    const token = accessToken;
    return { Authorization: `Bearer ${token}` };
};

// 세션 목록
export async function getScreeningSessionListAPI({ jwt }: { jwt: string }) {
    const response = await axios.get('/assessment/screening/sessions', {
        headers: makeHeaders(jwt),
    });
    return response.data;
}
