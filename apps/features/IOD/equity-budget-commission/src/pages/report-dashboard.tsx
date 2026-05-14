import { useState, useCallback } from 'react';
import { SelectBox } from 'devextreme-react';
import { SelectBoxTypes } from 'devextreme-react/cjs/select-box';

import { BlockContainer } from '../components/block-container';
import Report from '../reports/cob-reports';
import { ReportsList } from '../datatypes/equity-reports-types';

import './style.scss';
import 'devextreme/dist/css/dx.light.css';
import 'devextreme/dist/css/dx.light.compact.css';

export default function ReportDashboard() {
  const [activeReport, setActiveReport] = useState('');
  const [reportTitle, setReportTitle] = useState('');

  const handleReportChange = useCallback(
    (e: SelectBoxTypes.SelectionChangedEvent) => {
      const item = e.selectedItem;
      if (!item) return;

      setActiveReport(item.value);
      setReportTitle(item.name);
    },
    []
  );

  const shouldRenderReport = activeReport;

  return (
    <BlockContainer title="Reports">
      <SelectBox
        dataSource={ReportsList}
        valueExpr="value"
        displayExpr="name"
        label="Choose Report"
        labelMode="outside"
        className="dx-common-selectbox"
        width={300}
        value={activeReport}
        showDropDownButton
        onSelectionChanged={handleReportChange}
      />

      {shouldRenderReport && (
        <Report
          key={activeReport}   
          reportName={reportTitle}
        />
      )}
    </BlockContainer>
  );
}