import Card from '@mui/material/Card'
import './TcwCard.scss';
import { Box, CardContent, Typography, } from '@mui/material';
import React, { ReactNode } from 'react';
import { ThemeProvider } from '../../theme';

export const TcwCard: React.FC<{iconPath: string, title: string, children: ReactNode}> = (props: {iconPath: string ,title: string, children: ReactNode}) => {
    return (
        <ThemeProvider>
            <Card className='tcw-card-container'>
                <CardContent>
                    <Box className='tcw-card-header'>
                        <img src={props.iconPath} alt={`${props.title} image`} className='tcw-card-image' />
                        <Typography variant='h2' sx={{fontSize: '32px', color: 'primary.main'}}> {props.title} </Typography>
                    </Box>
                    <Box className='tcw-card-content'>
                        {props.children}
                    </Box>
                </CardContent>
            </Card>
        </ThemeProvider>

    )
}