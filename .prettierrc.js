module.exports = {
    printWidth: 140, // 가로 줄 길이
    tabWidth: 4, // 탭 간격
    useTabs: false, // 탭 대신 공백 사용
    singleQuote: true, // 작은따옴표
    jsxSingleQuote: true, // jsx 내에서도 작은따옴표 사용
    trailingComma: 'all', // 마지막 줄에도 콤마 사용
    bracketSpacing: true, // 중괄호 사이에 공백
    semi: true, // 세미콜론 붙임
    arrowParens: 'avoid', // arrow function 가능한 경우엔 괄호 생략
    endOfLine: 'auto', // EoF 설정

    plugins: ['prettier-plugin-tailwindcss'],
};
