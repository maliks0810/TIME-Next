import React from 'react';
import DataGrid, { Column, ColumnFixing, Paging, Scrolling, SearchPanel, Selection } from 'devextreme-react/data-grid';
import dxDataGrid, { SelectionChangedEvent, ToolbarPreparingEvent } from "devextreme/ui/data_grid";
import "devextreme/dist/css/dx.light.css";
import { HistorySummaryRow } from '../../lib/types';

export default function SummaryReportView({ asOfDate, rows, onSelect, onToolbarPreparing}: { asOfDate: Date,
	rows: HistorySummaryRow[], onSelect: (id: SelectionChangedEvent) => void,
	onToolbarPreparing: (id: ToolbarPreparingEvent) => void}) {
	const gridRef = React.useRef<dxDataGrid | null>(null);
  	const onGridSelectionChanged = React.useCallback((e: SelectionChangedEvent) => {
	 onSelect(e);
  }, [onSelect]);
  const onDetailToolbarPreparing = React.useCallback((e: ToolbarPreparingEvent) => {
	onToolbarPreparing(e);
  }, [onToolbarPreparing]);
  return (

    <div style={{ height: "100%", width: "100%", display: "flex", flexDirection: "column", minHeight: 0 }}>
      <div style={{ flex: 1, minHeight: 0, minWidth:0 }}>

	  <DataGrid
		ref={gridRef}
		dataSource={rows}
		showBorders
		keyExpr="portfolioNumber"
		onExporting={e => {
		  e.fileName = `Summary_Report_AsOf_${asOfDate.toISOString().slice(0,10)}`;
		}}
        onToolbarPreparing={onDetailToolbarPreparing}
		onSelectionChanged={onGridSelectionChanged}
        onRowClick={(e) => {
          //  make clicking anywhere in the row select it
          if (e?.key != null) e.component.selectRows([e.key], false);
        }}

		height="calc(78vh - 100px)"
		width="95%"
		allowColumnResizing
  		columnResizingMode="nextColumn"
		columnAutoWidth={true}
	  >

		<Scrolling mode="virtual" showScrollbar="always"/>
		<Paging enabled={false} />
		<ColumnFixing enabled={true} />
		<SearchPanel visible highlightCaseSensitive={false} />
        <Selection mode="single" />
		<Column dataField="final" caption="Final" width={60} fixed={true} fixedPosition="left" />
		<Column dataField="portfolioNumber" caption="Account Number" fixed fixedPosition="left" width={80} />
		<Column dataField="portfolioName" caption="Account Name" fixed fixedPosition="left" minWidth={260} />
		<Column dataField="benchmark" caption="Index" width={60} fixed={true} fixedPosition="left" minWidth={160} />
		<Column dataField="marketValue" caption="Market Value" format="#,##0.0#" width={100} />
		<Column dataField="monthGross" caption="Monthly (Gross)" format="#,##0.0#%" width={90} />
		<Column dataField="monthNet" caption="Monthly (Net)" format="#,##0.0#%" width={90} />
		<Column dataField="monthIndex" caption="Monthly Index" format="#,##0.0#%"  width={90}/>
		<Column dataField="alpha" caption="Out/Under (bps)" format="#,##0.0#%" width={90} />
		<Column dataField="qtdGross" caption="Qtd (Gross)" format="#,##0.0#%" width={90} />
		<Column dataField="qtdNet" caption="Qtd (Net)" format="#,##0.0#%" width={90} />
		<Column dataField="qtdIndex" caption="Qtd Index" format="#,##0.0#%" width={90} />
		<Column dataField="qtdAlpha" caption="Qtd Out/Under (bps)" format="#,##0.0#%" width={90} />
		<Column dataField="ytdGross" caption="Ytd (Gross)" format="#,##0.0#%" width={90} />
		<Column dataField="ytdNet" caption="Ytd (Net)" format="#,##0.0#%" width={90} />
		<Column dataField="ytdIndex" caption="Ytd Index" format="#,##0.0#%"  width={90}/>
		<Column dataField="ytdAlpha" caption="Ytd Out/Under (bps)" format="#,##0.0#"  width={90}/>
		<Column dataField="investmentStyle"/>
		<Column dataField="asOfDate" visible={false} />
	  </DataGrid>
	</div>
	</div>
  );
}