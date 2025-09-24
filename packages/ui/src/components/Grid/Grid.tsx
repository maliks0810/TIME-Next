import GridLayout from "react-grid-layout";
import './Grid.css';

export const Grid = () => {
    const layout = [
      { i: "a", x: 0, y: 0, w: 1, h: 2, static: true },
      { i: "b", x: 1, y: 0, w: 3, h: 2, minW: 2, maxW: 4 },
    ];
    return (
        <GridLayout
            className='grid-layout'
            layout={layout}
            cols={12}
            rowHeight={30}
            width={1200}
        >
            <div key='a' className='grid-item-a'> a </div>
            <div key='b' className='grid-item-b'> b </div>
        </GridLayout>
    );
}