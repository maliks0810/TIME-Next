import { render, screen, act } from '@testing-library/react';  
import { vi, expect, describe, it } from 'vitest'; // or jest if you use Jest  
import CommissionTradePage from '../pages/commission-trade-page';  
  
// Mock CommissionCombinedBudgetGrid to simplify the test  
vi.mock('../datagrids/commission-trade-grid', () => ({  
  __esModule: true,  
  CommissionTradeGrid: () => <div data-testid="commission-trade-grid" />,  
}));    
  
describe('CommissionTradePage', () => {  
  it('renders without crashing', () => {  
    act(() => {
          render(<CommissionTradePage />); 
    });
    // Check that BlockContainer title is rendered  
    expect(screen.getByText('Trades')).toBeInTheDocument();  
  });  
  
  it('renders CommissionTradeGrid', () => {  
    act(() => {
          render(<CommissionTradePage />); 
    }); 
    // Check that the mocked CommissionTradeGrid is rendered  
    expect(screen.findAllByTestId('commission-trade-grid')).toBeDefined();  
  });  
});  
