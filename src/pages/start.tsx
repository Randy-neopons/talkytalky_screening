import type { ReactNode } from 'react';
import Image from 'next/image';

import Container from '@/components/common/Container';

import testResultIcon from 'public/static/images/test-result-icon.png';
import testStartIcon from 'public/static/images/test-start-icon.png';

const Title = ({ children, required }: { children: ReactNode; required?: boolean }) => {
    return (
        <span className='font-noto text-head-2 text-black font-bold mb-4'>
            {children}
            {required && <span className='text-red1'>*</span>}
        </span>
    );
};

export default function StartPage() {
    return (
        <Container>
            <h1 className='text-head-1 font-jalnan'>기본정보 입력</h1>
            <div className='w-[550px] rounded-[20px] bg-white shadow-base mt-[60px] xl:mt-20 p-[50px]'>
                <Title>검사자명</Title>
                <input
                    className='rounded-md border border-neutral6 h-[50px] text-neutral1 placeholder:text-neutral1'
                    placeholder='검사자명을 입력하세요.'
                />
            </div>
        </Container>
    );
}
