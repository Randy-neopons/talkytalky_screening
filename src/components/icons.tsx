// 공통 svg 아이콘

type IconProps = {
    color?: string;
    width?: number;
    height?: number;
};

export const MikeIcon = ({ color = 'white', width = 24, height = 24 }: IconProps) => {
    return (
        <svg xmlns='http://www.w3.org/2000/svg' width={width} height={height} viewBox='0 0 24 24' fill='none'>
            <rect x='9.0004' y='3' width='6' height='10' rx='3' fill={color} />
            <path
                d='M7.0004 12C7.33373 13.4286 8.53373 16 12.0004 16C13.4448 16 16.2004 15.4286 17.0004 12'
                stroke={color}
                strokeWidth='2'
                strokeLinecap='round'
            />
            <path d='M12.0004 16.2344V20.2344' stroke={color} strokeWidth='2' strokeLinecap='round' />
        </svg>
    );
};

export const MemoIcon = ({ color = 'white', width = 24, height = 24 }: IconProps) => {
    return (
        <svg xmlns='http://www.w3.org/2000/svg' width={width} height={height} viewBox='0 0 24 24' fill='none'>
            <rect x='5' y='4' width='14' height='15' rx='2' fill={color} />
            <path d='M8 7H16' stroke='#DEE2E6' strokeLinecap='round' />
            <path d='M8 10H16' stroke='#DEE2E6' strokeLinecap='round' />
            <path d='M8 13H16' stroke='#DEE2E6' strokeLinecap='round' />
            <path d='M8 16H12' stroke='#DEE2E6' strokeLinecap='round' />
        </svg>
    );
};

export const PencilIcon = ({ color = 'white', width = 24, height = 24 }: IconProps) => {
    return (
        <svg xmlns='http://www.w3.org/2000/svg' width={width} height={height} viewBox='0 0 24 24' fill='none'>
            <path
                d='M13.7042 17.9307L3.71934 8.28841C3.32206 7.90476 3.31101 7.27169 3.69466 6.87441L5.77863 4.71639C6.16228 4.31911 6.79535 4.30806 7.19263 4.69171L17.1775 14.334C17.2916 14.4442 17.3779 14.5799 17.4291 14.73L18.4925 17.8422C18.756 18.6133 18.036 19.3589 17.2561 19.1225L14.1088 18.1684C13.957 18.1223 13.8183 18.0409 13.7042 17.9307Z'
                fill={color}
            />
            <path d='M5.5177 10.0234L8.99099 6.42674' stroke='#DEE2E6' />
        </svg>
    );
};

export const FontIcon = ({ color = 'white', width = 24, height = 24 }: IconProps) => {
    return (
        <svg xmlns='http://www.w3.org/2000/svg' width={width} height={height} viewBox='0 0 24 24' fill='none'>
            <path
                d='M4 18L6.33902 9.31222C6.59903 8.34648 7.95897 8.31836 8.25868 9.27252L11 18'
                stroke='white'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
            />
            <path
                d='M11 18L14.728 5.07625C14.9997 4.13425 16.3239 4.10525 16.6366 5.03445L21 18'
                stroke={color}
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
            />
            <path d='M5 14.5H9' stroke='white' strokeWidth='2' strokeLinecap='round' />
            <path d='M13 14H19' stroke='white' strokeWidth='2' strokeLinecap='round' />
        </svg>
    );
};

export const RecycleIcon = ({ color = 'white', width = 24, height = 24 }: IconProps) => {
    return (
        <svg xmlns='http://www.w3.org/2000/svg' width={width} height={height} viewBox='0 0 24 24' fill='none'>
            <rect x='6' y='5' width='12' height='2' rx='0.5' fill={color} />
            <rect x='9' y='4' width='6' height='2' rx='0.5' fill={color} />
            <path d='M7 8H17V19C17 19.5523 16.5523 20 16 20H8C7.44772 20 7 19.5523 7 19V8Z' fill={color} />
        </svg>
    );
};

