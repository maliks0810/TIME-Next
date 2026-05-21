import '../lib/style.scss';

export default function ReportLoaderTip() {
  return (
      <div className="report-loader-tip">
          <div className="loader-title">Generating report...</div>
          <div className="loader-subtitle">
              This process may take around 2–3 minutes. Please don’t close the window.
          </div>
      </div>
  );
}
