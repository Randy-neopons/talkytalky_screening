import { ResponsiveRadialBar, type RadialBarDatum, type RadialBarSerie } from '@nivo/radial-bar';

type Datum = RadialBarDatum & {
    color: string;
};

export default function SubtestScoreGraph({
    data /* see data tab */,
    maxScore = 100,
}: {
    data: RadialBarSerie<Datum>[];
    maxScore?: number;
}) {
    return (
        <div className={`relative h-40 w-40 xl:h-[200px] xl:w-[200px]`}>
            <ResponsiveRadialBar<Datum>
                data={data}
                valueFormat='>-.2f'
                padding={0}
                innerRadius={0.85}
                cornerRadius={20}
                startAngle={90}
                endAngle={450}
                maxValue={maxScore}
                circularAxisOuter={null}
                enableRadialGrid={false}
                enableCircularGrid={false}
                radialAxisStart={null}
                radialAxisEnd={null}
                colors={data => data.data.color}
                enableTracks={true}
                tracksColor={'#E9ECEF'}
            />
            <div className='absolute left-1/2 top-1/2 w-full -translate-x-1/2 -translate-y-1/2 text-center'>
                <div className='flex items-end justify-center gap-x-1'>
                    <span className='text-[26px] font-bold leading-none text-black xl:text-[34px]'>
                        {Math.ceil((data[0]?.data[0]?.y / maxScore) * 100)}
                    </span>
                    <span className='font-bold text-black'>점</span>
                </div>
                <span className='text-[14px] text-neutral4'>
                    {data[0]?.data[0]?.y}점 / {maxScore}점 만점기준
                </span>
            </div>
        </div>
    );
}

export function SubtestScoreGraphPrintView({
    data /* see data tab */,
    maxScore = 100,
}: {
    data: RadialBarSerie<Datum>[];
    maxScore?: number;
}) {
    return (
        <div className='relative h-[100px] w-[100px]'>
            <ResponsiveRadialBar<Datum>
                data={data}
                valueFormat='>-.2f'
                padding={0}
                innerRadius={0.85}
                cornerRadius={20}
                startAngle={90}
                endAngle={450}
                maxValue={maxScore}
                circularAxisOuter={null}
                enableRadialGrid={false}
                enableCircularGrid={false}
                radialAxisStart={null}
                radialAxisEnd={null}
                colors={data => data.data.color}
                enableTracks={true}
                tracksColor={'#E9ECEF'}
            />
            <div className='absolute left-1/2 top-1/2 flex w-full -translate-x-1/2 -translate-y-1/2 flex-col gap-0.5 text-center'>
                <div className='flex items-end justify-center'>
                    <span className='text-[12px] font-bold text-black'>{Math.ceil((data[0]?.data[0]?.y / maxScore) * 100)}점</span>
                </div>
                <span className='text-[8px] text-neutral4'>
                    {data[0]?.data[0]?.y}점/{maxScore}점 만점기준
                </span>
            </div>
        </div>
    );
}
