import Card from '@mui/material/Card'
import './TcwCard.scss';
import { Box, CardContent, Typography, } from '@mui/material';
import React, { ReactNode } from 'react';
import { ThemeProvider } from '../../theme';

export const TcwCard: React.FC<{iconPath: string, title: string, children: ReactNode, width?: number | string, height?: number | string}> = (props: {iconPath: string, title: string, children: ReactNode, width?: number | string, height?: number | string}) => {
    return (
        <ThemeProvider>
            <Card className='tcw-card-container' sx={{width: props.width, height: props.height}}>
                <CardContent>
                    <Box className='tcw-card-header'>
                        <img src={props.iconPath} alt={`${props.title} image`} className='tcw-card-image' />
                        <Typography variant='h1' sx={{fontSize: '32px', color: 'primary.main', fontWeight: 'bold'}}> {props.title} </Typography>
                    </Box>
                    <Box>
                        {props.children}
                    </Box>
                </CardContent>
            </Card>
        </ThemeProvider>

    )
}