import { BlockContainer } from '../components/block-container';
import  ResearchBudgetGrid  from '../datagrids/research-budget-grid'

import 'devextreme/dist/css/dx.light.css';
import 'devextreme/dist/css/dx.light.compact.css';

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