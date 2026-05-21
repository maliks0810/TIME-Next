import { FormInstance } from 'antd';
import { Modal, Button, Spin } from 'antd';
import { PlayCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import type { Dayjs } from 'dayjs';

import { RunBuyMaintainRequest, RunReportFormValues } from '../lib/types';
import RunReportForm from '../components/RunReportForm';
import ReportLoaderTip from '../components/ReportLoaderTip';
import '../lib/style.scss';
import { showErrorMessage } from '../lib/notifications';

export interface RunReportModalProps {
  form: FormInstance<RunReportFormValues>;  // ✅ controlled form
  visible: boolean;
  onCancel: () => void;
  onRun: (values: RunBuyMaintainRequest) => void;
  loading?: boolean;
}

export default function RunReportModal({
  form,
  visible,
  onCancel,
  onRun,
  loading = false,
}: RunReportModalProps) {

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (!values.reporting_date || !values.start_date || !values.portfolio) {
        showErrorMessage('Please fill all required fields correctly');
        return;
      }

      const apiParams: RunBuyMaintainRequest = {
        portfolio: values.portfolio,
        reporting_date: (values.reporting_date as Dayjs).format('YYYY-MM-DD'),
        start_date: (values.start_date as Dayjs).format('YYYY-MM-DD'),
      };

      onRun(apiParams);
    } catch {
      showErrorMessage('Please fill all required fields correctly');
    }
  };

  const handleCancel = () => {
    form.resetFields();     // ✅ still works
    onCancel();
  };

  return (
    <Modal
      title={
        <div className="run-report-modal-header">
          <PlayCircleOutlined />
          <span>Run Report</span>
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel} disabled={loading}>
          Cancel
        </Button>,
        <Button
          key="run"
          type="primary"
          icon={<PlayCircleOutlined />}
          loading={loading}
          onClick={handleSubmit}
        >
          Run Report
        </Button>,
      ]}
      width={500}
      destroyOnClose
    >
      <Spin
        spinning={loading}
        indicator={<LoadingOutlined className="loader-icon" spin />}
        tip={<ReportLoaderTip />}
      >
        <RunReportForm form={form} loading={loading} />
      </Spin>
    </Modal>
  );
}
