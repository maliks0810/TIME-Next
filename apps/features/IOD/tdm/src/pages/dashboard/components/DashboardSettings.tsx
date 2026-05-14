import React, { Dispatch, SetStateAction, useState } from 'react';
import { Box, Menu, MenuItem, Switch, Button } from '@mui/material';
import { Settings } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { clearDashboardGridFilters } from '../lib/DashboardSearchParameters';

type DashboardSettingsProps = {
  setAreSecurityRequestStatsVisible: Dispatch<SetStateAction<boolean>>;
}

const DashboardSettings: React.FC<DashboardSettingsProps> = ({setAreSecurityRequestStatsVisible}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const areDashboardSettingsOpen = Boolean(anchorEl);
  const [securityRequestStatsSwitchChecked, setSecurityRequestStatsSwitchChecked] = useState(false);
  const navigate = useNavigate();

  const handleSettingsMenuClose = () => {
    setAnchorEl(null);
    document.body.classList.remove('body-disable-scroll');
  };

  const handleSettingsClick = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    setAnchorEl(e.currentTarget);
    document.body.classList.add('body-disable-scroll');
  };

  const handleShowStatsOnChange = (checked: boolean) => {
    setSecurityRequestStatsSwitchChecked(checked);
    setAreSecurityRequestStatsVisible(checked);
  };

  const handleItemClick = (event: React.MouseEvent<HTMLLIElement>) => {
    if(event.currentTarget.innerText === 'Clear Filters')
    {
      clearDashboardGridFilters();
      navigate('/iod/tdm/*');
    }
  };
  
  return (
    <Box>
      <Button
        id='dashboardSettingsButton'
        type='button'
        aria-controls={areDashboardSettingsOpen ? 'dashboard-settings-menu' : undefined}
        aria-expanded={areDashboardSettingsOpen ? 'true' : undefined}
        aria-haspopup='true'
        onClick={handleSettingsClick}>
          <Settings/>
      </Button>
      <Box>
        <Menu
          id='dashboardSettingsMenu'
          anchorEl={anchorEl}
          open={areDashboardSettingsOpen}
          onClose={handleSettingsMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MenuItem>
            Show Stats
            <Switch
              checked={securityRequestStatsSwitchChecked}
              onChange={(e) => handleShowStatsOnChange(e.target.checked)}/>
          </MenuItem>
          <MenuItem onClick={handleItemClick}>
            Clear Filters
          </MenuItem>  
        </Menu>
      </Box>
    </Box>
  )
}

export default DashboardSettings;