import { useCallback, useEffect, useState, useMemo } from 'react';
import DataGrid, { Column, FilterRow, } from 'devextreme-react/data-grid';
import SelectBox, { SelectBoxTypes } from 'devextreme-react/select-box';
import CheckBox from 'devextreme-react/check-box';
import dayjs from 'dayjs';
import { CommissionResearchVote } from '../datatypes/tcw-commission-types';
import { NoTrailingForwardSlash } from '../utils/url-utils'
import { useUserInfo } from '@platform/utils';
import { commResearchVoteDataService } from '@/services/commission-research-vote-service';
import { MaintenanceBroker, MaintenanceDivision } from '@/datatypes/budget-maintenance-types';

import './styles.scss';
import 'devextreme/dist/css/dx.light.css';
import 'devextreme/dist/css/dx.light.compact.css';


export const EquityCommissionGrid = () => {
  const [, setCommissionData] = useState<CommissionResearchVote[]>([]);
  const [selectedCrBroker, setSelectedCredBroker] = useState<string|undefined>()
  const [selectedDivision, setSelectedDivision] = useState<string|undefined>()
  const [selectedExBroker, setSelectedExBroker] = useState<string|undefined>()
  const [divisions, setDivisions] = useState<MaintenanceDivision[]>()
  const [brokers, setBrokers] = useState<MaintenanceBroker[]>()
  const userInfo = useUserInfo();
  
  const apiBaseUrl = NoTrailingForwardSlash(import.meta.env.VITE_IOD_CMS_SERVICE_URL);
  const apiMainEndpoint = apiBaseUrl+'/maintenance';

  const dataSource = useMemo(() => {          
          return commResearchVoteDataService(setCommissionData, userInfo, 2025, selectedDivision);
  }, [selectedDivision]);

   useEffect(() => {    
        fetch(apiMainEndpoint+'/brokers',{cache: "no-store"})
        .then(async response => {
          let mstBrkData :MaintenanceBroker[] = await response.json();
          setBrokers(mstBrkData);
        })
        .catch(error => console.error('Error fetching broker data:', error));
        
        fetch(apiMainEndpoint+'/divisions',{cache: "no-store"})
        .then(async response => {
          let divData :MaintenanceDivision[] = await response.json();
          const defValue: MaintenanceDivision = {divisionId:0, divisionName:'ALL', status:'Active', lastUpdateBy:userInfo.name, lastUpdateDate: new Date(dayjs().year(),12,31)}
          divData.unshift(defValue)
          setDivisions(divData);
        })
        .catch(error => console.error('Error fetching division data:', error));  
    }, []);  

  const handleDvisionChange = useCallback((e: SelectBoxTypes.ValueChangedEvent) => {
    setSelectedDivision(e.value);
  }, [selectedDivision]);

  const handleCrBrokerChange = useCallback((e: SelectBoxTypes.ValueChangedEvent) => {
    setSelectedCredBroker(e.value);
  }, [selectedCrBroker]);

  const handleExBrokerChange = useCallback((e: SelectBoxTypes.ValueChangedEvent) => {
    setSelectedExBroker(e.value);
  }, [selectedCrBroker]);

  const handleRefresh = useCallback(async ()=> 
    {
      setSelectedCredBroker(undefined);
      dataSource.load();
    },[]);
  
  return (
    <div>
      <div className='grid-container-flex'>
        <div className="label-title">Executing Broker</div>
        <SelectBox
          dataSource={brokers}
          value={selectedExBroker}
          onValueChanged={handleExBrokerChange}
          showClearButton={true}
          elementAttr={{ class: 'dx-common-selectbox' }}
        />
        <div className="label-title"></div>
        <div className="label-title">Credit Only</div>
        <CheckBox />
      </div> 
      <div className='grid-container-flex'>
        <div className="label-title">Credit Broker</div>
        <SelectBox
          dataSource={brokers}
          value={selectedCrBroker}
          onValueChanged={handleCrBrokerChange}
          showClearButton={true}
          elementAttr={{ class: 'dx-common-selectbox' }}
        />
        <div className="label-title"></div>
        <div className="label-title">Division</div>
        <SelectBox
          dataSource={divisions}
          value={selectedDivision}
          onValueChanged={handleDvisionChange}
          showClearButton={true}
          elementAttr={{ class: 'dx-common-selectbox' }}
        />      
        <div className="label-title"></div>
        <input type='button' title='Refresh' value='Refresh' className='page-button' onClick={handleRefresh}></input>  
      </div> 
      <DataGrid 
        dataSource={dataSource}
        key="id" // Unique key for each item
        allowColumnResizing={false}
        allowColumnReordering={false}
        showBorders={true}
        paging={{enabled:false}}
        className='grid-full-block'
      >        
        <FilterRow visible={false} applyFilter="auto" />
        
        <Column dataField="divName" caption="Division Name" allowSorting={true} />
        <Column dataField="intMstBkr" caption="Executing Broker" allowSorting={true}/>
        <Column dataField="mBkrName" caption="Credit Broker" allowSorting={true}/>
        <Column dataField="mBkrCode" caption="Credit Broker Code" allowSorting={true}/>
        <Column dataField="grossBudget" caption="Budget" allowSorting={true} dataType="number" alignment='left' format={{ precision: 2 }} />
        <Column dataField="sumOfTotalComm" caption="Commission" allowSorting={true} dataType="number" alignment='left' format={{ precision: 2 }} />
        <Column dataField="remaining" caption="Remaining" allowSorting={true} dataType="number" alignment='left' format={{ precision: 2 }} />
        <Column dataField="pctDone" caption="PCTDone" allowSorting={true} dataType="number" alignment='left' format={{ precision: 2 }} />%
      </DataGrid>
    </div>
  );
};

export default EquityCommissionGrid;
