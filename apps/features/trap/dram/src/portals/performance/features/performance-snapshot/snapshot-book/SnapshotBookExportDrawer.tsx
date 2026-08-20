import {
  Button,
  Checkbox,
  DatePicker,
  Divider,
  Drawer,
  Form,
  Input,
  List,
  Radio,
  Segmented,
  Space,
  Switch,
  Typography,
} from "antd";
import dayjs from "dayjs";
import React, { useEffect, useMemo } from "react";
import { SNAPSHOT_REPORTS } from "./reportManifest";
import type { SnapshotBookPdfRequest, SnapshotReportId } from "./types";

const { Text, Title } = Typography;

interface Props {
  open: boolean;
  asOfDate: string;
  selectedReports: SnapshotReportId[];
  exporting: boolean;
  onClose: () => void;
  onExport: (request: SnapshotBookPdfRequest) => Promise<void>;
}

type FormValues = Omit<SnapshotBookPdfRequest, "reports">;

export default function SnapshotBookExportDrawer(props: Props): React.ReactElement {
  const [form] = Form.useForm<FormValues>();
  const includeCoverPage = Form.useWatch("includeCoverPage", form) ?? true;
  const reports = useMemo(
    () => SNAPSHOT_REPORTS.filter((report) => props.selectedReports.includes(report.id)),
    [props.selectedReports],
  );

  useEffect(() => {
    if (!props.open) return;
    form.setFieldsValue({
      asOfDate: props.asOfDate,
      includeCoverPage: true,
      coverTitle: "TCW Daily Performance Snapshot Book",
      coverSubtitle: "Daily performance and rankings",
      preparedFor: "Internal Distribution",
      preparedBy: "TCW Portfolio Analytics",
      includeTableOfContents: false,
      includeDisclosures: true,
      includeWarningAppendix: false,
      startEachReportOnNewPage: true,
      paperSize: "LEGAL",
      orientation: "LANDSCAPE",
      version: "INTERNAL",
      showPageNumbers: true,
    });
  }, [form, props.asOfDate, props.open]);

  async function submit(values: FormValues): Promise<void> {
    await props.onExport({ ...values, reports: reports.map((report) => report.id) });
  }

  return (
    <Drawer
      title="Configure Snapshot Book PDF"
      open={props.open}
      width={560}
      onClose={props.onClose}
      destroyOnClose
      extra={<Text type="secondary">{reports.length} reports</Text>}
    >
      <Form<FormValues> form={form} layout="vertical" onFinish={(values) => void submit(values)}>
        <Title level={5}>Document</Title>
        <Form.Item name="asOfDate" label="As-of date" getValueProps={(value: string) => ({ value: value ? dayjs(value) : undefined })} normalize={(value) => value?.format("YYYY-MM-DD")}>
          <DatePicker allowClear={false} style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item name="version" label="Version"><Segmented block options={[{ label: "Internal", value: "INTERNAL" }, { label: "Client", value: "CLIENT" }]} /></Form.Item>

        <Divider />
        <Space align="center" style={{ justifyContent: "space-between", width: "100%" }}>
          <Title level={5} style={{ margin: 0 }}>Cover page</Title>
          <Form.Item name="includeCoverPage" valuePropName="checked" noStyle><Switch /></Form.Item>
        </Space>
        <div className="snapshot-cover-settings" aria-disabled={!includeCoverPage}>
          <Form.Item name="coverTitle" label="Cover title" rules={[{ required: includeCoverPage, message: "Enter a cover title" }]}>
            <Input disabled={!includeCoverPage} maxLength={120} />
          </Form.Item>
          <Form.Item name="coverSubtitle" label="Subtitle"><Input disabled={!includeCoverPage} maxLength={160} /></Form.Item>
          <Form.Item name="preparedFor" label="Prepared for"><Input disabled={!includeCoverPage} maxLength={120} /></Form.Item>
          <Form.Item name="preparedBy" label="Prepared by"><Input disabled={!includeCoverPage} maxLength={120} /></Form.Item>
        </div>

        <Divider />
        <Title level={5}>Reports in PDF order</Title>
        <List bordered size="small" dataSource={reports} renderItem={(report) => <List.Item>{report.sequence}. {report.title}</List.Item>} />

        <Divider />
        <Title level={5}>Page layout</Title>
        <Form.Item name="paperSize" label="Paper size"><Radio.Group optionType="button" buttonStyle="solid" options={["LETTER", "LEGAL", "A4"]} /></Form.Item>
        <Form.Item name="orientation" label="Orientation"><Radio.Group optionType="button" buttonStyle="solid" options={["LANDSCAPE", "PORTRAIT"]} /></Form.Item>
        <Space direction="vertical">
          <Form.Item name="startEachReportOnNewPage" valuePropName="checked" noStyle><Checkbox>Start each report on a new page</Checkbox></Form.Item>
          <Form.Item name="showPageNumbers" valuePropName="checked" noStyle><Checkbox>Show page numbers</Checkbox></Form.Item>
          <Form.Item name="includeTableOfContents" valuePropName="checked" noStyle><Checkbox>Include table of contents</Checkbox></Form.Item>
          <Form.Item name="includeDisclosures" valuePropName="checked" noStyle><Checkbox>Include disclosures</Checkbox></Form.Item>
          <Form.Item name="includeWarningAppendix" valuePropName="checked" noStyle><Checkbox>Include warning appendix</Checkbox></Form.Item>
        </Space>

        <Divider />
        <Space>
          <Button onClick={props.onClose}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={props.exporting} disabled={!reports.length}>Generate Combined PDF</Button>
        </Space>
      </Form>
    </Drawer>
  );
}
