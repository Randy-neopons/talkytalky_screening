import {
    useCallback,
    useEffect,
    useMemo,
    useState,
    type ChangeEventHandler,
    type KeyboardEventHandler,
    type MouseEventHandler,
} from 'react';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import ReactTextareaAutosize from 'react-textarea-autosize';
import { toast } from 'react-toastify';
import type { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';

import { isAxiosError } from 'axios';
import { deleteCookie, getCookie } from 'cookies-next';

import { useCurrentSubTest } from '@/stores/testStore';
import { useTestTime, useTimerActions } from '@/stores/timerStore';
import { TALKYTALKY_URL } from '@/utils/const';
import CheckBox from '@/components/common/CheckBox';
import Container from '@/components/common/Container';
import { CheckIcon, TrashIcon, UploadIcon } from '@/components/common/icons';
import { LoadingOverlay } from '@/components/das/LoadingOverlay';
import VolumeModal from '@/components/das/VolumeModal';
import WaveformModal from '@/components/das/WaveformModal';
import { useConductedSubtestsQuery, useQuestionsAndAnswersQuery, useUpsertRecordingMutation } from '@/hooks/das';
import useAudioRecorder from '@/hooks/useAudioRecorder';
import { getAnswersCountAPI, getQuestionAndAnswerListAPI, updateSessionAPI } from '@/api/das';

import subtestStyles from '../SubTests.module.scss';

import type { Answer, QuestionAnswer, Recording } from '@/types/das';

// 소검사 ID
const CURRENT_SUBTEST_ID = 4;
const PART_ID_START = 15;

// 소검사 내 파트별 문항 index 정보
// TODO: part title도 DB에서 가져오기
const partIndexList = [
    { start: 0, end: 10, subtitle: '휴식 시', partTitle: 'AMR', partTitleKo: '교대운동속도', partId: 15 },
    { start: 10, end: 20, subtitle: '휴식 시', partTitle: 'SMR', partTitleKo: '일련운동속도', partId: 16 },
];

const RecordIcon = () => {
    return (
        <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none'>
            <circle cx='12' cy='12' r='8' fill='#FF647C' />
        </svg>
    );
};

const StopRecordIcon = () => {
    return (
        <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none'>
            <rect x='5' y='5' width='14' height='14' rx='2' fill='#FF647C' />
        </svg>
    );
};

const PlayIcon = ({ disabled }: { disabled?: boolean }) => {
    return (
        <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none'>
            <g clipPath='url(#clip0_13783_7609)'>
                <path
                    d='M20 10.2679C21.3333 11.0377 21.3333 12.9623 20 13.7321L8 20.6603C6.66667 21.4301 5 20.4678 5 18.9282L5 5.0718C5 3.5322 6.66667 2.56995 8 3.33975L20 10.2679Z'
                    fill={disabled ? 'gray' : '#6979F8'}
                />
            </g>
            <defs>
                <clipPath id='clip0_13783_7609'>
                    <rect width='24' height='24' fill='white' />
                </clipPath>
            </defs>
        </svg>
    );
};

const PauseIcon = () => {
    return (
        <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none'>
            <rect x='5' y='3' width='5' height='18' rx='1' fill='#6979F8' />
            <rect x='14' y='3' width='5' height='18' rx='1' fill='#6979F8' />
        </svg>
    );
};

const RecordButton = ({
    recordingId,
    partId,
    modalTitle,
    modalContent,
    onSuccess,
}: {
    recordingId?: number | null;
    partId: number;
    modalTitle: string;
    modalContent: string;
    onSuccess: (filePath: string) => void;
}) => {
    const [modalOpen, setModalOpen] = useState(false);
    const handleOpenModal = useCallback(() => {
        setModalOpen(true);
        // handleStart();
    }, []);
    const handleCloseModal = useCallback(() => {
        setModalOpen(false);
        // handleStop();
    }, []);

    return (
        <>
            <button type='button' className='m-auto flex' onClick={handleOpenModal}>
                <RecordIcon />
            </button>
            <VolumeModal
                title={modalTitle}
                content={modalContent}
                recordingId={recordingId}
                partId={partId}
                modalOpen={modalOpen}
                handleCloseModal={handleCloseModal}
                onSuccess={onSuccess}
            />
        </>
    );
};

const PlayButton = ({
    audioUrl,
    setRepeatCount,
    disabled,
}: {
    audioUrl?: string | null;
    setRepeatCount: (value: number) => void;

    disabled?: boolean;
}) => {
    const [url, setUrl] = useState<string>();

    // 모달 열기/닫기
    const [modalOpen, setModalOpen] = useState(false);
    const handleOpenModal = useCallback(() => {
        // modal이 열려있을 때 Wavesurfer 플러그인이 로드되어야 한다.
        // 그래서 modalOpen을 true로 만들고 동시에 url을 세팅함
        setUrl(audioUrl ? `/api/proxy?audioUrl=${audioUrl}` : undefined);
        setModalOpen(true);
    }, [audioUrl]);
    const handleCloseModal = useCallback(() => {
        setModalOpen(false);
    }, []);

    return (
        <>
            <button type='button' className='m-auto flex' onClick={handleOpenModal} disabled={!audioUrl}>
                <PlayIcon disabled={!audioUrl} />
            </button>

            <WaveformModal
                // audioBlob={audioBlob}
                audioUrl={url}
                modalOpen={modalOpen}
                handleCloseModal={handleCloseModal}
                setRepeatCount={setRepeatCount}
                placeholder='반복 횟수를 입력하세요.'
            />
        </>
    );
};

const DeleteButton = ({ recordingId, partId, onSuccess }: { recordingId: number | null; partId: number; onSuccess: () => void }) => {
    const router = useRouter();

    const { mutateAsync } = useUpsertRecordingMutation({ onSuccess });

    const handleClickDelete = useCallback(async () => {
        try {
            const sessionId = Number(router.query.sessionId);
            const accessToken = getCookie('jwt') as string;
            const result = await mutateAsync({ sessionId, recordingId, partId, audioBlob: null, jwt: accessToken });

            onSuccess();
        } catch (err) {
            console.error(err);
        }
    }, [mutateAsync, onSuccess, partId, recordingId, router.query.sessionId]);

    return (
        <button type='button' className='m-auto flex' onClick={handleClickDelete}>
            <TrashIcon color='#495057' />
        </button>
    );
};

const UploadButton = ({
    recordingId,
    partId,
    onSuccess,
}: {
    recordingId: number | null;
    partId: number;
    onSuccess: (filePath: string) => void;
}) => {
    const router = useRouter();

    const { mutateAsync } = useUpsertRecordingMutation({ onSuccess });

    const handleClickUpload = useCallback(async () => {
        try {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.mp3, .wav';
            input.onchange = async (event: Event) => {
                const target = event.target as HTMLInputElement;
                if (target.files && target.files.length > 0) {
                    const file = target.files[0];

                    const sessionId = Number(router.query.sessionId);
                    const accessToken = getCookie('jwt') as string;

                    const result = await mutateAsync({ sessionId, recordingId, partId, audioBlob: file, jwt: accessToken });
                    toast(
                        <div className='flex items-center justify-center text-[0.875rem]'>
                            <CheckIcon color='white' />
                            업로드되었습니다.
                        </div>,
                    );
                    onSuccess(result.filePath);
                }
            };
            input.click();
        } catch (err) {
            console.error(err);
        }
    }, [mutateAsync, onSuccess, partId, recordingId, router.query.sessionId]);

    return (
        <button type='button' className='m-auto flex' onClick={handleClickUpload}>
            <UploadIcon color='#495057' />
        </button>
    );
};

type FormValues = {
    recordings: Recording[];
    answers: Answer[];
};

// SPEECH II 문항 페이지
export default function SpeechMotorQuestionsPage({
    questionList,
    recordingList,
    currentPartId,
}: {
    questionList: QuestionAnswer[];
    recordingList: Recording[];
    currentPartId: number | null;
}) {
    const router = useRouter();

    // 현재 소검사, 선택한 소검사 정보
    const { data: subtestsData } = useConductedSubtestsQuery({ sessionId: Number(router.query.sessionId), jwt: getCookie('jwt') || '' });
    const testTime = useTestTime();
    const { setTestStart } = useTimerActions();
    const currentSubtest = useCurrentSubTest();

    // 문항 전부 정상으로 체크
    const [checkAll, setCheckAll] = useState(false);

    // 소검사 내 현재 파트 정보
    const [partId, setPartId] = useState(currentPartId || PART_ID_START);
    const { start, end, subtitle, partTitle, partTitleKo } = useMemo(
        () => partIndexList.find(v => v.partId === partId) || partIndexList[0],
        [partId],
    );

    // react-hook-form
    const {
        control,
        register,
        setValue,
        handleSubmit,
        formState: { isDirty, isValid },
        getValues,
        watch,
    } = useForm<FormValues>();

    const recordingId1 = useWatch({ control, name: 'recordings.0.recordingId' });
    const recordingId2 = useWatch({ control, name: 'recordings.1.recordingId' });
    const recordingId3 = useWatch({ control, name: 'recordings.2.recordingId' });

    const audioUrl1 = useWatch({ control, name: 'recordings.0.filePath' });
    const audioUrl2 = useWatch({ control, name: 'recordings.1.filePath' });
    const audioUrl3 = useWatch({ control, name: 'recordings.2.filePath' });

    const [uploaded1, setUploaded1] = useState(false);
    const [uploaded2, setUploaded2] = useState(false);
    const [uploaded3, setUploaded3] = useState(false);

    const { data: qnaData, refetch } = useQuestionsAndAnswersQuery({
        sessionId: Number(router.query.sessionId),
        subtestId: CURRENT_SUBTEST_ID,
        partId,
        start,
        end: end - 1,
        jwt: getCookie('jwt') || '',
    });

    useEffect(() => {
        if (qnaData?.recordings) {
            setValue('recordings', qnaData.recordings);
        }

        if (qnaData?.questions) {
            setValue(
                'answers',
                qnaData.questions.map(({ questionId, questionText, partId, subtestId, answer, comment }) => ({
                    questionId,
                    questionText,
                    partId,
                    subtestId,
                    answer,
                    comment,
                })),
            );
        }
    }, [qnaData?.recordings, qnaData?.questions, setValue]);

    const [loading, setLoading] = useState(false);

    // 폼 데이터 제출
    const handleSubmitData = useCallback(
        async ({ sessionId, data }: { sessionId: number; data: FormValues }) => {
            try {
                setLoading(true);

                // 세션 갱신
                const accessToken = getCookie('jwt') as string;
                await updateSessionAPI({
                    sessionId,
                    recordings: data.recordings,
                    testTime,
                    currentPartId: partId,
                    answers: data.answers,
                    jwt: accessToken,
                });

                setLoading(false);
            } catch (err) {
                setLoading(false);

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

    // 이전 파트로
    const handleClickPrev = useCallback(async () => {
        try {
            const data = getValues();
            const sessionId = Number(router.query.sessionId);
            await handleSubmitData({ sessionId, data });

            setCheckAll(false);

            if (partId > PART_ID_START) {
                setPartId(partId => partId - 1);
                typeof window !== 'undefined' && window.scrollTo(0, 0);
            } else {
                router.push(`/das/sessions/${sessionId}/subtests/speechMotor`);
            }
        } catch (err) {
            console.error(err);
        }
    }, [getValues, handleSubmitData, partId, router]);

    const setRepeatCount = useCallback(
        (index: number) => (value: number) => {
            setValue(`recordings.${index}.repeatCount`, value);
        },
        [setValue],
    );

    // 폼 제출 후 redirect
    const handleClickNext = useCallback(
        async (data: any) => {
            try {
                const sessionId = Number(router.query.sessionId);
                await handleSubmitData({ sessionId, data });

                console.log('partId', partId);

                // 평가불가 페이지에서 왔을 경우 완료 이동
                if (router.query.unassessable === 'true') {
                    router.push(`/das/sessions/${sessionId}/unassessable`);
                    return;
                }

                if (partId < partIndexList[partIndexList.length - 1].partId) {
                    setPartId(prev => prev + 1);
                    typeof window !== 'undefined' && window.scrollTo(0, 0); // 스크롤 초기화
                } else {
                    const subtests = subtestsData?.subtests;
                    if (!subtests) {
                        throw new Error('수행할 소검사가 없습니다');
                    }

                    const currentSubtestIndex = subtests.findIndex(v => v.subtestId === CURRENT_SUBTEST_ID);
                    const nextSubtestItem = subtests[currentSubtestIndex + 1];
                    if (nextSubtestItem) {
                        if (nextSubtestItem.subtestId === 5) {
                            router.push(`/das/sessions/${sessionId}/subtests/${nextSubtestItem.pathname}/questions`);
                        } else {
                            router.push(`/das/sessions/${sessionId}/subtests/${nextSubtestItem.pathname}`);
                        }
                    } else {
                        router.push(`/das/sessions/${sessionId}/unassessable`);
                    }
                }
            } catch (err) {
                console.error(err);
            }
        },
        [handleSubmitData, partId, router, subtestsData?.subtests],
    );

    const handleKeyDown = useCallback<KeyboardEventHandler<HTMLInputElement>>(e => {
        if (e.key === 'Enter') {
            e.preventDefault();
        }
    }, []);

    useEffect(() => {
        setTestStart(true);
    }, [setTestStart]);

    return (
        <>
            <LoadingOverlay loading={loading} />
            <Container>
                <form onSubmit={handleSubmit(handleClickNext)} className={`${subtestStyles.subtestForm}`}>
                    <input type='hidden' />
                    <h2 className='whitespace-pre-line text-center font-jalnan text-head-2'>{partTitle}</h2>
                    <h3 className='whitespace-pre-line text-center font-jalnan text-head-3'>{partTitleKo}</h3>

                    {partId === PART_ID_START ? (
                        <>
                            <table className={subtestStyles.recordingTable}>
                                <thead>
                                    <tr className={subtestStyles.subtitle}>
                                        <th colSpan={6}>AMR 측정 (5초)</th>
                                    </tr>
                                    <tr className={subtestStyles.option}>
                                        <th>안내</th>
                                        <th></th>
                                        <th>녹음</th>
                                        <th>재생</th>
                                        {/* <th>파형</th> */}
                                        <th>반복횟수</th>
                                        <th>가져오기</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td rowSpan={3} className='rounded-bl-base text-center'>
                                            숨을 크게 들어 마신 뒤, &apos;파&apos; 를 가능한 빨리
                                            <br /> 규칙적으로 반복해서 말해보세요. <br />
                                            (&apos;타&apos; 와 &apos;카&apos; 도 동일하게 시행)
                                        </td>
                                        <td className={subtestStyles.button}>파</td>
                                        <td className={subtestStyles.button}>
                                            <RecordButton
                                                recordingId={recordingId1}
                                                partId={partId}
                                                modalTitle='AMR 측정 (파)'
                                                modalContent="'파'를 가능한 빨리 규칙적으로 반복해서 말해보세요."
                                                onSuccess={(filePath: string) => {
                                                    setValue('recordings.0.filePath', filePath);
                                                    setUploaded1(false);
                                                }}
                                            />
                                        </td>
                                        <td className={subtestStyles.button}>
                                            <PlayButton audioUrl={audioUrl1} setRepeatCount={setRepeatCount(0)} disabled={!audioUrl1} />
                                        </td>
                                        <td className={subtestStyles.repeatCount}>
                                            <input
                                                type='number'
                                                step='0.01'
                                                className='text-center outline-none'
                                                autoComplete='off'
                                                onKeyDown={handleKeyDown}
                                                {...register(`recordings.0.repeatCount`)}
                                            />
                                            회
                                        </td>
                                        <td>
                                            {uploaded1 ? (
                                                <DeleteButton
                                                    recordingId={recordingId1}
                                                    partId={partId}
                                                    onSuccess={() => {
                                                        setValue('recordings.0.filePath', '');
                                                        setUploaded1(false);
                                                    }}
                                                />
                                            ) : (
                                                <UploadButton
                                                    recordingId={recordingId1}
                                                    partId={partId}
                                                    onSuccess={(filePath: string) => {
                                                        setValue('recordings.0.filePath', filePath);
                                                        setUploaded1(true);
                                                    }}
                                                />
                                            )}
                                        </td>
                                    </tr>
                                    <tr className={subtestStyles.repeatCount}>
                                        <td className={subtestStyles.button}>타</td>
                                        <td className={subtestStyles.button}>
                                            <RecordButton
                                                recordingId={recordingId2}
                                                partId={partId}
                                                modalTitle='AMR 측정 (타)'
                                                modalContent="'타'를 가능한 빨리 규칙적으로 반복해서 말해보세요."
                                                onSuccess={(filePath: string) => {
                                                    setValue('recordings.1.filePath', filePath);
                                                    setUploaded2(false);
                                                }}
                                            />
                                        </td>
                                        <td className={subtestStyles.button}>
                                            <PlayButton audioUrl={audioUrl2} setRepeatCount={setRepeatCount(1)} disabled={!audioUrl2} />
                                        </td>
                                        <td className={subtestStyles.repeatCount}>
                                            <input
                                                type='number'
                                                step='0.01'
                                                className='text-center outline-none'
                                                autoComplete='off'
                                                onKeyDown={handleKeyDown}
                                                {...register(`recordings.1.repeatCount`)}
                                            />
                                            회
                                        </td>
                                        <td>
                                            {uploaded2 ? (
                                                <DeleteButton
                                                    recordingId={recordingId2}
                                                    partId={partId}
                                                    onSuccess={() => {
                                                        setValue('recordings.1.filePath', '');
                                                        setUploaded2(false);
                                                    }}
                                                />
                                            ) : (
                                                <UploadButton
                                                    recordingId={recordingId2}
                                                    partId={partId}
                                                    onSuccess={(filePath: string) => {
                                                        setValue('recordings.1.filePath', filePath);
                                                        setUploaded2(true);
                                                    }}
                                                />
                                            )}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className={subtestStyles.button}>카</td>
                                        <td className={subtestStyles.button}>
                                            <RecordButton
                                                recordingId={recordingId3}
                                                partId={partId}
                                                modalTitle='AMR 측정 (카)'
                                                modalContent="'카'를 가능한 빨리 규칙적으로 반복해서 말해보세요."
                                                onSuccess={(filePath: string) => {
                                                    setValue('recordings.2.filePath', filePath);
                                                    setUploaded3(false);
                                                }}
                                            />
                                        </td>
                                        <td className={subtestStyles.button}>
                                            <PlayButton audioUrl={audioUrl3} setRepeatCount={setRepeatCount(2)} disabled={!audioUrl3} />
                                        </td>
                                        <td className={subtestStyles.repeatCount}>
                                            <input
                                                type='number'
                                                step='0.01'
                                                className='text-center outline-none'
                                                autoComplete='off'
                                                onKeyDown={handleKeyDown}
                                                {...register(`recordings.2.repeatCount`)}
                                            />
                                            회
                                        </td>
                                        <td>
                                            {uploaded3 ? (
                                                <DeleteButton
                                                    recordingId={recordingId3}
                                                    partId={partId}
                                                    onSuccess={() => {
                                                        setValue('recordings.2.filePath', '');
                                                        setUploaded3(false);
                                                    }}
                                                />
                                            ) : (
                                                <UploadButton
                                                    recordingId={recordingId3}
                                                    partId={partId}
                                                    onSuccess={(filePath: string) => {
                                                        setValue('recordings.2.filePath', filePath);
                                                        setUploaded3(true);
                                                    }}
                                                />
                                            )}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <p className='w-full text-right text-neutral4 text-body-2'>*반복횟수란 1초당 각 음절을 반복한 횟수를 의미함</p>
                        </>
                    ) : (
                        <>
                            <table className={subtestStyles.recordingTable}>
                                <thead>
                                    <tr className={subtestStyles.subtitle}>
                                        <th colSpan={6}>SMR 측정 (5초)</th>
                                    </tr>
                                    <tr className={subtestStyles.option}>
                                        <th>안내</th>
                                        <th></th>
                                        <th>녹음</th>
                                        <th>재생</th>
                                        {/* <th>파형</th> */}
                                        <th>반복횟수</th>
                                        <th>가져오기</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td align='center' className='rounded-bl-base'>
                                            &apos;파-타-카&apos;를 가능한 한 빨리, 규칙적으로 <br />
                                            반복해서 말해보세요.
                                        </td>
                                        <td className={subtestStyles.button}>파타카</td>
                                        <td className={subtestStyles.button}>
                                            <RecordButton
                                                recordingId={recordingId1}
                                                partId={partId}
                                                modalTitle='SMR 측정 (파-타-카)'
                                                modalContent="'파-타-카'를 가능한 빨리 규칙적으로 반복해서 말해보세요."
                                                onSuccess={(filePath: string) => {
                                                    setValue('recordings.0.filePath', filePath);
                                                }}
                                            />
                                        </td>
                                        <td className={subtestStyles.button}>
                                            <PlayButton audioUrl={audioUrl1} setRepeatCount={setRepeatCount(0)} disabled={!audioUrl1} />
                                        </td>
                                        <td className={subtestStyles.repeatCount}>
                                            <input
                                                type='number'
                                                step='0.01'
                                                className='w-full text-center outline-none'
                                                autoComplete='off'
                                                onKeyDown={handleKeyDown}
                                                {...register(`recordings.0.repeatCount`)}
                                            />
                                            회
                                        </td>
                                        <td>
                                            {uploaded1 ? (
                                                <DeleteButton
                                                    recordingId={recordingId1}
                                                    partId={partId}
                                                    onSuccess={() => {
                                                        setValue('recordings.0.filePath', '');
                                                        setUploaded1(false);
                                                    }}
                                                />
                                            ) : (
                                                <UploadButton
                                                    recordingId={recordingId1}
                                                    partId={partId}
                                                    onSuccess={(filePath: string) => {
                                                        setValue('recordings.0.filePath', filePath);
                                                        setUploaded1(true);
                                                    }}
                                                />
                                            )}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <p className='w-full text-right text-neutral4 text-body-2'>
                                *반복횟수란 1초당 각 음절을 반복한 횟수를 의미함(&apos;파타카&apos;모두를 반복한 횟수가 아님)
                            </p>
                        </>
                    )}

                    <div>
                        {router.query.unassessable !== 'true' && (
                            <button type='button' className='mt-20 btn btn-large btn-outlined' onClick={handleClickPrev}>
                                이전
                            </button>
                        )}

                        <button
                            key='submit'
                            type='submit'
                            className='ml-5 mt-20 btn btn-large btn-contained disabled:btn-contained-disabled'
                            disabled={!isValid}
                        >
                            {router.query.unassessable !== 'true' ? '다음' : '완료'}
                        </button>
                    </div>
                </form>
            </Container>
        </>
    );
}

export const getServerSideProps: GetServerSideProps = async context => {
    try {
        const sessionId = Number(context.query.sessionId);
        const currentPartId = context.query.currentPartId ? Number(context.query.currentPartId) : null;

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

        // 검사 시작할 때마다 진행률 불러오기
        const { totalCount, notNullCount } = await getAnswersCountAPI({ sessionId, jwt: accessToken });
        const progress = Math.ceil((notNullCount / totalCount) * 100);

        // 소검사 문항 정보 fetch
        const responseData = await getQuestionAndAnswerListAPI({ sessionId, subtestId: CURRENT_SUBTEST_ID, jwt: accessToken });
        const questionList = responseData.questions;
        const recordingList = responseData.recordings;

        return {
            props: {
                isLoggedIn: true,
                questionList,
                recordingList,
                progress,
                currentPartId,
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
