import { Descriptions, Divider, Input, Form, InputNumber } from 'antd';

import { NewAsset, NewAssetAnalytics } from '../../../lib/types';

import { nullspace, convertDateToPST } from '../../../lib/helpers';
import { Notes } from '../../Notes';

type AnalyticsFormLayoutProps = {
    asset: NewAssetAnalytics;
    selectedRow: NewAsset | null;
};

export default function AnalyticsFormLayout({ asset, selectedRow }: AnalyticsFormLayoutProps) {
    return (
        <>
            <Divider style={{ margin: '12px 0' }} />
            <div
                style={{
                    maxHeight: 'calc(100vh - 510px)',
                    overflow: 'auto',
                }}
            >
                <Descriptions title="Identification & Setup" size="small" column={3} bordered>
                    <Descriptions.Item label="Analytics Override Id">
                        {asset.analyticsOverrideId}
                    </Descriptions.Item>
                    <Descriptions.Item label="Asset Analytics Setup Id">
                        {asset.assetAnalyticsSetupId}
                    </Descriptions.Item>
                    <Descriptions.Item label="Asset Id">{asset.assetId}</Descriptions.Item>
                    <Descriptions.Item label="Asset Id Type">
                        <Form.Item name="assetIdType" style={{ marginBottom: 0 }}>
                            <Input style={{ width: '100%' }} />
                        </Form.Item>
                    </Descriptions.Item>
                    <Descriptions.Item label="Currency">
                        <Form.Item name="currency" style={{ marginBottom: 0 }}>
                            <Input style={{ width: '100%' }} />
                        </Form.Item>
                    </Descriptions.Item>
                    <Descriptions.Item label="Curve Type">
                        <Form.Item name="curveType" style={{ marginBottom: 0 }}>
                            <Input style={{ width: '100%' }} />
                        </Form.Item>
                    </Descriptions.Item>
                    <Descriptions.Item label="Risk Date">
                        {convertDateToPST(asset.riskDate)}
                    </Descriptions.Item>
                    <Descriptions.Item label="KRD Bench CUSIP">
                        <Form.Item name="krdBenchCusip" style={{ marginBottom: 0 }}>
                            <Input style={{ width: '100%' }} />
                        </Form.Item>
                    </Descriptions.Item>
                    <Descriptions.Item label="KRD Source">
                        <Form.Item name="krdSource" style={{ marginBottom: 0 }}>
                            <Input style={{ width: '100%' }} />
                        </Form.Item>
                    </Descriptions.Item>
                    <Descriptions.Item label="KRD Date">
                        {convertDateToPST(asset.krdDate)}
                    </Descriptions.Item>
                </Descriptions>
                <br />

                <Descriptions title="Pricing & Yields" size="small" column={4} bordered>
                    <Descriptions.Item label="Price">
                        <Form.Item name="price" style={{ marginBottom: 0 }}>
                            <InputNumber
                                style={{ width: '100%' }}
                                controls={false}
                                value={asset.price}
                            />
                        </Form.Item>
                    </Descriptions.Item>

                    <Descriptions.Item label="Yield to Maturity">
                        <Form.Item name="yieldToMaturity" style={{ marginBottom: 0 }}>
                            <InputNumber
                                style={{ width: '100%' }}
                                controls={false}
                                value={asset.yieldToMaturity}
                            />
                        </Form.Item>
                    </Descriptions.Item>

                    <Descriptions.Item label="Yield to Worst">
                        <Form.Item name="yieldToWorst" style={{ marginBottom: 0 }}>
                            <InputNumber
                                style={{ width: '100%' }}
                                controls={false}
                                value={asset.yieldToWorst}
                            />
                        </Form.Item>
                    </Descriptions.Item>

                    <Descriptions.Item label="ZV Yield">
                        <Form.Item name="zvYield" style={{ marginBottom: 0 }}>
                            <InputNumber
                                style={{ width: '100%' }}
                                controls={false}
                                value={asset.zvYield}
                            />
                        </Form.Item>
                    </Descriptions.Item>

                    <Descriptions.Item label="Real Yield">
                        <Form.Item name="realYield" style={{ marginBottom: 0 }}>
                            <InputNumber
                                style={{ width: '100%' }}
                                controls={false}
                                value={asset.realYield}
                            />
                        </Form.Item>
                    </Descriptions.Item>

                    <Descriptions.Item label="Static Yield">
                        <Form.Item name="staticYield" style={{ marginBottom: 0 }}>
                            <InputNumber
                                style={{ width: '100%' }}
                                controls={false}
                                value={asset.staticYield}
                            />
                        </Form.Item>
                    </Descriptions.Item>

                    <Descriptions.Item label="Spread to Worst">
                        <Form.Item name="spreadToWorst" style={{ marginBottom: 0 }}>
                            <InputNumber
                                style={{ width: '100%' }}
                                controls={false}
                                value={asset.spreadToWorst}
                            />
                        </Form.Item>
                    </Descriptions.Item>

                    <Descriptions.Item label="OAS">
                        <Form.Item name="oas" style={{ marginBottom: 0 }}>
                            <InputNumber
                                style={{ width: '100%' }}
                                controls={false}
                                value={asset.oas}
                            />
                        </Form.Item>
                    </Descriptions.Item>

                    <Descriptions.Item label="Static Spread">
                        <Form.Item name="oas1" style={{ marginBottom: 0 }}>
                            <InputNumber
                                style={{ width: '100%' }}
                                controls={false}
                                value={asset.oas1}
                            />
                        </Form.Item>
                    </Descriptions.Item>
                    <Descriptions.Item label="ROR CBE">
                        <Form.Item name="rorCbe" style={{ marginBottom: 0 }}>
                            <InputNumber
                                style={{ width: '100%' }}
                                controls={false}
                                value={asset.rorCbe}
                            />
                        </Form.Item>
                    </Descriptions.Item>
                </Descriptions>

                <br />
                <Descriptions title="Durations & Convexity" size="small" column={4} bordered>
                    <Descriptions.Item label="OAD">
                        <Form.Item name="oad" style={{ marginBottom: 0 }}>
                            <InputNumber
                                style={{ width: '100%' }}
                                controls={false}
                                value={asset.oad}
                            />
                        </Form.Item>
                    </Descriptions.Item>
                    <Descriptions.Item label="Model OAD">
                        <Form.Item name="modelOad" style={{ marginBottom: 0 }}>
                            <InputNumber
                                style={{ width: '100%' }}
                                controls={false}
                                value={asset.modelOad}
                            />
                        </Form.Item>
                    </Descriptions.Item>
                    <Descriptions.Item label="OAC">
                        <Form.Item name="oac" style={{ marginBottom: 0 }}>
                            <InputNumber
                                style={{ width: '100%' }}
                                controls={false}
                                value={asset.oac}
                            />
                        </Form.Item>
                    </Descriptions.Item>
                    <Descriptions.Item label="Model OAC">
                        <Form.Item name="modelOac" style={{ marginBottom: 0 }}>
                            <InputNumber
                                style={{ width: '100%' }}
                                controls={false}
                                value={asset.modelOac}
                            />
                        </Form.Item>
                    </Descriptions.Item>
                    <Descriptions.Item label="Mod Duration">
                        <Form.Item name="modDur" style={{ marginBottom: 0 }}>
                            <InputNumber
                                style={{ width: '100%' }}
                                controls={false}
                                value={asset.modDur}
                            />
                        </Form.Item>
                    </Descriptions.Item>
                    <Descriptions.Item label="Mod Duration (To Worst)">
                        <Form.Item name="modDurToWorst" style={{ marginBottom: 0 }}>
                            <InputNumber
                                style={{ width: '100%' }}
                                controls={false}
                                value={asset.modDurToWorst}
                            />
                        </Form.Item>
                    </Descriptions.Item>
                    <Descriptions.Item label="Spread Duration">
                        <Form.Item name="spdDur" style={{ marginBottom: 0 }}>
                            <InputNumber
                                style={{ width: '100%' }}
                                controls={false}
                                value={asset.spdDur}
                            />
                        </Form.Item>
                    </Descriptions.Item>
                    <Descriptions.Item label="Vol Dur">
                        <Form.Item name="volDur" style={{ marginBottom: 0 }}>
                            <InputNumber
                                style={{ width: '100%' }}
                                controls={false}
                                value={asset.volDur}
                            />
                        </Form.Item>
                    </Descriptions.Item>

                    <Descriptions.Item label="OAV">
                        <Form.Item name="oav" style={{ marginBottom: 0 }}>
                            <InputNumber
                                style={{ width: '100%' }}
                                controls={false}
                                value={asset.oav}
                            />
                        </Form.Item>
                    </Descriptions.Item>
                    <Descriptions.Item label="Infl Duration">
                        <Form.Item name="inflDuration" style={{ marginBottom: 0 }}>
                            <InputNumber
                                style={{ width: '100%' }}
                                controls={false}
                                value={asset.inflDuration}
                            />
                        </Form.Item>
                    </Descriptions.Item>
                    <Descriptions.Item label="Real Duration">
                        <Form.Item name="realDuration" style={{ marginBottom: 0 }}>
                            <InputNumber
                                style={{ width: '100%' }}
                                controls={false}
                                value={asset.realDuration}
                            />
                        </Form.Item>
                    </Descriptions.Item>
                    <Descriptions.Item label="SPRD Off WAL">
                        <Form.Item name="sprdOffWal" style={{ marginBottom: 0 }}>
                            <InputNumber
                                style={{ width: '100%' }}
                                controls={false}
                                value={asset.sprdOffWal}
                            />
                        </Form.Item>
                    </Descriptions.Item>
                    <Descriptions.Item label="Volatility">
                        <Form.Item name="volatility" style={{ marginBottom: 0 }}>
                            <InputNumber
                                style={{ width: '100%' }}
                                controls={false}
                                value={asset.volatility}
                            />
                        </Form.Item>
                    </Descriptions.Item>
                    <Descriptions.Item label="Vol Conv">
                        <Form.Item name="volConv" style={{ marginBottom: 0 }}>
                            <InputNumber
                                style={{ width: '100%' }}
                                controls={false}
                                value={asset.volConv}
                            />
                        </Form.Item>
                    </Descriptions.Item>
                </Descriptions>
                <br />
                <Descriptions title="WAL / ZV WAL" size="small" column={3} bordered>
                    <Descriptions.Item label="WAL">
                        <Form.Item name="wal" style={{ marginBottom: 0 }}>
                            <InputNumber
                                style={{ width: '100%' }}
                                controls={false}
                                value={asset.wal}
                            />
                        </Form.Item>
                    </Descriptions.Item>
                    <Descriptions.Item label="WAL to Worst">
                        <Form.Item name="walToWorst" style={{ marginBottom: 0 }}>
                            <InputNumber
                                style={{ width: '100%' }}
                                controls={false}
                                value={asset.walToWorst}
                            />
                        </Form.Item>
                    </Descriptions.Item>
                    <Descriptions.Item label="ZV WAL">
                        <Form.Item name="zvWal" style={{ marginBottom: 0 }}>
                            <InputNumber
                                style={{ width: '100%' }}
                                controls={false}
                                value={asset.zvWal}
                            />
                        </Form.Item>
                    </Descriptions.Item>
                </Descriptions>
                <br />
                <Descriptions title="Key Rate Durations (KRD)" size="small" column={4} bordered>
                    <Descriptions.Item label="3M">
                        <Form.Item name="krd3M" style={{ marginBottom: 0 }}>
                            <InputNumber
                                style={{ width: '100%' }}
                                controls={false}
                                value={asset.krd3M}
                            />
                        </Form.Item>
                    </Descriptions.Item>
                    <Descriptions.Item label="1Y">
                        <Form.Item name="krd1Y" style={{ marginBottom: 0 }}>
                            <InputNumber
                                style={{ width: '100%' }}
                                controls={false}
                                value={asset.krd1Y}
                            />
                        </Form.Item>
                    </Descriptions.Item>
                    <Descriptions.Item label="2Y">
                        <Form.Item name="krd2Y" style={{ marginBottom: 0 }}>
                            <InputNumber
                                style={{ width: '100%' }}
                                controls={false}
                                value={asset.krd2Y}
                            />
                        </Form.Item>
                    </Descriptions.Item>
                    <Descriptions.Item label="3Y">
                        <Form.Item name="krd3Y" style={{ marginBottom: 0 }}>
                            <InputNumber
                                style={{ width: '100%' }}
                                controls={false}
                                value={asset.krd3Y}
                            />
                        </Form.Item>
                    </Descriptions.Item>
                    <Descriptions.Item label="5Y">
                        <Form.Item name="krd5Y" style={{ marginBottom: 0 }}>
                            <InputNumber
                                style={{ width: '100%' }}
                                controls={false}
                                value={asset.krd5Y}
                            />
                        </Form.Item>
                    </Descriptions.Item>
                    <Descriptions.Item label="7Y">
                        <Form.Item name="krd7Y" style={{ marginBottom: 0 }}>
                            <InputNumber
                                style={{ width: '100%' }}
                                controls={false}
                                value={asset.krd7Y}
                            />
                        </Form.Item>
                    </Descriptions.Item>
                    <Descriptions.Item label="10Y">
                        <Form.Item name="krd10Y" style={{ marginBottom: 0 }}>
                            <InputNumber
                                style={{ width: '100%' }}
                                controls={false}
                                value={asset.krd10Y}
                            />
                        </Form.Item>
                    </Descriptions.Item>
                    <Descriptions.Item label="15Y">
                        <Form.Item name="krd15Y" style={{ marginBottom: 0 }}>
                            <InputNumber
                                style={{ width: '100%' }}
                                controls={false}
                                value={asset.krd15Y}
                            />
                        </Form.Item>
                    </Descriptions.Item>
                    <Descriptions.Item label="20Y">
                        <Form.Item name="krd20Y" style={{ marginBottom: 0 }}>
                            <InputNumber
                                style={{ width: '100%' }}
                                controls={false}
                                value={asset.krd20Y}
                            />
                        </Form.Item>
                    </Descriptions.Item>
                    <Descriptions.Item label="25Y">
                        <Form.Item name="krd25Y" style={{ marginBottom: 0 }}>
                            <InputNumber
                                style={{ width: '100%' }}
                                controls={false}
                                value={asset.krd25Y}
                            />
                        </Form.Item>
                    </Descriptions.Item>
                    <Descriptions.Item label="30Y">
                        <Form.Item name="krd30Y" style={{ marginBottom: 0 }}>
                            <InputNumber
                                style={{ width: '100%' }}
                                controls={false}
                                value={asset.krd30Y}
                            />
                        </Form.Item>
                    </Descriptions.Item>
                    <Descriptions.Item label="40Y">
                        <Form.Item name="krd40Y" style={{ marginBottom: 0 }}>
                            <InputNumber
                                style={{ width: '100%' }}
                                controls={false}
                                value={asset.krd40Y}
                            />
                        </Form.Item>
                    </Descriptions.Item>
                    {/* <Descriptions.Item label="50Y">
                            <Form.Item name="krd50Y" style={{ marginBottom: 0 }}>
                                <InputNumber
                                    style={{ width: "100%" }}
                                    controls={false}
                                    value={asset.krd50Y}
                                />
                            </Form.Item>
                        </Descriptions.Item> */}
                </Descriptions>
                <br />
                <Descriptions title="Processing & Audit" size="small" column={3} bordered>
                    <Descriptions.Item label="File Processing Status">
                        {asset.fileProcessingStatus}
                    </Descriptions.Item>
                    <Descriptions.Item label="Retry Count">
                        {asset.retryCount ?? nullspace}
                    </Descriptions.Item>
                    <Descriptions.Item label="Last Attempt Date">
                        {asset.lastAttemptDate}
                    </Descriptions.Item>
                    <Descriptions.Item label="BRS File Name">{asset.brsFileName}</Descriptions.Item>
                    <Descriptions.Item label="Created By">{asset.createdBy}</Descriptions.Item>
                    <Descriptions.Item label="Created Date">
                        {convertDateToPST(asset.createdDate)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Last Modified By">
                        {asset.lastModifiedBy}
                    </Descriptions.Item>
                    <Descriptions.Item label="Last Modified Date">
                        {convertDateToPST(asset.lastModifiedDate)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Status">{asset.status}</Descriptions.Item>
                    <Descriptions.Item label="Claimed By">{asset.claimedBy}</Descriptions.Item>
                    <Descriptions.Item label="Claimed At">
                        {convertDateToPST(asset.claimedAt ?? '')}
                    </Descriptions.Item>
                </Descriptions>
                <br />
                <Descriptions size="small" column={3} bordered>
                    <Descriptions.Item label="Note">
                        <Form.Item name="noteTextArea">
                            <Input.TextArea />
                        </Form.Item>
                    </Descriptions.Item>
                </Descriptions>
                <Notes selectedRow={selectedRow} noteType={'AOR'} />
            </div>
        </>
    );
}
