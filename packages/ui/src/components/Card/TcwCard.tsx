import Card from '@mui/material/Card'
import './TcwCard.scss';
import { Box, CardContent, CardHeader } from '@mui/material';
import React, { ReactNode } from 'react';

export const TcwCard: React.FC<{
        iconPath: string, 
        title: string, 
        children: ReactNode, 
        width?: number | string, 
        height?: number | string
    }> = (props: {
        iconPath: string, 
        title: string, 
        children: ReactNode, 
        width?: number | string, 
        height?: number | string
    }) => {
    return (
        <Card className='tcw-card-container' sx={{width: props.width, height: props.height}}>
            <CardHeader className='tcw-card-header'
                avatar={<img src={props.iconPath} alt={`${props.title} image`} className='tcw-card-image' />}
                title={props.title}
            />
            <CardContent className='tcw-card-content'>
                <Box>
                    {props.children}
                </Box>
            </CardContent>
        </Card>
    )
}