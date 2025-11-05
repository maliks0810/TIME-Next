import { useRef, useState } from 'react';
import { Typography } from '@mui/material';
import './waiting-ellipses.scss';

const ELLIPSES_COUNT = 3;
const TIMER_SPEED = 250;

export const WaitingEllipses = (props: {
    prefix: string;
    maintainWidth?: boolean;
    speed?: number;
    ellipseCount?: number;
}) => {
    const [typingCount, setTypingCount] = useState<number>(0);
    const ellipseCnt = props.ellipseCount ?? ELLIPSES_COUNT;

    const ellipses = '.'.repeat(typingCount);
    const timer = useRef<NodeJS.Timeout | undefined>(undefined);
    const level = props.maintainWidth ? 1 : 0;
    if (!timer.current) {
        timer.current = setTimeout(() => {
            clearTimeout(timer.current);
            timer.current = undefined;
            setTypingCount((p) => (p < ellipseCnt ? p + 1 : 0));
        }, props.speed ?? TIMER_SPEED);
    }

    return (
        <div className="waiting-ellipses-container" >
            <div className="waiting-wrapper" aria-level={level}>                
                <Typography className="waiting-text" aria-level={level}> {props.prefix}</Typography>
                <Typography className="waiting-ellipses" aria-level={level}>{ellipses}</Typography>
            </div>
        </div>
    );
};
