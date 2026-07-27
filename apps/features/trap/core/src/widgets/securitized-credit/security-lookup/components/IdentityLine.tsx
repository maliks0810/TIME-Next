import { Tag, theme } from 'antd';
import type { SearchResult } from '../types';
import { assetTypeColor } from '../utils';

type Props = { security: SearchResult; inline?: boolean };

export const IdentityLine = ({ security, inline }: Props) => {
    const { token } = theme.useToken();
    return (
        <div
            style={{
                display: 'flex',
                alignItems: inline ? 'center' : 'flex-start',
                flexDirection: inline ? 'row' : 'column',
                gap: inline ? 8 : 4,
                minWidth: 0,
            }}
        >
            <span
                style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: token.colorText,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    minWidth: 0,
                }}
                title={security.name}
            >
                {security.name}
            </span>
            {security.assetType && (
                <Tag
                    color={assetTypeColor(security.assetType)}
                    style={{ margin: 0, fontSize: 10, flexShrink: 0 }}
                >
                    {security.assetType}
                </Tag>
            )}
        </div>
    );
};