import { useCallback, useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/router';

import { useTestInfo, useTestInfoActions, useTests } from '@/stores/testInfoStore';
import { CheckBoxGroupItem } from '@/components/common/CheckBox';
import Container from '@/components/common/Container';

const SubtestBox = ({ children }: { children: ReactNode }) => {
    return (
        <div className='flex w-full flex-col flex-wrap gap-x-[180px] gap-y-5 rounded-[20px] bg-white px-[50px] py-[27px] shadow-base xl:flex-row xl:gap-y-[37px]'>
            {children}
        </div>
    );
};

const testList = [
    { label: 'SPEECH MECHANISM : 말기제 평가', value: 'speechMechanism' },
    { label: 'SPEECH I : 영역별 말평가', value: 'speech1' },
    { label: 'SPEECH II : 종합적 말평가', value: 'speech2' },
    { label: 'SPEECH MOTOR : 말운동 평가', value: 'speechMotor' },
    { label: '피로도 검사 포함', value: 'stressTest' },
];

export default function SelectTestPage() {
    const tests = useTests();
    const { setTests } = useTestInfoActions();

    const router = useRouter();

    const handleClickNext = useCallback(() => {
        // TODO: 세션 추가 API
        // router.push('/'); // 검사 ID로 이동
    }, [router]);

    return (
        <Container>
            <h1 className='font-jalnan text-head-1'>말운동평가</h1>
            <span className='text-neutral3 text-body-2'>
                평가를 원하는 소검사 항목에 <span className='font-bold text-accent1 text-body-2'>모두 체크 후 평가시작 버튼</span>을
                누르세요.
            </span>
            <div className='mt-7 flex w-full max-w-[1000px] flex-col gap-[30px] xl:mt-20'>
                <SubtestBox>
                    <CheckBoxGroupItem name='tests' value={testList[0].value} values={tests} setValues={setTests}>
                        <span className='ml-3 font-bold text-head-2'>{testList[0].label}</span>
                    </CheckBoxGroupItem>
                </SubtestBox>
                <SubtestBox>
                    <CheckBoxGroupItem name='tests' value={testList[1].value} values={tests} setValues={setTests}>
                        <span className='ml-3 font-bold text-head-2'>{testList[1].label}</span>
                    </CheckBoxGroupItem>

                    <CheckBoxGroupItem name='tests' value={testList[2].value} values={tests} setValues={setTests}>
                        <span className='ml-3 font-bold text-head-2'>{testList[2].label}</span>
                    </CheckBoxGroupItem>
                </SubtestBox>
                <SubtestBox>
                    <CheckBoxGroupItem name='tests' value={testList[3].value} values={tests} setValues={setTests}>
                        <span className='ml-3 font-bold text-head-2'>{testList[3].label}</span>
                    </CheckBoxGroupItem>
                    <CheckBoxGroupItem name='tests' value={testList[4].value} values={tests} setValues={setTests}>
                        <span className='ml-3 font-bold text-head-2'>{testList[4].label}</span>
                    </CheckBoxGroupItem>
                </SubtestBox>
            </div>
            <button type='button' className='mt-20 btn btn-large btn-contained' onClick={handleClickNext}>
                다음
            </button>
        </Container>
    );
}
