import { TcwCard } from "../../../../packages/ui/src/components/Card/TcwCard";

const HomePage: React.FC = () => {
  return (
    <div className="dashboard-container">
    {/* Put in shared components here  */}

        <TcwCard title={'Top Performers'} iconPath="src/assets/snowflake-color.png">
          <div>
            {/* <h1> Testing Content H1 </h1>
            <h2> Testing Content H2 </h2>
            <p> Testing Content P</p>
            <p> Testing Content P</p> */}
          </div>
        </TcwCard>

    </div>
  )
}

export default HomePage;