import { useEffect, useState } from 'react';
import { Descriptions } from 'antd';
import { getSecuritySettings } from './lib/services';
import { SecuritySettingsType } from './lib/types';

export default function SecuritySettings({
    selectedAssetId,
    latestUpdateTimestamp,
}: {
    selectedAssetId?: number | null;
    latestUpdateTimestamp: number;
}) {
    const [securitySettings, setSecuritySettings] = useState<SecuritySettingsType[] | null>([
        {
            aladdinId: null,
            price: null,
            modelFamily: null,
            interestRateScenario: null,
            overnightRisk: null,
            analysisDate: null,
            oadOacMultiplier: null,
            anserCode: null,
        },
    ]);

    useEffect(() => {
        if (selectedAssetId) {
            getSecuritySettings(selectedAssetId).then(({ data }) => {
                setSecuritySettings(data.response);
            });
        }
    }, [selectedAssetId, latestUpdateTimestamp]);

    return (
        <div className="securitySettingsContainer">
            <div className="securitySettingsHeader">Security Settings</div>
            <Descriptions column={6} layout="vertical" bordered>
                {securitySettings?.map((securitySettingItem) => (
                    <>
                        <Descriptions.Item label="Price" style={{ minWidth: 60 }}>
                            {securitySettingItem.price}
                        </Descriptions.Item>
                        <Descriptions.Item label="Model Family">
                            {securitySettingItem.modelFamily}
                        </Descriptions.Item>
                        <Descriptions.Item label="Interest Rate Scenario">
                            {securitySettingItem.interestRateScenario}
                        </Descriptions.Item>
                        <Descriptions.Item label="Overnight Risk">
                            {securitySettingItem.overnightRisk}
                        </Descriptions.Item>
                        <Descriptions.Item label="Analytics Date">
                            {securitySettingItem.analysisDate}
                        </Descriptions.Item>
                        <Descriptions.Item label="OAD/OAC Multiplier">
                            {securitySettingItem.oadOacMultiplier}
                        </Descriptions.Item>
                    </>
                ))}
            </Descriptions>
        </div>
    );
}
