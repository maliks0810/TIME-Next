import { render, screen, act } from '@testing-library/react';  
import { vi, expect, describe, it, } from 'vitest'; // or jest if you use Jest  
import BudgetResearchBudget from '../pages/budget-research-budget-page';  
  
// Mock ResearchBudgetGrid to simplify the test  
vi.mock('../datagrids/research-budget-grid', () => ({  
  __esModule: true,  
  default: () => <div data-testid="research-budget-grid" />,  
}));  
  
describe('BudgetResearchBudget', () => {  
  it('renders without crashing', async () => {  
    act(() => {
      render(<BudgetResearchBudget />);
    })
    // Check that BlockContainer title is rendered  
    expect(screen.getByText('Research Budget')).toBeInTheDocument();  
  });  
  
  it('renders ResearchBudgetGrid', () => {  
    act(() => {
      render(<BudgetResearchBudget />);
    })  
    // Check that the mocked ResearchBudgetGrid is rendered  
    expect(screen.findAllByTestId('research-budget-grid')).toBeDefined();  
  });  
});  
