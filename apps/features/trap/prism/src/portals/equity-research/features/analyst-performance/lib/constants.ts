import { CheckboxGroupProps } from 'antd/es/checkbox';

export const datePeriodOptions: CheckboxGroupProps<string>['options'] = [
    { label: 'MTD', value: 'MTD' },
    { label: 'QTD', value: 'QTD' },
    { label: 'YTD', value: 'YTD' },
    { label: '1Y', value: '1Y' },
    { label: '3Y', value: '3Y' },
    { label: '5Y', value: '5Y' },
    { label: 'Max', value: 'Max' },
];
