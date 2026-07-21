export interface DriverColumnConfigItem {
  key: string;
  title: string;
  dataIndex: string;
  category?: string;
  width?: number;
  required?: boolean;
  defaultSelected?: boolean;
}

export interface DriverColumnConfigState {
  availableColumns: DriverColumnConfigItem[];
  selectedColumns: DriverColumnConfigItem[];
}
