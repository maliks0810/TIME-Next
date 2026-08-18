import {
    Radio,
    type RadioChangeEvent,
} from 'antd';

interface KeySelectorProps {
    keys: string[];
    selectedKey: string;
    onChange: (key: string) => void;
    title?: string;
}

export default function KeySelector({
    keys,
    selectedKey,
    onChange,
}: KeySelectorProps) {

    if (keys.length === 0) {
        return null;
    }

    const handleChange = (
        event: RadioChangeEvent
    ) => {
        onChange(String(event.target.value));
    };

    return (
        <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ fontWeight: 'bold' }} >
                Select:
            </div>
            <Radio.Group
                value={selectedKey}
                onChange={handleChange}
                style={{ display: 'flex', flexWrap: 'wrap', }}
            >
                {keys.map((key) => (
                    <Radio
                        key={key}
                        value={key}
                    >
                        {key}
                    </Radio>
                ))}
            </Radio.Group>
        </div>
    );
}