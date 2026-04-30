import { useState, useCallback } from 'react';
import CommonReportViewer from '../components/common-reportviewer'
import { NoTrailingForwardSlash } from '../utils/url-utils'
import PropTypes from 'prop-types';  

import './report-div.scss';
import 'devextreme/dist/css/dx.light.css';
import 'devextreme/dist/css/dx.light.compact.css';

const reportBaseURL = NoTrailingForwardSlash(import.meta.env.VITE_IOD_COB_REPORT_URL);
const reportParams = '&rs:Command=Render&rc:Parameters=trues&rs:Embed=true'

export const formatDateForApi = (dateObject:Date) => {
    if(dateObject == undefined) return;
    const month = (dateObject.getMonth() + 1).toString().padStart(2, '0');
    const day = dateObject.getDate().toString().padStart(2, '0');
    const year = dateObject.getFullYear();
    
    return `${month}/${day}/${year}`;
};

const CommissionTradesReport = ({reportName=''}) => {    
  //const reportName = 'COB - Commission Trades Report';
  const [generateReport, setGenerateReport] = useState('');
  const [reportTitle, ] = useState(reportName);
  
  const handleRefresh = useCallback(() => {
    setGenerateReport(reportTitle)
  },[generateReport]);

  const getReportUrl = () => {     
        let reportAUrl = `${reportBaseURL}/${encodeURIComponent(reportTitle)}?${reportParams}`;
        return reportAUrl;      
    }  
   
    return (
        <div>
            <div className='report-viewer-container'>
                <input type='button' title='View Report' id='button2' value='View Report' className='report-page-button' onClick={handleRefresh}></input>  
            </div>
            {generateReport && (
                <CommonReportViewer reportUrl={getReportUrl()} reportTitle={reportTitle}/>
            )}
        </div>
    )
};

CommissionTradesReport.propTypes = {  
  reportName: PropTypes.string,  
};  

CommissionTradesReport.defaultProps = {  
  reportName: '',  
};  

export default CommissionTradesReport;