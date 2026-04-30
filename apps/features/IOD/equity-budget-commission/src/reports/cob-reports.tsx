import { useState, useCallback, useEffect } from 'react';
import CommonReportViewer from '../components/common-reportviewer';
import { NoTrailingForwardSlash } from '../utils/url-utils';
import PropTypes from 'prop-types';

import './report-div.scss';
import 'devextreme/dist/css/dx.light.css';
import 'devextreme/dist/css/dx.light.compact.css';

const reportBaseURL = NoTrailingForwardSlash(
  import.meta.env.VITE_IOD_COB_REPORT_URL
);

const reportParams = '&rs:Command=Render&rc:Parameters=true&rs:Embed=true';

export const formatDateForApi = (dateObject: Date) => {
  if (!dateObject) return;
  const month = (dateObject.getMonth() + 1).toString().padStart(2, '0');
  const day = dateObject.getDate().toString().padStart(2, '0');
  const year = dateObject.getFullYear();
  return `${month}/${day}/${year}`;
};

const Report = ({ reportName = '' }) => {
  const [generateReport, setGenerateReport] = useState('');
  const [reportTitle] = useState(reportName);

  const handleRefresh = useCallback(() => {
    setGenerateReport(reportTitle);
  }, [reportTitle]);

  // ✅ Automatically "click" the button
  useEffect(() => {
    handleRefresh();
  }, [handleRefresh]);

  const getReportUrl = () => {
    return `${reportBaseURL}/${encodeURIComponent(reportTitle)}?${reportParams}`;
  };

  return (
    <div>
      <div className="report-viewer-container"> </div>

      {generateReport && (
        <CommonReportViewer
          reportUrl={getReportUrl()}
          reportTitle={reportTitle}
        />
      )}
    </div>
  );
};

Report.propTypes = {
  reportName: PropTypes.string,
};

Report.defaultProps = {
  reportName: '',
};

export default Report;
