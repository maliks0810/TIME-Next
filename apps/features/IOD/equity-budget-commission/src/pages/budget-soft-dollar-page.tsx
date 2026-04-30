import { BlockContainer } from '../components/block-container';
//import BudgetSoftDollarGrid from '../datagrids/budget-softdollar-grid'
import SoftDollarBudgetGrid from '../datagrids/softdollar-budget-grid'

export default function BudgetSoftDollarBudget () {
    //console.debug('BudgetSoftDollar rendering');
    return (
        <BlockContainer title="Soft Dollar Budget">
            <div>
                <SoftDollarBudgetGrid />
            </div>
        </BlockContainer>
    );
};