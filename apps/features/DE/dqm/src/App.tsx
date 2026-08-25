import DqMonitorPage from './pages/DqMonitorPage';
import { CurrentUserProvider } from './hooks/use-current-dm-user';
import { useUserInfo } from '@platform/utils';
/* your feature app root */
/*.dqm-root {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}
*/
// App.tsx
export default function App() {
    const userInfo = useUserInfo();

  return (
    <div style={{ width: "100%", paddingTop: "5px", paddingBottom: "10px",  paddingLeft: "0px",paddingRight: "0px",
          display: "flex", flexDirection: "column", flex: "1 1 auto", minHeight: 0 }}>
      <CurrentUserProvider value={userInfo?.name ?? ""}>
      <DqMonitorPage/>
      </CurrentUserProvider>
    </div>
  );
}

