import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar, LocalizationProvider } from '@mui/x-date-pickers';
import { Box } from '@mui/material';
import { useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import './Calendar.css';
import { Typography } from '@mui/material';

export const Calendar = (props: { onSelect: (date: Date) => void }) => {

    const [ dateSelected, setDateSelected ] = useState< Dayjs | null>(dayjs());

    const handleDateSelect = (date: Dayjs | null) => {
        setDateSelected(date);
        if(date !== null){
            const jsDate = date.toDate()
            props.onSelect(jsDate);
        }
    }

    return(
        <Box sx={{ height: 'fit-content', width: 'fit-content' }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateCalendar sx={{ height: 'fit-content', padding: 0, margin: 0 }} value={dateSelected} onChange={(newDate) => handleDateSelect(newDate)}/>
            </LocalizationProvider>
            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                <Typography variant='subtitle1'> Date: {dateSelected?.format('dddd MMMM DD, YYYY').toString()}</Typography>
            </Box>
        </Box>
    );
}