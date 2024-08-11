import { useCallback, useMemo, useState, type ChangeEventHandler } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import ReactTextareaAutosize from 'react-textarea-autosize';
import type { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';

import CheckBox from '@/components/common/CheckBox';
import Container from '@/components/common/Container';
import { getQuestionListAPI } from '@/api/questions';

import subtestStyles from '../SubTests.module.css';

// 소검사 ID
const CURRENT_SUBTEST_ID = 3;

// 소검사 내 파트별 문항 index 정보
// TODO: part title도 DB에서 가져오기
const partIndexList = [
    { start: 0, end: 10, subtitle: '휴식 시', partTitle: 'AMR' },
    { start: 10, end: 20, subtitle: '휴식 시', partTitle: 'SMR' },
];

const RecordIcon = () => {
    return (
        <svg xmlns='http://www.w3.org/2000/svg' width='121' height='50' viewBox='0 0 121 50' fill='none'>
            <rect x='0.5' y='0.5' width='120' height='49' fill='white' />
            {/* <rect x='0.5' y='0.5' width='120' height='49' stroke='#CED4DA' /> */}
            <circle cx='60.5' cy='24.5' r='8.5' fill='#FF647C' />
        </svg>
    );
};

const PlayIcon = () => {
    return (
        <svg xmlns='http://www.w3.org/2000/svg' width='121' height='50' viewBox='0 0 121 50' fill='none'>
            <rect x='0.5' y='0.5' width='120' height='49' fill='white' />
            {/* <rect x='0.5' y='0.5' width='120' height='49' stroke='#CED4DA' /> */}
            <path
                d='M70 23.2679C71.3333 24.0377 71.3333 25.9623 70 26.7321L58 33.6603C56.6667 34.4301 55 33.4678 55 31.9282L55 18.0718C55 16.5322 56.6667 15.5699 58 16.3397L70 23.2679Z'
                fill='#6979F8'
            />
        </svg>
    );
};

// SPEECH II 문항 페이지
export default function SpeechMotorPage({
    questionList,
}: {
    questionList: { questionId: number; questionText: string; answerType: string; partId: number; subtestId: number }[];
}) {
    const router = useRouter();

    // 문항 전부 정상으로 체크
    const [checkAll, setCheckAll] = useState(false);

    // 소검사 내 현재 파트 정보
    const [currentPartId, setCurrentPartId] = useState(1);
    const { start, end, subtitle, partTitle } = useMemo(() => partIndexList[currentPartId - 1], [currentPartId]);

    // react-hook-form
    const { control, register, setValue, handleSubmit } = useForm<{
        answers: { questionId: number; questionText: string; answer?: string; memo?: string }[];
    }>({
        defaultValues: {
            answers: questionList?.map(({ questionId, questionText, partId, subtestId }) => ({
                questionId,
                questionText,
                partId,
                subtestId,
                answer: undefined,
                memo: undefined,
            })),
        },
    });
    const { fields } = useFieldArray({ name: 'answers', control });

    // 모두 정상 체크
    const handleChangeCheckAll = useCallback<ChangeEventHandler<HTMLInputElement>>(
        e => {
            if (e.target.checked === true) {
                Array.from({ length: end - start }, (v, i) => start + i).map(v => {
                    setValue(`answers.${v}.answer`, 'normal');
                });
            }

            setCheckAll(e.target.checked);
        },
        [setValue, end, start],
    );

    // 이전 파트로
    const handleClickPrev = useCallback(() => {
        setCheckAll(false);
        currentPartId > 1 && setCurrentPartId(partId => partId - 1);
        typeof window !== 'undefined' && window.scrollTo(0, 0);
    }, [currentPartId]);

    // 다음 파트로
    const handleClickNext = useCallback(() => {
        setCheckAll(false);
        currentPartId < partIndexList.length && setCurrentPartId(partId => partId + 1);
        typeof window !== 'undefined' && window.scrollTo(0, 0); // 스크롤 초기화
    }, [currentPartId]);

    // 폼 제출
    const handleOnSubmit = useCallback(
        (data: any) => {
            console.log(data);

            try {
                // TODO: 중간 저장 API

                const sessionId = router.query.sessionId;
                typeof sessionId === 'string' && router.push(`/sessions/${sessionId}/subTests/stressTesting`);
            } catch (err) {
                console.error(err);
            }
        },
        [router],
    );

    return (
        <Container>
            <h2 className='flex items-center font-jalnan text-accent1 text-head-2'>SPEECH Motor : 말운동평가</h2>
            <form onSubmit={handleSubmit(handleOnSubmit)} className='flex w-full flex-col flex-nowrap items-center px-5 xl:px-0'>
                <h1 className='whitespace-pre-line text-center font-jalnan text-head-1'>{partTitle}</h1>

                <table className={`${subtestStyles['table']}`}>
                    <thead className={`${subtestStyles['table-head']}`}>
                        <tr className='bg-accent1 text-white text-body-2'>
                            <th className='rounded-tl-base'>AMR 측정 (5초)</th>
                            <th></th>
                            <th>녹음</th>
                            <th>재생</th>
                            <th className='rounded-tr-base'>반복횟수</th>
                        </tr>
                    </thead>
                    <tbody className={`${subtestStyles['table-body']}`}>
                        <tr>
                            <td rowSpan={3}>
                                숨을 크게 들어 마신 뒤, &apos;파&apos; 를 가능한 빨리 규칙적으로 반복해서 말해보세요. (&apos;타&apos; 와
                                &apos;카&apos; 도 동일하게 시행)
                            </td>
                            <td>파</td>
                            <td>
                                <svg xmlns='http://www.w3.org/2000/svg' width='121' height='50' viewBox='0 0 121 50' fill='none'>
                                    <rect x='0.5' y='0.5' width='120' height='49' fill='white' />
                                    {/* <rect x='0.5' y='0.5' width='120' height='49' stroke='#CED4DA' /> */}
                                    <circle cx='60.5' cy='24.5' r='8.5' fill='#FF647C' />
                                </svg>
                            </td>
                            <td>
                                <svg xmlns='http://www.w3.org/2000/svg' width='121' height='50' viewBox='0 0 121 50' fill='none'>
                                    <rect x='0.5' y='0.5' width='120' height='49' fill='white' />
                                    {/* <rect x='0.5' y='0.5' width='120' height='49' stroke='#CED4DA' /> */}
                                    <path
                                        d='M70 23.2679C71.3333 24.0377 71.3333 25.9623 70 26.7321L58 33.6603C56.6667 34.4301 55 33.4678 55 31.9282L55 18.0718C55 16.5322 56.6667 15.5699 58 16.3397L70 23.2679Z'
                                        fill='#6979F8'
                                    />
                                </svg>
                            </td>
                            <td>
                                <input />
                            </td>
                        </tr>
                        <tr>
                            <td>타</td>
                            <td>
                                <svg xmlns='http://www.w3.org/2000/svg' width='121' height='50' viewBox='0 0 121 50' fill='none'>
                                    <rect x='0.5' y='0.5' width='120' height='49' fill='white' />
                                    {/* <rect x='0.5' y='0.5' width='120' height='49' stroke='#CED4DA' /> */}
                                    <circle cx='60.5' cy='24.5' r='8.5' fill='#FF647C' />
                                </svg>
                            </td>
                            <td>
                                <svg xmlns='http://www.w3.org/2000/svg' width='121' height='50' viewBox='0 0 121 50' fill='none'>
                                    <rect x='0.5' y='0.5' width='120' height='49' fill='white' />
                                    {/* <rect x='0.5' y='0.5' width='120' height='49' stroke='#CED4DA' /> */}
                                    <path
                                        d='M70 23.2679C71.3333 24.0377 71.3333 25.9623 70 26.7321L58 33.6603C56.6667 34.4301 55 33.4678 55 31.9282L55 18.0718C55 16.5322 56.6667 15.5699 58 16.3397L70 23.2679Z'
                                        fill='#6979F8'
                                    />
                                </svg>
                            </td>
                            <td>
                                <input />
                            </td>
                        </tr>
                        <tr>
                            <td>카</td>
                            <td>
                                <svg xmlns='http://www.w3.org/2000/svg' width='121' height='50' viewBox='0 0 121 50' fill='none'>
                                    <rect x='0.5' y='0.5' width='120' height='49' fill='white' />
                                    {/* <rect x='0.5' y='0.5' width='120' height='49' stroke='#CED4DA' /> */}
                                    <circle cx='60.5' cy='24.5' r='8.5' fill='#FF647C' />
                                </svg>
                            </td>
                            <td>
                                <svg xmlns='http://www.w3.org/2000/svg' width='121' height='50' viewBox='0 0 121 50' fill='none'>
                                    <rect x='0.5' y='0.5' width='120' height='49' fill='white' />
                                    {/* <rect x='0.5' y='0.5' width='120' height='49' stroke='#CED4DA' /> */}
                                    <path
                                        d='M70 23.2679C71.3333 24.0377 71.3333 25.9623 70 26.7321L58 33.6603C56.6667 34.4301 55 33.4678 55 31.9282L55 18.0718C55 16.5322 56.6667 15.5699 58 16.3397L70 23.2679Z'
                                        fill='#6979F8'
                                    />
                                </svg>
                            </td>
                            <td>
                                <input />
                            </td>
                        </tr>
                    </tbody>
                </table>

                <table className={`${subtestStyles['table']}`}>
                    <thead className={`${subtestStyles['table-head']}`}>
                        <tr className='bg-accent1 text-white text-body-2'>
                            <th className='rounded-tl-base'></th>
                            <th>{subtitle}</th>
                            <th>정상</th>
                            <th>경도</th>
                            <th>심도</th>
                            <th>평가불가</th>
                            <th className='rounded-tr-base'>메모</th>
                        </tr>
                    </thead>
                    <tbody className={`${subtestStyles['table-body']}`}>
                        {fields.slice(start, end).map((item, i) => (
                            <tr key={item.id}>
                                <td>{i + 1}</td>
                                <td>{item.questionText}</td>
                                <td className='text-center'>
                                    <input type='radio' {...register(`answers.${start + i}.answer`)} value='normal' />
                                </td>
                                <td className='text-center'>
                                    <input type='radio' {...register(`answers.${start + i}.answer`)} value='mild' />
                                </td>
                                <td className='text-center'>
                                    <input type='radio' {...register(`answers.${start + i}.answer`)} value='moderate' />
                                </td>
                                <td className='text-center'>
                                    <input type='radio' {...register(`answers.${start + i}.answer`)} value='unknown' />
                                </td>
                                <td className='p-0 text-center'>
                                    <Controller
                                        control={control}
                                        name={`answers.${start + i}.memo`}
                                        render={({ field }) => (
                                            <ReactTextareaAutosize
                                                className={`${subtestStyles.textarea}`}
                                                minRows={1}
                                                onChange={field.onChange}
                                                onBlur={field.onBlur}
                                                value={field.value}
                                            />
                                        )}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className='flex w-full justify-end'>
                    <CheckBox name='all' checked={checkAll} onChange={handleChangeCheckAll}>
                        모두 정상
                    </CheckBox>
                </div>

                <div>
                    {currentPartId > 1 && (
                        <button type='button' className='mt-20 btn btn-large btn-outlined' onClick={handleClickPrev}>
                            이전
                        </button>
                    )}
                    {/* key 설정을 해야 다른 컴포넌트로 인식하여 type이 명확히 구분됨 */}
                    {currentPartId < partIndexList.length ? (
                        <button key='noSubmit' type='button' className='ml-5 mt-20 btn btn-large btn-contained' onClick={handleClickNext}>
                            다음
                        </button>
                    ) : (
                        <button key='submit' type='submit' className='ml-5 mt-20 btn btn-large btn-contained'>
                            다음 검사로
                        </button>
                    )}
                </div>
            </form>
        </Container>
    );
}

export const getServerSideProps: GetServerSideProps = async context => {
    const sessionId = Number(context.query.sessionId);

    if (!sessionId) {
        return {
            redirect: {
                destination: '/',
                permanent: true,
            },
        };
    }

    try {
        // TODO: sessionId 통해 시험 세션 정보 얻음
        const testSession = {
            sessionId,
            subtests: [],
        };

        // 소검사 문항 정보 fetch
        const responseData = await getQuestionListAPI(CURRENT_SUBTEST_ID);
        const questionList = responseData.questions;

        return {
            props: {
                testSession,
                questionList,
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
