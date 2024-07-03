import { Controller, type FieldValues, type Control, type Path } from 'react-hook-form';
import type { DropdownIndicatorProps, GroupBase, Props, StylesConfig } from 'react-select';
import ReactSelect, { components } from 'react-select';

type OptionType = {
    value: string;
    label: string;
};

interface SelectProps<T extends FieldValues> extends Props<OptionType, false> {
    options: OptionType[];
    control?: Control<T>;
    name?: Path<T>;
    required?: boolean;
}

const customStyles: StylesConfig<OptionType, false> = {
    container: base => ({
        ...base,
        flex: 1,
    }),
    control: (baseStyles, state) => ({
        ...baseStyles,
        flex: '1',
        width: '100%',
        padding: '15px 16px',
        border: '1px solid #CED4DA',
        borderRadius: '6px',
        background: '#ffffff',

        '&:hover': {
            border: state.isFocused ? '1px solid #6979F8' : '',
        },
    }),
    indicatorSeparator: () => ({
        display: 'none',
    }),
    dropdownIndicator: () => ({
        padding: 0,
    }),
    input: baseStyles => ({
        ...baseStyles,
        margin: 0,
        padding: 0,
        color: '#000000',
    }),
    // menu: () => ({
    //     color: '#868e96',
    //     padding: '20px 20px 20px 30px',
    // }),
    valueContainer: baseStyles => ({
        ...baseStyles,
        padding: 0,
    }),
};

function DropdownIndicator(props: DropdownIndicatorProps<OptionType, false>) {
    return (
        <components.DropdownIndicator {...props}>
            <svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8' fill='none'>
                <path d='M6 8L0.803847 0.5L11.1962 0.500001L6 8Z' fill='#868E96' />
            </svg>
        </components.DropdownIndicator>
    );
}

export default function Select<T extends FieldValues>({ control, name, ...props }: SelectProps<T>) {
    if (!control || !name) {
        return <ReactSelect {...props} components={{ DropdownIndicator }} styles={customStyles} />;
    }

    return (
        <Controller
            control={control}
            name={name}
            render={({ field: { onChange, value, ref } }) => (
                <ReactSelect
                    {...props}
                    options={props.options}
                    components={{ DropdownIndicator }}
                    ref={ref}
                    value={props.options.find(option => option.value === value)}
                    onChange={option => onChange(option?.value)}
                    styles={customStyles}
                />
            )}
            rules={{ required: props.required }}
        />
    );
}
