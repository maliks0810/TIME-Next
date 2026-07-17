import { BlockContainer } from '../components/block-container';
import { CommissionCombinedBudgetGrid } from '../datagrids/commission-combinedbudget-grid'

import 'devextreme/dist/css/dx.light.css';
import 'devextreme/dist/css/dx.light.compact.css';

export default function CommissionCombinedBudget () {
    //console.debug('Commission rendering');
    return (
        <BlockContainer title="Combined Budgets">
            <div>
                <CommissionCombinedBudgetGrid />
            </div>
        </BlockContainer>
    );
};