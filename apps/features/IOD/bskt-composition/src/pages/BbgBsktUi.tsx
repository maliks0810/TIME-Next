import "devextreme/dist/css/dx.light.css";
import BsktProposalsGrid from "../components/BsktProposalsGrid/BsktProposalsGrid";

export default function BbgBsktUiPage() {
  return (
    <div style={{ padding: 16 }}>
      <div style={{ fontStyle: 'Lato', fontSize: 16, fontWeight: 600, marginBottom: 10 }}>
        BBG BSKT Proposals
      </div>
      <BsktProposalsGrid />
    </div>
  );
}