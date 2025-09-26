import { Box, Checkbox, Typography } from "@mui/material"
import { TcwCard } from "@platform/ui";

export type VerticalListContent = {
    task: string,
    assigner: string,
    dateAssigned: Date,
    completed: boolean
}

export const TcwVerticalList = (props: { contentList: VerticalListContent[], width?: string | number, height?: string | number }) => {

    const date = new Date();
    const getDate = (date: Date): string => {
        return `${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()}`
    } 

    return(
        <TcwCard
            title={`${getDate(date)} To-Do List`}
            titleSize="22px"
            width={props.width}
            height={props.height}
        >
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    rowGap: '10px',
                }}
            >
                {props.contentList.map((item: VerticalListContent, index: number) => (
                    <Box 
                        key={index}
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'flex-start',
                            textDecoration: item.completed ? 'line-through' : 'none',
                        }}
                    >
                        <Checkbox checked={item.completed} />
                        <Box 
                            sx={{
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                        >
                            <Typography variant='body1'> {item.task} </Typography>
                            <Typography variant='body2'> Assigned by {item.assigner} on {getDate(item.dateAssigned)} </Typography>
                        </Box>
                    </Box>
                ))}
            </Box>
        </TcwCard>
    )
}