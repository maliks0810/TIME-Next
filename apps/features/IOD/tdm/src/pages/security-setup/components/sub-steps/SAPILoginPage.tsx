import React from 'react';

export const SAPILoginPage: React.FC = () => {
  return (
    <div className="substep-content">
      <div className="sapi-instruction-box">
        <h3>SAPI Login Instructions</h3>
        <p>
          Please have the Data Manager (DM) log into SAPI and update the password for this security.
        </p>
        <p>
          {`Once completed, click "Next" to continue.`}
        </p>
      </div>
    </div>
  );
};
