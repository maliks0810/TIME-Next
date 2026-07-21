import React, { Dispatch, SetStateAction, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom'
import { Box, Grid, Menu, MenuItem } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { DataGrid } from 'devextreme-react';
import { Column, DataGridRef, DataGridTypes, HeaderFilter, Pager, Paging, Scrolling, Selection, StateStoring } from 'devextreme-react/data-grid';
import { IDashboardSecuritySetupRequest } from '../lib/DashboardSecuritySetupRequest'
import {
  SetupStatusesRecord,
  RiskAnalyticsStatusesRecord,
  ReadyForTradingStatusesRecord,
  EuSecuritizationStatusesRecord,
  ErisaStatusesRecord
} from '../lib/DashboardSecuritySetupRequestStatuses';
import { IReferenceDataKeyValue } from '../../security-setup/lib/types/referenceDataTypes';
import { useDashboardStore } from '../../../stores/useDashboardStore';
import { useIdentityStore } from '../../../stores/useIdentityStore';
import { setDmAssignment } from '../../../services/DashboardService';
import '../lib/dashboard.scss';

type DataGridColumnState = { visibleIndex?: number } & Record<string, unknown>;

type DataGridState = { columns?: DataGridColumnState[] } & Record<string, unknown>;

type DMAnalystMenuState = { requestId: number; position: { top: number; left: number } };

type DashboardGridProps = {
  dashboardGridRef: React.Ref<DataGridRef<IDashboardSecuritySetupRequest, number>>;
  securityRequestsData: IDashboardSecuritySetupRequest[] | undefined;
  setSelectedSecurityRequest: Dispatch<SetStateAction<IDashboardSecuritySetupRequest | undefined>>;
  setIsRequestDetailsOpen: Dispatch<SetStateAction<boolean>>;
  dmAnalystOptions: IReferenceDataKeyValue[];
  currentUser: string;
}

const DmAnalystCell: React.FC<{
  requestId: number;
  options: IReferenceDataKeyValue[];
  onOpen: (requestId: number, position: { top: number; left: number }) => void;
  allowExplicitAssignment: boolean;
}> = ({ requestId, options, onOpen, allowExplicitAssignment }) => {

  // selector scoped to this row's assignment so ONLY THIS cell re-renders on change
  const selectedEmail = useDashboardStore(s => s.dmAnalystAssignments[requestId]);
  const selectedAnalyst = options.find((a) => a.fieldDropdownValue === selectedEmail);

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();

    // attach dropdown to bottom of clicked element
    const rect = e.currentTarget.getBoundingClientRect();
    onOpen(requestId, { top: rect.bottom, left: rect.left });
  };

  if (!allowExplicitAssignment) {
    return (
      <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%'
      }}
    >
      <Box
        component='span'
        sx={{
          flex: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}
      >
        {selectedAnalyst?.fieldDropdownDescription || ''}
      </Box>
    </Box>
    )
  }

  return (
    <Box
      onClick={handleClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'pointer',
        width: '100%'
      }}
    >
      <Box
        component='span'
        sx={{
          flex: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}
      >
        {selectedAnalyst?.fieldDropdownDescription || ''}
      </Box>
      <ArrowDropDownIcon />
    </Box>
  )
}

