import { useCallback, useRef, useState, type ChangeEvent, type ReactNode, type RefObject } from 'react';
import { Controller, useForm } from 'react-hook-form';
import TextareaAutosize from 'react-textarea-autosize';
import Image from 'next/image';

import CheckBox, { CheckBoxGroupItem } from '@/components/common/CheckBox';
import Container from '@/components/common/Container';
import Select from '@/components/common/Select';

import styles from './Start.module.css';

const makeRangeOptions = (min: number, max: number) => {
    return Array.from({ length: max - min + 1 }, (v, i) => ({ label: `${i + min}`, value: `${i + min}` }));
};

const yearOptions = makeRangeOptions(1940, new Date().getFullYear());
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

export default function StartPage() {
    const { control, register, handleSubmit } = useForm<FormValues>({
        defaultValues: {
            testYear: `${new Date().getFullYear()}`,
            testMonth: `${new Date().getMonth() + 1}`,
            testDay: `${new Date().getDay() + 1}`,
            birthYear: `${new Date().getFullYear()}`,
            birthMonth: `${new Date().getMonth() + 1}`,
            birthDay: `${new Date().getDay() + 1}`,
            brainLesions: [],
        },
    });
    // 휴대폰 input
    const inputTestYearRef = useRef<HTMLInputElement>(null);
    const inputTestMonthRef = useRef<HTMLInputElement>(null);
    const inputTestDayRef = useRef<HTMLInputElement>(null);

    // 휴대폰 번호 각 부분
    const [testDate, setTestDate] = useState({
        year: '',
        month: '',
        day: '',
    });

    // 휴대폰 번호 각 부분 변경
    const handleChangeTestDate = useCallback(
        (nextRef: RefObject<HTMLInputElement> | null) => (e: ChangeEvent<HTMLInputElement>) => {
            const newValue = e.target.value.replace(/[^0-9]/g, ''); // 숫자만 입력 가능

            setTestDate({
                ...testDate,
                [e.target.name]: newValue,
            });

            if (newValue.length >= e.target.maxLength && nextRef) {
                nextRef.current?.focus();
            }
        },
        [testDate],
    );

    // 휴대폰 input
    const inputBirthYearRef = useRef<HTMLInputElement>(null);
    const inputBirthMonthRef = useRef<HTMLInputElement>(null);
    const inputBirthDayRef = useRef<HTMLInputElement>(null);

    // 휴대폰 번호 각 부분
    const [birthDate, setBirthDate] = useState({
        year: '',
        month: '',
        day: '',
    });

    // 휴대폰 번호 각 부분 변경
    const handleChangeBirthDate = useCallback(
        (nextRef: RefObject<HTMLInputElement> | null) => (e: ChangeEvent<HTMLInputElement>) => {
            const newValue = e.target.value.replace(/[^0-9]/g, ''); // 숫자만 입력 가능

            setBirthDate({
                ...birthDate,
                [e.target.name]: newValue,
            });

            if (newValue.length >= e.target.maxLength && nextRef) {
                nextRef.current?.focus();
            }
        },
        [birthDate],
    );

    return (
        <Container>
            <h1 className='font-jalnan text-head-1'>기본정보 입력</h1>
            <div className='mt-[60px] w-[550px] rounded-[20px] bg-white px-[50px] pb-[50px] pt-[10px] shadow-base xl:mt-20'>
                <form onSubmit={handleSubmit(data => console.log(data))}>
                    <Label htmlFor='testerName'>검사자명</Label>
                    <input {...register('testerName')} className={`${styles.input}`} placeholder='검사자명을 입력하세요.' />
                    <Label htmlFor='certificateNumber'>자격증 번호</Label>
                    <input {...register('certificateNumber')} className={`${styles.input}`} placeholder='자격증 번호를 입력하세요.' />
                    <Label htmlFor='testDate'>검사일</Label>
                    <div className='flex gap-[15px]'>
                        <Select control={control} name='testYear' required options={yearOptions} />
                        <Select control={control} name='testMonth' required options={monthOptions} />
                        <Select control={control} name='testDay' required options={dayOptions} />
                        {/* <input
                        ref={inputTestYearRef}
                        className={`${styles.input}`}
                        maxLength={4}
                        name='year'
                        placeholder='2010'
                        value={testDate.year}
                        onChange={handleChangeTestDate(inputTestMonthRef)}
                    />
                    <input
                        ref={inputTestMonthRef}
                        className={`${styles.input}`}
                        maxLength={2}
                        name='month'
                        placeholder='05'
                        value={testDate.month}
                        onChange={handleChangeTestDate(inputTestDayRef)}
                    />
                    <input
                        ref={inputTestDayRef}
                        className={`${styles.input}`}
                        maxLength={2}
                        name='day'
                        placeholder='18'
                        value={testDate.day}
                        onChange={handleChangeTestDate(null)}
                    /> */}
                    </div>
                    <div className='mb-[10px] mt-10 h-[1px] w-full bg-[#ced4da] xl:mt-[50px] '></div>
                    <Label htmlFor='testerName' required>
                        환자명
                    </Label>
                    <input
                        {...register('testerName', { required: '이름을 입력하세요' })}
                        className={`${styles.input}`}
                        placeholder='환자명을 입력하세요.'
                    />
                    <Label htmlFor='testerName' required>
                        성별
                    </Label>
                    <Select control={control} name='gender' required options={genderOptions} defaultValue={genderOptions[0]} />
                    <Label htmlFor='testDate' required>
                        생년월일(00세)
                    </Label>
                    <div className='flex gap-[15px]'>
                        <Select control={control} name='birthYear' required options={yearOptions} />
                        <Select control={control} name='birthMonth' required options={monthOptions} />
                        <Select control={control} name='birthDay' required options={dayOptions} />
                        {/* <input
                        ref={inputTestYearRef}
                        className={`${styles.input}`}
                        maxLength={4}
                        name='year'
                        placeholder='2010'
                        value={testDate.year}
                        onChange={handleChangeTestDate(inputTestMonthRef)}
                    />
                    <input
                        ref={inputTestMonthRef}
                        className={`${styles.input}`}
                        maxLength={2}
                        name='month'
                        placeholder='05'
                        value={testDate.month}
                        onChange={handleChangeTestDate(inputTestDayRef)}
                    />
                    <input
                        ref={inputTestDayRef}
                        className={`${styles.input}`}
                        maxLength={2}
                        name='day'
                        placeholder='18'
                        value={testDate.day}
                        onChange={handleChangeTestDate(null)}
                    /> */}
                    </div>
                    <Label htmlFor='testerName'>마비말장애 관련 뇌병변</Label>
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
                            />
                        )}
                    />
                    <button className='btn btn-large' type='submit'>
                        안녕
                    </button>
                </form>
            </div>
        </Container>
    );
}
