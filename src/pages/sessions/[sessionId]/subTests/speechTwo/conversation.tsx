import { useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';

import Container from '@/components/common/Container';

import fontSizeIcon from 'public/static/images/font-size-icon.png';
import memoIcon from 'public/static/images/memo-icon.png';
import recordIcon from 'public/static/images/record-icon.png';

export default function ConversationPage() {
    const router = useRouter();

    // 다음 클릭
    const handleClickPrev = useCallback(
        (data: any) => {
            console.log(data);

            try {
                // TODO: 중간 저장 API

                const sessionId = router.query.sessionId;
                typeof sessionId === 'string' && router.push(`/sessions/${sessionId}/subTests/speechTwo/description`);
            } catch (err) {
                console.error(err);
            }
        },
        [router],
    );

    return (
        <Container>
            <h2 className='flex items-center font-jalnan text-accent1 text-head-2'>SPEECH II : 종합적 말평가</h2>
            <h1 className='whitespace-pre-line text-center font-jalnan text-head-1'>{'대화하기'}</h1>
            <div className='ml-auto mt-8 flex items-center gap-[6px]'>
                <svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none'>
                    <rect x='2.5' y='7.5' width='19' height='9' rx='0.5' stroke='#212529' />
                    <path d='M6.5 3C6.5 2.72386 6.72386 2.5 7 2.5H17C17.2761 2.5 17.5 2.72386 17.5 3V7.5H6.5V3Z' stroke='#212529' />
                    <path
                        d='M6 13C6 12.4477 6.44772 12 7 12H17C17.5523 12 18 12.4477 18 13V19C18 19.5523 17.5523 20 17 20H7C6.44772 20 6 19.5523 6 19V13Z'
                        fill='#212529'
                    />
                    <path d='M8 14H16' stroke='#F5F7FC' strokeLinecap='round' />
                    <path d='M8 16H16' stroke='#F5F7FC' strokeLinecap='round' />
                    <path d='M8 18H12' stroke='#F5F7FC' strokeLinecap='round' />
                </svg>
                인쇄하기
            </div>
            <div className='mt-5 rounded-[20px] bg-white px-[65px] py-5'></div>

            <div className='mt-20 flex w-full flex-nowrap items-center'>
                <button type='button' className='btn btn-large btn-outlined' onClick={handleClickPrev}>
                    이전
                </button>
                <div className='mx-auto flex gap-[45px]'>
                    <button type='button'>
                        <Image src={memoIcon} alt='memo-icon' className='h-auto w-[60px]' />
                    </button>
                    <button type='button'>
                        <Image src={recordIcon} alt='memo-icon' className='h-auto w-[100px]' />
                    </button>
                    <button type='button'>
                        <Image src={fontSizeIcon} alt='memo-icon' className='h-auto w-[60px]' />
                    </button>
                </div>
                <button key='noSubmit' type='button' className='btn btn-large btn-contained' onClick={() => {}}>
                    다음
                </button>
            </div>
        </Container>
    );
}
