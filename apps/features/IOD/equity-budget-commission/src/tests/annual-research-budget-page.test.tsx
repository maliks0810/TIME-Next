import { render, screen, act } from '@testing-library/react';  
import { vi, expect, describe, it, } from 'vitest'; // or jest if you use Jest  
import AnnualResearchBudget from '../pages/annual-research-budget-page';
  
// Mock ResearchBudgetGrid to simplify the test  
vi.mock('../datagrids/annual-research-budget-grid', () => ({  
  __esModule: true,  
  default: () => <div data-testid="annual-research-budget-grid" />,  
}));  
  
describe('AnnualResearchBudgetGrid', () => {  
  it('renders without crashing', async () => {  
    act(() => {
      render(<AnnualResearchBudget />);
    })
    // Check that BlockContainer title is rendered  
    expect(screen.getByText('Create Annual Research Budget')).toBeInTheDocument();  
  });  
  
  it('renders AnnualResearchBudgetGrid', () => {  
    act(() => {
      render(<AnnualResearchBudget />);
    })  
    // Check that the mocked AnnualResearchBudgetGrid is rendered  
    expect(screen.findAllByTestId('annual-research-budget-grid')).toBeDefined();  
  });  
});  
