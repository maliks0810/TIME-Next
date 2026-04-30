import { BlockContainer } from '../components/block-container';
import { CommissionCombinedBudgetGrid } from '../datagrids/commission-combinedbudget-grid'

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