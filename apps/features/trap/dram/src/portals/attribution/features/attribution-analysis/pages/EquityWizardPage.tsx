import { Typography } from "antd";
import { useSearchParams } from "react-router-dom";
import PathBanner from "../components/PathBanner";
import WizardStepper from "../components/WizardStepper";

export default function EquityWizardPage() {
  const [search] = useSearchParams();
  const source = (search.get("source") || "landing") as "landing" | "workspace";
  return (
    <div>
      <Typography.Title level={2}>Equity Wizard</Typography.Title>
      <PathBanner text={source === "workspace" ? "This wizard is loaded from FastAPI state for editing." : "This wizard was opened from the landing-page path."} />
      <WizardStepper sourcePath={source} />
    </div>
  );
}
