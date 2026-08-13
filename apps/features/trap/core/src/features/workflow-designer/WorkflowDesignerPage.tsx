/* eslint-disable  @typescript-eslint/no-explicit-any */
import { theme } from 'antd';
import { useTheme, getThemeSurfaceMeta } from '../../theme/ThemeContext';

import CanvasContainer from '../../components/layout/CanvasContainer';
import { applySizing, toPersistedLayout } from '../../components/layout/sizing';

import DesignerHeader from './components/DesignerHeader';
import EmptyDesignerState from './components/EmptyDesignerState';
import DesignerCanvasItem from './components/DesignerCanvasItem';

import { useEffect, useMemo, useState } from 'react';
import { useWorkflowDesigner } from './hooks/useWorkflowDesigner';
import { setActiveCanvas } from '../landing/components/shell/activeCanvas';
import { ThemeName } from '../../theme/types';

type WorkflowDesignerPageProps = {
    // Provided when embedded inside a workflow tab (new shell). Omitted on the
    // standalone /designer route, where the hook falls back to query params.
    propTemplateId: string;
    versionId?: string;
    active?: boolean;
    // New shell: "Add Widget" opens the drawer's Widgets segment (the concept's library),
    // not the legacy in-designer picker modal.
    onRequestAddWidget?: () => void;
    onPublished?: () => void;
};

