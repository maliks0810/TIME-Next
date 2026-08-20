import { useEffect, useMemo, useState } from "react";
import { Card, Col, message, Row, Space, Statistic, UploadFile } from "antd";
import { Props } from "../../lib/types";
import { FinancingMonthlyPreview } from "../../components/financing-ingestion/components/FinancingMonthlyPreview";
import { ValidationErrorsDrawer } from "../../components/financing-ingestion/components/ValidationErrorsDrawer";
import { FinancingIngestionApi } from "../../components/financing-ingestion/FinancingIngestionApi";
import { FinancingBatchDto, FinancingErrorDto, FinancingSourceType } from "../../components/financing-ingestion";
import { IngestUploadCard } from "../../components/financing-ingestion/components/IngestUploadCard";
import { BatchStatusTable } from "../../components/financing-ingestion/components/BatchStatusTable";


/* ---------------------------------- */
/*  Component */
/* ---------------------------------- */

export default function PMAAdminPage({ }: Props) {
  const [sourceType, setSourceType] = useState<FinancingSourceType>("TBA");
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [batches, setBatches] = useState<FinancingBatchDto[]>([]);
  const [errors, setErrors] = useState<FinancingErrorDto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [loadingErrors, setLoadingErrors] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const totals = useMemo(() => ({
	batches: batches.length,
	raw: batches.reduce((sum, b) => sum + b.raw_row_count, 0),
	valid: batches.reduce((sum, b) => sum + b.valid_row_count, 0),
	errors: batches.reduce((sum, b) => sum + b.error_row_count, 0),
  }), [batches]);

  const loadBatches = async (): Promise<void> => {
	setLoadingBatches(true);
	try {
	  const data = await FinancingIngestionApi.listBatches(50);
	  setBatches(data);
	} catch (error) {
	  message.error(error instanceof Error ? error.message : "Failed to load batches.");
	} finally {
	  setLoadingBatches(false);
	}
  };

  useEffect(() => {
	void loadBatches();
  }, []);

  const upload = async (): Promise<void> => {
	const file = fileList[0]?.originFileObj;
	if (!file) {
	  message.warning("Please select an .xlsx file.");
	  return;
	}

	setUploading(true);
	try {
	  await FinancingIngestionApi.ingest(sourceType, file);
	  message.success("Financing ingestion completed.");
	  setFileList([]);
	  await loadBatches();
	} catch (error) {
	  message.error(error instanceof Error ? error.message : "Upload failed.");
	} finally {
	  setUploading(false);
	}
  };

  const viewErrors = async (batch: FinancingBatchDto): Promise<void> => {
	setDrawerOpen(true);
	setLoadingErrors(true);
	try {
	  setErrors(await FinancingIngestionApi.getErrors(batch.batch_id));
	} catch (error) {
	  message.error(error instanceof Error ? error.message : "Failed to load errors.");
	} finally {
	  setLoadingErrors(false);
	}
  };
  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <IngestUploadCard
        sourceType={sourceType}
        fileList={fileList}
        loading={uploading}
        onSourceTypeChange={setSourceType}
        onFileListChange={setFileList}
        onUpload={() => void upload()}
      />

      <Row gutter={16}>
        <Col xs={24} md={6}><Card><Statistic title="Batches" value={totals.batches} /></Card></Col>
        <Col xs={24} md={6}><Card><Statistic title="Raw rows" value={totals.raw} /></Card></Col>
        <Col xs={24} md={6}><Card><Statistic title="Valid rows" value={totals.valid} /></Card></Col>
        <Col xs={24} md={6}><Card><Statistic title="Error rows" value={totals.errors} /></Card></Col>
      </Row>

      <Card>
        <BatchStatusTable
          batches={batches}
          loading={loadingBatches}
          onViewErrors={(batch) => void viewErrors(batch)}
          onRefresh={() => void loadBatches()}
        />
      </Card>

      <FinancingMonthlyPreview />

      <ValidationErrorsDrawer
        open={drawerOpen}
        loading={loadingErrors}
        errors={errors}
        onClose={() => setDrawerOpen(false)}
      />
    </Space>
  );
};