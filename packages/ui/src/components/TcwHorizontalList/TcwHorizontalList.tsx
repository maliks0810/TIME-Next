import { Box, Typography } from '@mui/material';
import './TcwHorizontalList.css';

export const TcwHorizontalList = (props: { width: string | number, contentList: string[] }) => {
    return(
        <Box 
            sx={{ 
                width: props.width,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))',
                gap: '20px',
            }}
        >
            {props.contentList.map((item, index) => (
                <Typography variant='body1' key={index}> {item} </Typography>
            ))}
        </Box>
        // Flex Variation
        
        // <Box
        //     sx={{
        //         width: props.width,
        //         display: 'flex',
        //         flexDirection: 'row',
        //         flexWrap: 'wrap',
        //         columnGap: '50px'
        //     }}
        // >
        //     {props.contentList.map((item, index) => (
        //         <Typography variant='body1' key={index}> {item} </Typography>
        //     ))}
        // </Box>
    )
}