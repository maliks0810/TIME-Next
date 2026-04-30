import { BlockContainer } from '../components/block-container';
import  ResearchBudgetGrid  from '../datagrids/research-budget-grid'

export default function BudgetResearchBudget () {
    //console.debug('BudgetResearchBudget rendering');
    return (
        <BlockContainer title="Research Budget">
            <div>
                <ResearchBudgetGrid />
            </div>
        </BlockContainer>
    );
};