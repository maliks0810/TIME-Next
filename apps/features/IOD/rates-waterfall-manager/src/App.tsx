import RatesWaterfallManagerPage from './pages/RatesWaterfallManagerPage';
import { RatesWaterfallAccessGate } from './features/auth/RatesWaterfallAccessGate';
import { Providers } from './providers';

export default function App() {
  return (
    <Providers>
      <RatesWaterfallAccessGate>
        <RatesWaterfallManagerPage />
      </RatesWaterfallAccessGate>
    </Providers>
  );
}