import React, { Dispatch, SetStateAction, useCallback, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'
import { Box, Grid } from '@mui/material';
import { DataGrid } from 'devextreme-react';
import { ChangedOptionInfo } from 'devextreme-react/cjs/common/core/events';
import { Column, DataGridTypes, HeaderFilter, Pager, Paging, Scrolling, Selection, StateStoring } from 'devextreme-react/data-grid';
import { IDashboardSecuritySetupRequest } from '../lib/DashboardSecuritySetupRequest'
import {
  SetupStatusesRecord,
  RiskAnalyticsStatusesRecord,
  ReadyForTradingStatusesRecord,
  EuSecuritizationStatusesRecord,
  ErisaStatusesRecord
} from '../lib/DashboardSecuritySetupRequestStatuses';
import {
  getDefaultDashboardGridFilters,
  IDashboardGridFilters,
  updateDashboardGridFilters
} from '../lib/DashboardSearchParameters';
import '../lib/dashboard.scss';
import { SortOrder } from 'devextreme/common';

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
  const [gridFilters, setGridFilters] = useState<IDashboardGridFilters>(
    () => getDefaultDashboardGridFilters()
  );
    
  useEffect(() => {
    setGridFilters(getDefaultDashboardGridFilters());
  });

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

  const getSortOrder = (columnName: string): SortOrder | undefined => {
    const sortColumn = gridFilters.sortColumn;
    const sortDirection = gridFilters.sortDirection;

    if (sortColumn === columnName && sortDirection) {
      if (sortDirection === 'asc' || sortDirection === 'desc') {
        return sortDirection as SortOrder;
      }
    }

    return undefined;
  };

  const handleOptionChanged = (e: ChangedOptionInfo) => {
    if (e.fullName?.startsWith("columns")) {
      const isFilterValueChange = e.fullName.includes("filterValues");
      const isSortOrderChange = e.fullName.includes("sortOrder");

      // Description column
      if (e.fullName.includes("columns[0]")) {
        if (isFilterValueChange) {
          setGridFilters(updateDashboardGridFilters({
            descriptionFilter: e.value,
          }));
        }
        if (isSortOrderChange) {
          setGridFilters(updateDashboardGridFilters({
            sortColumn: "description",
            sortDirection: e.value,
          }));
        }
      }
      // Identifier column
      if (e.fullName.includes("columns[1]")) {
        if (isFilterValueChange) {
          setGridFilters(updateDashboardGridFilters({
            identifierFilter: e.value,
          }));
        }
        if (isSortOrderChange) {
          setGridFilters(updateDashboardGridFilters({
            sortColumn: "identifier",
            sortDirection: e.value
          }));
        }
      }
      // Created Date column
      if (e.fullName.includes("columns[2]")) {
        if (isFilterValueChange) {
          setGridFilters(updateDashboardGridFilters({
            createdDateFilter: e.value,
          }));
        }
        if (isSortOrderChange) {
          setGridFilters(updateDashboardGridFilters({
            sortColumn: "createdDate",
            sortDirection: e.value,
          }));
        }
      }
      // Created By column
      if (e.fullName.includes("columns[3]")) {
        if (isFilterValueChange) {
          setGridFilters(updateDashboardGridFilters({
            createdByFilter: e.value,
          }));
        }
        if (isSortOrderChange) {
          setGridFilters(updateDashboardGridFilters({
            sortColumn: "createdBy",
            sortDirection: e.value,
          }));
        }
      }
      // Setup Status column
      if (e.fullName.includes("columns[4]")) {
        if (isFilterValueChange) {
          setGridFilters(updateDashboardGridFilters({
            setupStatusFilter: e.value,
          }));
        }
        if (isSortOrderChange) {
          setGridFilters(updateDashboardGridFilters({
            sortColumn: "setupStatus",
            sortDirection: e.value,
          }));
        }
      }
      // Risk Analytics Status column
      if (e.fullName.includes("columns[5]")) {
        if (isFilterValueChange) {
          setGridFilters(updateDashboardGridFilters({
            riskAnalyticsStatusFilter: e.value,
          }));
        }
        if (isSortOrderChange) {
          setGridFilters(updateDashboardGridFilters({
            sortColumn: "riskAnalyticsStatus",
            sortDirection: e.value,
          }));
        }
      }
      // EU Securitization Status column
      if (e.fullName.includes("columns[6]")) {
        if (isFilterValueChange) {
          setGridFilters(updateDashboardGridFilters({
            euSecuritizationStatusFilter: e.value,
          }));
        }
        if (isSortOrderChange) {
          setGridFilters(updateDashboardGridFilters({
            sortColumn: "euSecuritizationStatus",
            sortDirection: e.value,
          }));
        }
      }
      // Erisa Status column
      if (e.fullName.includes("columns[7]")) {
        if (isFilterValueChange) {
          setGridFilters(updateDashboardGridFilters({
            erisaStatusFilter: e.value,
          }));
        }
        if (isSortOrderChange) {
          setGridFilters(updateDashboardGridFilters({
            sortColumn: "erisaStatus",
            sortDirection: e.value,
          }));
        }
      }
      // Ready For Trading column
      if (e.fullName.includes("columns[8]")) {
        if (isFilterValueChange) {
          setGridFilters(updateDashboardGridFilters({
            readyForTradingStatusFilter: e.value,
          }));
        }
        if (isSortOrderChange) {
          setGridFilters(updateDashboardGridFilters({
            sortColumn: "readyForTradingStatus",
            sortDirection: e.value,
          }));
        }
      }
    }
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
        allowColumnResizing={true}
        columnResizingMode='nextColumn'
        onRowDblClick={handleRowDbleClick}
        onRowClick={onRowClick}
        onOptionChanged={handleOptionChanged}
        repaintChangesOnly={true}
      >
        <StateStoring
          enabled
          type="localStorage"
          storageKey="dashboardGridState"
          savingTimeout={0}
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
          width={'10%'}
          sortOrder={getSortOrder("description")}
          filterValues={gridFilters.descriptionFilter}
          minWidth={140}
        />
        <Column
          dataField='identifier'
          caption='Identifier'
          width={'10%'}
          sortOrder={getSortOrder("identifier")}
          filterValues={gridFilters.identifierFilter}
          minWidth={140}
        />
        <Column
          dataField='createdDate'
          caption='Created On'
          dataType='date'
          format="MMM dd, yyyy hh:mm a"
          width={'10%'}
          sortOrder={getSortOrder("createdDate")}
          filterValues={gridFilters.createdDateFilter}
          minWidth={120}
        />
        <Column
          dataField='createdBy'
          caption='Requested By'
          width={'10%'}
          sortOrder={getSortOrder("createdBy")}
          filterValues={gridFilters.createdByFilter}
          minWidth={140}
        />
        <Column
          dataField='setupStatus'
          caption='Setup Status'
          alignment='center'
          width={'20%'}
          cellRender={cellRenderSetupStatus}
          sortOrder={getSortOrder("setupStatus")}
          filterValues={gridFilters.setupStatusFilter}
          minWidth={125}
        />
        <Column
          dataField='riskAnalyticsStatus'
          caption='Risk Analytics Status'
          alignment='center'
          width={'20%'}
          cellRender={cellRenderRiskAnalyticsStatus}
          sortOrder={getSortOrder("riskAnalyticsStatus")}
          filterValues={gridFilters.riskAnalyticsStatusFilter}
          minWidth={125}
        />
        <Column
          dataField='euSecuritizationStatus'
          caption='EU Securitization Status'
          alignment='center'
          width={'20%'}
          cellRender={cellRenderEuSecuritizationStatus}
          sortOrder={getSortOrder("euSecuritizationStatus")}
          filterValues={gridFilters.euSecuritizationStatusFilter}
          minWidth={125}
        />
        <Column
          dataField='erisaStatus'
          caption='ERISA Status'
          alignment='center'
          width={'20%'}
          cellRender={cellRenderErisaStatus}
          sortOrder={getSortOrder("erisaStatus")}
          filterValues={gridFilters.erisaStatusFilter}
          minWidth={125}
        />
        <Column
          dataField='readyForTradingStatus'
          caption='Ready For Trading'
          alignment='center'
          width={'10%'}
          cellRender={cellRenderReadyForTrading}
          sortOrder={getSortOrder("readyForTradingStatus")}
          filterValues={gridFilters.readyForTradingStatusFilter}
          minWidth={100}
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
