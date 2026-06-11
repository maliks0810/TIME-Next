import { Alert, Spin } from "antd";
import { useEffect, useState } from "react";
import { Props } from "../lib/types";
import WizardStepper from "../components/wizard-config/WizardStepper";
import { api } from "../lib/services";
import { GridConfigResponse } from "../components/dram-grid/types";
import { extractGridConfig } from "../lib/helpers";

export default function ConfigureWizardPage({
  // onComplete,
  assetClass,
}: Props) {

  const [config, setConfig] = useState<GridConfigResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load(): Promise<void> {
      try {
        if(assetClass === undefined){
          setError("Failed to load config");
          return;
        }

        const configResp = (await api.getConfigs(assetClass))as GridConfigResponse;
        const data = extractGridConfig(configResp);

        if (!cancelled) {
          setConfig(data);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error ? e.message : "Failed to load config"
          );
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [assetClass]);

  return (
    <div  style={{margin:'16px' }}>
      {/*  error */}
      {error && (
        <Alert
          type="error"
          showIcon
          message="Failed to load configuration"
          description={error}
          style={{ marginBottom: 16 }}
        />
      )}

      {/*  loading */}
      {!config && !error && <Spin />}

      {/*  main render (clean) */}
      {config && (
        <WizardStepper
          config={config} isConfigView={true}
          // onComplete={onComplete}
          assetClass={assetClass ?? ''}
        />
      )}
    </div>
  );
}