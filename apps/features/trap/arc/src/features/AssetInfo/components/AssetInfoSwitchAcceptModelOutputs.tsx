import { Form, Switch } from 'antd';


export const AssetInfoSwitchAcceptModelOutputs = ({
    value,
}: {
    value?: boolean;
}) => {
    return (
        <div style={{ marginBottom: 8 }}>
            <div style={{ minHeight: 20, fontSize: 13 }}>
                <Form.Item
                    noStyle
                    name="acceptModelOutputs"
                >
                    <Switch
                        value={value}
                        style={{
                            width: '20px',
                        }}
                    />
                </Form.Item>
            </div>
            <div style={{ fontSize: 9 }}>Use SAC API</div>
        </div>
    );
};
