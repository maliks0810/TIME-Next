import React from "react";
import { Alert } from "antd";

export default function WidgetErrorState(props: { message?: string }) {
  return (
    <Alert
      type="error"
      showIcon
      message="Widget execution error"
      description={props.message ?? "Unknown widget error"}
    />
  );
}