import { forwardRef, ReactNode, useImperativeHandle, useRef } from 'react';
import ExpandMoreOutlinedIcon from '@mui/icons-material/ExpandMoreOutlined';
import './select.scss';
import { genSmallId } from '../utils/uuid';

export type SelectProps = { children: ReactNode; selectText: string; className?: string, disabled?: boolean};

export type SelectRef = {
    toggleOptions: () => void;
    showOptions: () => void;
    hideOptions: () => void;
};

export const Select = forwardRef<SelectRef, SelectProps>((props, ref) => {
    const { children, selectText, className, disabled } = props;
    const popoverRef = useRef<HTMLDivElement>(null);
    const idRef = useRef<string>(genSmallId());

    useImperativeHandle(ref, () => ({
        toggleOptions: () => {
            popoverRef.current?.togglePopover();
        },
        showOptions: () => {
            popoverRef.current?.showPopover();
        },
        hideOptions: () => {
            popoverRef.current?.hidePopover();
        },
    }));

    return (
        <div className={`select-container ${className ?? ''}`}>
            <div id={`selectPopover-${idRef.current}`} popover="auto" className="select-options" ref={popoverRef}>
                {children}
            </div>
            <button
                className="select-button"
                popoverTarget={`selectPopover-${idRef.current}`}
                popoverTargetAction="toggle"      
                disabled={disabled}          
            >
                <div className="select-button-content">
                    <div className="select-button-text">{selectText}</div>
                    <ExpandMoreOutlinedIcon className="select-icon" />
                </div>
            </button>
        </div>
    );
});
Select.displayName = 'Select';
