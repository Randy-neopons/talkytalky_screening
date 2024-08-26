import { useCallback, useEffect, useState } from 'react';
import type { GetServerSideProps } from 'next';
import Image from 'next/image';
import { useRouter } from 'next/router';

import { isAxiosError } from 'axios';
import { deleteCookie, getCookie } from 'cookies-next';

import { TALKYTALKY_URL } from '@/utils/const';
import Container from '@/components/common/Container';
import useAudioRecorder from '@/hooks/useAudioRecorder';
import { getAnswersCountAPI, updateSessionAPI } from '@/api/questions';

import fontSizeIcon from 'public/static/images/font-size-icon.png';
import memoIcon from 'public/static/images/memo-icon.png';
import playIcon from 'public/static/images/play-icon.png';
import playRecordIcon from 'public/static/images/play-record-icon.png';
import recordIcon from 'public/static/images/record-icon.png';
import stopIcon from 'public/static/images/stop-icon.png';

// 소검사 ID
const CURRENT_SUBTEST_ID = 3;
const CURRENT_PART_ID_START = 8;

// 문단읽기 페이지
export default function ParagraphReadingPage() {
    const router = useRouter();

    const { audioBlob, audioUrl, isRecording, handlePlay, handleStartRecording, handleStopRecording } = useAudioRecorder();

    const [currentPartId, setCurrentPartId] = useState(CURRENT_PART_ID_START);

    useEffect(() => {
        console.log(audioUrl);
    }, [audioUrl]);

    // 폼 데이터 제출
    const handleSubmitData = useCallback(
        async ({ sessionId }: { sessionId: number }) => {
            try {
                const formData = new FormData();
                formData.append('audio1', audioBlob || 'null');
                formData.append('recordings', JSON.stringify([{ filePath: null, repeatCount: null }]));

                formData.append('currentPartId', `${currentPartId}`);

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
        [audioBlob, currentPartId],
    );

    // 다음 클릭
    const handleClickNext = useCallback(async () => {
        try {
            const sessionId = Number(router.query.sessionId);
            await handleSubmitData({ sessionId });

            router.push(`/sessions/${sessionId}/subtests/speechTwo/description`);
        } catch (err) {
            console.error(err);
        }
    }, [handleSubmitData, router]);

    return (
        <Container>
            <h2 className='flex items-center font-jalnan text-accent1 text-head-2'>SPEECH II : 종합적 말평가</h2>
            <h1 className='whitespace-pre-line text-center font-jalnan text-head-1'>{'문단읽기'}</h1>
            <div className='ml-auto mt-8 flex items-center gap-[6px]'>
                <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none'>
                    <rect x='2.5' y='7.5' width='19' height='9' rx='0.5' stroke='#212529' />
                    <path d='M6.5 3C6.5 2.72386 6.72386 2.5 7 2.5H17C17.2761 2.5 17.5 2.72386 17.5 3V7.5H6.5V3Z' stroke='#212529' />
                    <path
                        d='M6 13C6 12.4477 6.44772 12 7 12H17C17.5523 12 18 12.4477 18 13V19C18 19.5523 17.5523 20 17 20H7C6.44772 20 6 19.5523 6 19V13Z'
                        fill='#212529'
                    />
                    <path d='M8 14H16' stroke='#F5F7FC' strokeLinecap='round' />
                    <path d='M8 16H16' stroke='#F5F7FC' strokeLinecap='round' />
                    <path d='M8 18H12' stroke='#F5F7FC' strokeLinecap='round' />
                </svg>
                인쇄하기
            </div>
            <div className='mt-5 rounded-base bg-white p-[50px] text-head-2'>
                (예시문단) 높은 산에 올라가 맑은 공기를 마시며 소리를 지르면 가슴이 활찍 열리는 듯하다. 바닷가에 나가 조개를 주으며 넓게
                펼쳐 있는 바다를 바라보면 내 마음이 역시 넓어지는 것 같다. 가로수 길게 뻗어 있는 곧은 길을 따라 걸어가면서 마치 쭉쭉 뻗어
                있는 나무들처럼, 그리고 반듯하게 놓여있는 길처럼 바른 마음으로 자연을 벗하며 살아야겠다는 생각을 한다. 아이들이 뛰어 노는
                놀이터에 가면 우는 아이, 소리 지르는 아이, 땅에 주저앉은 아이, 발을 동동 구르는 아이, 신발이 벗겨진 아이, 랄랄랄랄 노래
                부르는 아이, 천차만별이다. 문득 아파트 놀이터가 너무 비좁다는 생각을 했다. 시장에 가면 많은 구경거리가 있다. 신발장사
                아저씨, 채소 파는 아주머니, 즐비하게 늘어선 옷집, 구석구석에 차려진 간이식당, 오디오나 비디오를 취급하는 업소, 빽빽하게
                물건이 들어서 있는 커다란 가구점, 노상에 차려 놓은 여러 악세사리점, 복잡한 시장길 옆으로 수많은 차들이 쌩쌩 지나다니며 온갖
                난폭 운전을 일삼기 때문에 아슬아슬한 심정을 통 가눌 길이 없을 때도 있다.
            </div>

            <div className='mt-20 flex w-full flex-nowrap items-center'>
                <div className='mx-auto flex gap-[45px]'>
                    {/* <button type='button'>
                        <Image src={memoIcon} alt='memo-icon' className='h-auto w-[60px]' />
                    </button> */}
                    <button type='button' onClick={isRecording ? handleStopRecording : audioUrl ? handlePlay : handleStartRecording}>
                        {isRecording ? (
                            <Image src={stopIcon} alt='stop-icon' className='h-auto w-[100px]' />
                        ) : audioUrl ? (
                            <Image src={playIcon} alt='play-record-icon' className='h-[100px] w-auto' />
                        ) : (
                            <Image src={recordIcon} alt='record-icon' className='h-auto w-[100px]' />
                        )}
                    </button>
                    {/* <button type='button'>
                        <Image src={fontSizeIcon} alt='font-icon' className='h-auto w-[60px]' />
                    </button> */}
                </div>
            </div>
            <div className='mt-20 flex gap-5'>
                <button type='button' className='btn btn-large btn-outlined' onClick={() => {}}>
                    이전
                </button>
                <button key='noSubmit' type='button' className='btn btn-large btn-contained' onClick={handleClickNext}>
                    다음
                </button>
            </div>
        </Container>
    );
}

export const getServerSideProps: GetServerSideProps = async context => {
    try {
        const sessionId = Number(context.query.sessionId);
        if (!sessionId) {
            return {
                redirect: {
                    destination: '/',
                    permanent: true,
                },
            };
        }

        const accessToken = getCookie('jwt', context);
        if (!accessToken || accessToken === 'undefined') {
            return {
                props: {
                    isLoggedIn: false,
                },
            };
        }

        // 검사 시작할 때마다 진행률 불러오기
        const { totalCount, notNullCount } = await getAnswersCountAPI({ sessionId, jwt: accessToken });
        const progress = (notNullCount / totalCount) * 100;

        return {
            props: {
                isLoggedIn: true,
                progress,
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