export default function WorkflowDesignerPage({
    propTemplateId,
    onPublished,
    active,
    onRequestAddWidget,
}: WorkflowDesignerPageProps) {
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const { token } = theme.useToken();
    const { themeName } = useTheme();
    const surfaceMeta = getThemeSurfaceMeta(themeName as ThemeName);

    const isDarkHud =
        themeName === 'dark' ||
        themeName === 'neonMint' ||
        themeName === 'vaporwave' ||
        themeName === 'neonGlow' ||
        themeName === 'solarizedDark' ||
        themeName === 'plumGradient' ||
        themeName === 'goldGradient' ||
        themeName === 'greenGradient' ||
        themeName === 'blueGradient' ||
        themeName === 'cyberpunk' ||
        themeName === 'matrix' ||
        themeName === 'dumpsterFire';

    const designerHeaderBackground = surfaceMeta.isGradientTheme
        ? surfaceMeta.hudGradient
        : `linear-gradient(180deg, ${token.colorBgElevated} 0%, ${token.colorBgContainer} 100%)`;

    const {
        nav,
        loading,
        loaded,
        templateId,
        selectedWidgetParams,
        layout,
        widgetsById,
        defaultContextJson,
        isDraftSaved,
        isPublished,
        isDraft,
        saveDisabledReason,
        publishDisabledReason,
        widgetDefById,
        selectedWidgetDef,
        filteredWidgetDefs,
        setSelectedWidgetDefId,
        setSelectedWidgetParams,
        onLayoutChange,
        addWidget,
        removeWidget,
        publish,
        updateWidgetConfig,
        contextHolder,
    } = useWorkflowDesigner({ onPublishedCb: onPublished, templateId: propTemplateId });

    useEffect(() => {
        if (layout.length !== 0) {
            setIsInitialLoading(false);
        }
    }, [layout]);

    useEffect(() => {
        if (!active) return;
        setActiveCanvas({
            isDraft,
            widgets: filteredWidgetDefs,
            addWidget,
            selectedWidgetParams,
            loading,
            onWidgetParamsSelect: setSelectedWidgetParams,
            setSelectedWidgetDefId,
            selectedWidgetDef,
            filteredWidgetDefs,
        });
        return () => setActiveCanvas(null);
    }, [active, isDraft, filteredWidgetDefs, selectedWidgetParams, loading, selectedWidgetDef]);

    // Decorate the layout with per-item resize policy derived from each
    // widget's `uiHints.sizing`. Opted-in widgets (e.g. the counter tile)
    // become drag-resizable with min/max + 10px height snap; every other item
    // is explicitly locked, so enabling grid-level resize never leaks to
    // widgets that haven't opted in. Decoration is render-only and stripped
    // via toPersistedLayout before persisting.
    const decoratedLayout = useMemo(
        () => applySizing(layout, widgetsById, widgetDefById),
        [layout, widgetsById, widgetDefById]
    );

    return (
        // Plain full-width divs (NOT antd Space) around the canvas: Space injects
        // .ant-space-item flex wrappers that shrink the grid's measured width below
        // 1840 → react-grid-layout's WidthProvider under-measures → resize handle
        // under-tracks. Gap spacing preserved via marginBottom.
        <div style={{ width: '100%' }}>
            {contextHolder}
            <div style={{ marginBottom: 16 }}>
                <DesignerHeader
                    templateId={propTemplateId}
                    loaded={loaded}
                    loading={loading}
                    isPublished={isPublished}
                    isDraft={isDraft}
                    isDarkHud={isDarkHud}
                    designerHeaderBackground={designerHeaderBackground}
                    borderStyle={
                        surfaceMeta.isGradientTheme
                            ? '1px solid rgba(255,255,255,0.10)'
                            : `1px solid ${token.colorBorderSecondary}`
                    }
                    boxShadow={
                        surfaceMeta.isGradientTheme
                            ? `inset 0 1px 0 rgba(255,255,255,0.08), 0 0 16px ${surfaceMeta.hudGlow}`
                            : 'none'
                    }
                    textColor={isDarkHud ? '#fff' : token.colorText}
                    secondaryTextColor={
                        isDarkHud ? 'rgba(255,255,255,0.82)' : token.colorTextSecondary
                    }
                    buttonBackground={isDarkHud ? 'rgba(255,255,255,0.10)' : token.colorBgElevated}
                    buttonBorder={
                        isDarkHud
                            ? '1px solid rgba(255,255,255,0.12)'
                            : `1px solid ${token.colorBorder}`
                    }
                    buttonTextColor={isDarkHud ? '#fff' : token.colorText}
                    saveDisabledReason={saveDisabledReason}
                    publishDisabledReason={publishDisabledReason}
                    onOpenLibrary={onRequestAddWidget as () => void}
                    onPublish={() => void publish()}
                    onBack={() => nav('/trap')}
                />
            </div>

            {!propTemplateId || layout.length === 0 ? (
                <EmptyDesignerState
                    hasRoute={!!templateId}
                    hasWidgets={layout.length > 0}
                    isPublished={isPublished}
                    onBack={() => nav('/trap')}
                    onOpenLibrary={onRequestAddWidget}
                />
            ) : (
                <CanvasContainer
                    layout={decoratedLayout as any}
                    onLayoutChange={(current) =>
                        onLayoutChange((current as any[]).map(toPersistedLayout) as any)
                    }
                    isInitialLoading={isInitialLoading}
                    draggableHandle=".widget-drag-handle"
                    draggableCancel=".rgl-no-drag"
                    isDraggable={!isPublished}
                    isResizable={!isPublished}
                >
                    {decoratedLayout
                        .filter((it) => !!widgetsById[it.i])
                        .map((it) => {
                            const widget = widgetsById[it.i];
                            const widgetDefinition = widgetDefById[widget?.widgetDefinitionId];

                            return (
                                <DesignerCanvasItem
                                    key={it.i}
                                    item={it}
                                    widget={widget}
                                    widgetDefinition={widgetDefinition}
                                    templateId={propTemplateId}
                                    isPublished={isPublished}
                                    isDraft={isDraft}
                                    isDraftSaved={isDraftSaved}
                                    defaultContextJson={defaultContextJson}
                                    onRemove={removeWidget}
                                    onConfigUpdate={updateWidgetConfig}
                                />
                            );
                        })}
                </CanvasContainer>
            )}
        </div>
    );
}
