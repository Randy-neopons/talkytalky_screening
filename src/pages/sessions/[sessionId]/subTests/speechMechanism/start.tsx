import { useCallback, useState, type ChangeEventHandler } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import ReactTextareaAutosize from 'react-textarea-autosize';

import CheckBox from '@/components/common/CheckBox';
import Container from '@/components/common/Container';

import startStyles from './Start.module.css';

// TODO: DB에서 불러옴
const questionList = [
    { questionId: 1, title: '입 모양의 대칭' },
    { questionId: 2, title: '코 모양의 대칭' },
    { questionId: 3, title: '눈 모양의 대칭' },
    { questionId: 4, title: '이마 모양의 대칭' },
    { questionId: 5, title: '얼굴표정 : 경직되거나 가면 쓴 것 처럼 보이는가?' },
];

// form default value
const initialValues: {
    answers: { questionId: number; title: string; answer?: string }[];
} = {
    answers: questionList.map(v => ({ ...v, answer: undefined })),
};

// 말기제평가 페이지
export default function SpeechMechanismStartPage() {
    const [checkAll1, setCheckAll1] = useState(false);
    const [checkAll2, setCheckAll2] = useState(false);

    const { control, register, setValue } = useForm({ defaultValues: initialValues });
    const { fields } = useFieldArray({ name: 'answers', control });

    // 모두 정상 체크
    const handleChangeCheckAll1 = useCallback<ChangeEventHandler<HTMLInputElement>>(
        e => {
            if (e.target.checked === true) {
                console.log('here');
                setValue(`answers.0.answer`, 'normal');
                setValue(`answers.1.answer`, 'normal');
                setValue(`answers.2.answer`, 'normal');
                setValue(`answers.3.answer`, 'normal');
                setValue(`answers.4.answer`, 'normal');
            }

            setCheckAll1(e.target.checked);
        },
        [setValue],
    );

    const handleClickNext = useCallback(() => {}, []);

    return (
        <Container>
            <h2 className='flex items-center font-jalnan text-accent1 text-head-2'>SPEECH MECHANISM : 말기제평가</h2>
            <h1 className='font-jalnan text-head-1'>Facial (안면)</h1>
            <table className='mb-5 mt-[60px] border-collapse rounded-base shadow-base xl:mt-[80px]'>
                <thead className={`${startStyles['table-head']}`}>
                    <tr className='bg-accent1 text-white text-body-2'>
                        <th className='rounded-tl-base'></th>
                        <th>활동시</th>
                        <th>정상</th>
                        <th>경도</th>
                        <th>심도</th>
                        <th>평가불가</th>
                        <th className='rounded-tr-base'>메모</th>
                    </tr>
                </thead>
                <tbody className={`${startStyles['table-body']}`}>
                    {fields.map((field, i) => (
                        <tr key={field.id}>
                            <td>{i + 1}</td>
                            <td>{field.title}</td>
                            <td className='text-center'>
                                <input type='radio' {...register(`answers.${i}.answer`)} value='normal' />
                            </td>
                            <td className='text-center'>
                                <input type='radio' {...register(`answers.${i}.answer`)} value='mild' />
                            </td>
                            <td className='text-center'>
                                <input type='radio' {...register(`answers.${i}.answer`)} value='moderate' />
                            </td>
                            <td className='text-center'>
                                <input type='radio' {...register(`answers.${i}.answer`)} value='unknown' />
                            </td>
                            <td className='p-0 text-center'>
                                <ReactTextareaAutosize className={`${startStyles.textarea}`} minRows={1} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <CheckBox name='all' checked={checkAll1} onChange={handleChangeCheckAll1}>
                모두 정상
            </CheckBox>

            <button type='button' className='mt-20 btn btn-large btn-contained' onClick={handleClickNext}>
                다음
            </button>
        </Container>
    );
}
