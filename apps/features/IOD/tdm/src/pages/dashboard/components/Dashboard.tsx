import React, { useCallback, useState, ChangeEvent, KeyboardEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Card, CardContent, CardMedia, Drawer, Grid, InputAdornment, TextField, Typography } from '@mui/material';
import { Search } from '@mui/icons-material';
import { DateRangeBox } from 'devextreme-react/date-range-box'
import DashboardSettings from './DashboardSettings';
import DashboardChart from './DashboardChart';
import DashboardGrid from './DashboardGrid';
import DashboardRequestDetails from './DashboardRequestDetails';
import { setupStatusData, riskManagementStatusData } from '../lib/ChartData';
import { ISecurityRequest } from '../lib/SecurityRequest'
import { getSecurityRequestsDashboard } from '../../../services/DashboardService';
import '../lib/dashboard.scss';

const Dashboard: React.FC = () => {
  const [isRequestDetailsOpen, setIsRequestDetailsOpen] = useState(false);
  const [selectedSecurityRequest, setSelectedSecurityRequest] = useState<ISecurityRequest>();
  const [areSecurityRequestStatsVisible, setAreSecurityRequestStatsVisible] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [startDate, setStartDate] = useState<Date | null>();
  const [endDate, setEndDate] = useState<Date | null>();
  const [securityRequestsData, setSecurityRequestsData] = useState<ISecurityRequest[]>();
  const [filteredSecurityRequestsData, setFilteredSecurityRequestsData] = useState<ISecurityRequest[]>();
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      const data = await getSecurityRequestsDashboard();
      setSecurityRequestsData(data);
      // initialize filtered data with original data
      setFilteredSecurityRequestsData(data);
    };
    
    loadData();
  }, [setSecurityRequestsData, setFilteredSecurityRequestsData]);

  const handleNewSecurityRequestOnClick = () => {
    navigate('iod/tdm/security-setup');
  }

  const handleSearchTextFieldOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const handleStartDateChange = useCallback((value: string | number | Date | null) => {
    setStartDate(null);
    if (value) {
      const newStartDate = new Date(value);
      setStartDate(newStartDate);
    }
  }, [setStartDate]);

  const handleEndDateChange = useCallback((value: string | number | Date | null) => {
    setEndDate(null);
    if (value) {
      const newEndDate = new Date(value);
      setEndDate(newEndDate);
    }
  }, [setEndDate]);

  const handleSearchOnClick = useCallback(() => {
    const filteredData = getFilterSecurityRequests()      
    setFilteredSecurityRequestsData(filteredData);
  }, [searchValue, startDate, endDate, setFilteredSecurityRequestsData]);

  const getFilterSecurityRequests = useCallback(() => {
    if (securityRequestsData) {
      let filteredData = securityRequestsData;
      if (searchValue &&
          searchValue.trim() !== '') {
        filteredData = filteredData.filter(s => {
          return s.identifier.includes(searchValue);
        });
      }

      if (startDate && endDate) {
        filteredData = filteredData.filter(s => {
          return s.createdDate >= startDate && s.createdDate <= endDate;
        });
      }
      
      return filteredData;
    }

    return securityRequestsData;
  }, [searchValue, startDate, endDate]);

  const handleSearchTextFieldKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearchOnClick();
    }
  };

  const handleSetRequestDetailsOpen = useCallback((isOpen: boolean) => () => {
    setIsRequestDetailsOpen(isOpen);
  }, [setIsRequestDetailsOpen]);

  return (
    <Box sx={{p:'2em'}}>
      <Card sx={{width:'100%'}}>
        <CardMedia
          component="div"
          className='dashboard-card-media'>
        </CardMedia>
        <CardContent sx={{padding:'2em'}}>
          <Grid container display='flex' flexDirection='column' spacing={2}>
            
            {/* Title Section */}
            <Grid container display='flex' flexDirection='row' height='60px'>
              <Grid flex={1}>
                <Typography variant="h5">
                  Security Setup Dashboard
                </Typography>
                <Typography variant="subtitle2">
                  Manage Security Setup Requests
                </Typography>
              </Grid>
              <Grid flex={1} display='flex' justifyContent='flex-end'>
                <DashboardSettings
                  setAreSecurityRequestStatsVisible={setAreSecurityRequestStatsVisible}
                />
              </Grid>
            </Grid>

            {/* Search Section */}
            <Grid container flexDirection='row' columns={2} spacing={2}>
              <Grid flex={1}>
                <TextField
                  value={searchValue}
                  onChange={handleSearchTextFieldOnChange}
                  onKeyDown={handleSearchTextFieldKeyDown}
                  className='dashboard-search-textfield'
                  placeholder="Search Security ..."
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search/>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Grid>
              <Grid flex={1}>
                <Grid container flexDirection='row' spacing={2} justifyContent={'space-between'} height={'55px'}>
                  <Grid display='flex'>
                    <DateRangeBox
                      className='dashboard-daterangebox'
                      width={'250px'}
                      onStartDateChange={handleStartDateChange}
                      onEndDateChange={handleEndDateChange}
                    />
                  </Grid>
                  <Grid flex={1} display='flex'>
                    <Button
                      onClick={handleSearchOnClick}
                      className='tcw-button'
                      variant='contained'
                      sx={{pl:'4em', pr:'4em'}}>
                        Search
                    </Button>
                  </Grid>
                  <Grid flex={1} display='flex' justifyContent='flex-end'>
                    <Button
                      className='tcw-button'
                      variant='contained'
                      onClick={handleNewSecurityRequestOnClick}>
                        + New Security Request
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            
            {/* Stats Section */}
            {areSecurityRequestStatsVisible && (
            <Grid container display='flex' flexDirection='row' columns={4} spacing={2}>
              <Grid flex={1}>
                <Card elevation={0} className='dashboard-card'>
                  <CardMedia
                    component="div"
                    className='dashboard-card-media'>
                  </CardMedia>
                  <CardContent sx={{height:'90%', textAlign:'center'}}>
                    <Typography variant="subtitle1">
                        Total Requests
                      </Typography>
                    <Grid container display={'flex'} height={'100%'} alignContent={'center'}>
                      <Typography variant="h2" width={'100%'}>
                        <b>16</b>
                      </Typography>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
              <Grid flex={1}>
                <Card elevation={0} className='dashboard-card'>
                  <CardMedia
                    component="div"
                    className='dashboard-card-media'>
                  </CardMedia>
                  <CardContent sx={{height:'90%', textAlign:'center'}}>
                    <Typography variant="subtitle1">
                        Average Setup Time
                    </Typography>
                    <Grid container height={'100%'} alignContent={'center'} justifyContent={'center'}>
                      <Grid>
                        <Typography variant='h2'>
                          <b>20</b>
                        </Typography>
                      </Grid>
                      <Grid>
                        <Typography variant='h5' height={'100%'} alignContent={'flex-end'} lineHeight={2}>
                          min
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
              <Grid flex={1}>
                <Card elevation={0} className='dashboard-card'>
                  <CardMedia
                    component="div"
                    className='dashboard-card-media'>
                  </CardMedia>
                  <CardContent>
                    <Grid display='flex' flexDirection='column' textAlign='center'>
                      <Typography variant="subtitle1" flex={1}>
                        Setup Status
                      </Typography>
                      <DashboardChart
                        chartData={setupStatusData}
                      />
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
              <Grid flex={1}>
                <Card elevation={0} className='dashboard-card'>
                  <CardMedia
                    component="div"
                    className='dashboard-card-media'>
                  </CardMedia>
                  <CardContent>
                    <Grid display='flex' flexDirection='column' textAlign='center'>
                      <Typography variant="subtitle1" flex={1}>
                        Risk Management Status
                      </Typography>
                      <DashboardChart
                        chartData={riskManagementStatusData}
                      />
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            )}

            {/* DataGrid Section */}
            <Grid>
              <DashboardGrid 
                securityRequestsData={filteredSecurityRequestsData}
                setSelectedSecurityRequest={setSelectedSecurityRequest}
                setIsRequestDetailsOpen={setIsRequestDetailsOpen}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      {/* Request Details Flyout */}
      <Drawer
        open={isRequestDetailsOpen}
        onClose={handleSetRequestDetailsOpen(false)}
        variant='persistent'
        anchor='right'
        disablePortal={true}
        hideBackdrop={true}
      >
        <DashboardRequestDetails
          securityRequest={selectedSecurityRequest}
          setIsRequestDetailsOpen={setIsRequestDetailsOpen}
        />
      </Drawer>
    </Box>
  )
}

export default Dashboard;