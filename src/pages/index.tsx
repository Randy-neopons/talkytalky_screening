import Container from '@/components/common/Container';

export default function Home() {
    return (
        <Container>
            <h1 className='text-head-1 font-jalnan'>말운동 평가</h1>
            <span className='text-body-1 font-noto text-center'>
                말운동장애(motor speech disorder)란 운동계의 기능 이상에 의해 초래되는 말산출장애(마비말장애, 말실행증 등)를 말합니다.
                <br />
                말운동 평가는 말운동 체계의 기능을 알아보기 위해{' '}
                <span className='mt-[10px] font-bold text-accent1'>호흡, 발성, 공명, 조음, 운율 영역을 평가하는 검사</span>로
                <br />
                말실행증보다는 마비말장애 여부를 판단하는 데에 초점을 두고 있습니다.
            </span>
            <ul className='mt-[60px]'>
                <li className='float-left flex flex-col flex-nowrap items-center rounded-[20px] bg-white shadow-base py-[30px] px-[58px] mr-[30px]'>
                    테스트 시작하기
                </li>
                <li className='float-left flex flex-col flex-nowrap items-center rounded-[20px] bg-white shadow-base py-[30px] px-[58px]'>
                    테스트 결과보기
                </li>
            </ul>
        </Container>
    );
}
