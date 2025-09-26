import { Box, Typography } from "@mui/material"

export type VerticalListContent = {
    task: string,
    assigner: string,
    dateAssigned: Date
}

export const TcwVerticalList = (props: { contentList: VerticalListContent[], width: string | number, height: string | number }) => {

    const date = new Date();

    return(
        <Box
            sx={{
                border: '1px solid red',
                width: props.width,
                height: props.height
            }}
        >
            <Box
                sx={{
                    border: '1px solid red',
                    width: '100%',
                    padding: '10px'
                }}
            > 
                <Typography variant='h5'> {date.getMonth()}/{date.getDate()} To-Do List</Typography>
            </Box>
        </Box>
    )
}