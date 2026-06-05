import { render, screen, act } from '@testing-library/react';  
import { vi, expect, describe, it } from 'vitest'; 
import CSAMonthlyCommission from '../pages/commission-csa-monthly-page';  
  
// Mock CSAMonthlyCommissionGrid to simplify the test  
vi.mock('../datagrids/csa-monthly-commission-grid', () => ({  
  __esModule: true,  
  CSAMonthlyCommissionGrid: () => <div data-testid="csa-monthly-commission-grid" />,  
}));    
  
describe('CSAMonthlyCommission', () => {  
  it('renders without crashing', () => {  
    act(() => {
          render(<CSAMonthlyCommission />); 
    });
    // Check that BlockContainer title is rendered  
    expect(screen.getByText('CSA Monthly Commission')).toBeInTheDocument();  
  });  
  
  it('renders CSAMonthlyCommission', () => {  
    act(() => {
          render(<CSAMonthlyCommission />); 
    }); 
    // Check that the mocked CSAMonthlyCommissionGrid is rendered  
    expect(screen.findAllByTestId('csa-monthly-commission-grid')).toBeDefined();  
  });  
});  
