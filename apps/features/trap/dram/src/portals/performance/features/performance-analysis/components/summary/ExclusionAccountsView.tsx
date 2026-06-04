import DataGrid, { Column, ColumnFixing, Paging, Scrolling, SearchPanel, Selection } from 'devextreme-react/data-grid';
import dxDataGrid, { ToolbarPreparingEvent } from "devextreme/ui/data_grid";
import React from 'react';
import { ExclusionAccountRow } from '../../lib/types';

export default function ExclusionAccountsView({ asOfDate, rows, onToolbarPreparing }: { asOfDate: Date, rows: ExclusionAccountRow[],
	onToolbarPreparing: (id: ToolbarPreparingEvent) => void}) {
	const gridRef = React.useRef<dxDataGrid | null>(null);
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
		keyExpr="portfolioNumber"
		onExporting={e => {
		  e.fileName = `Exclusion_Accounts_AsOf_${asOfDate.toISOString().slice(0,10)}.xlsx`;
		}}

		height="calc(78vh - 100px)"
		width="95%"

		onRowClick={(e) => {
		  //  make clicking anywhere in the row select it
		  if (e?.key != null) e.component.selectRows([e.key], false);
		}}
		onToolbarPreparing={onDetailToolbarPreparing}
	  >
		<Selection mode="single" />
		<Scrolling mode="virtual" showScrollbar="always"/>
		<Paging enabled={false} />
		<ColumnFixing enabled={true} />
		<SearchPanel visible highlightCaseSensitive={false} />

		<Column dataField="portfolioNumber" caption="Portfolio Number" width={200} />
		<Column dataField="portfolioName" caption="Portfolio Name" minWidth={300} />
	  </DataGrid>
	</div>
	</div>
  );
}
