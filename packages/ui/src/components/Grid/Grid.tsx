import GridLayout from "react-grid-layout";
import './Grid.css';

export const Grid = () => {
    const layout = [
      { i: "a", x: 0, y: 0, w: 1, h: 2 },
      { i: "b", x: 1, y: 0, w: 3, h: 2 },
    ];
    return (
        <GridLayout
            className='layout'
            layout={layout}
            cols={14}
            rowHeight={20}
            width={1900}
            isResizable={true}
        >
            <div key='a' className='grid-item-a'> a </div>
            <div key='b' className='grid-item-b'> b </div>
        </GridLayout>
    );
}