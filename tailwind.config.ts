import plugin from 'tailwindcss/plugin';

import type { Config } from 'tailwindcss';

const config: Config = {
    content: ['./src/pages/**/*.{js,ts,jsx,tsx,mdx}', './src/components/**/*.{js,ts,jsx,tsx,mdx}', './src/app/**/*.{js,ts,jsx,tsx,mdx}'],
    theme: {
        extend: {
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
            },
            borderRadius: {
                base: '1.25rem' /* 20px */,
            },
            boxShadow: {
                base: '0px 4px 8px 0px rgba(0, 0, 0, 0.08)',
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
    plugins: [
        plugin(function ({ addUtilities, theme }) {
            addUtilities({
                '.text-head-1': {
                    fontSize: '1.75rem',
                    lineHeight: '2.625rem',

                    '@media (min-width: 1280px)': {
                        fontSize: '2rem',
                        lineHeight: '3rem',
                    },
                },
                '.text-head-2': {
                    fontSize: '1.25rem',
                    lineHeight: '1.875rem',

                    '@media (min-width: 1280px)': {
                        fontSize: '1.5rem',
                        lineHeight: '2.25rem',
                    },
                },
                '.text-head-3': {
                    fontSize: '1.125rem',
                    lineHeight: '1.75rem',

                    '@media (min-width: 1280px)': {
                        fontSize: '1.25rem',
                        lineHeight: '1.875rem',
                    },
                },
                '.text-body-1': {
                    fontSize: '1rem',
                    lineHeight: '1.5rem',

                    '@media (min-width: 1280px)': {
                        fontSize: '1.125rem',
                        lineHeight: '1.75rem',
                    },
                },
                '.text-body-2': {
                    fontSize: '0.875rem',
                    lineHeight: '1.375rem',

                    '@media (min-width: 1280px)': {
                        fontSize: '1rem',
                        lineHeight: '1.5rem',
                    },
                },

                '.btn': {
                    borderRadius: '6px',
                    borderWidth: '2px',
                    fontWeight: '700',
                },
                '.btn-large': {
                    width: '12.5rem',
                    height: '3.5rem',

                    // body-2
                    fontSize: '0.875rem',
                    lineHeight: '1.375rem',

                    '@media (min-width: 1280px)': {
                        width: '13.75rem',
                        height: '3.75rem',

                        fontSize: '1rem',
                        lineHeight: '1.5rem',
                    },
                },
                '.btn-small': {
                    width: '8.125rem',
                    height: '3.125rem',

                    // body-1
                    fontSize: '1rem',
                    lineHeight: '1.5rem',

                    '@media (min-width: 1280px)': {
                        fontSize: '1.125rem',
                        lineHeight: '1.75rem',
                    },
                },
                '.btn-contained': {
                    backgroundColor: theme('colors.accent1'),
                    color: theme('colors.neutral11'),
                    borderColor: theme('colors.accent1'),
                },
                '.btn-outlined': {
                    backgroundColor: theme('colors.neutral11'),
                    color: theme('colors.accent1'),
                    borderColor: theme('colors.accent1'),
                    // '@apply bg-neutral11 text-accent1 border-accent1': '',
                },
                '.btn-disabled': {
                    backgroundColor: theme('colors.neutral7'),
                    color: theme('colors.neutral4'),
                    borderColor: theme('colors.neutral7'),
                },
            });
        }),
    ],
};
export default config;