export const InfoIcon = ({ color = 'white', width = 24, height = 24 }: IconProps) => {
    return (
        <svg xmlns='http://www.w3.org/2000/svg' width={width} height={height} viewBox='0 0 24 24' fill='none'>
            <circle cx='12' cy='12' r='8' stroke={color} strokeWidth='2' />
            <circle cx='12' cy='8' r='1' fill={color} />
            <rect x='11' y='10' width='2' height='7' rx='1' fill={color} />
        </svg>
    );
};

export const PrintIcon = ({ color = 'white', width = 24, height = 24 }: IconProps) => {
    return (
        <svg xmlns='http://www.w3.org/2000/svg' width={width} height={height} viewBox='0 0 24 24' fill='none'>
            <rect x='2.5' y='7.5' width='19' height='9' rx='0.5' stroke={color} />
            <path d='M6.5 3C6.5 2.72386 6.72386 2.5 7 2.5H17C17.2761 2.5 17.5 2.72386 17.5 3V7.5H6.5V3Z' stroke={color} />
            <path
                d='M6 13C6 12.4477 6.44772 12 7 12H17C17.5523 12 18 12.4477 18 13V19C18 19.5523 17.5523 20 17 20H7C6.44772 20 6 19.5523 6 19V13Z'
                fill={color}
            />
            <path d='M8 14H16' stroke='#F5F7FC' strokeLinecap='round' />
            <path d='M8 16H16' stroke='#F5F7FC' strokeLinecap='round' />
            <path d='M8 18H12' stroke='#F5F7FC' strokeLinecap='round' />
        </svg>
    );
};

export const PlayIcon = ({ color = 'white', width = 24, height = 24 }: IconProps) => {
    return (
        <svg xmlns='http://www.w3.org/2000/svg' width={width} height={height} viewBox='0 0 24 24' fill='none'>
            <path
                d='M17.5 11.134C18.1667 11.5189 18.1667 12.4811 17.5 12.866L10 17.1962C9.33333 17.5811 8.5 17.0999 8.5 16.3301L8.5 7.66987C8.5 6.90007 9.33333 6.41895 10 6.80385L17.5 11.134Z'
                fill={color}
            />
        </svg>
    );
};

export const PauseIcon = ({ color = 'white', width = 24, height = 24 }: IconProps) => {
    return (
        <svg xmlns='http://www.w3.org/2000/svg' width={width} height={height} viewBox='0 0 50 50' fill='none'>
            <rect x='16' y='13' width='4' height='25' rx='2' fill={color} />
            <rect x='30' y='13' width='4' height='25' rx='2' fill={color} />
        </svg>
    );
};

export const StopIcon = ({ color = 'white', width = 24, height = 24 }: IconProps) => {
    return (
        <svg xmlns='http://www.w3.org/2000/svg' width={width} height={height} viewBox='0 0 24 24' fill='none'>
            <rect x='7' y='7' width='10' height='10' rx='1' fill={color} />
        </svg>
    );
};

export const ChevronRightIcon = ({ color = 'white', width = 24, height = 24 }: IconProps) => {
    return (
        <svg xmlns='http://www.w3.org/2000/svg' width={width} height={height} viewBox='0 0 24 24' fill='none'>
            <path d='M9 6L15 11.8182L9 18' stroke='white' strokeWidth='2' strokeLinecap='round' />
        </svg>
    );
};

export const ClockIcon = ({ color = 'white', width = 24, height = 24 }: IconProps) => {
    return (
        <svg xmlns='http://www.w3.org/2000/svg' width='23' height='23' viewBox='0 0 23 23' fill='none'>
            <circle cx='11.5' cy='11.5' r='10.5' stroke='white' strokeWidth='2' />
            <path d='M11.5 5.32031V13.0409L15.5147 15.2027' stroke='white' strokeWidth='2' strokeLinecap='round' />
        </svg>
    );
};
