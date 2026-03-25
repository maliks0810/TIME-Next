import React, { Dispatch, SetStateAction, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'
import { Box, Grid } from '@mui/material';
import { DataGrid } from 'devextreme-react';
import { Column, DataGridTypes, HeaderFilter, Pager, Paging, Selection } from 'devextreme-react/data-grid';
import { IDashboardSecuritySetupRequest } from '../lib/DashboardSecuritySetupRequest'
import {
  SetupStatusesRecord,
  RiskAnalyticsStatusesRecord,
  ReadyForTradingStatusesRecord,
  EuSecuritizationStatusesRecord,
  ErisaStatusesRecord
} from '../lib/DashboardSecuritySetupRequestStatuses';
import '../lib/dashboard.scss';

type DashboardGridProps = {
  securityRequestsData: IDashboardSecuritySetupRequest[] | undefined;
  setSelectedSecurityRequest: Dispatch<SetStateAction<IDashboardSecuritySetupRequest | undefined>>;
  setIsRequestDetailsOpen: Dispatch<SetStateAction<boolean>>;
}

const DashboardGrid: React.FC<DashboardGridProps> = ({
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
        key='dashboardSecurityRequestsGrid'
        keyExpr='id'
        dataSource={securityRequestsData}
        className='dashboard-grid'
        columnAutoWidth={false}        
        onRowDblClick={handleRowDbleClick}
        onRowClick={onRowClick}
        repaintChangesOnly={true}
      >
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
          width={'10%'}
        />
        <Column
          dataField='identifier'
          caption='Identifier'
          width={'10%'}
        />
        <Column
          dataField='createdDate'
          caption='Created On'
          dataType='date'
          format="MMM dd, yyyy hh:mm"
          width={'10%'}
          sortOrder='desc'
        />
        <Column
          dataField='createdBy'
          caption='Requested By'
          width={'10%'}
        />
        <Column
          dataField='setupStatus'
          caption='Setup Status'
          alignment='center'
          width={'20%'}
          cellRender={cellRenderSetupStatus}
        />
        <Column
          dataField='riskAnalyticsStatus'
          caption='Risk Analytics Status'
          alignment='center'
          width={'20%'}
          cellRender={cellRenderRiskAnalyticsStatus}
        />
        <Column
          dataField='euSecuritizationStatus'
          caption='Eu Securtization Status'
          alignment='center'
          width={'20%'}
          cellRender={cellRenderEuSecuritizationStatus}
        />
        <Column
          dataField='erisaStatus'
          caption='Erisa Status'
          alignment='center'
          width={'20%'}
          cellRender={cellRenderErisaStatus}
        />
        <Column
          dataField='readyForTradingStatus'
          caption='Ready For Trading'
          alignment='center'
          width={'10%'}
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
