import { useState } from "react";
import { Col, message, Row, Typography } from "antd";
import { Props } from "../../lib/types";
import UploadCard from "../../components/csv-upload/UploadCard";
import { buildDram1Url } from "../../lib/services";


/* ---------------------------------- */
/*  Component */
/* ---------------------------------- */

export default function PMAAdminPage({ }: Props) {

  	const [uploading, setUploading] = useState(false);
	const onUpload = (info: string): void => {
	setUploading(true);
	try {
		message.info(info);
	} catch (error) {
		message.error('Upload failed');
		console.error(error);
	} finally {
		setUploading(false);
	}
	};
  return (
	<div style={{margin:'16px' , height: "95vh", overflowY: "auto" }}>
	  <Typography.Title level={2}>
		PMA Admin
	  </Typography.Title>
	<Row>
		<Col xs={24} md={12} lg={8}>
			<UploadCard uploading={uploading} onUpload={onUpload}
			destinationLink={buildDram1Url("/rtn-attribution/api/v2/factset-historical-bulk-csv")} importTitle="FactSet Historical Upload" formatMessage={""} />
		</Col>
	  </Row>
	</div>
  );
}