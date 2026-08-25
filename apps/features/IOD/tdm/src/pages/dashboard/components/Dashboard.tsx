import React, { useCallback, useState, ChangeEvent, KeyboardEvent, useEffect, useRef } from 'react';
import DashboardSettings from './DashboardSettings';
import DashboardChart from './DashboardChart';
import DashboardGrid from './DashboardGrid';
import DashboardRequestDetails from './DashboardRequestDetails';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Card, CardContent, CardMedia, Drawer, Grid, IconButton, InputAdornment, TextField, Typography } from '@mui/material';
import { Clear, Search } from '@mui/icons-material';
import { DateRangeBox } from 'devextreme-react/date-range-box'
import { IDashboardSecuritySetupRequest, IDashboardStats } from '../lib/DashboardSecuritySetupRequest'
import { getDefaultDashboardSearchParameters, IDashboardSearchParameters, updateDashboardSearchParameter } from '../lib/DashboardSearchParameters';
import { getSecurityRequestsDashboard } from '../../../services/DashboardService';
import { useDashboardStore } from '../../../stores/useDashboardStore';
import { useReferenceData } from '../../../hooks/useReferenceData';
import { ReferenceDataFieldKey } from '../../security-setup/lib/types/referenceDataTypes';
import { useVisibilityChange } from '../../../hooks/useVisibilityChange';
import { useIdentity } from '../../../hooks/useIdentity';
import { useInterval } from '../../../hooks/useInterval';
import { getCurrentLocalTime } from '../../../utils/DateTimeHelper';
import { DASHBOARD_POLLING_INTERVAL } from '../../../constants/environmentConstants';
import { useSecuritySetupNotifications } from '../../../hooks/useSecuritySetupNotifications';
import '../lib/dashboard.scss';
import { DataGridRef } from 'devextreme-react/cjs/data-grid';
import { useUserInfo } from '@platform/utils';

