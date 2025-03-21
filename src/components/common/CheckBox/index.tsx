import { useCallback, type ChangeEvent, type InputHTMLAttributes, type ReactNode } from 'react';
import { Controller, useController, type Control, type FieldValues, type Path } from 'react-hook-form';

const CheckBoxIcon = () => (
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
);

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

    if (isControlled) {
        return (
            <label className='flex cursor-pointer items-center justify-center'>
                <input type='checkbox' className='peer hidden' checked={checked} onChange={onChange} />
                <CheckBoxIcon />
                {children}
            </label>
        );
    }

    return (
        <Controller
            name={name}
            control={control}
            render={({ field }) => (
                <label className='flex cursor-pointer items-center justify-center'>
                    <input type='checkbox' className='peer hidden' checked={field.value} onChange={field.onChange} />
                    <CheckBoxIcon />
                    {children}
                </label>
            )}
        />
    );
}

export function CheckBoxGroup<T extends FieldValues>({
    name,
    control,
    options,
    required,
}: {
    name: Path<T>; // 폼 필드 이름
    control?: Control<T>; // 폼 control
    required?: boolean;
    options: { value: string; label: string }[];
}) {
    const handleChange = useCallback(
        (currentValues: string[], setValues: (newValues: string[]) => void) => (e: ChangeEvent<HTMLInputElement>) => {
            let newValues: string[] = [];

            console.log(e.target.value);
            if (typeof e.target.value === 'string' && ['unknown', 'normal'].includes(e.target.value)) {
                // 알 수 없음 클릭 시 기존 checkbox 해제
                // TODO: 'unknown'이라는 값을 변수로 받을지
                if (currentValues?.includes(e.target.value)) {
                    newValues = currentValues.filter(fieldValue => fieldValue !== e.target.value);
                } else {
                    newValues = [e.target.value];
                }
            } else {
                // 알 수 없음 제외한 값 클릭 시
                if (currentValues?.includes(e.target.value)) {
                    newValues = currentValues.filter(fieldValue => fieldValue !== e.target.value);
                } else {
                    newValues = [
                        ...(currentValues.filter(fieldValue => !['unknown', 'normal'].includes(fieldValue)) || []),
                        e.target.value,
                    ];
                }
            }
            setValues(newValues);
        },
        [],
    );

    return (
        <Controller
            control={control}
            name={name}
            rules={{
                validate: (value: string[]) => {
                    if (required) {
                        return value.length > 0 || '최소 하나의 항목을 선택헤주세요.';
                    }
                },
            }}
            render={({ field }) => (
                <ul className='flex flex-row flex-wrap'>
                    {options.map((option, i) => (
                        <li key={option.value} className='mb-[10px] basis-1/2 xl:mb-[11px]'>
                            <label className='flex cursor-pointer items-center'>
                                <input
                                    type='checkbox'
                                    className='peer hidden'
                                    value={option.value}
                                    checked={field.value?.includes(option.value)}
                                    onChange={handleChange(field.value, field.onChange)}
                                />
                                <CheckBoxIcon />
                                {option.label}
                            </label>
                        </li>
                    ))}
                </ul>
            )}
        />
    );
}

export function CheckBoxGroupItem<T extends FieldValues, V = string>({
    name,
    control,
    value,
    values,
    setValues,
    required,
    children,
}: {
    name: Path<T>; // 폼 필드 이름
    control?: Control<T>; // 폼 control

    value: V;
    values?: V[];
    setValues?: (newValues: V[]) => void;
    required?: boolean;
    children: ReactNode;
}) {
    const handleChange = useCallback(
        (currentValues: V[], setValues: (newValues: V[]) => void) => () => {
            let newValues: V[] = [];

            if (typeof value === 'string' && ['unknown', 'normal'].includes(value)) {
                // 알 수 없음 클릭 시 기존 checkbox 해제
                // TODO: 'unknown'이라는 값을 변수로 받을지
                if (currentValues?.includes(value)) {
                    newValues = currentValues.filter(fieldValue => fieldValue !== value);
                } else {
                    newValues = [value];
                }
            } else {
                // 알 수 없음 제외한 값 클릭 시
                if (currentValues?.includes(value)) {
                    newValues = currentValues.filter(fieldValue => fieldValue !== value);
                } else {
                    newValues = [...(currentValues.filter(fieldValue => fieldValue !== 'unknown') || []), value];
                }
            }
            setValues(newValues);
        },
        [value],
    );

    if (values && setValues) {
        return (
            <label className='flex cursor-pointer items-center'>
                <input
                    type='checkbox'
                    className='peer hidden'
                    checked={values?.includes(value)}
                    onChange={handleChange(values, setValues)}
                    required={required}
                />
                <CheckBoxIcon />
                {children}
            </label>
        );
    }

    return (
        <Controller
            control={control}
            name={name}
            render={({ field }) => (
                <label className='flex cursor-pointer items-center'>
                    <input
                        type='checkbox'
                        className='peer hidden'
                        checked={field.value?.includes(value)}
                        onChange={handleChange(field.value, field.onChange)}
                    />
                    <CheckBoxIcon />
                    {children}
                </label>
            )}
            rules={{ required }}
        />
    );
}
