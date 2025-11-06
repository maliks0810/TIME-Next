import Paper from '@mui/material/Paper'
import './TcwCard.scss';
import { Box, CardContent, CardHeader } from '@mui/material';
import * as MuiIcons from '@mui/icons-material';  
import React, { ReactNode } from 'react';

export const TcwCard: React.FC<{
        title: string, 
        children: ReactNode, 
        width?: number | string, 
        height?: number | string,
        titleSize?: string
        avatarMuiIcon?: keyof typeof MuiIcons;
        avatarCustom?: string;
    }> = (props: {
        title: string, 
        children: ReactNode, 
        width?: number | string, 
        height?: number | string,
        titleSize?: string
        avatarMuiIcon?: keyof typeof MuiIcons;
        avatarCustom?: string;
    }) => {
        const renderAvatar = () => {
            if (props.avatarCustom) {
                return <img src={props.avatarCustom} alt={`${props.title} image`} className='tcw-card-image' />
            }

            if (props.avatarMuiIcon) {
                const MuiIconComponent = MuiIcons[props.avatarMuiIcon];
                return <MuiIconComponent />;
            }

            return null;
        };
    return (
        <Paper className='tcw-card-container' sx={{width: props.width, height: props.height}}>
            <CardHeader className='tcw-card-header'
                avatar={renderAvatar()}
                title={props.title}
                slotProps={{
                    title: {
                        sx: {
                            fontSize: props.titleSize
                        }
                    }
                }}
            />
            <CardContent className='tcw-card-content'>
                <Box>
                    {props.children}
                </Box>
            </CardContent>
        </Paper>
    )
}