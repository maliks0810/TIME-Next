import { useRef } from 'react';
import './filter.scss';

export const FilterInput = (props: {
    filter: string | undefined;
    onFilterChanged: (value: string) => void;
    placeholder: string;
    disabled?: boolean;
}) => {
    const { filter, onFilterChanged, placeholder, disabled } = props;
    const ref = useRef<HTMLInputElement>(null);
    const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onFilterChanged(e.target.value);
    };

    const handleOnKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key == 'Escape') {
            if (ref.current) {
                ref.current.value = '';
            }
            onFilterChanged('');
        }
    };
    return (
        <div className="filter-container" aria-disabled={disabled}>
            <input
                id="filter-input"
                type="text"
                className="filter-input"
                placeholder={placeholder}
                defaultValue={filter}
                onChange={handleOnChange}
                onKeyDown={handleOnKeyDown}
                data-form-type="other"
                ref={ref}
                disabled={disabled}
            ></input>
            <button
                className="filter-clear-button"
                onClick={() => onFilterChanged('')}
                disabled={disabled}
            >
                x
            </button>
        </div>
    );
};
