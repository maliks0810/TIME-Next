import React, { useRef } from "react";
import { useDramGridContext } from "./DramGridContext";

interface Props extends React.ThHTMLAttributes<HTMLTableCellElement> {
  colId?: string;
  width?: number;
}

export const HeaderCell: React.FC<Props> = ({
  colId,
  width,
  children,
  ...rest
}) => {
  const {
    setColumnWidth,
    reorderColumns,
    draggingColumnId,
    setDraggingColumnId,
    setDropTargetColumnId,
  } = useDramGridContext();

  const startX = useRef(0);
  const startWidth = useRef(0);

  /*  Resize handler (no change needed) */
  const onResizeStart = (e: React.MouseEvent): void => {
    if (!colId) return;

    startX.current = e.clientX;
    startWidth.current = width ?? 120;

    const onMouseMove = (moveEvent: MouseEvent): void => {
      const delta = moveEvent.clientX - startX.current;
      setColumnWidth(colId, startWidth.current + delta);
    };

    const onMouseUp = (): void => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  /*  Drag handlers */

  const handleDragStart = (): void => {
    if (colId) {
      setDraggingColumnId(colId);
    }
  };

  const handleDragOver = (e: React.DragEvent): void => {
    if (!colId) return;

    e.preventDefault();
    setDropTargetColumnId(colId);
  };

  const handleDrop = (): void => {
    if (!colId || !draggingColumnId) return;

    reorderColumns(draggingColumnId, colId);
  };

  return (
    <th
      draggable={Boolean(colId)}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      {...rest}
    >

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontWeight: 500,
        }}
      >

        <span>{children}</span>

        {/*  Resize handle */}
        <span
          style={{
            marginLeft: "auto",
            cursor: "col-resize",
            padding: "0 4px",
            userSelect: "none",
          }}
          onMouseDown={onResizeStart}
        >

        </span>
      </div>
    </th>
  );
};