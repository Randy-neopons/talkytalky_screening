import { useCallback, useEffect, useRef, useState, type ChangeEventHandler } from 'react';
import { useReactToPrint } from 'react-to-print';
import type { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';

import { isAxiosError } from 'axios';
import { deleteCookie, getCookie } from 'cookies-next';

import { useCurrentSubTest } from '@/stores/testStore';
import { useTestTime, useTimerActions } from '@/stores/timerStore';
import { TALKYTALKY_URL } from '@/utils/const';
import { AudioButton } from '@/components/common/Buttons';
import Container from '@/components/common/Container';
import { useModal } from '@/components/common/Modal/context';
import { InfoIcon, PrintIcon } from '@/components/common/icons';
import { FontSizeButton } from '@/components/das/FontSizeButton';
import { MemoButton } from '@/components/das/MemoButton';
import { useConductedSubtestsQuery } from '@/hooks/das';
import useAudioRecorder from '@/hooks/useAudioRecorder';
import { getAnswersCountAPI, getQuestionAndAnswerListAPI, updateSessionAPI, upsertRecordingAPI } from '@/api/das';

import styles from '../SubTests.module.scss';

import type { Recording } from '@/types/das';

const TooltipArrowIcon = () => {
    return (
        <svg className={`${styles.tooltipArrow}`} xmlns='http://www.w3.org/2000/svg' width='54' height='54' viewBox='0 0 54 54' fill='none'>
            <path
                d='M24.4019 4.5C25.5566 2.5 28.4434 2.5 29.5981 4.5L47.7846 36C48.9393 38 47.4959 40.5 45.1865 40.5H8.81346C6.50406 40.5 5.06069 38 6.21539 36L24.4019 4.5Z'
                fill='#495057'
            />
        </svg>
    );
};

// 본문 폰트 크기 조절 className 생성
const makeFontSizeClassName = (fontSize: number) => {
    return fontSize === 3 ? 'text-head-1' : fontSize === 2 ? 'text-head-2' : 'text-head-3';
};

// 소검사 ID
const CURRENT_SUBTEST_ID = 3;
const PART_ID_START = 8;

type Props = {
    recording: Recording;
};

// 문단읽기 페이지
export default function ParagraphReadingPage({ recording }: Props) {
    const router = useRouter();

    const { audioBlob, audioUrl, isRecording, isPlaying, handlePlay, handlePause, handleStartRecording, handleStopRecording } =
        useAudioRecorder(recording?.filePath);

    const [partId, setPartId] = useState(PART_ID_START);

    const divRef = useRef<HTMLDivElement>(null);

    const reactToPrintFn = useReactToPrint({
        contentRef: divRef,
    });

    // 현재 소검사, 선택한 소검사 정보
    const { data: subtestsData } = useConductedSubtestsQuery({ sessionId: Number(router.query.sessionId), jwt: getCookie('jwt') || '' });
    const testTime = useTestTime();
    const { setTestStart } = useTimerActions();
    const currentSubtest = useCurrentSubTest();
    const { handleOpenModal } = useModal();

    // 폼 데이터 제출
    const handleSubmitData = useCallback(
        async ({ sessionId }: { sessionId: number }) => {
            try {
                // 세션 갱신
                const accessToken = getCookie('jwt') as string;
                await upsertRecordingAPI({
                    sessionId,
                    audioBlob: audioBlob || null,
                    recordingId: recording?.recordingId,
                    partId,
                    jwt: accessToken,
                });
                await updateSessionAPI({ sessionId, answers: [], testTime, currentPartId: partId, jwt: accessToken });
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
        [audioBlob, partId, recording, testTime],
    );

    // 이전 버튼 클릭
    const handleClickPrev = useCallback(async () => {
        try {
            const sessionId = Number(router.query.sessionId);
            await handleSubmitData({ sessionId });

            const subtests = subtestsData?.subtests;
            if (!subtests) {
                throw new Error('수행할 소검사가 없습니다');
            }

            // 이전 소검사
            const currentSubtestIndex = subtests.findIndex(v => v.subtestId === currentSubtest?.subtestId);
            const prevSubtestItem = subtests[currentSubtestIndex - 1];

            if (prevSubtestItem) {
                // 이전 소검사가 있으면 이동
                router.push(`/das/sessions/${sessionId}/subtests/${prevSubtestItem.pathname}`);
            } else {
                // 없으면 홈으로 이동
                handleOpenModal({
                    content: '홈으로 이동하시겠습니까?',
                    cancelText: '아니오',
                    okText: '네',
                    onOk: () => {
                        router.push('/das');
                    },
                });
            }
        } catch (err) {
            console.error(err);
        }
    }, [currentSubtest?.subtestId, handleOpenModal, handleSubmitData, router, subtestsData?.subtests]);

    // 다음 클릭
    const handleClickNext = useCallback(async () => {
        try {
            const sessionId = Number(router.query.sessionId);
            await handleSubmitData({ sessionId });

            router.push(`/das/sessions/${sessionId}/subtests/speechTwo/description`);
        } catch (err) {
            console.error(err);
        }
    }, [handleSubmitData, router]);

    useEffect(() => {
        setTestStart(true);
    }, [setTestStart]);

    // 폰트 크기 조절
    const [fontSize, setFontSize] = useState(1);
    const handleChangeFontSize = useCallback<ChangeEventHandler<HTMLInputElement>>(e => {
        setFontSize(e.target.valueAsNumber);
    }, []);

    // 메모
    const [memo, setMemo] = useState('');
    const handleChangeMemo = useCallback<ChangeEventHandler<HTMLTextAreaElement>>(e => {
        setMemo(e.target.value);
    }, []);

    const [showTooltip, setShowTooltip] = useState(true);
    const tooltipContentRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (tooltipContentRef.current && !tooltipContentRef.current.contains(event.target as Node)) {
                console.log('here');
                setShowTooltip(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <Container>
            <div className={`${styles.title}`}>
                <h1 className='flex items-center whitespace-pre-line text-center font-jalnan text-head-1'>문단읽기</h1>
                <div
                    className={`${styles.buttonContainer}`}
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                >
                    <button>
                        <InfoIcon bgColor='#6979F8' color='#FFFFFF' width={44} height={44} />
                    </button>
                    {showTooltip && <TooltipArrowIcon />}
                </div>
                {showTooltip && (
                    <div className={`${styles.tooltipContent}`}>
                        <p>
                            <b>치료사 지시문</b>
                        </p>
                        <p>
                            &ldquo;자, 이 글 보이시나요?(안보인다면 크기 조절하기) 제가 &lsquo;시작&rsquo;하면 이 글을 소리내서 자연스럽게
                            읽어주세요.&rdquo;
                        </p>
                    </div>
                )}
            </div>
            <button
                onClick={() => {
                    reactToPrintFn();
                }}
                className='ml-auto mt-8 flex items-center gap-[6px] rounded-[10px] border border-neutral7 bg-white px-5 py-2.5'
            >
                <PrintIcon color={'#212529'} />
                인쇄하기
            </button>
            <div className={`mt-5 rounded-base bg-white p-[50px] ${makeFontSizeClassName(fontSize)}`} ref={divRef}>
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
                <div className='mx-auto flex items-center gap-[45px]'>
                    <MemoButton memo={memo} handleChangeMemo={handleChangeMemo} />

                    <AudioButton
                        audioUrl={audioUrl}
                        isRecording={isRecording}
                        isPlaying={isPlaying}
                        handleStartRecording={handleStartRecording}
                        handleStopRecording={handleStopRecording}
                        handlePause={handlePause}
                        handlePlay={handlePlay}
                    />

                    <FontSizeButton fontSize={fontSize} handleChangeFontSize={handleChangeFontSize} />
                </div>
            </div>
            <div className='mt-20 flex gap-5'>
                <button type='button' className='btn btn-large btn-outlined' onClick={handleClickPrev}>
                    이전 검사로
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
                    destination: '/das',
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

        const responseData = await getQuestionAndAnswerListAPI({ sessionId, subtestId: CURRENT_SUBTEST_ID, jwt: accessToken });
        const recording = responseData.recordings?.[0] || null;

        console.log(recording);

        // 검사 시작할 때마다 진행률 불러오기
        const { totalCount, notNullCount } = await getAnswersCountAPI({ sessionId, jwt: accessToken });
        const progress = Math.ceil((notNullCount / totalCount) * 100);

        return {
            props: {
                isLoggedIn: true,
                recording,
                progress,
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
