import PowerBIReport from '../components/PowerBIReport';
import { useLocation } from 'react-router-dom';

export default function TracerPage() {
    const location = useLocation();

    const segments = location.pathname.split('/');
    const reportName = segments[3].replaceAll('%20',' ');
    const subTitle = segments[4].replaceAll('%20',' ');
    const workspaceId = segments[5];
    const reportId = segments[6];

    const userRole: string = "Viewer";

  return (
    <div>
      <PowerBIReport workspaceId={workspaceId} reportId={reportId} userRole={userRole} title={reportName} subtitle={subTitle} />
    </div>
  );
};