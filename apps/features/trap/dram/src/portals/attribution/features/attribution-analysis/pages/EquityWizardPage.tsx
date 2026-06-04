import { Typography } from "antd";
import { useSearchParams } from "react-router-dom";
import PathBanner from "../components/PathBanner";
import WizardStepper from "../components/WizardStepper";
import { Props } from "../lib/types";

export default function EquityWizardPage({ onComplete }: Props)  {
  const [search] = useSearchParams();
  const source = (search.get("source") || "landing") as "landing" | "workspace";
  return (
    <div style={{margin:'16px'}}>
      <Typography.Title level={2}>Equity Wizard</Typography.Title>
      <PathBanner text={source === "workspace" ? "This wizard is loaded from FastAPI state for editing." : "This wizard was opened from the landing-page path."} />
      <WizardStepper onComplete={onComplete}/>
    </div>
  );
}
