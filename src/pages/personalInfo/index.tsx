import { useCallback, useRef, useState, type ChangeEvent, type ReactNode, type RefObject } from 'react';
import { Controller, useForm, useWatch, type Control } from 'react-hook-form';
import TextareaAutosize from 'react-textarea-autosize';
import Image from 'next/image';
import { useRouter } from 'next/router';

import { ErrorMessage } from '@hookform/error-message';
import dayjs from 'dayjs';
import { create, useStore } from 'zustand';

import CheckBox, { CheckBoxGroupItem } from '@/components/common/CheckBox';
import Container from '@/components/common/Container';
import Select from '@/components/common/Select';

import styles from './PersonalInfo.module.css';

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

const useTestInfoStore = create<{
    testInfo: FormValues;
    tests: string[];
    actions: {
        setTestInfo: (newInfo: FormValues) => void;
        setTests: (newTests: string[]) => void;
    };
}>(set => ({
    testInfo: {
        testerName: '',
        certificateNumber: '',
        testYear: `${dayjs().year()}`,
        testMonth: `${dayjs().month() + 1}`,
        testDay: `${dayjs().date()}`,
        patientName: '',
        gender: 'female',
        birthYear: `${dayjs().year()}`,
        birthMonth: `${dayjs().month() + 1}`,
        birthDay: `${dayjs().date()}`,
        brainLesions: [],
        medicalHistory: '',
        memo: '',
    },
    tests: [],
    actions: {
        setTestInfo: newInfo => set({ testInfo: newInfo }),
        setTests: newTests => set({ tests: newTests }),
    },
}));
export const useTestInfo = () => useTestInfoStore(state => state.testInfo);
export const useTests = () => useTestInfoStore(state => state.tests);
export const useTestInfoActions = () => useTestInfoStore(state => state.actions);

const Label = ({ children, htmlFor, required }: { children: ReactNode; htmlFor: string; required?: boolean }) => {
    return (
        <label htmlFor={htmlFor} className='mb-4 mt-10 block font-noto font-bold text-black text-head-2'>
            {children}
            {required && <span className='text-red1'>*</span>}
        </label>
    );
};

interface FormValues {
    testerName: string;
    certificateNumber: string;
    testYear: string;
    testMonth: string;
    testDay: string;
    patientName: string;
    gender: string;
    birthYear: string;
    birthMonth: string;
    birthDay: string;
    brainLesions: string[];
    medicalHistory: string;
    memo: string;
}

// 만 나이 계산 custom hook
const useAge = ({ control }: { control: Control<FormValues> }) => {
    const birthYear = Number(useWatch({ control, name: 'birthYear' }));
    const birthMonth = Number(useWatch({ control, name: 'birthMonth' }));
    const birthDay = Number(useWatch({ control, name: 'birthDay' }));

    // 만 나이 계산
    const age = dayjs().diff(new Date(birthYear, birthMonth - 1, birthDay), 'year');

    return age;
};

const ErrorText = ({ children }: { children: ReactNode }) => {
    return <p className='mt-1 text-red1 text-body-2'>{children}</p>;
};

export default function PersonalInfoPage() {
    const router = useRouter(); // next router
    const { setTestInfo } = useTestInfoActions(); // 검사 정보 global state

    // 검사 정보 입력 form
    const {
        control,
        register,
        formState: { errors },
        handleSubmit,
    } = useForm<FormValues>({
        defaultValues: {
            testYear: `${dayjs().year()}`,
            testMonth: `${dayjs().month() + 1}`,
            testDay: `${dayjs().date()}`,
            birthYear: `${dayjs().year()}`,
            birthMonth: `${dayjs().month() + 1}`,
            birthDay: `${dayjs().date()}`,
            brainLesions: [],
        },
    });
    const age = useAge({ control }); // 만 나이 계산

    // 폼 제출
    const handleOnSubmit = useCallback(
        (data: any) => {
            setTestInfo(data); // set global state
            console.log(data);
            router.push('/selectTest'); // 검사 선택 화면으로
        },
        [router, setTestInfo],
    );

    return (
        <Container>
            <h1 className='font-jalnan text-head-1'>기본정보 입력</h1>
            <form className='mb-20 mt-[60px] w-[550px] rounded-[20px] bg-white px-[50px] pb-[50px] pt-[10px] shadow-base xl:mt-20'>
                <Label htmlFor='testerName' required>
                    검사자명
                </Label>
                <input
                    {...register('testerName', { required: '검사자명을 입력하세요.' })}
                    className={`${styles.input}`}
                    placeholder='검사자명을 입력하세요.'
                />
                <ErrorMessage errors={errors} name='testerName' render={({ message }) => <ErrorText>{message}</ErrorText>} />

                <Label htmlFor='certificateNumber' required>
                    자격증 번호
                </Label>
                <input
                    {...register('certificateNumber', { required: '자격증 번호를 입력하세요.' })}
                    className={`${styles.input}`}
                    placeholder='자격증 번호를 입력하세요.'
                />
                <ErrorMessage errors={errors} name='certificateNumber' render={({ message }) => <ErrorText>{message}</ErrorText>} />

                <Label htmlFor='testDate'>검사일</Label>
                <div className='flex gap-[15px]'>
                    <Select control={control} name='testYear' required options={yearOptions} />
                    <Select control={control} name='testMonth' required options={monthOptions} />
                    <Select control={control} name='testDay' required options={dayOptions} />
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

                <Label htmlFor='gender' required>
                    성별
                </Label>
                <Select control={control} name='gender' required options={genderOptions} defaultValue={genderOptions[0]} />

                <Label htmlFor='birthDate' required>
                    생년월일({age}세)
                </Label>
                <div className='flex gap-[15px]'>
                    <Select control={control} name='birthYear' required options={yearOptions} />
                    <Select control={control} name='birthMonth' required options={monthOptions} />
                    <Select control={control} name='birthDay' required options={dayOptions} />
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

                <Label htmlFor='memo'>개인관련 추가정보</Label>
                <Controller
                    control={control}
                    name='memo'
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
            <button className='btn btn-large btn-contained' type='button' onClick={handleSubmit(handleOnSubmit)}>
                다음
            </button>
        </Container>
    );
}
