import { useEffect, useState, useRef } from "react";
import TextArea, { TextAreaTypes } from "devextreme-react/text-area";
import Button from "devextreme-react/button";
import { Note } from "../../lib/types";

type HistoryHeaderProps = {
  notes: string;
  onNotesChange: (value: string) => void;
  onSave: (notes: string) => Promise<void>;
  onRefresh: () => Promise<void>;
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
  const [saving, setSaving] = useState(false);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [showHistoryInline, setShowHistoryInline] = useState(false);


const containerRef = useRef<HTMLDivElement | null>(null);
  const isEmpty = !notes || !notes.trim();

  const normalizedNotes = historicalNotes.map(n => ({
    ...n,
    createdAt: n.CreatedAt ?? "",
    createdBy: n.CreatedBy ?? "",
  }));

  //  Normalize + sort once
  const sortedNotes = [...(normalizedNotes ?? [])].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const lastTwo = sortedNotes.slice(0, 1);

  //  Save
  const handleSaveClick = async () => {
    setSaving(true);
    try {
      await onSave(notes);
      onNotesChange("");

      await onRefresh();

      //  highlight newest AFTER refresh (safe)
      const newest = sortedNotes[0];
      if (newest && newest.createdAt !== undefined) {
        setHighlightId(newest.createdAt);
      }
    } finally {
      setSaving(false);
    }
  };

  //  Toggle inline history
  const handleHistoricalNotes = async () => {
    if (!showHistoryInline) {
      await onRefresh();
    }
    setShowHistoryInline((prev) => !prev);
  };

  //  Auto-clear highlight
  useEffect(() => {
    if (!highlightId) return;
    const t = setTimeout(() => setHighlightId(null), 3000);
    return () => clearTimeout(t);
  }, [highlightId]);

  //  formatter
  const formatDate = (ts: string) =>
    new Date(ts).toLocaleString(undefined, {
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowHistoryInline(false);
      }
    }

    if (showHistoryInline) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showHistoryInline]);

  return (

<div
  style={{
    padding: 10,
    borderBottom: "1px solid #ddd",
    background: "#fafafa",
  }}
>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {/*  LEFT: Recent Notes */}
        <div style={{ width: 400 }}>
          <div style={{ fontSize: 12 }}>
            {lastTwo.length === 0 && (
              <div style={{ color: "#aaa" }}>No notes</div>
            )}

{lastTwo.map((n) => {
  const isNew = n.createdAt === highlightId;

  return (
    <div
      key={n.createdAt}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        padding: "2px 3px",
        marginBottom: 6,
        borderRadius: 4,
        background: isNew ? "#e6f7ff" : "#f7f7f7",
        border: "1px solid #eee",
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 11,
          color: "#666",
        }}
      >
        <span style={{color: "#888", fontWeight: 500 }}>
          Recent Notes: {n.createdBy} -
        {formatDate(n.createdAt)}</span>
      </div>

      {/* Note text */}
      <div
        style={{
          fontSize: 12,
          color: "#333",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {n.NoteText}
      </div>
    </div>
  );
})}
          </div>
        </div>

        {/*  RIGHT: Input + Actions */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flex: 1,
          }}
        >
          <div style={{ flex: 1 }}>
            <TextArea style={{ border:"2px",borderColor:"#000" }}
              value={notes}
              height={36}
              valueChangeEvent="keyup"
              onValueChanged={(e: TextAreaTypes.ValueChangedEvent) =>
                onNotesChange(e.value ?? "")
              }
            />
          </div>


          <Button
            text="Save Notes"
            type="success"
            width={120}
            disabled={isEmpty || saving}
            onClick={handleSaveClick}
          />

          <Button text="See All Notes"
            icon={showHistoryInline ? "chevronup" : "more"}
            stylingMode="text"
            onClick={handleHistoricalNotes}
          />

        </div>
      </div>

      {/*  INLINE HISTORY */}
<div style={{ position: "relative" }} ref={containerRef}>
  {showHistoryInline && (
    <div
      style={{
        position: "absolute",
        top: 50,
        right: 0,
        width: 420,
        maxHeight: 300,
        overflowY: "auto",
        background: "#fff",
        border: "1px solid #ddd",
        borderRadius: 6,
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        zIndex: 1000,
        padding: 8,
      }}
    >
      {sortedNotes.length === 0 && (
        <div style={{ padding: 8, color: "#999" }}>No notes</div>
      )}

      {sortedNotes.map((n) => {
        const isNew = n.createdAt === highlightId;

        return (
          <div
            key={n.createdAt}
            style={{
              padding: "8px 10px",
              marginBottom: 6,
              borderRadius: 4,
              background: isNew ? "#e6f7ff" : "#fafafa",
              border: "1px solid #eee",
            }}
          >
            {/* header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 11,
                color: "#666",
              }}
            >
              <span style={{ fontWeight: 500 }}>{n.createdBy}</span>
              <span>
                {new Date(n.createdAt).toLocaleString(undefined, {
                  month: "short",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            {/* text */}
            <div
              style={{
                fontSize: 12,
                marginTop: 4,
                whiteSpace: "pre-wrap",
                color: "#333",
              }}
            >
              {n.NoteText}
            </div>
          </div>
        );
      })}
    </div>
  )}
</div>
    </div>
  );
}
