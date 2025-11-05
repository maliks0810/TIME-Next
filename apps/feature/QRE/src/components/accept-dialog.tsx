import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import { ReactNode } from 'react';
import {
    Button,
    Card,
    Dialog,
    Typography,
} from '@mui/material';
import './accept-dialog.scss';
import { CircularProgress } from '@mui/material';
import { WaitingEllipses } from './waiting-ellipses';

export const AcceptDialog = (props: {
    title: string | ReactNode;
    children: ReactNode;
    open: boolean;
    onClick: (accept: boolean) => void;
    busyMessage?: string | null;
    busyTitle?: string | null;
}) => {
    const { title, children, open, onClick, busyMessage, busyTitle } = props;
    const titleBlock =
        typeof title === 'string' ? (
            <Typography className="accept-dialog-title">
                <WarningAmberOutlinedIcon className="accept-dialog-warning-icon" />
                {title}
            </Typography>
        ) : (
            title
        );
    return (
        <Dialog open={open} aria-modal={true} className="accept-dialog">
            <Card className="accept-dialog-container popup-container">
                <div className="block-top" />
                {busyMessage && (
                    <div className="accept-dialog-busy-container">
                        {busyTitle && <Typography className="accept-dialog-busy-title">{busyTitle}</Typography>}
                        <div className="accept-dialog-busy-text">
                            <WaitingEllipses
                                prefix={busyMessage ?? 'Please wait'}
                                maintainWidth={true}
                            />
                        </div>
                        {/* couldn't get the 'track' prop to work on CircularProgress, so this is a work-around */}
                        <div className="accept-dialog-busy-progress">
                            <CircularProgress
                                variant="determinate"
                                value={100}
                                id="background-progress"
                            />
                            <CircularProgress id="foreground-progress" />
                        </div>
                    </div>
                )}
                {titleBlock}
                <Typography className="accept-dialog-child-container">{children}</Typography>
                <div className="accept-dialog-buttons">
                    <Button
                        className="accept-dialog-button responsive-button"
                        onClick={() => onClick(true)}
                    >
                        Yes
                    </Button>
                    <Button
                        className="accept-dialog-button responsive-button"
                        onClick={() => onClick(false)}
                    >
                        Cancel
                    </Button>
                </div>
            </Card>
        </Dialog>
    );
};
