import { Alert } from "antd";

export default function PathBanner({ text }: { text: string }) {
  return <Alert showIcon type="info" message={text} style={{ marginBottom: 16 }} />;
}