const DashboardGrid: React.FC<DashboardGridProps> = ({
  dashboardGridRef,
  securityRequestsData,
  setSelectedSecurityRequest,
  setIsRequestDetailsOpen,
  dmAnalystOptions,
  currentUser
}) => {
  const navigate = useNavigate();

  // Get user auth permissions by action
  const userAuth = useIdentityStore((s) => s.userAuth);

  const [dmAnalystMenuState, setDmAnalystMenuState] = useState<DMAnalystMenuState | null>(null);

  const dmAnalystAssignments = useDashboardStore((s) => s.dmAnalystAssignments);
  const setDmAnalyst = useDashboardStore((s) => s.setDmAnalyst);
  const setDmAnalystDropdownOpen = useDashboardStore((s) => s.setDmAnalystDropdownOpen);

  const openDmAnalystMenu = useCallback((requestId: number, position: { top: number, left: number }) => {
    setDmAnalystMenuState({ requestId, position });
    setDmAnalystDropdownOpen(true);
  }, [setDmAnalystDropdownOpen])

  const closeDmAnalystMenu = useCallback(() => {
    setDmAnalystMenuState(null);
    setDmAnalystDropdownOpen(false);
  }, [setDmAnalystDropdownOpen])

  const handleDmAnalystSelect = useCallback(async (email: string) => {
    if (!dmAnalystMenuState) {
      closeDmAnalystMenu();
      return;
    }

    const { requestId } = dmAnalystMenuState;
    const analyst = dmAnalystOptions.find((a) => a.fieldDropdownValue === email);

    const previousEmail = dmAnalystAssignments[requestId];
    setDmAnalyst(requestId, email);
    closeDmAnalystMenu();

    try {
      const { isDmAssignmentUpdated } = await setDmAssignment({
        securitySetupRequestId: requestId,
        name: analyst?.fieldDropdownDescription ?? '',
        email,
        updatedBy: currentUser
      });

      // service returns isDmAssignmentUpdated false
      if (!isDmAssignmentUpdated) {
        setDmAnalyst(requestId, previousEmail);
      }
    } catch (err) {
      setDmAnalyst(requestId, previousEmail);
      console.error('Failed to save DM analyst assignment:', err)
    }

  }, [dmAnalystMenuState, dmAnalystOptions, setDmAnalyst, closeDmAnalystMenu, currentUser])

  const cellRenderSetupStatus = (data: DataGridTypes.ColumnCellTemplateData) => {
    const status = data.value;
    const setupStatusProperties = SetupStatusesRecord[status];

    if (status && setupStatusProperties) {
      const className = 'dashboard-grid-status ' + setupStatusProperties.className;
      return (
        <Grid container justifyContent={'center'}>
          <Box className={className} whiteSpace={'normal'}>
            {setupStatusProperties.name}
          </Box>
        </Grid>
      )
    }

    return <></>;
  }

  const cellRenderRiskAnalyticsStatus = (data: DataGridTypes.ColumnCellTemplateData) => {
    const status = data.value;
    const riskAnalyticsStatusProperties = RiskAnalyticsStatusesRecord[status]

    if (status && riskAnalyticsStatusProperties) {
      const className = 'dashboard-grid-status ' + riskAnalyticsStatusProperties.className;
      return (
        <Grid container justifyContent={'center'}>
          <Box className={className} whiteSpace={'normal'}>
            {riskAnalyticsStatusProperties.name}
          </Box>
        </Grid>
      )
    }

    return <></>;
  }

  const cellRenderReadyForTrading = (data: DataGridTypes.ColumnCellTemplateData) => {
    const status = data.value;
    const readyForTradingStatusProperties = ReadyForTradingStatusesRecord[status]

    if (status && readyForTradingStatusProperties) {
      const className = 'dashboard-grid-status ' + readyForTradingStatusProperties.className;
      return (
        <Grid container justifyContent={'center'}>
          <Box className={className} whiteSpace={'normal'}>
            {readyForTradingStatusProperties.name}
          </Box>
        </Grid>
      )
    }

    return <></>;
  }

  const cellRenderEuSecuritizationStatus = (data: DataGridTypes.ColumnCellTemplateData) => {
    var status = data.value;
    if (!status) {
      status = 'Not Selected'
    }
    const euSecuritizationStatusProperties = EuSecuritizationStatusesRecord[status]

    if (status && euSecuritizationStatusProperties) {
      const className = 'dashboard-grid-status ' + euSecuritizationStatusProperties.className;
      return (
        <Grid container justifyContent={'center'}>
          <Box className={className} whiteSpace={'normal'}>
            {euSecuritizationStatusProperties.name}
          </Box>
        </Grid>
      )
    }

    return <></>;
  }

  const cellRenderErisaStatus = (data: DataGridTypes.ColumnCellTemplateData) => {
    var status = data.value;
    if (!status) {
      status = 'Not Selected'
    }
    const erisaStatusProperties = ErisaStatusesRecord[status]

    if (status && erisaStatusProperties) {
      const className = 'dashboard-grid-status ' + erisaStatusProperties.className;
      return (
        <Grid container justifyContent={'center'}>
          <Box className={className} whiteSpace={'normal'}>
            {erisaStatusProperties.name}
          </Box>
        </Grid>
      )
    }

    return <></>;
  }

  const handleGridStateSave = useCallback(
    (state: DataGridState) => {
      const customState: DataGridState = {
        ...state,
        columns: state.columns?.map(col => ({
          ...col,
          // exclude col index from state
          visibleIndex: undefined
        })),
      };

      localStorage.setItem('dashboardGridState', JSON.stringify(customState))
    },
    [],
  )

  const handleGridStateLoad = useCallback(
    (): DataGridState => {
      const saved = localStorage.getItem('dashboardGridState');

      const state: DataGridState = saved ? JSON.parse(saved) : {};

      // keep user's saved settings if exists
      const hasSavedSort = state.columns?.some(col => col.sortOrder);

      // fall back to default createdDate sort
      if (!hasSavedSort) {
        state.columns = state.columns?.length ?
          state.columns?.map((col) => {
            if (col.dataField === 'createdDate') {
              return {
                ...col,
                sortOrder: 'desc',
                sortIndex: 0
              }
            }
            return col
          }) : [{ dataField: 'createdDate', sortOrder: 'desc', sortIndex: 0 }]
      }
      return state
    },
    [],
  )

  let clickTimer: NodeJS.Timeout | null = null;

  const onRowClick = useCallback((e: DataGridTypes.RowClickEvent) => {

    // Clear previous timer to prevent single click firing
    if (clickTimer) clearTimeout(clickTimer);

    clickTimer = setTimeout(() => {
      // Execute single-click logic here
      setSelectedSecurityRequest(e.data);
      setIsRequestDetailsOpen(true);
    }, 250); // 250ms buffer

  }, [setSelectedSecurityRequest, setIsRequestDetailsOpen]);

  const cellRenderDmAnalyst = useCallback((data: DataGridTypes.ColumnCellTemplateData) => {
    return <DmAnalystCell 
      requestId={data.data.id}
      options={dmAnalystOptions}
      onOpen={openDmAnalystMenu}
      allowExplicitAssignment={userAuth?.permissionsAllowed.explicit_dm_analyst_assignment || false}
    />
  }, [dmAnalystOptions, openDmAnalystMenu])

  const handleRowDbleClick = (e: DataGridTypes.RowDblClickEvent) => {

    // Clear timer so the single click action doesn't fire
    if (clickTimer) clearTimeout(clickTimer);

    const rowId = e?.data?.id;
    navigate(`/iod/tdm/security-setup?id=${rowId}`)
  }

  const currentSelectedEmail = dmAnalystMenuState
    ? dmAnalystAssignments[dmAnalystMenuState.requestId]
    : undefined;

  if (!securityRequestsData) {
    return <></>
  }

  return (
    <>
      <DataGrid
        ref={dashboardGridRef}
        key='dashboardSecurityRequestsGrid'
        keyExpr='id'
        dataSource={securityRequestsData}
        className='dashboard-grid'
        allowColumnResizing={true}
        columnResizingMode='nextColumn'
        columnMinWidth={100}
        onRowDblClick={handleRowDbleClick}
        onRowClick={onRowClick}
        repaintChangesOnly={false}
        loadPanel={{ enabled: false }}
      >
        <StateStoring
          enabled
          type="custom"
          storageKey="dashboardGridState"
          savingTimeout={0}
          customSave={handleGridStateSave}
          customLoad={handleGridStateLoad}
        />
        <Scrolling columnRenderingMode='virtual' />
        <Selection
          mode='single'
          allowSelectAll={false}
        />
        <HeaderFilter
          visible={true}
        />
        <Column
          dataField='description'
          caption='Description'
          minWidth={175}
        />
        <Column
          dataField='tranche'
          caption='Tranche'
          minWidth={175}
        />
        <Column
          dataField='identifier'
          caption='Identifier'
          minWidth={175}
        />
        <Column
          dataField='createdDate'
          caption='Created On'
          dataType='date'
          format="MMM dd, yyyy hh:mm a"
          minWidth={175}
        />
        <Column
          dataField='createdBy'
          caption='Requested By'
          minWidth={175}
        />
        <Column
          dataField='dmAnalyst'
          caption='DM Analyst'
          alignment='center'
          minWidth={175}
          cellRender={cellRenderDmAnalyst}
        />
        <Column
          dataField='setupStatus'
          caption='Setup Status'
          alignment='center'
          width={250}
          cellRender={cellRenderSetupStatus}
        />
        <Column
          dataField='riskAnalyticsStatus'
          caption='Risk Analytics Status'
          alignment='center'
          width={250}
          cellRender={cellRenderRiskAnalyticsStatus}
        />
        <Column
          dataField='euSecuritizationStatus'
          caption='EU Securitization Status'
          alignment='center'
          width={250}
          cellRender={cellRenderEuSecuritizationStatus}
        />
        <Column
          dataField='erisaStatus'
          caption='ERISA Status'
          alignment='center'
          width={250}
          cellRender={cellRenderErisaStatus}
        />
        <Column
          dataField='readyForTradingStatus'
          caption='Ready For Trading'
          alignment='center'
          width={175}
          cellRender={cellRenderReadyForTrading}
        />
        <Paging
          enabled={true}
          defaultPageSize={10}
        />
        <Pager
          visible={true}
          showNavigationButtons={true}
          showPageSizeSelector={true}
          allowedPageSizes={[10, 20, 30]}
        />
      </DataGrid>
      <Menu
        anchorReference="anchorPosition"
        anchorPosition={dmAnalystMenuState?.position}
        open={Boolean(dmAnalystMenuState)}
        onClose={closeDmAnalystMenu}
        sx={{ zIndex: 9999 }}
      >
        {dmAnalystOptions.length === 0
          ? <MenuItem disabled>No analysts available</MenuItem>
          : dmAnalystOptions.map((analyst) => (
            <MenuItem
              key={analyst.fieldDropdownValue}
              selected={analyst.fieldDropdownValue === currentSelectedEmail}
              onClick={() => handleDmAnalystSelect(analyst.fieldDropdownValue)}
            >
              {analyst.fieldDropdownDescription}
            </MenuItem>
          ))}
      </Menu>
    </>
  )
}

export default DashboardGrid;
