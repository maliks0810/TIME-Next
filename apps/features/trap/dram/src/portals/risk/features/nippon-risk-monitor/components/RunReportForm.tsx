import { Form, Select, DatePicker, FormInstance } from 'antd';
import type { RunReportFormValues } from '../lib/types';
import '../lib/style.scss';
import { PORTFOLIO_LIST } from '../lib/constant';

const { Option } = Select;

interface RunReportFormProps {
  form: FormInstance<RunReportFormValues>;
  loading: boolean;
}

export default function RunReportForm({ form, loading }: RunReportFormProps) {
  return (
      <Form form={form} layout="vertical" requiredMark="optional" className="run-report-form">
          <Form.Item
              name="portfolio"
              label="Portfolio"
              rules={[{ required: true, message: 'Please select a portfolio' }]}
          >
              <Select
                  placeholder="Select from list below"
                  showSearch
                  disabled={loading}
                  optionFilterProp="children"
                  filterOption={(input, option) => (option?.children as unknown as string)
              ?.toLowerCase()
              .includes(input.toLowerCase())}
              >
                  {PORTFOLIO_LIST.map((portfolio) => (
                      <Option key={portfolio} value={portfolio}>
                          {portfolio}
                      </Option>
          ))}
              </Select>
          </Form.Item>

          <Form.Item
              name="reporting_date"
              label="Reporting Date"
              rules={[{ required: true, message: 'Please select reporting date' }]}
          >
              <DatePicker
                  className="run-report-input"
                  format="YYYY-MM-DD"
                  placeholder="Select reporting date"
                  disabled={loading}
              />
          </Form.Item>

          <Form.Item
              name="start_date"
              label="Start Date"
              rules={[{ required: true, message: 'Please select start date' }]}
          >
              <DatePicker
                  className="run-report-input"
                  format="YYYY-MM-DD"
                  placeholder="Select start date"
                  disabled={loading}
              />
          </Form.Item>
      </Form>
  );
}
