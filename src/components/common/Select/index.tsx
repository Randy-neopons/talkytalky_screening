import { Controller, type FieldValues, type Control } from 'react-hook-form';
import type { DropdownIndicatorProps, GroupBase, Props, StylesConfig } from 'react-select';
import ReactSelect, { components } from 'react-select';

type SelectProps = Props & {
    control?: Control<FieldValues>;
    required?: boolean;
};

const customStyles: SelectProps['styles'] = {
    control: (baseStyles, state) => ({
        ...baseStyles,
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

const DropdownIndicator = (props: DropdownIndicatorProps) => {
    return (
        <components.DropdownIndicator {...props}>
            <svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8' fill='none'>
                <path d='M6 8L0.803847 0.5L11.1962 0.500001L6 8Z' fill='#868E96' />
            </svg>
        </components.DropdownIndicator>
    );
};

export default function Select(props: SelectProps) {
    if (!props.control || !props.name) {
        return <ReactSelect {...props} components={{ DropdownIndicator }} styles={customStyles} />;
    }

    return (
        <Controller
            control={props.control}
            name={props.name}
            render={({ field }) => <ReactSelect {...props} {...field} components={{ DropdownIndicator }} styles={customStyles} />}
            rules={{ required: props.required }}
        />
    );
}
