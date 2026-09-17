import { CircularProgress, Alert, Button } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { useIdentity } from '../hooks/useIdentity';
import { useIdentityStore } from '../stores/useIdentityStore';

export default function TdmLayout() {
  const { error } = useIdentity();
  const isIdentityLoaded = useIdentityStore((s) => s.isIdentityLoaded);

  if (error) {
    return (
      <div style={{ padding: '40px' }}>
        <Alert severity="error">
          Failed to load user identity: {error.message}
          <Button onClick={() => window.location.reload()} style={{ marginLeft: '16px' }}>
            Retry
          </Button>
        </Alert>
      </div>
    );
  }

  if (!isIdentityLoaded) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </div>
    );
  }

  return <Outlet />;
}
