import React from 'react';
import GridLayout from "react-grid-layout/legacy";
import { LayoutItem } from 'react-grid-layout/legacy';
import './TcwAdjustableGrid.css';

export const TcwAdjustableGrid = (props: { layout: LayoutItem[], children: React.ReactNode }) => {
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