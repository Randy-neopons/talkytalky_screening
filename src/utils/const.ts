export const TALKYTALKY_URL = process.env.NEXT_PUBLIC_TALKYTALKY_URL;

export const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const genderOptions = [
    { value: 'female', label: '여' },
    { value: 'male', label: '남' },
];

export const dominantHandOptions = [
    { value: 'right', label: '오른손' },
    { value: 'left', label: '왼손' },
    { value: 'both', label: '양손' },
];

export const hearingAidsUseOptions = [
    { value: 'left', label: '좌측' },
    { value: 'right', label: '우측' },
    { value: 'both', label: '양측' },
    { value: 'none', label: '사용안함' },
];

export const brainLesionOptions = [
    { value: 'bilateralUpperMotorNeuron', label: '양측상부운동신경손상' },
    { value: 'unilateralUpperMotorNeuron', label: '일측상부운동신경손상' },
    { value: 'lowerMotorNeuron', label: '하부운동신경손상' },
    { value: 'cerebellarControlCircuit', label: '소뇌조절회로' },
    { value: 'basalGangliaControlCircuit', label: '기저핵조절회로' },
    { value: 'unknown', label: '특정할 수 없음' },
    { value: 'normal', label: '정상 소견' },
];

export const answerOptions = [
    { value: 'normal', label: '정상' },
    { value: 'mild', label: '경도' },
    { value: 'moderate', label: '심도' },
    { value: 'unknown', label: '평가불가' },
];

export const typeOptions = [
    { value: 'spastic', label: '경직형(spastic)' },
    { value: 'flaccid', label: '이완형(flaccid)' },
    { value: 'ataxic', label: '실조형(ataxic)' },
    { value: 'hypokinetic', label: '과소운동형(hypokinetic)' },
    { value: 'hyperkinetic', label: '과다운동형(hyperkinetic)' },
    { value: 'UUMN', label: '일측상부운동신경형(UUMN)' },
    { value: 'mixed', label: '혼합형(mixed)' },
];
