// import { TcwCard } from "@platform/ui";
// import { Box, Chip, Typography } from '@mui/material';
// import snowflake from '../assets/snowflake.png';
// import { useGenericDataContext, useUpdateGenericDataContext } from "@platform/utils";
// import { Calendar } from '@platform/ui';
// import { Axios } from '@platform/utils';
// import { useState } from 'react';
//import { TcwAdjustableGrid } from '@platform/ui';
// import { useEffect } from 'react';
// import { TcwVerticalList, VerticalListContent } from '@platform/ui';
import '../App.scss';

const HomePage: React.FC = () => {

  // const genericData = useGenericDataContext();
  // const updateGenericData = useUpdateGenericDataContext();

  
  // const [ date, setDate ] = useState<Date>();

  // Sample of how to use Axios from @platform/utils
  // const axios = new Axios();

  // useEffect(() => {
  //   const fetchUsers = async () => {
  //     try {
  //       const response = await axios.get('https://jsonplaceholder.typicode.com/users');
  //       console.log(response)
  //     } catch (err) {
  //       console.log(err)
  //     }
  //   }

  //   fetchUsers()
  // })

  // const todoListItems: VerticalListContent[] = [
  //   {
  //     task: 'Present Generalist Report to John Smith',
  //     assigner: 'Tom Marks',
  //     dateAssigned: new Date(),
  //     completed: false
  //   },
  //   {
  //     task: 'Generate Atlas Report to Elliot Jones',
  //     assigner: 'Tom Marks',
  //     dateAssigned: new Date(),
  //     completed: true
  //   },
  //   {
  //     task: 'Lorem ipsum dolores nonummy',
  //     assigner: 'Tom Marks',
  //     dateAssigned: new Date(),
  //     completed: false
  //   },
  // ]
  
  return (
    <div className="dashboard-container">
      HomePage

    {/* <TcwVerticalList contentList={todoListItems} width={'375px'} /> */}

    {/* <TcwAdjustableGrid /> */}
    {/* Put in shared components here  */}

        {/* <TcwCard title={'Top Performers Year 2025'} height={'fit-content'} width={'fit-content'} titleSize='22px' avatarMuiIcon='StarBorder'>
          <Box sx={{display: 'flex', flexDirection: 'row', columnGap: '20px'}}>
            <TcwCard title={'Wealth Portfolio ABC123'} height={'135px'} avatarCustom={snowflake} >
              <Box sx={{height: '40px', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly'}}>
                <Typography variant="h4" fontSize={'24px'}> 598.91 </Typography>
                <Chip label='-0.02%' sx={{height: '40px', width: '70px', borderRadius: '30px'}} variant="outlined" />
              </Box>
            </TcwCard>

            <TcwCard title={'Wealth Portfolio DEF456'} height={'135px'} avatarCustom={snowflake}>
              <Box sx={{height: '40px', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly'}}>
                <Typography variant="h4" fontSize={'24px'}> 621.23 </Typography>
                <Chip label='1.93%' sx={{height: '40px', width: '70px', borderRadius: '30px'}} variant="outlined" />
              </Box>
            </TcwCard>

            <button onClick={() => console.log(genericData.data)}> View Data </button>
            <button onClick={() => updateGenericData({data: {
              name: 'test user',
              date: 'Sept 16',
              amount: 1235,
              projects: [{name: 'TIME', language: 'React TypeScript', team: 'Platform Engineering'}],
            }})}> Update Data</button>
          </Box>
        </TcwCard> */}

        {/* With Optional Callback to store date in state */}
        {/* { date && <p> Date Selected: {date?.toDateString()}</p>}
        <Calendar onSelect={(date) => setDate(date)}/> */}

        {/* Without optional callback to store date in state */}
        {/* <Calendar /> */}

    </div>
  )
}

export default HomePage;