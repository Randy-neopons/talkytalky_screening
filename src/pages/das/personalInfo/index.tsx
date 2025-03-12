import { useCallback, useEffect, useMemo, type ReactNode } from 'react';
import { Controller, useForm, useWatch, type Control } from 'react-hook-form';
import TextareaAutosize from 'react-textarea-autosize';
import type { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';

import { ErrorMessage } from '@hookform/error-message';
import { getCookie } from 'cookies-next';
import dayjs from 'dayjs';

import { useTestInfo, useTestActions } from '@/stores/testStore';
import { dominantHandOptions, genderOptions, hearingAidsUseOptions } from '@/utils/const';
import { RadioButton } from '@/components/common/Buttons';
import { CheckBoxGroup, CheckBoxGroupItem } from '@/components/common/CheckBox';
import Container from '@/components/common/Container';
import Select from '@/components/common/Select';
import { useUserQuery } from '@/hooks/user';

import styles from './PersonalInfo.module.scss';

import type { TestInfoFormValues } from '@/types/das';

const makeRangeOptions = (min: number, max: number) => {
    return Array.from({ length: max - min + 1 }, (v, i) => ({ label: `${i + min}`, value: `${i + min}` }));
};

const yearOptions = makeRangeOptions(1940, dayjs().year());
const monthOptions = makeRangeOptions(1, 12);
const dayOptions = makeRangeOptions(1, 31);

const brainLesionOptions = [
    { value: 'bilateralUpperMotorNeuron', label: '양측상부운동신경손상' },
    { value: 'unilateralUpperMotorNeuron', label: '일측상부운동신경손상' },
    { value: 'lowerMotorNeuron', label: '하부운동신경손상' },
    { value: 'cerebellarControlCircuit', label: '소뇌조절회로' },
    { value: 'basalGangliaControlCircuit', label: '기저핵조절회로' },
    { value: 'unknown', label: '특정할 수 없음' },
    { value: 'normal', label: '정상 소견' },
];

const comorbidityOptions = [
    { value: 'N', label: '비동반' },
    { value: 'Y', label: '동반' },
];

const Label = ({ children, htmlFor, required }: { children: ReactNode; htmlFor: string; required?: boolean }) => {
    return (
        <label htmlFor={htmlFor} className='mb-4 mt-10 block font-noto font-bold text-black text-head-2'>
            {children}
            {required && <span className='text-red1'>*</span>}
        </label>
    );
};

type FormValues = Omit<TestInfoFormValues, 'testDate' | 'patientBirthdate'> & {
    testYear: string;
    testMonth: string;
    testDay: string;
    birthYear: string;
    birthMonth: string;
    birthDay: string;
};

// 만 나이 계산 custom hook
const useAge = ({ control }: { control: Control<FormValues> }) => {
    const birthYear = Number(useWatch({ control, name: 'birthYear' }));
    const birthMonth = Number(useWatch({ control, name: 'birthMonth' }));
    const birthDay = Number(useWatch({ control, name: 'birthDay' }));

    if (!birthYear) {
        return null;
    }

    // 만 나이 계산
    const age = dayjs().diff(new Date(birthYear, birthMonth - 1, birthDay), 'year');

    return age;
};

const ErrorText = ({ children }: { children: ReactNode }) => {
    return <p className='mt-1 text-red1 text-body-2'>{children}</p>;
};

export const PersonalInfoForm = ({
    userInfo,
    testInfo,
    onSubmit,
}: {
    userInfo: any;
    testInfo?: {
        testDate: string;
        patientName: string;
        patientGender: string;
        patientBirthdate: string;
        dominantHand: string;
        hearingAidsUse: string;
        educationYear: string;
        brainLesions: string[];
        medicalHistory: string;
        patientMemo: string;
        neurologicalLesion?: string; // 신경학적 병변
        languageDisorder?: string; // 언어장애
        languageDisorderDetail?: {
            kWabAq?: number;
            aphasiaType?: string;
        }; // 언어장애
        cognitiveDisorder?: string; // 인지장애
        cognitiveDisorderDetail?: {
            mmseScore?: number;
        };
        dysphagia?: string;
    };
    onSubmit: (data: FormValues) => void;
}) => {
    // 검사 정보 입력 form
    const {
        control,
        register,
        formState: { errors, isValid },
        handleSubmit,
    } = useForm<FormValues>({
        defaultValues: {
            patientName: testInfo?.patientName,
            patientGender: testInfo?.patientGender,
            testYear: `${dayjs(testInfo?.testDate).year()}`,
            testMonth: `${dayjs(testInfo?.testDate).month() + 1}`,
            testDay: `${dayjs(testInfo?.testDate).date()}`,
            birthYear: testInfo?.patientBirthdate ? `${dayjs(testInfo.patientBirthdate).year()}` : '',
            birthMonth: testInfo?.patientBirthdate ? `${dayjs(testInfo.patientBirthdate).month() + 1}` : '',
            birthDay: testInfo?.patientBirthdate ? `${dayjs(testInfo.patientBirthdate).date()}` : '',
            dominantHand: testInfo?.dominantHand || '',
            hearingAidsUse: testInfo?.hearingAidsUse || '',
            educationYear: testInfo?.educationYear || '',
            brainLesions: testInfo?.brainLesions || [],
            medicalHistory: testInfo?.medicalHistory || '',
            patientMemo: testInfo?.patientMemo || '',
            neurologicalLesion: testInfo?.neurologicalLesion || '',
            languageDisorder: testInfo?.languageDisorder,
            languageDisorderDetail: testInfo?.languageDisorderDetail,
            cognitiveDisorder: testInfo?.cognitiveDisorder,
            cognitiveDisorderDetail: testInfo?.cognitiveDisorderDetail,
            dysphagia: testInfo?.dysphagia,
        },
        mode: 'onChange',
    });
    const age = useAge({ control }); // 만 나이 계산
    const watchLanguageDisorder = useWatch({ control, name: 'languageDisorder' });
    const watchCognitiveDisorder = useWatch({ control, name: 'cognitiveDisorder' });

    const router = useRouter();

    // 제출 버튼 텍스트
    const submitButtonText = useMemo(() => {
        const pathname = router.asPath.split('/').slice(-1)[0];
        return pathname === 'editInfo' ? '확인' : '다음';
    }, [router]);

    return (
        <>
            <form className='mb-20 mt-15 w-[550px] rounded-2xl bg-white px-[50px] pb-[50px] pt-[10px] shadow-base xl:mt-20'>
                <Label htmlFor='testerName' required>
                    검사자명
                </Label>
                <input value={userInfo?.fullName || ''} className={`${styles.input}`} placeholder='검사자명을 입력해주세요.' disabled />
                <ErrorMessage errors={errors} name='testerName' render={({ message }) => <ErrorText>{message}</ErrorText>} />

                <Label htmlFor='certificateNumber' required>
                    자격증 번호
                </Label>
                <input
                    value={userInfo?.certificateArr?.[0]?.certNum || ''}
                    className={`${styles.input}`}
                    placeholder='자격증 번호를 입력해주세요.'
                    disabled
                />
                <ErrorMessage errors={errors} name='certificateNumber' render={({ message }) => <ErrorText>{message}</ErrorText>} />

                <Label htmlFor='testDate' required>
                    검사일
                </Label>
                <div className='flex gap-[15px]'>
                    <Select control={control} name='testYear' required options={yearOptions} placeholder='년' />
                    <Select control={control} name='testMonth' required options={monthOptions} placeholder='월' />
                    <Select control={control} name='testDay' required options={dayOptions} placeholder='일' />
                </div>

                <div className='mb-[10px] mt-10 h-[1px] w-full bg-[#ced4da] xl:mt-[50px] '></div>

                <div className='flex w-full basis-1/2 gap-2.5'>
                    <div className='w-full'>
                        <Label htmlFor='patientName' required>
                            환자명
                        </Label>
                        <input
                            {...register('patientName', { required: '환자명을 입력해주세요.' })}
                            className={`${styles.input}`}
                            placeholder='환자명을 입력해주세요.'
                        />
                        <ErrorMessage errors={errors} name='patientName' render={({ message }) => <ErrorText>{message}</ErrorText>} />
                    </div>

                    <div className='w-full'>
                        <Label htmlFor='patientGender' required>
                            성별
                        </Label>
                        <Select control={control} name='patientGender' required options={genderOptions} placeholder='성별' />
                    </div>
                </div>

                <Label htmlFor='patientBirthDate' required>
                    생년월일(만 <span className='text-accent1'>{age}</span>세)
                </Label>
                <div className='flex gap-[15px]'>
                    <Select control={control} name='birthYear' required options={yearOptions} placeholder='년' />
                    <Select control={control} name='birthMonth' required options={monthOptions} placeholder='월' />
                    <Select control={control} name='birthDay' required options={dayOptions} placeholder='일' />
                </div>

                <Label htmlFor='dominantHand' required>
                    주로 사용하는 손
                </Label>
                <Select
                    control={control}
                    name='dominantHand'
                    required
                    options={dominantHandOptions}
                    placeholder='주로 사용하는 손을 입력해주세요'
                />
                <ErrorMessage errors={errors} name='dominantHand' render={({ message }) => <ErrorText>{message}</ErrorText>} />

                <Label htmlFor='hearingAidsUse' required>
                    보청기 사용유무
                </Label>
                <Select
                    control={control}
                    name='hearingAidsUse'
                    required
                    options={hearingAidsUseOptions}
                    placeholder='보청기 사용유무를 입력해주세요'
                />
                <ErrorMessage errors={errors} name='hearingAidsUse' render={({ message }) => <ErrorText>{message}</ErrorText>} />

                <Label htmlFor='educationYear' required>
                    교육년수
                </Label>
                <input
                    {...register('educationYear', { required: '교육년수를 입력해주세요.' })}
                    className={`${styles.input}`}
                    placeholder='교육년수를 입력해주세요.'
                />
                <ErrorMessage errors={errors} name='patientName' render={({ message }) => <ErrorText>{message}</ErrorText>} />

                <Label htmlFor='brainLesions' required>
                    마비말장애 관련 뇌병변
                </Label>
                <CheckBoxGroup control={control} name='brainLesions' options={brainLesionOptions} required />

                <Label htmlFor='medicalHistory'>병력</Label>
                <Controller
                    control={control}
                    name='medicalHistory'
                    render={({ field: { onChange, onBlur, value, ref } }) => (
                        <TextareaAutosize
                            className={styles.textarea}
                            minRows={3}
                            placeholder='병력을 입력해주세요.'
                            onChange={onChange}
                            onBlur={onBlur}
                            value={value}
                            ref={ref}
                        />
                    )}
                />

                <Label htmlFor='patientMemo'>개인관련 추가정보</Label>
                <Controller
                    control={control}
                    name='patientMemo'
                    render={({ field: { onChange, onBlur, value, ref } }) => (
                        <TextareaAutosize
                            className={styles.textarea}
                            minRows={3}
                            placeholder='환자의 개인관련 추가정보를 입력해주세요.'
                            onChange={onChange}
                            onBlur={onBlur}
                            value={value}
                            ref={ref}
                        />
                    )}
                />

                <Label htmlFor='neurologicalLesion'>신경학적 병변 위치 또는 질환명</Label>
                <Controller
                    control={control}
                    name='neurologicalLesion'
                    render={({ field: { onChange, onBlur, value, ref } }) => (
                        <TextareaAutosize
                            className={styles.textarea}
                            minRows={3}
                            placeholder='신경학적 병변 위치 또는 질환명을 입력해주세요.'
                            onChange={onChange}
                            onBlur={onBlur}
                            value={value}
                            ref={ref}
                        />
                    )}
                />

                <Label htmlFor='comorbidity'>동반장애 유무</Label>
                <div className='mt-7.5 flex flex-row gap-5'>
                    <span className='font-bold text-body-1'>언어장애</span>
                    <div>
                        <div className='flex flex-row gap-7.5'>
                            {comorbidityOptions.map((option, i) => (
                                <label key={option.value} className='flex items-center gap-[10px] text-body-1'>
                                    <input type='radio' {...register('languageDisorder')} value={option.value} className='h-6 w-6' />
                                    {option.label}
                                </label>
                            ))}
                        </div>
                        <div className='mt-3.5 flex flex-row gap-5'>
                            <div className='flex items-center gap-2'>
                                <span>K-WAB AQ:</span>
                                <input
                                    type='number'
                                    className='w-20 border-b border-black'
                                    {...register('languageDisorderDetail.kWabAq')}
                                />
                            </div>
                            <div className='flex items-center gap-2'>
                                <span>실어증 타입:</span>
                                <input className='w-20 border-b border-black' {...register('languageDisorderDetail.aphasiaType')} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className='mt-7.5 flex flex-row gap-5'>
                    <span className='font-bold text-body-1'>인지장애</span>
                    <div>
                        <div className='flex flex-row gap-7.5'>
                            {comorbidityOptions.map((option, i) => (
                                <label key={option.value} className='flex items-center gap-[10px] text-body-1'>
                                    <input type='radio' {...register('cognitiveDisorder')} value={option.value} className='h-6 w-6' />
                                    {option.label}
                                </label>
                            ))}
                        </div>
                        <div className='mt-3.5 flex flex-row gap-5'>
                            <div className='flex items-center gap-2'>
                                <span>MMSE 총점:</span>
                                <input
                                    type='number'
                                    className='w-20 border-b border-black'
                                    {...register('cognitiveDisorderDetail.mmseScore')}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className='mt-7.5 flex flex-row gap-5'>
                    <span className='font-bold text-body-1'>삼킴장애</span>
                    <div>
                        <div className='flex flex-row gap-7.5'>
                            {comorbidityOptions.map((option, i) => (
                                <label key={option.value} className='flex items-center gap-[10px] text-body-1'>
                                    <input type='radio' {...register('dysphagia')} value={option.value} className='h-6 w-6' />
                                    {option.label}
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </form>
            <button
                className='btn btn-large btn-contained disabled:btn-contained-disabled'
                type='button'
                onClick={handleSubmit(onSubmit)}
                disabled={!isValid}
            >
                {submitButtonText}
            </button>
        </>
    );
};

export default function PersonalInfoPage() {
    const router = useRouter(); // next router
    const { setTestInfo } = useTestActions(); // 검사 정보 global state
    const { data: user } = useUserQuery();

    // 폼 제출
    const onSubmit = useCallback(
        (data: FormValues) => {
            console.log(data);
            const { testYear, testMonth, testDay, birthYear, birthMonth, birthDay, ...rest } = data;

            const testDate = dayjs(new Date(Number(testYear), Number(testMonth) - 1, Number(testDay))).format('YYYY-MM-DD');
            const patientBirthdate = dayjs(new Date(Number(birthYear), Number(birthMonth) - 1, Number(birthDay))).format('YYYY-MM-DD');

            const formValues = {
                ...rest,
                therapistUserId: user?.data.therapistUserId,
                testDate,
                patientBirthdate,
            };
            setTestInfo(formValues); // set global state
            router.push('/das/selectTest'); // 검사 선택 화면으로
        },
        [router, setTestInfo, user?.data.therapistUserId],
    );

    return (
        <Container>
            <h1 className='font-jalnan text-head-1'>기본정보 입력</h1>
            <PersonalInfoForm userInfo={user?.data} onSubmit={onSubmit} />
        </Container>
    );
}

export const getServerSideProps: GetServerSideProps = async context => {
    try {
        const accessToken = getCookie('jwt', context);
        if (!accessToken || accessToken === 'undefined') {
            return {
                props: {
                    isLoggedIn: false,
                },
            };
        }

        return {
            props: {
                isLoggedIn: true,
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
