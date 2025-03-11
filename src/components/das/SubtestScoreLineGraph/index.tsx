import { ResponsiveLine, type LineSvgProps, type Serie } from '@nivo/line';

// nivo line theme (desktop)
const graphThemeDesktop: NonNullable<LineSvgProps['theme']> = {
    text: {
        fontSize: 16,
        fontFamily: 'Noto Sans KR',
        lineHeight: 28,
        fill: '#212529',
    },
    axis: {
        ticks: {
            text: {
                fontSize: 14,
                fontFamily: 'Noto Sans KR',
                fill: '#868E96',
                fontWeight: 400,
            },
        },
    },
    legends: {
        text: {
            fontSize: 16,
            fontFamily: 'Noto Sans KR',
            lineHeight: 16,
            fill: '#212529',
            fontWeight: 400,
        },
    },
};

export default function SubtestScoreLineGraph({ data, color }: { data: Serie[]; color: string }) {
    return (
        <div className={`relative h-[200px] w-[400px] xl:h-[320px] xl:w-[640px]`}>
            <ResponsiveLine
                data={data}
                margin={{ top: 10, right: 60, bottom: 100, left: 80 }}
                xScale={{ type: 'point' }}
                yScale={{
                    type: 'linear',
                    min: 0,
                    max: 50,
                    stacked: false,
                    reverse: false,
                }}
                enableGridX={false}
                gridYValues={5}
                defs={[
                    {
                        colors: [
                            {
                                color: 'inherit',
                                offset: 0,
                            },
                            {
                                color: 'inherit',
                                offset: 100,
                                opacity: 0,
                            },
                        ],
                        id: 'gradientA',
                        type: 'linearGradient',
                    },
                ]}
                enableArea
                fill={[
                    {
                        id: 'gradientA',
                        match: '*',
                    },
                ]}
                axisTop={null}
                axisRight={null}
                axisBottom={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    // 커스텀 tick 렌더링 함수
                    renderTick({ opacity, textAnchor, textBaseline, textX, textY, value, x, y }) {
                        /**
                         * svg에선 wrap text를 지원하지 않으므로, tspan과 y값으로 직접 조정해야 한다.
                         * \n 갯수에 따라 y값을 조정하기 위해 tspanCnt를 계산한다.
                         */
                        const tspanCnt = String(value).split('\n').length;

                        return (
                            <g transform={`translate(${x},${y + 10})`} style={{ opacity }}>
                                {/* 모바일에선 wrap 처리*/}
                                <text
                                    dominantBaseline={textBaseline}
                                    alignmentBaseline='middle'
                                    textAnchor={textAnchor}
                                    transform={`translate(${textX},${textY}) rotate(0)`}
                                    style={{
                                        fontSize: 14,
                                        fontFamily: 'Noto Sans KR',
                                        fill: '#212529',
                                        fontWeight: 400,
                                    }}
                                >
                                    {String(value)
                                        .split('\n')
                                        .map((v, i) => (
                                            <tspan key={i} x={0} y={tspanCnt === 1 ? 12 : i * 24}>
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
                    tickSize: 0,
                    tickPadding: 60,
                    tickRotation: 0,
                    truncateTickAt: 0,
                }}
                colors={color}
                lineWidth={3}
                pointSize={10}
                pointColor='#FFFFFF'
                pointBorderWidth={3}
                pointBorderColor={{ from: 'serieColor' }}
                pointLabelYOffset={-12}
                enablePointLabel
                theme={{
                    text: {
                        fontSize: 16,
                        fontFamily: 'Noto Sans KR',
                        lineHeight: 28,
                        fill: color,
                        fontWeight: 700,
                    },
                    axis: {
                        ticks: {
                            text: {
                                fontSize: 14,
                                fontFamily: 'Noto Sans KR',
                                fill: '#868E96',
                                fontWeight: 400,
                            },
                        },
                    },
                    legends: {
                        text: {
                            fontSize: 16,
                            fontFamily: 'Noto Sans KR',
                            lineHeight: 16,
                            fill: '#212529',
                            fontWeight: 400,
                        },
                    },
                }}
            />
        </div>
    );
}

export function SubtestScoreLineGraphPrintView({ data, color }: { data: Serie[]; color: string }) {
    return (
        <div className='relative h-[120px] w-full'>
            <ResponsiveLine
                data={data}
                margin={{ top: 10, right: 30, bottom: 50, left: 60 }}
                xScale={{ type: 'point' }}
                yScale={{
                    type: 'linear',
                    min: 0,
                    max: 50,
                    stacked: false,
                    reverse: false,
                }}
                enableGridX={false}
                gridYValues={5}
                defs={[
                    {
                        colors: [
                            {
                                color: 'inherit',
                                offset: 0,
                            },
                            {
                                color: 'inherit',
                                offset: 100,
                                opacity: 0,
                            },
                        ],
                        id: 'gradientA',
                        type: 'linearGradient',
                    },
                ]}
                enableArea
                fill={[
                    {
                        id: 'gradientA',
                        match: '*',
                    },
                ]}
                axisTop={null}
                axisRight={null}
                axisBottom={{
                    tickSize: 5,
                    tickPadding: 0,
                    tickRotation: 0,
                    // 커스텀 tick 렌더링 함수
                    renderTick({ opacity, textAnchor, textBaseline, textX, textY, value, x, y }) {
                        /**
                         * svg에선 wrap text를 지원하지 않으므로, tspan과 y값으로 직접 조정해야 한다.
                         * \n 갯수에 따라 y값을 조정하기 위해 tspanCnt를 계산한다.
                         */
                        const tspanCnt = String(value).split('\n').length;

                        return (
                            <g transform={`translate(${x},${y + 10})`} style={{ opacity }}>
                                {/* 모바일에선 wrap 처리*/}
                                <text
                                    dominantBaseline={textBaseline}
                                    alignmentBaseline='middle'
                                    textAnchor={textAnchor}
                                    transform={`translate(${textX},${textY}) rotate(0)`}
                                    style={{
                                        fontSize: 8,
                                        fontFamily: 'Noto Sans KR',
                                        fill: '#212529',
                                        fontWeight: 400,
                                    }}
                                >
                                    {String(value)
                                        .split('\n')
                                        .map((v, i) => (
                                            <tspan key={i} x={0} y={tspanCnt === 1 ? 6 : i * 12}>
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
                    tickSize: 0,
                    tickPadding: 40,
                    tickRotation: 0,
                    truncateTickAt: 0,
                }}
                colors={color}
                lineWidth={2}
                pointSize={8}
                pointColor='#FFFFFF'
                pointBorderWidth={3}
                pointBorderColor={{ from: 'serieColor' }}
                pointLabelYOffset={-12}
                enablePointLabel
                theme={{
                    text: {
                        fontSize: 8,
                        fontFamily: 'Noto Sans KR',
                        lineHeight: 12,
                        fill: '#000000',
                        fontWeight: 400,
                    },
                    axis: {
                        ticks: {
                            text: {
                                fontSize: 8,
                                fontFamily: 'Noto Sans KR',
                                fill: '#868E96',
                                fontWeight: 400,
                            },
                        },
                    },
                    legends: {
                        text: {
                            fontSize: 8,
                            fontFamily: 'Noto Sans KR',
                            lineHeight: 16,
                            fill: '#212529',
                            fontWeight: 400,
                        },
                    },
                }}
            />
        </div>
    );
}
