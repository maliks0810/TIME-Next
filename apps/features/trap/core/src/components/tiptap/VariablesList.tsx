/* eslint-disable  @typescript-eslint/no-explicit-any */

import React, { useEffect, useImperativeHandle, useState } from 'react';
import styles from './VariablesList.module.scss';
const VariablesList = (props: any) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const selectItem = (index: number) => {
        const item = props.items[index];

        if (item) {
            props.command({ id: item });
        }
    };

    const upHandler = () => {
        setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
    };

    const downHandler = () => {
        setSelectedIndex((selectedIndex + 1) % props.items.length);
    };

    const enterHandler = () => {
        selectItem(selectedIndex);
    };

    useEffect(() => setSelectedIndex(0), [props.items]);

    useImperativeHandle(props.ref, () => ({
        onKeyDown: ({ event }: { event: KeyboardEvent }) => {
            if (event.key === 'ArrowUp') {
                upHandler();
                return true;
            }

            if (event.key === 'ArrowDown') {
                downHandler();
                return true;
            }

            if (event.key === 'Enter') {
                enterHandler();
                return true;
            }

            return false;
        },
    }));

    return (
        <div className={styles.dropdown}>
            {props.items.length ? (
                props.items.map((item: string, index: number) => (
                    <button
                        className={index === selectedIndex ? 'is-selected' : ''}
                        key={index}
                        onClick={() => selectItem(index)}
                    >
                        {item}
                    </button>
                ))
            ) : (
                <div className="item">No result</div>
            )}
        </div>
    );
};
export default VariablesList;
