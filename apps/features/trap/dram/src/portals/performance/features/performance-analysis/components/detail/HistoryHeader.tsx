import { useState } from "react";
import TextArea, { TextAreaTypes } from "devextreme-react/text-area";
import Button from "devextreme-react/button";
import Popup from "devextreme-react/popup";
import { DataGrid } from "devextreme-react";
import { Note } from "../../lib/types";

type HistoryHeaderProps = {
  notes: string;
  onNotesChange: (value: string) => void;
  onSave: (notes: string) => void; // event to parent
  onRefresh: () => void;
  portfolioId: string;
  historicalNotes: Note[];
};

export default function HistoryHeader({
  notes,
  onNotesChange,
  onSave,
  onRefresh,
  historicalNotes,
}: HistoryHeaderProps) {
  const [showHistory, setShowHistory] = useState(false);
  const [saving, setSaving] = useState(false);

  const isEmpty = !notes || !notes.trim();

  // local wrapper
  const handleSaveClick = async () => {
    setSaving(true);

    try {
      await onSave(notes); //  raise event to parent
    } finally {
      setSaving(false);
    }
  };
  const handleHistoricalNotes = async () => {
    setShowHistory(true);
    try {
      await onRefresh(); //  raise event to parent
    } finally {
      setSaving(false);
    }
  }
  return (
    <div style={{ padding: 8, borderBottom: "1px solid #ddd" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        {/*  TextArea */}
        <div style={{ flex: 1 }}>
          <TextArea
            value={notes}
            minHeight={30}
            valueChangeEvent="keyup"
            onValueChanged={(e: TextAreaTypes.ValueChangedEvent) =>
            onNotesChange(e.value ?? "")
            }
          />
        </div>

        {/*  Save button (event only) */}
        <Button
          text={saving ? "Saving..." : "Save"}
          type="success"
          stylingMode="contained"
          disabled={isEmpty || saving}
          onClick={handleSaveClick}
        />

        {/* History button */}
        <Button
          icon="info"
          stylingMode="text"
          onClick={handleHistoricalNotes}
        />
      </div>

      <Popup
        visible={showHistory}
        title="Notes History"
        onHiding={() => setShowHistory(false)}
      >
        <div>
          <DataGrid
            dataSource={historicalNotes}
          >
          </DataGrid>
        </div>
      </Popup>
    </div>
  );
}