const Dashboard: React.FC = () => {
  const [isRequestDetailsOpen, setIsRequestDetailsOpen] = useState(false);
  const [selectedSecurityRequest, setSelectedSecurityRequest] = useState<IDashboardSecuritySetupRequest>();
  const [areSecurityRequestStatsVisible, setAreSecurityRequestStatsVisible] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [startDate, setStartDate] = useState<Date | null | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | null | undefined>(new Date());
  const [searchParameters, setSearchParameters] = useState<IDashboardSearchParameters>(getDefaultDashboardSearchParameters);
  const [securityRequestsData, setSecurityRequestsData] = useState<IDashboardSecuritySetupRequest[]>();
  const [dashboardStats, setDashboardStats] = useState<IDashboardStats>();
  const [pollingInterval, setPollingInterval] = useState<number | null>(DASHBOARD_POLLING_INTERVAL)
  const [lastRefreshed, setLastRefreshed] = useState<string>("");
  const [isPolling, setIsPolling] = useState<boolean>(false);
  const isPageVisible = useVisibilityChange();
  const isDmAnalystDropdownOpen = useDashboardStore(s => s.isDmAnalystDropdownOpen);
  const setDmAnalystAssignments = useDashboardStore(s => s.setDmAnalystAssignments)
  const navigate = useNavigate();
  const { name: currentUser } = useUserInfo();
  const dashboardGridRef = useRef<DataGridRef<IDashboardSecuritySetupRequest, number>>(null);

  useSecuritySetupNotifications(securityRequestsData);

  // Server state hooks — stay as hooks, not in Zustand
  const { data: referenceData } =
    useReferenceData();
  const dmAnalystOptions = referenceData?.byKey[ReferenceDataFieldKey.DmAnalyst]?.fieldDropdownValues ?? [];

  // Set user auth permissions to Zustand store
  useIdentity();

  // poll data when page is visible
  useEffect(() => {
    // pause polling when user had DM Analyst dropdown open
    if (isPageVisible && !isDmAnalystDropdownOpen) {
      setPollingInterval(DASHBOARD_POLLING_INTERVAL);
    }
    else {
      setPollingInterval(null);
    }
  }, [isPageVisible, isDmAnalystDropdownOpen]);

  // poll data in intervals
  useInterval(() => {
    if (!isPolling) {
      loadData(searchParameters);
    }
  }, pollingInterval);

  useEffect(() => {
    setSearchValue(searchParameters.searchTerm);
    setStartDate(searchParameters.startDate);
    setEndDate(searchParameters.endDate);
    loadData(searchParameters);
  }, [searchParameters]);

  const loadData = useCallback(async (parameters: IDashboardSearchParameters) => {
    try {
      setIsPolling(true);
      const data = await getSecurityRequestsDashboard(parameters);
      setSecurityRequestsData(data.securityRequests);
      setDashboardStats(data.dashboardStats)
      setDmAnalystAssignments(
        (data.securityRequests ?? []).map(r => ({ id: r.id, email: r.dmAnalystEmail })),
      )

      const currentTime = getCurrentLocalTime();
      setLastRefreshed(currentTime);
    }
    catch {

    }
    finally {
      setIsPolling(false);
    }
  }, [searchParameters, setSecurityRequestsData, setLastRefreshed, setIsPolling, setDmAnalystAssignments]);

  const handleClearGridFilters = () => {
    if (dashboardGridRef.current) {
      const dashboardGridInstance = dashboardGridRef.current.instance();
      if (dashboardGridInstance) {
        dashboardGridInstance.clearFilter();
        dashboardGridInstance.clearSorting();
        dashboardGridInstance.clearSelection();
        dashboardGridInstance.columnOption('createdDate', 'sortOrder', 'desc')
      }
    }
  }

  const handleNewSecurityRequestOnClick = () => {
    navigate('/iod/tdm/security-setup');
  }

  const handleSearch = useCallback(async () => {
    const currentSearchParameters: IDashboardSearchParameters = {
      searchTerm: searchValue,
      startDate: startDate,
      endDate: endDate,
    };

    setSearchParameters(currentSearchParameters);
    await loadData(currentSearchParameters);

  }, [setSearchParameters, searchValue, startDate, endDate]);

  const handleSearchClear = useCallback(async () => {
    setSearchValue('');
    updateDashboardSearchParameter({ searchTerm: '' });

    await handleSearch();
  }, [setSearchValue]);

  const handleSearchTextFieldOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    updateDashboardSearchParameter({ searchTerm: e.target.value });
  };

  const handleStartDateChange = useCallback((value: string | number | Date | null) => {
    setStartDate(null);
    let newStartDate: Date | null = null
    if (value) {
      if (value instanceof Date) {
        newStartDate = value;
      }
      if (typeof value === 'string' || typeof value === 'number') {
        newStartDate = new Date(value);
      }
    }
    setStartDate(newStartDate);
    updateDashboardSearchParameter({ startDate: newStartDate });
  }, [setStartDate]);

  const handleEndDateChange = useCallback((value: string | number | Date | null) => {
    setEndDate(null);
    let newEndDate: Date | null = null
    if (value) {
      if (value instanceof Date) {
        newEndDate = value;
      }
      if (typeof value === 'string' || typeof value === 'number') {
        newEndDate = new Date(value);
      }
    }
    setEndDate(newEndDate);
    updateDashboardSearchParameter({ endDate: newEndDate });
  }, [setEndDate]);

  const handleSearchTextFieldKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleSetRequestDetailsOpen = useCallback((isOpen: boolean) => () => {
    setIsRequestDetailsOpen(isOpen);
  }, [setIsRequestDetailsOpen]);

  return (
    <Box sx={{ p: '2em', overflow: 'hidden' }}>
      <Card sx={{ width: '100%', overflow: 'hidden' }}>
        <CardMedia
          component="div"
          className='dashboard-card-media'>
        </CardMedia>
        <CardContent sx={{ padding: '2em', overflow: 'hidden' }}>
          < Grid container display='flex' flexDirection='column' spacing={2} >

            {/* Title Section */}
            <Grid container display='flex' flexDirection='row' height='60px' >
              <Grid flex={1}>
                <Typography variant="h5">
                  Security Setup Dashboard
                </Typography>
                <Typography variant="subtitle2" sx={{ color: 'gray' }}>
                  Manage Security Setup Requests - Last Refreshed: {lastRefreshed}
                </Typography>
              </Grid>
              <Grid flex={1} display='flex' justifyContent='flex-end'>
                <DashboardSettings
                  setAreSecurityRequestStatsVisible={setAreSecurityRequestStatsVisible}
                  clearGridFilters={handleClearGridFilters}
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
                        <InputAdornment position='start'>
                          <Search />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position='end'>
                          <IconButton
                            onClick={handleSearchClear}>
                            <Clear />
                          </IconButton>
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
                      startDate={startDate}
                      endDate={endDate}
                      onStartDateChange={handleStartDateChange}
                      onEndDateChange={handleEndDateChange}
                    />
                  </Grid>
                  <Grid flex={1} display='flex'>
                    <Button
                      onClick={handleSearch}
                      className='tcw-button'
                      variant='contained'
                      sx={{ pl: '4em', pr: '4em' }}>
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
                    <CardContent sx={{ height: '90%', textAlign: 'center' }}>
                      <Typography variant="subtitle1">
                        Total Requests
                      </Typography>
                      <Grid container display={'flex'} height={'100%'} alignContent={'center'}>
                        <Typography variant="h2" width={'100%'}>
                          <b>{dashboardStats?.totalRequests}</b>
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
                    <CardContent sx={{ height: '90%', textAlign: 'center' }}>
                      <Typography variant="subtitle1">
                        Average Setup Time
                      </Typography>
                      <Grid container height={'100%'} alignContent={'center'} justifyContent={'center'}>
                        <Grid>
                          <Typography variant='h2'>
                            <b>{dashboardStats?.averageSetupTime ?? 0}</b>
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
                          chartData={dashboardStats?.securitySetupStatusData}
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
                          chartData={dashboardStats?.riskAnalyticsStatusData}
                        />
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}

            {/* DataGrid Section */}
            <Grid sx={{ overflow: 'hidden', width: '100%' }}>
              <DashboardGrid
                dashboardGridRef={dashboardGridRef}
                securityRequestsData={securityRequestsData}
                setSelectedSecurityRequest={setSelectedSecurityRequest}
                setIsRequestDetailsOpen={setIsRequestDetailsOpen}
                dmAnalystOptions={dmAnalystOptions}
                currentUser={currentUser || ''}
              />
            </Grid>
          </Grid>
        </CardContent >
      </Card >

      {/* Request Details Flyout */}
      <>
        <Drawer
          open={isRequestDetailsOpen}
          onClose={handleSetRequestDetailsOpen(false)}
          anchor='right'
          disablePortal={true}
          hideBackdrop={false}
          slotProps={{
            backdrop: {
              sx: { backgroundColor: 'transparent' }
            }
          }}

        >
          <DashboardRequestDetails
            securityRequest={selectedSecurityRequest}
            setIsRequestDetailsOpen={setIsRequestDetailsOpen}
            referenceData={referenceData}
          />
        </Drawer>
      </>
    </Box >
  )
}

export default Dashboard;
