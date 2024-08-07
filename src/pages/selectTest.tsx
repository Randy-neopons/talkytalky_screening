import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/router';

import { useTestInfo, useTestInfoActions, useTests } from '@/stores/testInfoStore';
import { CheckBoxGroupItem } from '@/components/common/CheckBox';
import Container from '@/components/common/Container';
import { createSessionAPI } from '@/api/questions';

const ErrorText = ({ children }: { children: ReactNode }) => {
    return <p className='mt-1 text-red1 text-body-2'>{children}</p>;
};

const SubtestBox = ({ children }: { children: ReactNode }) => {
    return (
        <div className='flex w-full flex-col flex-wrap gap-x-[180px] gap-y-5 rounded-[20px] bg-white px-[50px] py-[27px] shadow-base xl:flex-row xl:gap-y-[37px]'>
            {children}
        </div>
    );
};

const testList = [
    { subtestId: '1', subtestTitle: 'SPEECH MECHANISM : 말기제 평가', pathname: 'speechMechanism' },
    { subtestId: '2', subtestTitle: 'SPEECH I : 영역별 말평가', pathname: 'speech1' },
    { subtestId: '3', subtestTitle: 'SPEECH II : 종합적 말평가', pathname: 'speech2' },
    { subtestId: '4', subtestTitle: 'SPEECH MOTOR : 말운동 평가', pathname: 'speechMotor' },
    { subtestId: '5', subtestTitle: '피로도 검사 포함', pathname: 'stressTest' },
];

export default function SelectTestPage() {
    const testInfo = useTestInfo();
    const tests = useTests();
    const { setTests } = useTestInfoActions();
    const [error, setError] = useState(false);

    const router = useRouter();

    const handleClickNext = useCallback(async () => {
        try {
            const subtestIds = tests.toSorted();
            console.log(subtestIds);
            if (subtestIds.length === 0) {
                setError(true);
            } else {
                setError(false);

                // 세션 추가
                const responseData = await createSessionAPI({ testInfo, subtestIds });
                const sessionId = responseData.sessionId;
                const pathname = testList.find(v => v.subtestId === subtestIds[0]);

                pathname && router.push(`/sessions/${sessionId}/subTests/${pathname}`);
            }
        } catch (err) {
            console.error(err);
        }

        // router.push('/'); // 검사 ID로 이동
    }, [router, testInfo, tests]);

    return (
        <Container>
            <h1 className='font-jalnan text-head-1'>말운동평가</h1>
            <span className='text-neutral3 text-body-2'>
                평가를 원하는 소검사 항목에 <span className='font-bold text-accent1 text-body-2'>모두 체크 후 평가시작 버튼</span>을
                누르세요.
            </span>
            <div className='mt-7 flex w-full max-w-[1000px] flex-col gap-[30px] xl:mt-20'>
                <SubtestBox>
                    <CheckBoxGroupItem name='tests' value={testList[0].subtestId} values={tests} setValues={setTests}>
                        <span className='ml-3 font-bold text-head-2'>{testList[0].subtestTitle}</span>
                    </CheckBoxGroupItem>
                </SubtestBox>
                <SubtestBox>
                    <CheckBoxGroupItem name='tests' value={testList[1].subtestId} values={tests} setValues={setTests}>
                        <span className='ml-3 font-bold text-head-2'>{testList[1].subtestTitle}</span>
                    </CheckBoxGroupItem>

                    <CheckBoxGroupItem name='tests' value={testList[2].subtestId} values={tests} setValues={setTests}>
                        <span className='ml-3 font-bold text-head-2'>{testList[2].subtestTitle}</span>
                    </CheckBoxGroupItem>
                </SubtestBox>
                <SubtestBox>
                    <CheckBoxGroupItem name='tests' value={testList[3].subtestId} values={tests} setValues={setTests}>
                        <span className='ml-3 font-bold text-head-2'>{testList[3].subtestTitle}</span>
                    </CheckBoxGroupItem>
                    <CheckBoxGroupItem name='tests' value={testList[4].subtestId} values={tests} setValues={setTests}>
                        <span className='ml-3 font-bold text-head-2'>{testList[4].subtestTitle}</span>
                    </CheckBoxGroupItem>
                </SubtestBox>
                {error && <ErrorText>소검사를 하나 이상 체크해주세요</ErrorText>}
            </div>
            <button type='button' className='mt-20 btn btn-large btn-contained' onClick={handleClickNext}>
                다음
            </button>
        </Container>
    );
}
