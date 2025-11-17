import { ReactNode } from 'react';
import { Button, Dialog, DialogTitle, DialogActions, DialogContent, Grid } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';

export enum DialogIcon {
    None,
    Info,
    Alert,
    Question,
}

export const DialogBase = (props: {
    open: boolean;
    onButtonClick: (button: string) => void;
    title: string;
    children: ReactNode;
    header?: ReactNode;
    icon?: DialogIcon;
    buttons?: string[];
}) => {
    const { open, onButtonClick, title, children, header } = props;
    const icon = props.icon ?? DialogIcon.None;
    const buttons: string[] = props.buttons ?? ['yes', 'cancel'];

    if (buttons.length < 1) {
        buttons.push('yes', 'cancel');
    }

    const IconComponent = {
        [DialogIcon.Info]: <InfoIcon color="info" fontSize="large" />,
        [DialogIcon.Alert]: <InfoIcon color="error" fontSize="large" />,
        [DialogIcon.Question]: <InfoIcon color="warning" fontSize="large" />,
    };

    const handleClick = (button: string) => {
        onButtonClick(button);
    };

    return (
        <Dialog open={open} fullWidth={true} maxWidth="md">
            <DialogTitle>{title}</DialogTitle>
            {header ?? <></>}
            <DialogContent dividers>
                <Grid container flexGrow={1}>
                    <Grid size={11}>{children}</Grid>
                    <Grid size={1}>{icon != DialogIcon.None && IconComponent[icon]}</Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                {buttons.map((b, i) => (
                    <Button variant="outlined" onClick={() => handleClick(b)} key={i}>
                        {b}
                    </Button>
                ))}
            </DialogActions>
        </Dialog>
    );
};
