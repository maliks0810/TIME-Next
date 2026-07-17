import { BlockContainer } from '../components/block-container';
import TabPanel, { Item } from 'devextreme-react/tab-panel';
import { CommissionTradeGrid } from '../datagrids/commission-trade-grid'
import { CommissionReconGrid } from '../datagrids/commission-recon-grid';

import './style.scss';
import 'devextreme/dist/css/dx.light.css';
import 'devextreme/dist/css/dx.light.compact.css';

export default function CommissionTradePage () {
    return (
        <BlockContainer title="Trades">
            <div className='custom-tab-panel'>
                <TabPanel deferRendering={true} >
                    <Item title="Trades">
                        <CommissionTradeGrid />
                    </Item>
                    <Item title="Recon">
                        <CommissionReconGrid />
                    </Item>
                </TabPanel>
            </div>
        </BlockContainer>
    );
};