import { BlockContainer } from '../components/block-container';
import { CSAMonthlyCommissionGrid } from '../datagrids/csa-monthly-commission-grid'

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