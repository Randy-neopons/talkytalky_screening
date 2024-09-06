import { useCallback, type ReactElement, type ReactNode } from 'react';
import { Controller, useForm, useWatch, type Control } from 'react-hook-form';
import type { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';

import { ErrorMessage } from '@hookform/error-message';
import { getCookie } from 'cookies-next';
import dayjs from 'dayjs';

import Container from '@/components/common/Container';
import Select from '@/components/common/Select';
import ScreeningAppLayout from '@/components/screening/ScreeningAppLayout';
import { useUserQuery } from '@/hooks/user';

import styles from './PersonalInfo.module.css';

import type { ScreeningTestInfo } from '@/types/screening';
import type { NextPageWithLayout } from '@/types/types';

const genderOptions = [
    { value: 'female', label: '여' },
    { value: 'male', label: '남' },
];

const Label = ({ children, htmlFor, required }: { children: ReactNode; htmlFor: string; required?: boolean }) => {
    return (
        <label htmlFor={htmlFor} className='mb-4 mt-10 block font-noto font-bold text-black text-head-2'>
            {children}
            {required && <span className='text-red1'>*</span>}
        </label>
    );
};

type FormValues = Omit<ScreeningTestInfo, 'testeeBirthdate'> & {
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

export const ScreeningPersonalInfoForm = ({
    testInfo,
    onSubmit,
}: {
    testInfo?: ScreeningTestInfo;
    onSubmit: (data: FormValues) => void;
}) => {
    // 검사 정보 입력 form
    const {
        control,
        register,
        formState: { errors, isDirty, isValid },
        handleSubmit,
    } = useForm<FormValues>({
        defaultValues: {
            testeeName: testInfo?.testeeName,
            testeeGender: testInfo?.testeeGender,
            birthYear: testInfo?.testeeBirthdate ? `${dayjs(testInfo.testeeBirthdate).year()}` : '',
            birthMonth: testInfo?.testeeBirthdate ? `${dayjs(testInfo.testeeBirthdate).month() + 1}` : '',
            birthDay: testInfo?.testeeBirthdate ? `${dayjs(testInfo.testeeBirthdate).date()}` : '',
            testeePhoneNumber: testInfo?.testeePhoneNumber,
        },
        mode: 'onChange',
    });
    const age = useAge({ control }); // 만 나이 계산

    return (
        <>
            <form className='mb-20 mt-[60px] w-[550px] rounded-[20px] bg-white px-[50px] pb-[50px] pt-[10px] shadow-base xl:mt-20'>
                <Label htmlFor='testeeName' required>
                    이름
                </Label>
                <input
                    {...register('testeeName', { required: '환자명을 입력해주세요.' })}
                    className={`${styles.input}`}
                    placeholder='환자명을 입력해주세요.'
                />
                <ErrorMessage errors={errors} name='testeeName' render={({ message }) => <ErrorText>{message}</ErrorText>} />

                <Label htmlFor='testeeGender'>성별</Label>
                <Select control={control} name='testeeGender' options={genderOptions} placeholder='성별' />

                <Label htmlFor='testeeBirthDate' required>
                    생년월일(만 <span className='text-accent1'>{age}</span>세)
                </Label>
                <div className='flex gap-[15px]'>
                    <input
                        {...register('birthYear', { required: '생년월일을 입력해주세요.' })}
                        className={`${styles.input}`}
                        type='number'
                        placeholder='년'
                        min={1940}
                        max={dayjs().year()}
                    />
                    <input
                        {...register('birthMonth', { required: '생년월일을 입력해주세요.' })}
                        className={`${styles.input}`}
                        type='number'
                        placeholder='월'
                        min={1}
                        max={12}
                    />
                    <input
                        {...register('birthDay', { required: '생년월일을 입력해주세요.' })}
                        className={`${styles.input}`}
                        type='number'
                        placeholder='일'
                        min={1}
                        max={31}
                    />
                </div>
                <ErrorMessage errors={errors} name='birthYear' render={({ message }) => <ErrorText>{message}</ErrorText>} />
                <ErrorMessage errors={errors} name='birthYear' render={({ message }) => <ErrorText>{message}</ErrorText>} />

                <Label htmlFor='testeeContact'>전화번호</Label>
                <input {...register('testeePhoneNumber')} className={`${styles.input}`} placeholder='전화번호를 입력해주세요.' />
            </form>
            <button
                className='disabled:btn-contained-disabled btn btn-large btn-contained'
                type='button'
                onClick={handleSubmit(onSubmit)}
                disabled={!isValid}
            >
                시작하기
            </button>
        </>
    );
};

const ScreeningPersonalInfoPage: NextPageWithLayout = () => {
    const router = useRouter(); // next router
    const { data: user } = useUserQuery();

    // 폼 제출
    const handleOnSubmit = useCallback(
        (data: FormValues) => {
            console.log(data);
            const { birthYear, birthMonth, birthDay, ...rest } = data;

            const testeeBirthdate = dayjs(new Date(Number(birthYear), Number(birthMonth) - 1, Number(birthDay))).format('YYYY-MM-DD');

            const formValues = {
                ...rest,
                therapistUserId: user?.data.therapistUserId,
                testeeBirthdate,
            };

            // TODO: createScreeningSession
            // TODO: sessionId 받아오기
            const sessionId = 1;
            router.push(`/screening/sessions/${sessionId}/initialQuestion`); // 검사 선택 화면으로
        },
        [router, user],
    );

    return (
        <Container>
            <h1 className='font-jalnan text-head-1'>기본정보 입력</h1>
            <ScreeningPersonalInfoForm onSubmit={handleOnSubmit} />
        </Container>
    );
};

ScreeningPersonalInfoPage.getLayout = function getLayout(page: ReactElement) {
    return <ScreeningAppLayout>{page}</ScreeningAppLayout>;
};

export default ScreeningPersonalInfoPage;

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
