import { useState } from "react";
import TextArea, { TextAreaTypes } from "devextreme-react/text-area";
import Button from "devextreme-react/button";
import Popup from "devextreme-react/popup";

type HistoryHeaderProps = {
  notes: string;
  onNotesChange: (value: string) => void;
  onSave: (notes: string) => void; // event to parent
  portfolioId: string;
};

export default function HistoryHeader({
  notes,
  onNotesChange,
  onSave
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
          onClick={() => setShowHistory(true)}
        />
      </div>

      <Popup
        visible={showHistory}
        title="Notes History"
        onHiding={() => setShowHistory(false)}
      >
        <div>No history available</div>
      </Popup>
    </div>
  );
}
