import Card from '@mui/material/Card'
import './TcwCard.scss';
import { CardContent, } from '@mui/material';
import React, { ReactNode } from 'react';

export const TcwCard: React.FC<{iconPath: string, title: string, children: ReactNode}> = (props: {iconPath: string ,title: string, children: ReactNode}) => {
    return (
        <Card className='tcw-card-container'>
            <CardContent>
                <div className='tcw-card-header'>
                    <img src={props.iconPath} alt={`${props.title} image`} className='tcw-card-image' />
                    <h2> {props.title} </h2>
                </div>
                <div className='tcw-card-content'>
                    {props.children}
                </div>
            </CardContent>
        </Card>
    )
}