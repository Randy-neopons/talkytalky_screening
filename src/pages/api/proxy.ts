import type { NextApiRequest, NextApiResponse } from 'next';

import axios from 'axios';

// cloud storage 서버로부터 audioUrl 받아오기 위한 proxy
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { audioUrl } = req.query;

    try {
        // axios를 사용해 오디오 URL에서 데이터를 가져옴
        const response = await axios.get(audioUrl as string, {
            responseType: 'arraybuffer',
        });

        // Content-Type 헤더를 설정하고 클라이언트에 전송
        res.setHeader('Content-Type', 'audio/mpeg');
        res.send(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch audio' });
    }
}
