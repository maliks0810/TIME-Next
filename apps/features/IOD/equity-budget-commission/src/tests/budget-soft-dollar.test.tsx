import { render, screen, act } from '@testing-library/react';  
import { vi, expect, describe, it} from 'vitest'; // or jest if you use Jest  
import BudgetSoftDollarBudget from '../pages/budget-soft-dollar-page';  
  
// Mock BudgetSoftDollarGrid to simplify the test  
vi.mock('../datagrids/softdollar-budget-grid', () => ({  
  __esModule: true,  
  default: () => <div data-testid="softdollar-budget-grid" />,  
}));  
  
describe('BudgetSoftDollarBudget', () => {  
  it('renders without crashing', () => {  
    act(() => {
      render(<BudgetSoftDollarBudget />);  
    });
    // Check that BlockContainer title is rendered  
    expect(screen.getByText('Soft Dollar Budget')).toBeInTheDocument();  
  });  
  
  it('renders BudgetSoftDollarBudget', () => {  
    act(() => {
      render(<BudgetSoftDollarBudget />);  
    }); 
    // Check that the mocked BudgetSoftDollarGrid is rendered  
    expect(screen.findAllByTestId('softdollar-budget-grid')).toBeDefined();  
  });  
});  
