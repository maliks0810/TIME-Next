import {useState} from 'react';
import PropTypes from 'prop-types';  

import './block-container.scss'

const CommonReportViewer = ({ reportUrl='', reportTitle='' }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const handleLoad = () => {
    setIsLoading(false);
    console.log("Iframe loaded successfully.");
  };

  const handleError = () => {
    setIsLoading(false);
    setError("Failed to load the report URL.");
  };

  return (    
    <div className='container-reportviewer'>
      {!error && (
        <iframe
          src={reportUrl}
          width="100%"
          height="700px"
          frameBorder="0"
          scrolling="yes"          
          className={isLoading ? 'iframe-show-none' : 'iframe-show-block' } // Hide iframe until loaded          
          title={reportTitle}
          onLoad={handleLoad}
          onError={handleError}
        ></iframe>
      )}
    </div>
  );
};

CommonReportViewer.propTypes = {  
  reportUrl: PropTypes.string.isRequired,  // mark as required if it must be provided  
  reportTitle: PropTypes.string,  
};  

CommonReportViewer.defaultProps = {  
  reportTitle: '',  
};  

export default CommonReportViewer;