import React, { useState } from 'react';
import { ToolbarPreparingEvent } from "devextreme/ui/data_grid";
import DataGrid, { Column, ColumnFixing, Paging, Scrolling, SearchPanel } from 'devextreme-react/data-grid';
import HistoryHeader from './HistoryHeader';
import { HistoryRow, Note, NoteType } from '../../lib/types';
import { fetchPerformanceNotesService, saveNotesService } from '../../lib/services';
import { useUserInfo } from '@platform/utils';

export default function DetailHistory({portfolioId, rows, onToolbarPreparing }: { portfolioId: string,
  rows: HistoryRow[], onToolbarPreparing: (id: ToolbarPreparingEvent) => void}) {
  const [notes, setNotes] = useState('');
  const [historicalNotes, setHistoricalNotes] = useState<Note[]>([]);
  const onDetailToolbarPreparing = React.useCallback((e: ToolbarPreparingEvent) => {
    onToolbarPreparing(e);
  }, [onToolbarPreparing]);
  const user = useUserInfo();
  const handleSave = async (value: string) => {
    try {
      await saveNotesService(value,"PAGR",portfolioId, user.email);

    } catch {
    }
  };
  const handleLoadHistoryNotes = async() => {
    try {
      const resp =  await fetchPerformanceNotesService(NoteType.PAGR.toString() ,portfolioId);
      const newRows = resp.data ?? [];
      setHistoricalNotes(newRows);
      } catch {

      }
  };
      React.useEffect(() => {
           handleLoadHistoryNotes();
      }, []);
  return (
    <div style={{ height: "100%", width: "100%", display: "flex", flexDirection: "column", minHeight: 0 }}>
      <div style={{height: '80px', width:"95%"}}>
        <HistoryHeader
          notes={notes}
                onNotesChange={setNotes}
                onSave={handleSave} portfolioId={portfolioId}
                 historicalNotes={historicalNotes} onRefresh={handleLoadHistoryNotes}
        />
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
      <DataGrid  dataSource={rows} height='calc(78vh - 300px)'
        keyExpr="endingDate"
                  width="95%"
                  showBorders={true}
                  rowAlternationEnabled={true}
                  hoverStateEnabled={true}
                  columnAutoWidth={false}
                  wordWrapEnabled={false}
                  onToolbarPreparing={onDetailToolbarPreparing}>
        <Paging enabled={false} />
        <Scrolling mode="standard"  showScrollbar="always"/>
        <ColumnFixing enabled={true} />
        <SearchPanel visible highlightCaseSensitive={false} />

        <Column dataField="final" caption="Final" width={50} fixed={true} fixedPosition="left" />
        <Column dataField="endingDate" caption="Ending Date" width={90} fixed={true} fixedPosition="left" />
        <Column dataField="endingMV" caption="Ending MV" width={120} fixed={true} fixedPosition="left"
          format="#,##0.##" />

        <Column dataField="month" caption="Month" width={80} format="#0.####%" />
        <Column dataField="rollingQtr" caption="Rolling 3-Month" width={90} format="#0.####%" />
        <Column dataField="qtd" caption="QTD" width={80} format="#0.####%" />
        <Column dataField="ytd" caption="YTD" width={80} format="#0.####%" />
        <Column dataField="oneYear" caption="1 Year" width={80} format="#0.####%" />
        <Column dataField="twoYear" caption="2 Year" width={80} format="#0.####%" />
        <Column dataField="threeYear" caption="3 Year" width={80} format="#0.####%" />
        <Column dataField="fourYear" caption="4 Year" width={80} format="#0.####%" />
        <Column dataField="fiveYear" caption="5 Year" width={80} format="#0.####%" />
        <Column dataField="sixYear" caption="6 Year" width={80} format="#0.####%" />
        <Column dataField="sevenYear" caption="7 Year" width={80} format="#0.####%" />
        <Column dataField="eightYear" caption="8 Year" width={80} format="#0.####%" />
        <Column dataField="nineYear" caption="9 Year" width={80} format="#0.####%" />
        <Column dataField="tenYear" caption="10 Year" width={90} format="#0.####%" />
        <Column dataField="twentyYear" caption="20 Year" width={90} format="#0.####%" />
        <Column  dataField="sinceInceptionAnnualized"  caption="Incep (Annualized)"
          width={120}  format="#0.####%"  />
        <Column dataField="sinceInceptionCumulative"  caption="Incep (Cumulative)"
          width={120}  format="#0.####%"  />
        <Column dataField="portfolioPerfStartDate" caption="BM Incept Dt" width={120} />
      </DataGrid>

      </div>
    </div>
  );
}
