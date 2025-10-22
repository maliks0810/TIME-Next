import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar, LocalizationProvider } from '@mui/x-date-pickers';
import { Dayjs } from 'dayjs';

// Summary:
// - Wrapper around MUI-X Calendar component using DayJs
// - Displays Day/Month/Year and allows the user to optionally use the callback property to store the selection in a state and use in their code if necessary
// - Converts the DayJs format used by the MUI component to a standard JavaScript Date format so it can be used without importing anything
//
// Usage:
// - To just display the calendar:
//      - Import it like any other component: import { Calendar } from '@platform/ui';
//      - Call it like any other component: <Calendar />
// - To use the optional callback:
//      - In your component create a state to hold the data: const [ date, setDate ] = useState<Date>();
//      - Call the Calendar component using the prop callback: <Calendar onSelect={(date) => setDate(date)}/> */}
//      - The data in "date" can now be used anywhere within the component with the type Date
export const TcWCalendar = (props: { onSelect?: (date: Date) => void }) => {

    const handleDateSelect = (date: Dayjs | null) => {
        if(date !== null && props.onSelect){
            const jsDate = date.toDate()
            props.onSelect(jsDate);
        }
    }

    return(
    
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateCalendar sx={{ height: 'fit-content', width: 'fit-content',padding: 0, margin: 0 }} onChange={(newDate) => handleDateSelect(newDate)}/>
        </LocalizationProvider>
    );
}