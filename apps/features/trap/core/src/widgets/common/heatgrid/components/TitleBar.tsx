import { FileExcelOutlined, SettingOutlined } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';
import '../heatgrid.scss';
import { Props } from './HeatmapWidgetBase';

type TitleBarProps = Pick<
    Props,
    'foundation' | 'titleActions' | 'exportMeta' | 'ready' | 'title'
> & {
    exporting: boolean;
    onExport: () => void;
    toggleDrawer: () => void;
};
export const TitleBar = ({
    foundation,
    titleActions,
    exportMeta,
    exporting,
    title,
    onExport,
    ready,
    toggleDrawer,
}: TitleBarProps) => {
    return (
        <div className="wg-titlebar">
            {foundation.showTitle && (
                <div className="wg-title">
                    <div className="brand-mark">
                        <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true">
                            <g
                                stroke="currentColor"
                                strokeWidth="2.4"
                                strokeLinecap="round"
                                fill="none"
                            >
                                <path d="M3 8 h10 a3 3 0 1 0 -3 -3" />
                                <path d="M3 13 h14 a3 3 0 1 1 -3 3" />
                                <path d="M3 18 h7" />
                            </g>
                        </svg>
                    </div>
                    {title}
                </div>
            )}
            <div className="wg-actions">
                {titleActions}

                {exportMeta && foundation.showExport && (
                    <Tooltip title="Export to Excel — current view">
                        <Button
                            type="text"
                            size="small"
                            icon={<FileExcelOutlined />}
                            loading={exporting}
                            disabled={!ready}
                            onClick={onExport}
                        />
                    </Tooltip>
                )}
                <Tooltip title="Display settings">
                    <Button
                        type="text"
                        size="small"
                        icon={<SettingOutlined />}
                        onClick={() => toggleDrawer()}
                    />
                </Tooltip>
            </div>
        </div>
    );
};
