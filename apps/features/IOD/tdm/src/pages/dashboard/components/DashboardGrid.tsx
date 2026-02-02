import React, { Dispatch, SetStateAction, useCallback } from 'react';
import { Box, Grid } from '@mui/material';
import { DataGrid } from 'devextreme-react';
import { Column, DataGridTypes, HeaderFilter, Pager, Paging, Selection } from 'devextreme-react/data-grid';
import { IDashboardSecuritySetupRequest } from '../lib/DashboardSecuritySetupRequest'
import { SetupStatusesRecord, RiskAnalyticsStatusesRecord, ReadyForTradingStatusesRecord } from '../lib/DashboardSecuritySetupRequestStatuses';
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

    const cellRenderProcessTime = (data: DataGridTypes.ColumnCellTemplateData) => {
      if (data.value){
        const processTime = data.value.toString() + ' min';
        return <>{processTime}</>
      }

       return <></>;
    }

    const onRowClick = useCallback((e: DataGridTypes.RowClickEvent) => {
      setSelectedSecurityRequest(e.data);
      setIsRequestDetailsOpen(true);
    }, [setSelectedSecurityRequest, setIsRequestDetailsOpen]);

  if (!securityRequestsData)
  {
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
          format={'MMM dd, yyyy'}
          width={'10%'}
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
          dataField='readyForTradingStatus'
          caption='Ready For Trading'
          alignment='center'
          width={'10%'}
          cellRender={cellRenderReadyForTrading}
        />
        <Column
          dataField='processTime'
          caption='Process Time'
          width={'10%'}
          alignment='center'
          cellRender={cellRenderProcessTime}
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