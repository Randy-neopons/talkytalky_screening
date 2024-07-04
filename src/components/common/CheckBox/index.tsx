import { useCallback, type InputHTMLAttributes, type ReactNode } from 'react';
import { useController, type Control, type FieldValues, type Path } from 'react-hook-form';

export default function CheckBox<T extends FieldValues>({
    name,
    control,
    checked,
    onChange,
    children,
}: {
    name: Path<T>; // 폼 필드 이름
    control?: Control<T>; // 폼 control
    checked?: InputHTMLAttributes<HTMLInputElement>['checked']; // controlled state
    onChange?: InputHTMLAttributes<HTMLInputElement>['onChange']; // controlled onchange
    children: ReactNode;
}) {
    const isControlled = checked !== undefined && onChange !== undefined; // controlled인지 폼 쓸것인지 구분

    const { field } = useController({ name, control }) || {}; // useForm 사용

    const isChecked = isControlled ? checked : field.value;
    console.log(field.name, field.value);
    const handleChange = isControlled ? onChange : field.onChange;

    return (
        <label className='flex cursor-pointer items-center justify-center'>
            <input type='checkbox' className='peer hidden' checked={isChecked} onChange={handleChange} />
            <svg
                className='rounded border bg-white peer-checked:border-none peer-checked:bg-accent1'
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
}

export function CheckBoxGroupItem<T extends FieldValues>({
    name,
    control,
    value,
    children,
}: {
    name: Path<T>; // 폼 필드 이름
    control?: Control<T>; // 폼 control
    value: string;
    children: ReactNode;
}) {
    const { field } = useController({ name, control }) || {}; // useForm 사용

    const handleChange = useCallback(() => {
        let newValue: string[] = [];

        if (value === 'unknown') {
            // 알 수 없음 클릭 시 기존 checkbox 해제
            // TODO: 'unknown'이라는 값을 변수로 받을지
            if (field.value?.includes(value)) {
                newValue = field.value.filter((fieldValue: string) => fieldValue !== value);
            } else {
                newValue = [value];
            }
        } else {
            // 알 수 없음 제외한 값 클릭 시
            if (field.value?.includes(value)) {
                newValue = field.value.filter((fieldValue: string) => fieldValue !== value);
            } else {
                newValue = [...(field.value.filter((fieldValue: string) => fieldValue !== 'unknown') || []), value];
            }
        }

        field.onChange(newValue); // react-hook-form setting
    }, [field, value]);

    return (
        <label className='flex cursor-pointer items-center'>
            <input type='checkbox' className='peer hidden' checked={field.value?.includes(value)} onChange={handleChange} />
            <svg
                className='mr-2 rounded border bg-white peer-checked:border-none peer-checked:bg-accent1'
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
}
