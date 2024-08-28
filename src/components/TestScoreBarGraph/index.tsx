import { ResponsiveBar, type BarDatum } from '@nivo/bar';

export function TestScoreBarGraphTablet({ data }: { data: BarDatum[] }) {
    return (
        <div className='block h-full w-full xl:hidden'>
            <ResponsiveBar
                data={data}
                keys={['score']}
                indexBy='graphTitle'
                groupMode='grouped'
                margin={{ top: 50, right: 40, bottom: 100, left: 80 }}
                padding={0.6}
                valueScale={{ type: 'linear' }}
                indexScale={{ type: 'band', round: true }}
                colors={['#20C997', '#FFA26B', '#0084F4']}
                colorBy='indexValue'
                minValue={0}
                maxValue={100}
                borderColor={{
                    from: 'color',
                    modifiers: [['darker', 1.6]],
                }}
                axisTop={null}
                axisRight={null}
                axisBottom={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    truncateTickAt: 0,
                    renderTick({ opacity, textAnchor, textBaseline, textX, textY, value, x, y }) {
                        /**
                         * svg에선 wrap text를 지원하지 않으므로, tspan과 y값으로 직접 조정해야 한다.
                         * \n 갯수에 따라 y값을 조정하기 위해 tspanCnt를 계산한다.
                         */
                        const tspanCnt = String(value).split('\n').length;

                        return (
                            <g transform={`translate(${x},${y})`} style={{ opacity }}>
                                {/* 모바일에선 wrap 처리*/}
                                <text
                                    dominantBaseline={textBaseline}
                                    alignmentBaseline='middle'
                                    textAnchor={textAnchor}
                                    transform={`translate(${textX},${textY}) rotate(0)`}
                                >
                                    {String(value)
                                        .split('\n')
                                        .map((v, i) => (
                                            <tspan key={i} x={0} y={tspanCnt === 1 ? 12 : i * 24} className='font-bold'>
                                                {v}
                                            </tspan>
                                        ))}
                                </text>
                            </g>
                        );
                    },
                }}
                axisLeft={{
                    tickValues: 5,
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    truncateTickAt: 0,
                }}
                enableLabel={false}
                role='application'
                theme={{
                    text: {
                        fontSize: 16,
                        fontFamily: 'Noto Sans KR',
                        lineHeight: 24,
                    },
                    axis: {
                        ticks: {
                            text: {
                                fontSize: 16,
                                fontFamily: 'Noto Sans KR',
                                fill: '#868E96',
                            },
                        },
                    },
                }}
            />
        </div>
    );
}

export function TestScoreBarGraphDesktop({ data }: { data: BarDatum[] }) {
    return (
        <div className='hidden h-full w-full xl:block'>
            <ResponsiveBar
                data={data}
                keys={['score']}
                indexBy='graphTitle'
                groupMode='grouped'
                margin={{ top: 50, right: 40, bottom: 100, left: 80 }}
                padding={0.6}
                valueScale={{ type: 'linear' }}
                indexScale={{ type: 'band', round: true }}
                colors={['#20C997', '#FFA26B', '#0084F4']}
                colorBy='indexValue'
                minValue={0}
                maxValue={100}
                borderColor={{
                    from: 'color',
                    modifiers: [['darker', 1.6]],
                }}
                axisTop={null}
                axisRight={null}
                axisBottom={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    truncateTickAt: 0,
                    renderTick({ opacity, textAnchor, textBaseline, textX, textY, value, x, y }) {
                        /**
                         * svg에선 wrap text를 지원하지 않으므로, tspan과 y값으로 직접 조정해야 한다.
                         * \n 갯수에 따라 y값을 조정하기 위해 tspanCnt를 계산한다.
                         */
                        const tspanCnt = String(value).split('\n').length;

                        return (
                            <g transform={`translate(${x},${y})`} style={{ opacity }}>
                                {/* 모바일에선 wrap 처리*/}
                                <text
                                    dominantBaseline={textBaseline}
                                    alignmentBaseline='middle'
                                    textAnchor={textAnchor}
                                    transform={`translate(${textX},${textY}) rotate(0)`}
                                >
                                    {String(value)
                                        .split('\n')
                                        .map((v, i) => (
                                            <tspan key={i} x={0} y={tspanCnt === 1 ? 12 : i * 24} className='font-bold'>
                                                {v}
                                            </tspan>
                                        ))}
                                </text>
                            </g>
                        );
                    },
                }}
                axisLeft={{
                    tickValues: 5,
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    truncateTickAt: 0,
                }}
                enableLabel={false}
                role='application'
                theme={{
                    text: {
                        fontSize: 16,
                        fontFamily: 'Noto Sans KR',
                        lineHeight: 24,
                    },
                    axis: {
                        ticks: {
                            text: {
                                fontSize: 16,
                                fontFamily: 'Noto Sans KR',
                                fill: '#868E96',
                            },
                        },
                    },
                }}
            />
        </div>
    );
}

export default function TestScoreBarGraph({ data }: { data: BarDatum[] }) {
    return (
        <>
            <TestScoreBarGraphTablet data={data} />
            <TestScoreBarGraphDesktop data={data} />
        </>
    );
}
