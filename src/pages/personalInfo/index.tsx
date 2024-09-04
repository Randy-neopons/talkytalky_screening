import { useCallback, useEffect, type ReactNode } from 'react';
import { Controller, useForm, useWatch, type Control } from 'react-hook-form';
import TextareaAutosize from 'react-textarea-autosize';
import type { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';

import { ErrorMessage } from '@hookform/error-message';
import { getCookie } from 'cookies-next';
import dayjs from 'dayjs';

import { useTestInfo, useTestActions } from '@/stores/testStore';
import { CheckBoxGroupItem } from '@/components/common/CheckBox';
import Container from '@/components/common/Container';
import Select from '@/components/common/Select';
import { useUserQuery } from '@/hooks/user';

import styles from './PersonalInfo.module.css';

import type { TestInfoFormValues } from '@/types/types';

const makeRangeOptions = (min: number, max: number) => {
    return Array.from({ length: max - min + 1 }, (v, i) => ({ label: `${i + min}`, value: `${i + min}` }));
};

const yearOptions = makeRangeOptions(1940, dayjs().year());
const monthOptions = makeRangeOptions(1, 12);
const dayOptions = makeRangeOptions(1, 31);

const genderOptions = [
    { value: 'female', label: '여' },
    { value: 'male', label: '남' },
];

const brainLesionOptions = [
    { value: 'bilateralUpperMotorNeuron', label: '양측상부운동신경손상' },
    { value: 'unilateralUpperMotorNeuron', label: '일측상부운동신경손상' },
    { value: 'lowerMotorNeuron', label: '하부운동신경손상' },
    { value: 'cerebellarControlCircuit', label: '소뇌조절회로' },
    { value: 'basalGangliaControlCircuit', label: '기저핵조절회로' },
    { value: 'unknown', label: '알 수 없음' },
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
        brainLesions: string[];
        medicalHistory: string;
        patientMemo: string;
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
            brainLesions: testInfo?.brainLesions || [],
            medicalHistory: testInfo?.medicalHistory || '',
            patientMemo: testInfo?.patientMemo || '',
        },
        mode: 'onChange',
    });
    const age = useAge({ control }); // 만 나이 계산

    return (
        <>
            <form className='mb-20 mt-[60px] w-[550px] rounded-[20px] bg-white px-[50px] pb-[50px] pt-[10px] shadow-base xl:mt-20'>
                <Label htmlFor='testerName' required>
                    검사자명
                </Label>
                <input value={userInfo?.fullName || ''} className={`${styles.input}`} placeholder='검사자명을 입력하세요.' disabled />
                <ErrorMessage errors={errors} name='testerName' render={({ message }) => <ErrorText>{message}</ErrorText>} />

                <Label htmlFor='certificateNumber' required>
                    자격증 번호
                </Label>
                <input
                    value={userInfo?.certificateArr?.[0]?.certNum || ''}
                    className={`${styles.input}`}
                    placeholder='자격증 번호를 입력하세요.'
                    disabled
                />
                <ErrorMessage errors={errors} name='certificateNumber' render={({ message }) => <ErrorText>{message}</ErrorText>} />

                <Label htmlFor='testDate'>검사일</Label>
                <div className='flex gap-[15px]'>
                    <Select control={control} name='testYear' required options={yearOptions} placeholder='년' />
                    <Select control={control} name='testMonth' required options={monthOptions} placeholder='월' />
                    <Select control={control} name='testDay' required options={dayOptions} placeholder='일' />
                </div>

                <div className='mb-[10px] mt-10 h-[1px] w-full bg-[#ced4da] xl:mt-[50px] '></div>

                <Label htmlFor='patientName' required>
                    환자명
                </Label>
                <input
                    {...register('patientName', { required: '환자명을 입력하세요' })}
                    className={`${styles.input}`}
                    placeholder='환자명을 입력하세요.'
                />
                <ErrorMessage errors={errors} name='patientName' render={({ message }) => <ErrorText>{message}</ErrorText>} />

                <Label htmlFor='patientGender' required>
                    성별
                </Label>
                <Select control={control} name='patientGender' required options={genderOptions} placeholder='성별' />

                <Label htmlFor='patientBirthDate' required>
                    생년월일(<span className='text-accent1'>{age}</span>세)
                </Label>
                <div className='flex gap-[15px]'>
                    <Select control={control} name='birthYear' required options={yearOptions} placeholder='년' />
                    <Select control={control} name='birthMonth' required options={monthOptions} placeholder='월' />
                    <Select control={control} name='birthDay' required options={dayOptions} placeholder='일' />
                </div>

                <Label htmlFor='brainLesions'>마비말장애 관련 뇌병변</Label>
                <ul className='flex flex-row flex-wrap'>
                    {brainLesionOptions.map((option, i) => (
                        <li key={option.value} className='mb-[10px] basis-1/2 xl:mb-[11px]'>
                            <CheckBoxGroupItem key={option.value} control={control} name='brainLesions' value={option.value}>
                                {option.label}
                            </CheckBoxGroupItem>
                        </li>
                    ))}
                </ul>

                <Label htmlFor='medicalHistory'>병력</Label>
                <Controller
                    control={control}
                    name='medicalHistory'
                    render={({ field: { onChange, onBlur, value, ref } }) => (
                        <TextareaAutosize
                            className={styles.textarea}
                            minRows={3}
                            placeholder='병력을 입력해주세요'
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
                            placeholder='추가정보를 입력해주세요'
                            onChange={onChange}
                            onBlur={onBlur}
                            value={value}
                            ref={ref}
                        />
                    )}
                />
            </form>
            <button
                className='btn btn-large btn-contained disabled:btn-disabled'
                type='button'
                onClick={handleSubmit(onSubmit)}
                disabled={!isValid}
            >
                다음
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
            router.push('/selectTest'); // 검사 선택 화면으로
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
                destination: '/',
                permanent: true,
            },
        };
    }
};
