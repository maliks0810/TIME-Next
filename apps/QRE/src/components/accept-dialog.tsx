// import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import { ReactNode } from 'react';
import './accept-dialog.scss';
// import { CircularProgress } from '@mui/material';
import { WaitingEllipses } from './waiting-ellipses';

export const AcceptDialog = (props: {
    title: string | ReactNode;
    children: ReactNode;
    ref: React.Ref<HTMLDialogElement> | undefined;
    onClick: (accept: boolean) => void;
    busyMessage?: string | null;
    busyTitle?: string | null;
}) => {
    const { title, children, ref, onClick, busyMessage, busyTitle } = props;
    const titleBlock =
        typeof title === 'string' ? (
            <div className="accept-dialog-title">
                {/* <WarningAmberOutlinedIcon className="accept-dialog-warning-icon" /> */}
                {title}
            </div>
        ) : (
            title
        );
    return (
        <dialog ref={ref} aria-modal={true} className="accept-dialog">
            <div className="accept-dialog-container popup-container">
                <div className="block-top" />
                {busyMessage && (
                    <div className="accept-dialog-busy-container">
                        {busyTitle && <div className="accept-dialog-busy-title">{busyTitle}</div>}
                        <div className="accept-dialog-busy-text">
                            <WaitingEllipses
                                prefix={busyMessage ?? 'Please wait'}
                                maintainWidth={true}
                            />
                        </div>
                        {/* couldn't get the 'track' prop to work on CircularProgress, so this is a work-around */}
                        <div className="accept-dialog-busy-progress">
                            {/* <CircularProgress
                                variant="determinate"
                                value={100}
                                id="background-progress"
                            />
                            <CircularProgress id="foreground-progress" /> */}
                        </div>
                    </div>
                )}
                {titleBlock}
                <div className="accept-dialog-child-container">{children}</div>
                <div className="accept-dialog-buttons">
                    <button
                        className="accept-dialog-button responsive-button"
                        onClick={() => onClick(true)}
                    >
                        Yes
                    </button>
                    <button
                        className="accept-dialog-button responsive-button"
                        onClick={() => onClick(false)}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </dialog>
    );
};
