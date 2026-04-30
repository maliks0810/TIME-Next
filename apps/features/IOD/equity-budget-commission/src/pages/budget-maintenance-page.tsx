import TabPanel, { Item } from 'devextreme-react/tab-panel';
import { BlockContainer } from '../components/block-container';
import MaintenanceDivisionGrid from '../datagrids/maintenance-division-grid';
import MaintenanceDepartmentGrid from '../datagrids/maintenance-department-grid'
import MaintenanceBrokerGrid from '../datagrids/maintenance-broker-grid';
import MaintenanceMasterBrokerGrid from '../datagrids/maintenance-masterbroker-grid';
import MaintenanceUserGrid from '../datagrids/maintenance-user-grid'
import MaintenancePortfolioGrid from '../datagrids/maintenance-portfolio-grid';
import MaintenancePortfolioGroupGrid from '../datagrids/maintenance-portfolio-group-grid';
import MaintenanceBrokerGroupGrid from '../datagrids/maintenance-brokergroup-grid';
import MaintenanceDirectedRulesGrid from '../datagrids/maintenance-directedrules-grid';



import 'devextreme/dist/css/dx.light.css';
import 'devextreme/dist/css/dx.light.compact.css';

export default function BudgetMaintenance () {
    //console.debug('BudgetMaintenance rendering');
    return (
        <BlockContainer title="Maintenance">
            <div className='custom-tab-panel'>
            <TabPanel deferRendering={true} >
                <Item title="Division">
                    <MaintenanceDivisionGrid  />
                </Item>
                <Item title="Department">
                    <MaintenanceDepartmentGrid />
                </Item>
                <Item title="Broker">
                    <MaintenanceBrokerGrid />
                </Item>
                <Item title="Broker Group">
                    <MaintenanceBrokerGroupGrid />
                </Item>               
                <Item title="Master Broker">
                    <MaintenanceMasterBrokerGrid />
                </Item>
                <Item title="Users (Staff)">
                    <MaintenanceUserGrid />
                </Item>
                <Item title="Portfolio">
                    <MaintenancePortfolioGrid />
                </Item>
                <Item title="Portfolio Group">
                    <MaintenancePortfolioGroupGrid />
                </Item>
                <Item title="Directed Rules">
                    <MaintenanceDirectedRulesGrid />
                </Item>                
            </TabPanel>
            </div>
        </BlockContainer>
    );
};