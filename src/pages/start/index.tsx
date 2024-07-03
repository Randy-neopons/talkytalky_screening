import { useCallback, useRef, useState, type ChangeEvent, type ReactNode, type RefObject } from 'react';
import { useForm } from 'react-hook-form';
import Image from 'next/image';

import Container from '@/components/common/Container';
import Select from '@/components/common/Select';

import styles from './Start.module.css';

const Label = ({ children, htmlFor, required }: { children: ReactNode; htmlFor: string; required?: boolean }) => {
    return (
        <label htmlFor={htmlFor} className='mb-4 mt-10 block font-noto font-bold text-black text-head-2'>
            {children}
            {required && <span className='text-red1'>*</span>}
        </label>
    );
};

export default function StartPage() {
    const { control, register } = useForm();
    // 휴대폰 input
    const input1Ref = useRef<HTMLInputElement>(null);
    const input2Ref = useRef<HTMLInputElement>(null);
    const input3Ref = useRef<HTMLInputElement>(null);

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

    return (
        <Container>
            <h1 className='font-jalnan text-head-1'>기본정보 입력</h1>
            <div className='mt-[60px] w-[550px] rounded-[20px] bg-white px-[50px] pb-[50px] pt-[10px] shadow-base xl:mt-20'>
                <Label htmlFor='testerName'>검사자명</Label>
                <input {...register('testerName')} className={`${styles.input}`} placeholder='검사자명을 입력하세요.' />
                <Label htmlFor='certificateNumber'>자격증 번호</Label>
                <input {...register('certificateNumber')} className={`${styles.input}`} placeholder='자격증 번호를 입력하세요.' />
                <Label htmlFor='testDate'>검사일</Label>
                <div className='flex gap-[15px]'>
                    <input
                        ref={input1Ref}
                        className={`${styles.input}`}
                        maxLength={4}
                        name='year'
                        placeholder='2010'
                        value={testDate.year}
                        onChange={handleChangeTestDate(input2Ref)}
                    />
                    <input
                        ref={input2Ref}
                        className={`${styles.input}`}
                        maxLength={2}
                        name='month'
                        placeholder='05'
                        value={testDate.month}
                        onChange={handleChangeTestDate(input3Ref)}
                    />
                    <input
                        ref={input3Ref}
                        className={`${styles.input}`}
                        maxLength={2}
                        name='day'
                        placeholder='18'
                        value={testDate.day}
                        onChange={handleChangeTestDate(null)}
                    />
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
                <Label htmlFor='testerName'>성별</Label>
                <Select
                    control={control}
                    name='gender'
                    options={[
                        { value: 'female', label: '여' },
                        { value: 'male', label: '남' },
                    ]}
                />
                <input {...register('testerName')} className={`${styles.input}`} placeholder='검사자명을 입력하세요.' />
                <Label htmlFor='testerName'>검사자명</Label>
                <input {...register('testerName')} className={`${styles.input}`} placeholder='검사자명을 입력하세요.' />
                <Label htmlFor='testerName'>검사자명</Label>
                <input {...register('testerName')} className={`${styles.input}`} placeholder='검사자명을 입력하세요.' />
                <Label htmlFor='testerName'>검사자명</Label>
                <input {...register('testerName')} className={`${styles.input}`} placeholder='검사자명을 입력하세요.' />
            </div>
        </Container>
    );
}
