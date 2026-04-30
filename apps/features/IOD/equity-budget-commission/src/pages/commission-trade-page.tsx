import { BlockContainer } from '../components/block-container';
import { CommissionTradeGrid } from '../datagrids/commission-trade-grid'

export default function CommissionTradePage () {
    //console.debug('CommissionTrade rendering');
    return (
        <BlockContainer title="Trades">
            <div>
                <CommissionTradeGrid />
            </div>
        </BlockContainer>
    );
};