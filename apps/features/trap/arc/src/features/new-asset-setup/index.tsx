/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { Radio } from 'antd';
import Dragger from 'antd/lib/upload/Dragger';
import { CloudUploadOutlined } from '@ant-design/icons';
// import { submitTranche } from '../../lib/services';
// import { NISelectTranche } from './components/NISelectTranche';

const arcFilesUploadUrl = import.meta.env.VITE_R2_TRAP_PRISM_CLO_URL + '/v1/arc/files/upload?user=TEST';
// const arcFilesUploadUrl =
//     import.meta.env.VITE_PRISM_URL +
//     '/api/v1/new-asset/files/upload?user=gatska&sessionId=7466c7b3-fbca-455e-8eb0-3cfba79d77dd';
export function NewAssetSetup() {
    const [dealDetails, setDealDetails] = useState<any>({});
    const [trancheDetails, setTrancheDetails] = useState<any>([]);
    // const [selectedTrancheValue, setSelectedTrancheValue] = useState<any>();
    // const [selectedTrancheCUSIP, setSelectedTrancheCUSIP] = useState<string | undefined>(undefined);

    /**
     * Handle drop of CDI file to render the Deal info and Tranche info
     * @param info
     */
    const handleUploadChange = (info: any) => {
        const { status, response } = info.file;
        if (status === 'done') {
            const dealInfo = response?.results[0];
            const trancheInfos = dealInfo?.tranches;
            setDealDetails(dealInfo);
            setTrancheDetails(trancheInfos);
        } else if (status === 'error') {
            alert(response);
        } else if (status === 'removed') {
            setDealDetails({});
            setTrancheDetails([]);
            // setSelectedTrancheValue([]);
            // setSelectedTrancheCUSIP(undefined);
        }
    };

    /**
     * Filter the Tranche to grab the CUSIP on Tranche Select
     * @param value Tranche
     */
    // const handleTrancheChange = (value: any) => {
    //     const trancheInfo = trancheDetails.filter(( val: any) => val.tranche === value)[0];
    //     setSelectedTrancheCUSIP(trancheInfo?.cusip);
    // };

    return (
        <div className="ni-container">
            <div className="ni-container-main">
                <div className="ni-container-main-dragger">
                    <div className="ni-container-main-dragger-header">
                        Upload CDI <span>(Compressed Zip file)</span>
                    </div>
                    <div className="ni-container-main-dragger-content">
                        <Dragger
                            action={`${arcFilesUploadUrl}`}
                            onChange={handleUploadChange}
                            multiple={false}
                            name="files"
                        >
                            <p className="ant-upload-drag-icon">
                                <CloudUploadOutlined style={{ color: '#00000058' }} />
                            </p>
                            <p>Click or drag the CDI zip file to this area to upload</p>
                            <p className="ni-container-main-dragger-content-paragraph">
                                Support for a single file upload only. Strictly prohibited from
                                uploading company data or other banned files.
                            </p>
                        </Dragger>
                    </div>
                </div>
                <div className="ni-container-main-deal-info">
                    <div className="ni-container-main-deal-info-header">
                        Extraction from CDI File
                    </div>
                    <div className="ni-container-main-deal-info-content">
                        <th colSpan={2}>Deal Detail</th>
                        <table>
                            <tr>
                                <td>Deal Name</td>
                                <td>{dealDetails.intexDealName}</td>
                            </tr>
                            <tr>
                                <td>Bloomberg Deal Name</td>
                                <td>{dealDetails.bloombergDealName}</td>
                            </tr>
                            <tr>
                                <td>Deal Type</td>
                                <td>{dealDetails.dealType}</td>
                            </tr>
                            <tr>
                                <td>Collateral Type</td>
                                <td>{dealDetails.collateralType}</td>
                            </tr>
                        </table>
                        <th colSpan={2}>Deal & Collat Balance</th>
                        <table>
                            <tr>
                                <td>Original Deal Balance</td>
                                <td>{dealDetails.origDealBalance}</td>
                            </tr>
                            <tr>
                                <td>Original Collat Balance</td>
                                <td>{dealDetails.origCollatBalance}</td>
                            </tr>
                        </table>
                        <th colSpan={2}>Dates</th>
                        <table>
                            <tr>
                                <td>Settle Date</td>
                                <td>{dealDetails.settleDate}</td>
                            </tr>
                        </table>
                        <th colSpan={2}>Deal Traits</th>
                        <table>
                            <tr>
                                <td>Country</td>
                                <td>{dealDetails.country}</td>
                            </tr>
                        </table>
                        <hr />
                        {/* <th colSpan={2} style={{ backgroundColor: 'lightgray', color: 'black' }}>
                            Overrides
                        </th>
                        <table>
                            <tr>
                                <td>Asset Type</td>
                                <td>
                                    <Select size="small" style={{ width: 120 }}>
                                        <Select.Option value="NA RMBS">NA RMBS</Select.Option>
                                        <Select.Option value="Agency MBS">Agency MBS</Select.Option>
                                        <Select.Option value="ABS">ABS</Select.Option>
                                    </Select>
                                </td>
                            </tr>
                        </table> */}
                    </div>
                </div>
            </div>
            <div className="ni-container-main-tranche-info">
                    <div className="ni-container-main-tranche-info-header">
                        &nbsp;
                    </div>
                    <div className="ni-container-main-tranche-info-content">
                        <Radio.Group>
                            <table>
                                <th colSpan={3}>Tranches<span style={{ color: 'transparent' }}> *</span></th>
                                    {trancheDetails?.map((item: any) => (
                                        <tr key={item.tranche}>
                                            {/* <td style={{ width: '10px' }}>
                                                <Radio key={item.tranche} value={item.tranche} />
                                            </td> */}
                                            <td>
                                                {item.tranche}
                                            </td>
                                            <td>
                                                {item.cusip}
                                            </td>
                                        </tr>
                                    ))}
                            </table>
                        </Radio.Group>
                    </div>
                </div>
            {/* <hr
                style={{
                    width: '100%',
                    border: 'none',
                    height: '1px',
                    backgroundColor: 'lightgray',
                }}
            />
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'row-reverse',
                    justifyContent: 'space-between',
                }}
            /> */}
        </div>
    );
}