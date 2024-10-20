import { ResponsiveRadialBar, type RadialBarDatum, type RadialBarSerie } from '@nivo/radial-bar';

type Datum = RadialBarDatum & {
    color: string;
};

export default function TestTotalScoreGraph({ data /* see data tab */ }: { data: RadialBarSerie<Datum>[] }) {
    return (
        <div className={`relative top-1/2 h-full w-full -translate-y-[30%]`}>
            <ResponsiveRadialBar<Datum>
                data={data}
                valueFormat='>-.2f'
                padding={0}
                innerRadius={0.8}
                cornerRadius={20}
                startAngle={270}
                endAngle={450}
                maxValue={100}
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
                    <span className='text-[40px] font-bold leading-none text-black xl:text-[50px]'>{data[0]?.data[0]?.y}</span>
                    <span className='text-[26px] font-bold leading-tight text-black xl:text-[34px]'>점</span>
                </div>
                <span className='mt-2 text-center text-neutral4 text-body-2'>100점 만점기준</span>
            </div>
        </div>
    );
}
