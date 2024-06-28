import type { InputHTMLAttributes, ReactNode } from 'react';
import { useController, type Control } from 'react-hook-form';

const CheckBox = ({
    name,
    control,
    checked,
    onChange,
    children,
}: {
    name: string; // 폼 필드 이름
    control?: Control; // 폼 control
    checked?: InputHTMLAttributes<HTMLInputElement>['checked']; // controlled state
    onChange?: InputHTMLAttributes<HTMLInputElement>['onChange']; // controlled onchange
    children: ReactNode;
}) => {
    const isControlled = checked !== undefined && onChange !== undefined; // controlled인지 폼 쓸것인지 구분

    const { field } = useController({ name, control, defaultValue: false }) || {}; // useForm 사용

    const isChecked = isControlled ? checked : field.value;
    const handleChange = isControlled ? onChange : field.onChange;

    return (
        <label className='flex justify-center items-center cursor-pointer'>
            <input type='checkbox' className='hidden peer' checked={isChecked} onChange={handleChange} />
            <svg
                className='bg-white peer-checked:bg-accent1 rounded border peer-checked:border-none'
                xmlns='http://www.w3.org/2000/svg'
                width='24'
                height='24'
                viewBox='0 0 24 24'
                fill='none'
            >
                <path d='M7 12L11 16L17 8' stroke='white' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
            </svg>
            {children}
        </label>
    );
};

export default CheckBox;
