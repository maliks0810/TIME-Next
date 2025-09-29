import React from 'react';
import GridLayout from "react-grid-layout";
import { Layout } from 'react-grid-layout';
import './TcwAdjustableGrid.css';

export const TcwAdjustableGrid = (props: { layout: Layout[], children: React.ReactNode }) => {
    return (
        <GridLayout
            className='layout'
            layout={props.layout}
            cols={14}
            rowHeight={20}
            width={1900}
            isResizable={true}
        >
            {props.children}
        </GridLayout>
    );
}