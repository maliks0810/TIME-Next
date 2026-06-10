import React, { Dispatch, SetStateAction, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'
import { Box, Grid } from '@mui/material';
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
import '../lib/dashboard.scss';

type DataGridColumnState = { visibleIndex?: number } & Record<string, unknown>;

type DataGridState = { columns?: DataGridColumnState[] } & Record<string, unknown>;

type DashboardGridProps = {
  dashboardGridRef: React.Ref<DataGridRef<IDashboardSecuritySetupRequest, number>>;
  securityRequestsData: IDashboardSecuritySetupRequest[] | undefined;
  setSelectedSecurityRequest: Dispatch<SetStateAction<IDashboardSecuritySetupRequest | undefined>>;
  setIsRequestDetailsOpen: Dispatch<SetStateAction<boolean>>;
}

const DashboardGrid: React.FC<DashboardGridProps> = ({
  dashboardGridRef,
  securityRequestsData,
  setSelectedSecurityRequest,
  setIsRequestDetailsOpen,
}) => {

  const navigate = useNavigate();

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
    (): DataGridState | null => {
      const saved = localStorage.getItem('dashboardGridState');

      if (!saved) return null;

      const state: DataGridState = JSON.parse(saved);
      state.columns = state.columns?.map((col) => {
        if (col.dataField === 'createdDate') {
          return {
            ...col,
            sortOrder: 'desc',
            sortIndex: 0
          }
        }
        return {
          ...col,
          sortOrder: undefined,
          sortIndex: undefined
        };
      })

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

  const handleRowDbleClick = (e: DataGridTypes.RowDblClickEvent) => {

    // Clear timer so the single click action doesn't fire
    if (clickTimer) clearTimeout(clickTimer);

    const rowId = e?.data?.id;
    navigate(`/iod/tdm/security-setup?id=${rowId}`)
  }

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
    </>
  )
}

export default DashboardGrid;
