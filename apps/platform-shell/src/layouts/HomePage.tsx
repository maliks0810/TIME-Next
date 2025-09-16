import { TcwCard } from "@platform/ui";
import { Box, Chip, Typography } from '@mui/material';
import '../App.scss';
import snowflake from '../assets/snowflake.png';
import { useGenericDataContext, useUpdateGenericDataContext } from "@platform/utils";


const HomePage: React.FC = () => {

  const genericData = useGenericDataContext();
  const updateGenericData = useUpdateGenericDataContext();

  return (
    <div className="dashboard-container">
    {/* Put in shared components here  */}

        <TcwCard title={'Top Performers Year 2025'} height={'fit-content'} width={'fit-content'} titleSize='22px' avatarMuiIcon='StarBorder'>
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
        </TcwCard>

    </div>
  )
}

export default HomePage;