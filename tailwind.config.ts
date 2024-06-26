import type { Config } from 'tailwindcss';

const config: Config = {
    content: ['./src/pages/**/*.{js,ts,jsx,tsx,mdx}', './src/components/**/*.{js,ts,jsx,tsx,mdx}', './src/app/**/*.{js,ts,jsx,tsx,mdx}'],
    theme: {
        extend: {
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
            },
            colors: {
                primary1: '#FFCF5C',
                primary2: '#FFE29D',
                primary3: '#FFF8E7',
                accent1: '#6979F8',
                accent2: '#A5AFFB',
                accent3: '#E5E7FA',
                purple1: '#BE52F2',
                purple2: '#DBA5F5',
                purple3: '#EEDFF2',
                orange1: '#FFA26B',
                orange2: '#FFC7A6',
                orange3: '#FFE8DA',
                blue1: '#0084F4',
                blue2: '#66B5F8',
                blue3: '#D5E9FA',
                green1: '#20c997',
                green2: '#7DDFC3',
                green3: '#D5F2EA',
                red1: '#FF647C',
                red2: '#FDAFBB',
                red3: '#FBE4E8',
                neutral1: '#212529',
                neutral2: '#343a40',
                neutral3: '#495057',
                neutral4: '#868e96',
                neutral5: '#adb5bd',
                neutral6: '#ced4da',
                neutral7: '#dee2e6',
                neutral8: '#e9ecef',
                neutral9: '#f1f3f5',
                neutral10: '#f8f9fa',
                neutral11: '#ffffff',
            },
            fontFamily: {
                jalnan: ['Jalnan'],
                noto: ['Noto Sans KR'],
            },
        },
    },
    plugins: [],
};
export default config;
