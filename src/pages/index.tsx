import Image from 'next/image';

import Container from '@/components/common/Container';

import testResultIcon from 'public/static/images/test-result-icon.png';
import testStartIcon from 'public/static/images/test-start-icon.png';

export default function Home() {
    return (
        <Container>
            <h1 className='text-head-1 font-jalnan'>말운동 평가</h1>
            <span className='text-body-1 font-noto text-center mt-[10px]'>
                말운동장애(motor speech disorder)란 운동계의 기능 이상에 의해 초래되는 말산출장애(마비말장애, 말실행증 등)를 말합니다.
                <br />
                말운동 평가는 말운동 체계의 기능을 알아보기 위해{' '}
                <span className='mt-[10px] font-bold text-accent1'>호흡, 발성, 공명, 조음, 운율 영역을 평가하는 검사</span>로
                <br />
                말실행증보다는 마비말장애 여부를 판단하는 데에 초점을 두고 있습니다.
            </span>
            <ul className='mt-[60px]'>
                <li className='float-left flex flex-col flex-nowrap items-center xl:items-start rounded-[20px] bg-white shadow-base py-[30px] px-[58px] mr-[30px] w-[300px] h-[467px] xl:w-[477px] xl:h-[440px]'>
                    <Image src={testStartIcon} alt='test-start' width={120} height={100} />
                    <span className='font-bold text-accent1 text-head-2 leading-normal xl:leading-tight mt-5'>테스트 시작하기</span>
                    <span className='text-neutral4 text-body-2 mt-[10px] xl:mt-2 text-center xl:text-left'>
                        환자의 기본정보 입력 후 원하는 소검사를 선택하여 평가를 진행할 수 있습니다.
                    </span>
                    <button className='btn btn-small btn-contained mt-auto xl:mr-auto'>시작하기</button>
                </li>

                <li className='float-left flex flex-col flex-nowrap items-center xl:items-start rounded-[20px] bg-white shadow-base py-[30px] px-[58px] w-[300px] h-[467px] xl:w-[477px] xl:h-[440px] text-center xl:text-left'>
                    <Image src={testResultIcon} alt='test-result' width={120} height={100} />
                    <span className='font-bold text-accent1 text-head-2 leading-normal xl:leading-tight mt-5'>테스트 결과보기</span>
                    <span className='text-neutral4 text-body-2 mt-[10px] xl:mt-2'>
                        평가 후, 결과보기를 통해 소검사 영역별 점수와 총점이 제공되며 그래프를 통해 환자가 가진 말운동 기능의 영역별
                        강약점을 파악할 수 있습니다.
                        <br />
                        또한 문제를 보인 항목들에 대한 초기점검이 가능합니다.
                    </span>
                    <button className='btn btn-small btn-contained mt-auto xl:mr-auto'>시작하기</button>
                </li>
            </ul>
        </Container>
    );
}
