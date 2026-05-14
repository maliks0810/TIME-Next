import { render, screen, act } from '@testing-library/react';  
import { expect, it, describe} from 'vitest'; // or jest if you use Jest  
import CommissionResearchVote from '../pages/commission-research-vote-page';  

describe('CommissionResearchVote', () => {  
  it('renders without crashing', () => {
    act(() => {
      render(<CommissionResearchVote />);  
    });
    // Check that BlockContainer title is rendered  
    expect(screen.getByText('Commission Research Vote')).toBeInTheDocument();  
  });  

});