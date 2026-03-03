export const AssetInfoItem = ({
    title,
    value = '---',
    titleColor,
    valueColor,
}: {
    title: string;
    value?: string | number | null;
    titleColor?: string;
    valueColor?: string;
}) => (
    <div style={{ marginBottom: 8 }}>
        <div style={{ minHeight: 20, fontSize: 13, color: valueColor }}>{value}</div>
        <div style={{ fontSize: 9, color: titleColor }}>{title}</div>
    </div>
);
