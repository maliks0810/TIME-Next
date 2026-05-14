import { render, screen, act } from '@testing-library/react';  
import { vi, expect, describe, it } from 'vitest'; // or jest if you use Jest  
import CommissionCombinedBudget from '../pages/commission-combinedbudget-page';  
  
// Mock CommissionCombinedBudgetGrid to simplify the test  
vi.mock('../datagrids/commission-combinedbudget-grid', () => ({  
  __esModule: true,  
  CommissionCombinedBudgetGrid: () => <div data-testid="commission-combinedbudget-grid" />,  
}));    
  
describe('CommissionCombinedBudget', () => {  
  it('renders without crashing', () => {  
    act(() => {
          render(<CommissionCombinedBudget />); 
    });
    // Check that BlockContainer title is rendered  
    expect(screen.getByText('Combined Budgets')).toBeInTheDocument();  
  });  
  
  it('renders CommissionCombinedBudgetGrid', () => {  
    act(() => {
          render(<CommissionCombinedBudget />); 
    }); 
    // Check that the mocked CommissionCombinedBudgetGrid is rendered  
    expect(screen.findAllByTestId('commission-combinedbudget-grid')).toBeDefined();  
  });  
});  
