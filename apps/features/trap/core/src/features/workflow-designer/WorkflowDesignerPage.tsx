/* eslint-disable  @typescript-eslint/no-explicit-any */
import { Space, theme } from 'antd';
import { useTheme, getThemeSurfaceMeta } from '../../theme/ThemeContext';

import CanvasContainer from '../../components/layout/CanvasContainer';
import { applySizing, toPersistedLayout } from '../../components/layout/sizing';

import DesignerHeader from './components/DesignerHeader';
import WidgetPickerModal from './components/WidgetPickerModal';
import EmptyDesignerState from './components/EmptyDesignerState';
import DesignerCanvasItem from './components/DesignerCanvasItem';

import { useEffect, useMemo, useState } from 'react';
import { useWorkflowDesigner } from './hooks/useWorkflowDesigner';

export default function WorkflowDesignerPage() {
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const { token } = theme.useToken();
    const { themeName } = useTheme();
    const surfaceMeta = getThemeSurfaceMeta(themeName);

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
        widgetSearch,
        selectedCategory,
        selectedWidgetDefId,
        selectedWidgetVariantId,
        selectedWidgetParams,
        layout,
        widgetsById,
        defaultContextJson,
        isDraftSaved,
        widgetPickerOpen,
        isPublished,
        isDraft,
        saveDisabledReason,
        publishDisabledReason,
        widgetDefById,
        selectedWidgetDef,
        widgetCategories,
        filteredWidgetDefs,
        setWidgetSearch,
        setSelectedCategory,
        setSelectedWidgetDefId,
        setSelectedWidgetVariantId,
        setSelectedWidgetParams,
        setWidgetPickerOpen,
        onLayoutChange,
        addWidget,
        removeWidget,
        saveDraft,
        publish,
        updateWidgetConfig,
        contextHolder
    } = useWorkflowDesigner();

    useEffect(() => {
        if (layout.length !== 0) {
            setIsInitialLoading(false);
        }
    }, [layout]);

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
        <Space direction="vertical" size={16} style={{ width: '100%', gap: 4 }}>
            {contextHolder}
            <DesignerHeader
                templateId={templateId}
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
                secondaryTextColor={isDarkHud ? 'rgba(255,255,255,0.82)' : token.colorTextSecondary}
                buttonBackground={isDarkHud ? 'rgba(255,255,255,0.10)' : token.colorBgElevated}
                buttonBorder={
                    isDarkHud
                        ? '1px solid rgba(255,255,255,0.12)'
                        : `1px solid ${token.colorBorder}`
                }
                buttonTextColor={isDarkHud ? '#fff' : token.colorText}
                saveDisabledReason={saveDisabledReason}
                publishDisabledReason={publishDisabledReason}
                onOpenLibrary={() => setWidgetPickerOpen(true)}
                onSaveDraft={() => void saveDraft()}
                onPublish={() => void publish()}
                onBack={() => nav('/trap')}
            />

            {!templateId || layout.length === 0 ? (
                <EmptyDesignerState
                    hasRoute={!!templateId}
                    hasWidgets={layout.length > 0}
                    isPublished={isPublished}
                    onBack={() => nav('/trap')}
                    onOpenLibrary={() => setWidgetPickerOpen(true)}
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
                                    templateId={templateId}
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

            <WidgetPickerModal
                open={widgetPickerOpen}
                isPublished={isPublished}
                templateId={templateId}
                widgetSearch={widgetSearch}
                selectedCategory={selectedCategory}
                widgetCategories={widgetCategories}
                filteredWidgetDefs={filteredWidgetDefs}
                selectedWidgetDefId={selectedWidgetDefId}
                selectedWidgetVariantId={selectedWidgetVariantId}
                onSelectParams={setSelectedWidgetParams}
                selectedParams={selectedWidgetParams}
                selectedWidgetDef={selectedWidgetDef}
                onClose={() => setWidgetPickerOpen(false)}
                onSearchChange={setWidgetSearch}
                onCategoryChange={setSelectedCategory}
                onSelectWidget={(widgetId) => {
                    setSelectedWidgetDefId(widgetId);
                    setSelectedWidgetVariantId(undefined);
                }}
                onSelectVariant={setSelectedWidgetVariantId}
                onAddWidget={addWidget}
                loading={loading}
            />
        </Space>
    );
}
