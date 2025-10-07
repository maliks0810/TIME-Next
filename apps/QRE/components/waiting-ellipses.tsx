import { useState } from 'react';
// import { useRef, useState } from 'react';
import './waiting-ellipses.scss';

// const ELLIPSES_COUNT = 3;
// const TIMER_SPEED = 250;

export const WaitingEllipses = (props: {
    prefix: string;
    maintainWidth?: boolean;
    speed?: number;
    ellipseCount?: number;
}) => {
    // const [typingCount, setTypingCount] = useState<number>(0);
    const [typingCount] = useState<number>(0);
    // const ellipseCnt = props.ellipseCount ?? ELLIPSES_COUNT;

    const ellipses = '.'.repeat(typingCount);
    // const timer = useRef<number | undefined>(undefined);
    const level = props.maintainWidth ? 1 : 0;
    // if (!timer.current) {
    //     timer.current = setTimeout(() => {
    //         clearTimeout(timer.current);
    //         timer.current = undefined;
    //         setTypingCount((p) => (p < ellipseCnt ? p + 1 : 0));
    //     }, props.speed ?? TIMER_SPEED);
    // }

    return (
        <div className="waiting-ellipses-container" >
            <div className="waiting-wrapper" aria-level={level}>                
                <div className="waiting-text" aria-level={level}> {props.prefix}</div>
                <div className="waiting-ellipses" aria-level={level}>{ellipses}</div>
            </div>
        </div>
    );
};
