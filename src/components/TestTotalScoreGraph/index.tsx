import { ResponsiveRadialBar, type RadialBarDatum, type RadialBarSerie } from '@nivo/radial-bar';

type Datum = RadialBarDatum & {
    color: string;
};

export default function TestTotalScoreGraph({ data /* see data tab */ }: { data: RadialBarSerie<Datum>[] }) {
    return (
        <div className={`relative top-1/2 h-[230px] w-[230px] -translate-y-1/2 xl:h-[330px] xl:w-[330px]`}>
            <ResponsiveRadialBar<Datum>
                data={data}
                valueFormat='>-.2f'
                padding={0}
                innerRadius={0.8}
                cornerRadius={20}
                startAngle={270}
                endAngle={450}
                maxValue={300}
                circularAxisOuter={null}
                enableRadialGrid={false}
                enableCircularGrid={false}
                radialAxisStart={null}
                radialAxisEnd={null}
                colors={data => data.data.color}
                enableTracks={true}
                tracksColor={'#E9ECEF'}
            />
            <div className='absolute left-1/2 top-1/2 w-full -translate-x-1/2 -translate-y-full text-center'>
                <div className='flex items-end justify-center gap-x-1'>
                    <span className='text-[26px] font-bold leading-none text-black xl:text-[34px]'>{data[0]?.data[0]?.y}</span>
                    <span className='font-bold text-black'>점</span>
                </div>
                <span className='text-center text-[14px] text-neutral4'>300점 만점기준</span>
            </div>
        </div>
    );
}
