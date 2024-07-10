import { useCallback, useState } from 'react';
import type { GetServerSideProps } from 'next';
import Image from 'next/image';

import Container from '@/components/common/Container';

import styles from './Session.module.css';

import infoIcon from 'public/static/images/info-icon.png';

export default function SessionPage() {
    const [open, setOpen] = useState(false);
    const handleOnMouseOver = useCallback(() => {
        setOpen(true);
    }, []);

    return (
        <Container>
            <h1 className='flex items-center font-jalnan text-head-1'>
                SPEECH MECHANISM : 말기제평가
                <span className={`${styles['tooltip']}`}>
                    <Image src={infoIcon} alt='info' className={`ml-[10px] inline-block`} />
                    <div className={`${styles['tooltip-content']}`}>
                        말기제평가는 안면/턱/혀/기타 등 말산출과 관련한 구조와 해당 기능을 평가합니다. (총 35개 항목) <br />
                        해당 항목에 대해 문제가 없을 경우 &apos;정상&apos;에, 문제가 있을 경우, &apos;경도&apos; 또는 &apos;심도&apos; 에
                        체크해주세요.
                        <br />
                        평가 불가한 상황에서는 &apos;평가불가&apos;에 체크하고 필요 시, 메모란을 이용해주세요.
                        <br />
                        <br />
                        &apos;모두정상&apos; 체크 시, &apos;정상&apos; 에 모두 체크표시 됨.
                    </div>
                </span>
            </h1>
        </Container>
    );
}

export const getServerSideProps: GetServerSideProps = async context => {
    context.params;
    const sessionId = Number(context.query.sessionId);

    if (!sessionId) {
        return {
            redirect: {
                destination: '/',
                permanent: true,
            },
        };
    }

    // TODO: sessionId 통해 시험 세션 정보 얻음
    const testSession = {
        sessionId,
        subTests: [],
    };

    try {
        return {
            props: {
                testSession,
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
