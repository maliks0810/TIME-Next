import { BlockContainer } from '../components/block-container';
import { CSAMonthlyCommissionGrid } from '../datagrids/csa-monthly-commission-grid'

import 'devextreme/dist/css/dx.light.css';
import 'devextreme/dist/css/dx.light.compact.css';

export default function CSAMonthlyCommission () {
    //console.debug('Commission rendering');
    return (
        <BlockContainer title="CSA Monthly Commission">
            <div>
                <CSAMonthlyCommissionGrid />
            </div>
        </BlockContainer>
    );
};