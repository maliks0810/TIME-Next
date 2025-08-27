import { TcwCard } from "../../../../packages/ui/src/components/Card/TcwCard";
import { Box } from '@mui/material';

const HomePage: React.FC = () => {
  return (
    <div className="dashboard-container">
    {/* Put in shared components here  */}

        <TcwCard title={'Top Performers'} width={1/2} iconPath="src/assets/snowflake-color.png">
          <Box sx={{display: 'flex', flexDirection: 'column'}}>
            <p> TEST </p>
          </Box>
        </TcwCard>

    </div>
  )
}

export default HomePage;