import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function TdmPage() {
    const navigate = useNavigate();

    const handleSecuritySetupClick = () => {
        navigate('/iod/tdm/security-setup')
    }
    return (
        <>
            <div>TCW Data Management</div>
            <Button
                onClick={handleSecuritySetupClick}
            >
                Security Setup Wizard
            </Button>
        </>
    )
}
