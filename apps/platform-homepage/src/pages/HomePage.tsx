// import { TcwCard } from "@platform/ui";
// import { Box, Chip, Typography } from '@mui/material';
// import snowflake from '../assets/snowflake.png';
import { useGenericDataContext, useUpdateGenericDataContext } from "@platform/utils";
// import { Calendar } from '@platform/ui';
// import { Axios } from '@platform/utils';
// import { useState } from 'react';
// import { TcwAdjustableGrid } from '@platform/ui';
// import { useEffect } from 'react';
// import { TcwVerticalList, VerticalListContent } from '@platform/ui';
// import { TcwHorizontalList } from '@platform/ui';
import '../App.scss';
//import { TcwAdjustableGrid } from '@platform/ui';
// import { tlog } from '@platform/utils';
// import { useEffect } from 'react';

const HomePage: React.FC = () => {
  const genericData = useGenericDataContext();
  const updateGenericData = useUpdateGenericDataContext();

  
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
  
  // const testLog = () => {
  //   tlog.warn('testing client logging warn');
  //   tlog.info('testing client logging info');
  //   tlog.debug('testing client logging debug');
  //   tlog.error(new Error('error log'), 'testing client logs', 'testLog()', '123', {key: 'value'});
  //   tlog.fatal('testing client logging fatal');
  // }

  return (
    <div className="dashboard-container">
      HomePage

      {/* Working */}
      <button onClick={() => updateGenericData('test' as any)}> SET </button>
      <button onClick={() => updateGenericData({data: 'testing'})}> SET WITH DATA </button>
      <button onClick={() => updateGenericData({hello: '123'} as any)}> SET WITH ANY OBJ </button>
      <button onClick={() => updateGenericData({hello: {test: { again: '123'}}} as any)}> SET NESTED </button>

      {/* Runs function but does not save anything to state */}
      <button onClick={() => updateGenericData(console.log('test') as any)}> SET WITH FUN </button>
      {/* Syntax Err */}
      {/* <button onClick={() => updateGenericData(() => console.log('test') as any)}> SET WITH FUN </button> */}


      <button onClick={() => console.log(genericData)}> GET </button>

    {/* <TcwVerticalList contentList={todoListItems} width={'375px'} /> */}

    {/* <TcwAdjustableGrid /> */}
      {/* <button onClick={() => testLog()}> TEST LOG </button> */}
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

        {/* <TcwAdjustableGrid /> */}

        {/* With Optional Callback to store date in state */}
        {/* { date && <p> Date Selected: {date?.toDateString()}</p>}
        <Calendar onSelect={(date) => setDate(date)}/> */}

        {/* Without optional callback to store date in state */}
        {/* <Calendar /> */}
          
        {/* <TcwHorizontalList width={'100%'} contentList={[ '12 Tasks Waiting', '8 Tasks Waiting', '21 Compliance Updates', '18 New Workflows', '12 Reports', '$500M AUM', '438 Total Accounts']}/> */}
    </div>
  )
}

export default HomePage;