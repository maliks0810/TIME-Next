import { BlockContainer } from '../components/block-container';
import  AnnualResearchBudgetGrid  from '../datagrids/annual-research-budget-grid'

export default function AnnualResearchBudget () {
    //console.debug('BudgetResearchBudget rendering');
    return (
        <BlockContainer title="Create Annual Research Budget">
            <div>
                <AnnualResearchBudgetGrid />
            </div>
        </BlockContainer>
    );
};