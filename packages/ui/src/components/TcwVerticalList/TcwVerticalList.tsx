import { Box, Typography } from "@mui/material"

export type VerticalListContent = {
    task: string,
    assigner: string,
    dateAssigned: Date,
    completed: boolean
}

export const TcwVerticalList = (props: { contentList: VerticalListContent[], width: string | number, height: string | number }) => {

    const date = new Date();
    const getDate = (date: Date): string => {
        return `${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()}`
    } 

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
                <Typography variant='h5'> {getDate(date)} To-Do List</Typography>
            </Box>

            <Box
                sx={{
                    border: '1px solid blue',
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    rowGap: '10px'
                }}
            >
                {props.contentList.map((item: VerticalListContent, index: number) => (
                    <Box 
                        key={index}
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            textDecoration: item.completed ? 'line-through' : 'none'
                        }}
                    >
                        <Typography variant='body1'> {item.task} </Typography>
                        <Typography variant='body2'> Assigned by {item.assigner} on {getDate(item.dateAssigned)} </Typography>
                    </Box>
                ))}
            </Box>
        </Box>
    )
}