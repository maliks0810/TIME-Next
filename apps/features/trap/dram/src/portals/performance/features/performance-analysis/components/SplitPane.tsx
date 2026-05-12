import React from "react";

export default function SplitPane(props: {
  leftWidth: number;
  children: [React.ReactNode, React.ReactNode];
}) {
  const { leftWidth, children } = props;
  return (
    <div style={{ display: "flex", height: "100%", width: "100%" }}>
      <div style={{ width: leftWidth, minWidth: 200 }}>{children[0]}</div>
      <div style={{ flex: 1, minWidth: 0 }}>{children[1]}</div>
    </div>
  );
}