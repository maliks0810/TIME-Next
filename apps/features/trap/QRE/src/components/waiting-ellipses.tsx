import { useRef, useState } from 'react';
import { Box, Stack, Typography } from '@mui/material';
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
    // const _level = props.maintainWidth ? 1 : 0;
    if (!timer.current) {
        timer.current = setTimeout(() => {
            clearTimeout(timer.current);
            timer.current = undefined;
            setTypingCount((p) => (p < ellipseCnt ? p + 1 : 0));
        }, props.speed ?? TIMER_SPEED);
    }

    return (
        <Box >
            <Stack direction='row' spacing={0}>
                <Typography > {props.prefix}</Typography>
                <Typography >{ellipses}</Typography>
            </Stack>
        </Box>
    );
};
