import DataGrid, { Column, ColumnFixing, Paging, Scrolling, SearchPanel, Selection } from 'devextreme-react/data-grid';
import dxDataGrid, { SelectionChangedEvent, ToolbarPreparingEvent } from "devextreme/ui/data_grid";
import React from 'react';
import { PortfolioRow } from '../../lib/types';

export default function SummaryListReport({ asOfDate, rows, onSelect, onToolbarPreparing }: { asOfDate: Date, rows: PortfolioRow[],
	onSelect: (id: SelectionChangedEvent) => void , onToolbarPreparing: (id: ToolbarPreparingEvent) => void}) {
	const gridRef = React.useRef<dxDataGrid | null>(null);
  	const onGridSelectionChanged = React.useCallback((e: SelectionChangedEvent) => {
	onSelect(e);
  }, [onSelect]);
  const onDetailToolbarPreparing = React.useCallback((e: ToolbarPreparingEvent) => {
	onToolbarPreparing(e);
  }, [onToolbarPreparing]);
  return (

    <div style={{ height: "100%", width: "100%", display: "flex", flexDirection: "column", minHeight: 0 }}>
      <div style={{ flex: 1, minHeight: 0 }}>

	  <DataGrid
		ref={gridRef}
		dataSource={rows}
		showBorders
		keyExpr="portId"
		onExporting={e => {
		  e.fileName = `Summary_List_AsOf_${asOfDate.toISOString().slice(0,10)}`;
		}}

		height="calc(78vh - 100px)"
		width="95%"

        onRowClick={(e) => {
          //  make clicking anywhere in the row select it
          if (e?.key != null) e.component.selectRows([e.key], false);
        }}
        onToolbarPreparing={onDetailToolbarPreparing}
		onSelectionChanged={onGridSelectionChanged}
	  >
        <Selection mode="single" />
		<Scrolling mode="virtual" showScrollbar="always"/>
		<Paging enabled={false} />
		<ColumnFixing enabled={true} />
		<SearchPanel visible highlightCaseSensitive={false} />

        <Column dataField="portId" caption="Port ID" width={90} fixed={true} fixedPosition="left"/>
        <Column dataField="portfolioName" caption="Portfolio Name" minWidth={300} fixed={true} fixedPosition="left"/>
        <Column dataField="inceptionDate" caption="Inception Date" dataType="date" format="MM/dd/yyyy" width={130} />
        <Column dataField="perfStartDate" caption="Perf Start Date" dataType="date" format="MM/dd/yyyy" width={130} />
		<Column dataField="benchmark" caption="Benchmark" minWidth={200} />
	  </DataGrid>
	</div>
	</div>
  );
}
