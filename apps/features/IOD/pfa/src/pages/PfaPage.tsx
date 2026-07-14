import '../generated/pfa.css';
import '../features/portfolio-analysis/styles/pfa-toolbar-selector.css';
import { PfaPortfolioAnalysisShell } from '../features/portfolio-analysis/components/PfaPortfolioAnalysisShell';

export default function PfaPage() {
  return (
    <div id="pfa-app-root" className="pfa-app-root">
      <PfaPortfolioAnalysisShell />
    </div>
  );
}
