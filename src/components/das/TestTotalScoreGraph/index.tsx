import { ResponsiveRadialBar, type RadialBarDatum, type RadialBarSerie } from '@nivo/radial-bar';

type Datum = RadialBarDatum & {
    color: string;
};

export default function TestTotalScoreGraph({
    data /* see data tab */,
    maxScore = 100,
}: {
    data: RadialBarSerie<Datum>[];
    maxScore?: number;
}) {
    return (
        <div className={`relative top-1/2 h-full w-full -translate-y-[30%]`}>
            <ResponsiveRadialBar<Datum>
                data={data}
                valueFormat='>-.2f'
                padding={0}
                innerRadius={0.85}
                cornerRadius={20}
                startAngle={270}
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
            <div className='absolute left-1/2 top-1/2 w-full -translate-x-1/2 -translate-y-full text-center'>
                <div className='flex items-end justify-center gap-x-1'>
                    <span className='text-[40px] font-bold leading-none text-black xl:text-[50px]'>
                        {Math.ceil((data[0]?.data[0]?.y / maxScore) * 100)}
                    </span>
                    <span className='text-[26px] font-bold leading-tight text-black xl:text-[34px]'>점</span>
                </div>
                <span className='mt-2 text-center text-neutral4 text-body-2'>
                    {data[0]?.data[0]?.y}점 / {maxScore}점 만점기준
                </span>
            </div>
        </div>
    );
}

export function TestTotalScoreGraphPrintView({
    data /* see data tab */,
    maxScore = 100,
}: {
    data: RadialBarSerie<Datum>[];
    maxScore?: number;
}) {
    return (
        <div className={`relative top-1/2 h-full w-full -translate-y-[30%]`}>
            <ResponsiveRadialBar<Datum>
                data={data}
                valueFormat='>-.2f'
                padding={0}
                innerRadius={0.9}
                startAngle={270}
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
            <div className='absolute left-1/2 top-1/2 flex w-full -translate-x-1/2 -translate-y-full flex-col text-center'>
                <span className='text-xs font-bold leading-none text-black'>{Math.ceil((data[0]?.data[0]?.y / maxScore) * 100)}점</span>
                <span className='mt-[2px] text-center text-[8px] text-neutral4'>
                    {data[0]?.data[0]?.y}점 / {maxScore}점 만점기준
                </span>
            </div>
        </div>
    );
}
