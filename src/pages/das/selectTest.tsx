import { useCallback, useEffect, useState, type ReactNode } from 'react';
import type { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';

import { isAxiosError } from 'axios';
import { deleteCookie, getCookie, setCookie } from 'cookies-next';

import { subtestList, useTestInfo, useTestActions, useSubtests, partList } from '@/stores/testStore';
import { useTimerActions } from '@/stores/timerStore';
import { TALKYTALKY_URL } from '@/utils/const';
import { CheckBoxGroupItem } from '@/components/common/CheckBox';
import Container from '@/components/common/Container';
import { createSessionAPI } from '@/api/das';

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

export default function SelectTestPage() {
    const router = useRouter(); // next router

    // 현재 소검사, 선택한 소검사 정보
    const testInfo = useTestInfo();
    const { setSubtests } = useTestActions();
    const { setTestStart } = useTimerActions();
    const [subtestIds, setSubtestIds] = useState<number[]>([]);

    const [error, setError] = useState(subtestIds.length === 0);

    const handleClickNext = useCallback(async () => {
        try {
            if (subtestIds.length === 0) {
                setError(true);
            } else {
                setError(false);

                const sortedSubtestIds = [...subtestIds];

                // SPEECh I 체크하면 II도 포함
                if (sortedSubtestIds.includes(subtestList[1].subtestId)) {
                    sortedSubtestIds.push(subtestList[2].subtestId);
                }
                sortedSubtestIds.sort(); // 정렬

                const subtests = subtestList.filter(v => sortedSubtestIds.includes(v.subtestId));
                const currentPartId = partList.find(v => v.subtestId === subtestIds[0])?.partId;
                if (!currentPartId) {
                    throw new Error('파트가 필요합니다.');
                }

                setSubtests(subtests);

                // 세션 추가
                const accessToken = getCookie('jwt') as string;
                const responseData = await createSessionAPI({ testInfo, currentPartId, subtestIds: sortedSubtestIds, jwt: accessToken });
                const sessionId = responseData.sessionId;
                const pathname = subtests[0].pathname;

                setTestStart(true);
                pathname && router.push(`/das/sessions/${sessionId}/subtests/${pathname}`);
            }
        } catch (err) {
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
    }, [router, setSubtests, setTestStart, subtestIds, testInfo]);

    return (
        <Container>
            <h1 className='font-jalnan text-head-1'>Dysarthria Assessment System (DAS)</h1>
            <span className='text-neutral3 text-body-2'>
                평가를 원하는 소검사 항목에 <span className='font-bold text-accent1 text-body-2'>모두 체크 후 평가시작 버튼</span>을
                누르세요.
            </span>
            <div className='mt-7 flex w-full max-w-[1000px] flex-col gap-7.5 xl:mt-20'>
                <SubtestBox>
                    <CheckBoxGroupItem name='tests' value={subtestList[0].subtestId} values={subtestIds} setValues={setSubtestIds}>
                        <span className='ml-3 font-bold text-head-2'>{subtestList[0].subtestTitle}</span>
                    </CheckBoxGroupItem>
                </SubtestBox>
                <SubtestBox>
                    <CheckBoxGroupItem name='tests' value={subtestList[1].subtestId} values={subtestIds} setValues={setSubtestIds}>
                        <span className='ml-3 font-bold text-head-2'>
                            {subtestList[1].subtestTitle} & {subtestList[2].subtestTitle}
                        </span>
                    </CheckBoxGroupItem>
                </SubtestBox>
                <SubtestBox>
                    <CheckBoxGroupItem name='tests' value={subtestList[3].subtestId} values={subtestIds} setValues={setSubtestIds}>
                        <span className='ml-3 font-bold text-head-2'>{subtestList[3].subtestTitle}</span>
                    </CheckBoxGroupItem>
                    <CheckBoxGroupItem name='tests' value={subtestList[4].subtestId} values={subtestIds} setValues={setSubtestIds}>
                        <span className='ml-3 font-bold text-head-2'>{subtestList[4].subtestTitle}</span>
                    </CheckBoxGroupItem>
                </SubtestBox>
            </div>
            <button
                type='button'
                className='mt-20 btn btn-large btn-contained disabled:btn-contained-disabled'
                onClick={handleClickNext}
                disabled={subtestIds.length === 0}
            >
                다음
            </button>
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
