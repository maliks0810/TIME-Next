import { Box, Typography } from "@mui/material"

export type VerticalListContent = {
    task: string,
    assigner: string,
    dateAssigned: Date,
    completed: boolean
}

export const TcwVerticalList = (props: { contentList: VerticalListContent[], width: string | number, height: string | number }) => {

    const date = new Date();

    return(
        <Box
            sx={{
                border: '1px solid red',
                width: props.width,
                height: props.height,
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            <Box
                sx={{
                    border: '1px solid red',
                    width: '100%',
                    padding: '10px',
                    minHeight: '50px'
                }}
            > 
                <Typography variant='h5'> {date.getMonth()}/{date.getDate()} To-Do List</Typography>
            </Box>

            <Box
                sx={{
                    border: '1px solid blue',
                    flexGrow: 1
                }}
            >

            </Box>
        </Box>
    )
}