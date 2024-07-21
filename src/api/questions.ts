import axios from 'axios';
axios.defaults.baseURL = 'http://localhost:5400/api/v1';

// 문항 목록 조회
export async function getQuestionListAPI(subtestId: number) {
    const response = await axios.get('/assessment/questions', { params: { subtestId } });
    return response.data;
}
