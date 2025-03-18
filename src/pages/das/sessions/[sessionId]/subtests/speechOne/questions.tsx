import { useCallback, useEffect, useMemo, useState, type ChangeEventHandler, type KeyboardEventHandler } from 'react';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import ReactTextareaAutosize from 'react-textarea-autosize';
import { toast } from 'react-toastify';
import type { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';

import { isAxiosError } from 'axios';
import { deleteCookie, getCookie } from 'cookies-next';

import { useCurrentSubTest, useSubtests, useTestActions } from '@/stores/testStore';
import { useTestTime, useTimerActions } from '@/stores/timerStore';
import { TALKYTALKY_URL } from '@/utils/const';
import CheckBox from '@/components/common/CheckBox';
import Container from '@/components/common/Container';
import { CheckIcon, TrashIcon, UploadIcon } from '@/components/common/icons';
import VolumeModal from '@/components/das/VolumeModal';
import WaveformModal from '@/components/das/WaveformModal';
import { useConductedSubtestsQuery, useQuestionsAndAnswersQuery, useUpsertRecordingMutation } from '@/hooks/das';
import useAudioRecorder from '@/hooks/useAudioRecorder';
import { getAnswersCountAPI, getQuestionAndAnswerListAPI, updateSessionAPI } from '@/api/das';

import subtestStyles from '../SubTests.module.scss';

import type { Answer, QuestionAnswer, Recording } from '@/types/das';

// 소검사 ID
const CURRENT_SUBTEST_ID = 2; // SpeechOne
const PART_ID_START = 5;

// 소검사 내 파트별 문항 index 정보
// TODO: part title도 DB에서 가져오기
const partIndexList = [
    {
        start: 0,
        split: 6,
        end: 6,
        subtitle1: '음질',
        subtitle2: '음질',
        partTitle: '호흡 / 발성',
        partTitleEn: 'Respiration / Phonation',
        partId: 5,
        page: 0,
    },
    {
        start: 6,
        split: 10,
        end: 10,
        subtitle1: '음도',
        subtitle2: '음도',
        partTitle: '호흡 / 발성',
        partTitleEn: 'Respiration / Phonation',
        partId: 5,
        page: 1,
    },
    {
        start: 10,
        split: 12,
        end: 12,
        subtitle1: '강도',
        subtitle2: '강도',
        partTitle: '호흡 / 발성',
        partTitleEn: 'Respiration / Phonation',
        partId: 5,
        page: 2,
    },
    {
        start: 0,
        split: 4,
        end: 8,
        subtitle1: '과다비성',
        subtitle2: '비강누출',
        partTitle: '공명',
        partTitleEn: 'Resonance',
        partId: 6,
        page: 0,
    },
    {
        start: 0,
        split: 5,
        end: 5,
        subtitle1: '자음정확성',
        partTitle: '조음',
        partTitleEn: 'Articulation',
        partId: 7,
        page: 0,
    },
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
    setMPT,
}: {
    audioUrl?: string | null;
    setRepeatCount?: (value: number) => void;
    setMPT?: (value: number) => void;
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
            <WaveformModal title='MPT 측정파형' audioUrl={url} modalOpen={modalOpen} handleCloseModal={handleCloseModal} setMPT={setMPT} />
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

// SPEECH I 문항 페이지
export default function SpeechOneQuestionsPage({
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
    const [checkAll1, setCheckAll1] = useState(false);
    const [checkAll2, setCheckAll2] = useState(false);

    // 소검사 내 현재 파트 정보
    const [partId, setPartId] = useState(currentPartId || PART_ID_START);
    // SPEECH I에서 Respiration & Phonation은 문항이 많아 한 파트가 여러 페이지를 차지함.
    // 다른 파트는 다 1페이지 구성임.
    const [page, setPage] = useState(0);

    const { start, split, end, subtitle1, subtitle2, partTitle, partTitleEn } = useMemo(
        () => partIndexList.find(v => v.partId === partId && v.page === page) || partIndexList[0],
        [page, partId],
    );

    const { data: qnaData } = useQuestionsAndAnswersQuery({
        sessionId: Number(router.query.sessionId),
        subtestId: CURRENT_SUBTEST_ID,
        partId,
        start,
        end: end - 1,
        jwt: getCookie('jwt') || '',
    });

    // react-hook-form
    const {
        control,
        register,
        setValue,
        handleSubmit,
        formState: { isDirty, isValid },
        getValues,
    } = useForm<{
        recordings: Recording[];
        answers: Answer[];
    }>();
    const { fields } = useFieldArray({ name: 'answers', control });

    const recordingId1 = useWatch({ control, name: 'recordings.0.recordingId' });
    const recordingId2 = useWatch({ control, name: 'recordings.1.recordingId' });
    const recordingId3 = useWatch({ control, name: 'recordings.2.recordingId' });

    const audioUrl1 = useWatch({ control, name: 'recordings.0.filePath' });
    const audioUrl2 = useWatch({ control, name: 'recordings.1.filePath' });
    const audioUrl3 = useWatch({ control, name: 'recordings.2.filePath' });

    // 모두 정상 체크
    const handleChangeCheckAll1 = useCallback<ChangeEventHandler<HTMLInputElement>>(
        e => {
            if (e.target.checked === true) {
                Array.from({ length: split - start }, (v, i) => i).map(v => {
                    setValue(`answers.${v}.answer`, 'normal', { shouldValidate: true });
                });
            }

            setCheckAll1(e.target.checked);
        },
        [setValue, split, start],
    );

    // 모두 정상 체크
    const handleChangeCheckAll2 = useCallback<ChangeEventHandler<HTMLInputElement>>(
        e => {
            if (e.target.checked === true) {
                Array.from({ length: end - split }, (v, i) => split - start + i).map(v => {
                    console.log(v);
                    setValue(`answers.${v}.answer`, 'normal', { shouldValidate: true });
                });
            }

            setCheckAll2(e.target.checked);
        },
        [end, setValue, split, start],
    );

    // // 이전 파트로
    // const handleClickPrev = useCallback(() => {
    //     setCheckAll1(false);
    //     setCheckAll2(false);
    //     partId > PART_ID_START && setPartId(partId => partId - 1);
    //     typeof window !== 'undefined' && window.scrollTo(0, 0);
    // }, [partId]);

    // 다음 파트로
    // const handleClickNext = useCallback(() => {
    //     setCheckAll1(false);
    //     setCheckAll2(false);

    //     if (partId === PART_ID_START && page < 3) {
    //         setPage(page => page + 1);
    //     } else {
    //         if (partId < partIndexList[partIndexList.length - 1].partId) {
    //             setPartId(partId => partId + 1);
    //             setPage(0);
    //         }
    //     }

    //     typeof window !== 'undefined' && window.scrollTo(0, 0); // 스크롤 초기화
    // }, [page, partId]);

    // 폼 데이터 제출'이전, 다음, 다른 파트' 이동 시 사용자 데이터 저장
    const handleSubmitData = useCallback(
        async ({ sessionId, data }: { sessionId: number; data: any }) => {
            try {
                // 세션 갱신
                const accessToken = getCookie('jwt') as string;
                await updateSessionAPI({
                    sessionId,
                    testTime, // 검사 시간
                    currentPartId: partId, // 현재 파트
                    answers: data.answers, // 답변
                    recordings: data.recordings, // 녹음
                    jwt: accessToken,
                });
            } catch (err) {
                console.error(err);
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

            setCheckAll1(false);
            setCheckAll2(false);

            if (partId > PART_ID_START) {
                setPartId(partId => partId - 1);
                typeof window !== 'undefined' && window.scrollTo(0, 0);
            } else if (partId === PART_ID_START && page > 0) {
                setPage(page => page - 1);
                typeof window !== 'undefined' && window.scrollTo(0, 0);
            } else {
                router.push(`/das/sessions/${sessionId}/subtests/speechOne`);
            }
        } catch (err) {
            console.error(err);
        }
    }, [getValues, handleSubmitData, page, partId, router]);

    // 폼 제출 후 redirect
    const handleClickNext = useCallback(
        async (data: any) => {
            try {
                const sessionId = Number(router.query.sessionId);
                await handleSubmitData({ sessionId, data });

                setCheckAll1(false);
                setCheckAll2(false);

                if (partId === PART_ID_START && page < 2) {
                    setPage(page => page + 1);
                    console.log('here1');
                } else {
                    if (partId < partIndexList[partIndexList.length - 1].partId) {
                        console.log('here2');
                        setPartId(partId => partId + 1);
                        setPage(0);
                    } else {
                        console.log('here3');
                        const subtests = subtestsData?.subtests;
                        if (!subtests) {
                            throw new Error('수행할 소검사가 없습니다');
                        }
                        // 다음 진행할 소검사
                        const currentSubtestIndex = subtests.findIndex(v => v.subtestId === CURRENT_SUBTEST_ID);
                        const nextSubtestItem = subtests[currentSubtestIndex + 1];

                        if (nextSubtestItem) {
                            // 다음 소검사가 있으면 이동
                            if (nextSubtestItem.subtestId === 5) {
                                router.push(`/das/sessions/${sessionId}/subtests/${nextSubtestItem.pathname}/questions`);
                            } else {
                                router.push(`/das/sessions/${sessionId}/subtests/${nextSubtestItem.pathname}`);
                            }
                        } else {
                            // 다음 소검사가 없으면 평가불가 문항으로 이동
                            router.push(`/das/sessions/${sessionId}/unassessable`);
                        }
                    }
                }
            } catch (err) {
                console.error(err);
            }
        },
        [handleSubmitData, page, partId, router, subtestsData?.subtests],
    );

    const [uploaded1, setUploaded1] = useState(false);
    const [uploaded2, setUploaded2] = useState(false);
    const [uploaded3, setUploaded3] = useState(false);

    useEffect(() => {
        setTestStart(true);
    }, [setTestStart]);

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
    }, [qnaData, setValue]);

    const setRepeatCount = useCallback(
        (index: number) => (value: number) => {
            setValue(`recordings.${index}.repeatCount`, value);
        },
        [setValue],
    );

    // 엔터키 submit
    const handleKeyDown = useCallback<KeyboardEventHandler<HTMLInputElement>>(e => {
        if (e.key === 'Enter') {
            e.preventDefault();
        }
    }, []);

    return (
        <Container>
            <form onSubmit={handleSubmit(handleClickNext)} className={subtestStyles.subtestForm}>
                <input type='hidden' />
                <h1 className='whitespace-pre-line text-center font-jalnan text-head-1'>{partTitleEn}</h1>
                <h2 className='whitespace-pre-line text-center font-jalnan text-head-2'>{partTitle}</h2>

                {partId === PART_ID_START && (
                    <table className={subtestStyles.recordingTable}>
                        <thead>
                            <tr className={subtestStyles.subtitle}>
                                <th colSpan={6}>MPT 측정</th>
                            </tr>
                            <tr className={subtestStyles.option}>
                                <th>안내</th>
                                <th></th>
                                <th>녹음</th>
                                <th>재생</th>
                                <th>지속시간</th>
                                <th>가져오기</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td rowSpan={3} className='rounded-bl-base text-center'>
                                    숨을 크게 들어 마신 뒤, 쉬지 말고 최대한 길게
                                    <br />
                                    편안하게 ‘아~’ 소리를 내보세요.
                                </td>
                                <td className={subtestStyles.button}>1차</td>
                                <td className={subtestStyles.button}>
                                    <RecordButton
                                        recordingId={recordingId1}
                                        partId={partId}
                                        modalTitle='MPT 측정'
                                        modalContent='숨을 크게 들어 마신 뒤, 쉬지 말고 최대한 길게 편안하게 ‘아~’ 소리를 내보세요.'
                                        onSuccess={(filePath: string) => {
                                            setValue('recordings.0.filePath', filePath);
                                            setUploaded1(false);
                                        }}
                                    />
                                </td>
                                <td className={subtestStyles.button}>
                                    <PlayButton audioUrl={audioUrl1} setMPT={setRepeatCount(0)} />
                                </td>
                                <td className={subtestStyles.repeatCount}>
                                    <input
                                        type='number'
                                        step='0.01'
                                        className='outline-none'
                                        autoComplete='off'
                                        onKeyDown={handleKeyDown}
                                        {...register(`recordings.0.repeatCount`)}
                                    />
                                    초
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
                            <tr>
                                <td className={subtestStyles.button}>2차</td>
                                <td className={subtestStyles.button}>
                                    <RecordButton
                                        recordingId={recordingId2}
                                        partId={partId}
                                        modalTitle='MPT 측정'
                                        modalContent='숨을 크게 들어 마신 뒤, 쉬지 말고 최대한 길게 편안하게 ‘아~’ 소리를 내보세요.'
                                        onSuccess={(filePath: string) => {
                                            setValue('recordings.1.filePath', filePath);
                                            setUploaded2(false);
                                        }}
                                    />
                                </td>
                                <td className={subtestStyles.button}>
                                    <PlayButton audioUrl={audioUrl2} setMPT={setRepeatCount(1)} />
                                </td>
                                <td className={subtestStyles.repeatCount}>
                                    <input
                                        type='number'
                                        step='0.01'
                                        className='outline-none'
                                        autoComplete='off'
                                        onKeyDown={handleKeyDown}
                                        {...register(`recordings.1.repeatCount`)}
                                    />
                                    초
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
                                <td className={subtestStyles.button}>3차</td>
                                <td className={subtestStyles.button}>
                                    <RecordButton
                                        recordingId={recordingId3}
                                        partId={partId}
                                        modalTitle='MPT 측정'
                                        modalContent='숨을 크게 들어 마신 뒤, 쉬지 말고 최대한 길게 편안하게 ‘아~’ 소리를 내보세요.'
                                        onSuccess={(filePath: string) => {
                                            setValue('recordings.2.filePath', filePath);
                                            setUploaded3(false);
                                        }}
                                    />
                                </td>
                                <td className={subtestStyles.button}>
                                    <PlayButton audioUrl={audioUrl3} setMPT={setRepeatCount(2)} />
                                </td>
                                <td className={subtestStyles.repeatCount}>
                                    <input
                                        type='number'
                                        step='0.01'
                                        className='outline-none'
                                        autoComplete='off'
                                        onKeyDown={handleKeyDown}
                                        {...register(`recordings.2.repeatCount`)}
                                    />
                                    초
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
                )}
                {/* 휴식시 활동시 */}
                {split - start > 0 && (
                    <>
                        <table className={subtestStyles.questionTable}>
                            <thead>
                                <tr className={subtestStyles.yesNo}>
                                    <th colSpan={2}>{subtitle1}</th>
                                    <th>예</th>
                                    <th colSpan={2}>아니오</th>
                                    <th>기타</th>
                                </tr>
                                <tr className={subtestStyles.option}>
                                    <th colSpan={2}>질문</th>
                                    <th>정상</th>
                                    <th>경도</th>
                                    <th>심도</th>
                                    <th>평가불가</th>
                                </tr>
                            </thead>
                            <tbody>
                                {fields.slice(0, split - start).map((item, i) => (
                                    <tr key={item.id}>
                                        <td className={subtestStyles.num}>{i + 1}</td>
                                        <td className={subtestStyles.text}>{item.questionText}</td>
                                        <td className={subtestStyles.option}>
                                            <input
                                                type='radio'
                                                {...register(`answers.${i}.answer`, {
                                                    required: true,
                                                })}
                                                value='normal'
                                            />
                                        </td>
                                        <td className={subtestStyles.option}>
                                            <input
                                                type='radio'
                                                {...register(`answers.${i}.answer`, {
                                                    required: true,
                                                })}
                                                value='mild'
                                            />
                                        </td>
                                        <td className={subtestStyles.option}>
                                            <input
                                                type='radio'
                                                {...register(`answers.${i}.answer`, {
                                                    required: true,
                                                })}
                                                value='moderate'
                                            />
                                        </td>
                                        <td className={subtestStyles.option}>
                                            <input
                                                type='radio'
                                                {...register(`answers.${i}.answer`, {
                                                    required: true,
                                                })}
                                                value='unknown'
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className='flex w-full justify-end'>
                            <CheckBox name='all' checked={checkAll1} onChange={handleChangeCheckAll1}>
                                모두 정상
                            </CheckBox>
                        </div>
                    </>
                )}

                {end - split > 0 && (
                    <>
                        <table className={subtestStyles.questionTable}>
                            <thead>
                                <tr className={subtestStyles.yesNo}>
                                    <th colSpan={2}></th>
                                    <th>예</th>
                                    <th colSpan={2}>아니오</th>
                                    <th>기타</th>
                                </tr>
                                <tr className={subtestStyles.option}>
                                    <th></th>
                                    <th>{subtitle2}</th>
                                    <th>정상</th>
                                    <th>경도</th>
                                    <th>심도</th>
                                    <th>평가불가</th>
                                </tr>
                            </thead>
                            <tbody>
                                {fields.slice(split - start).map((item, i) => (
                                    <tr key={item.id}>
                                        <td className={subtestStyles.num}>{split - start + i + 1}</td>
                                        <td className={subtestStyles.text}>{item.questionText}</td>
                                        <td className={subtestStyles.option}>
                                            <input
                                                type='radio'
                                                {...register(`answers.${split - start + i}.answer`, { required: true })}
                                                value='normal'
                                            />
                                        </td>
                                        <td className={subtestStyles.option}>
                                            <input
                                                type='radio'
                                                {...register(`answers.${split - start + i}.answer`, { required: true })}
                                                value='mild'
                                            />
                                        </td>
                                        <td className={subtestStyles.option}>
                                            <input
                                                type='radio'
                                                {...register(`answers.${split - start + i}.answer`, { required: true })}
                                                value='moderate'
                                            />
                                        </td>
                                        <td className={subtestStyles.option}>
                                            <input
                                                type='radio'
                                                {...register(`answers.${split - start + i}.answer`, { required: true })}
                                                value='unknown'
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className='flex w-full justify-end'>
                            <CheckBox name='all' checked={checkAll2} onChange={handleChangeCheckAll2}>
                                모두 정상
                            </CheckBox>
                        </div>
                    </>
                )}

                <div>
                    <button type='button' className='mt-20 btn btn-large btn-outlined' onClick={handleClickPrev}>
                        이전
                    </button>

                    <button key='submit' type='submit' className='ml-5 mt-20 btn btn-large btn-contained' disabled={!isValid}>
                        다음
                    </button>
                </div>
            </form>
        </Container>
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
        console.error(err);

        return {
            redirect: {
                destination: '/das',
                permanent: true,
            },
        };
    }
};
