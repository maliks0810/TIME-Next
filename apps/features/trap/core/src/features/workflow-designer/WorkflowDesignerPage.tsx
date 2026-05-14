/* eslint-disable  @typescript-eslint/no-explicit-any */
import { Space, theme } from 'antd';
import { useTheme, getThemeSurfaceMeta } from '../../theme/ThemeContext';

import CanvasContainer from '../../components/layout/CanvasContainer';

import DesignerHeader from './components/DesignerHeader';
import WidgetPickerModal from './components/WidgetPickerModal';
import EmptyDesignerState from './components/EmptyDesignerState';
import DesignerCanvasItem from './components/DesignerCanvasItem';

import { useEffect, useState } from 'react';
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
        themeName === 'tron' ||
        themeName === 'matrix' ||
        themeName === 'bladeRunner';

    const designerHeaderBackground = surfaceMeta.isGradientTheme
        ? surfaceMeta.hudGradient
        : `linear-gradient(180deg, ${token.colorBgElevated} 0%, ${token.colorBgContainer} 100%)`;

    const {
        nav,
        loading,
        loaded,
        templateId,
        versionId,
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
    } = useWorkflowDesigner();

    useEffect(() => {
        if (layout.length !== 0) {
            setIsInitialLoading(false);
        }
    }, [layout]);

    return (
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <DesignerHeader
                templateId={templateId}
                versionId={versionId}
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

            {!templateId || !versionId || layout.length === 0 ? (
                <EmptyDesignerState
                    hasRoute={!!templateId && !!versionId}
                    hasWidgets={layout.length > 0}
                    isPublished={isPublished}
                    onBack={() => nav('/trap')}
                    onOpenLibrary={() => setWidgetPickerOpen(true)}
                />
            ) : (
                <CanvasContainer
                    layout={layout as any}
                    onLayoutChange={onLayoutChange}
                    isInitialLoading={isInitialLoading}
                    draggableHandle=".widget-drag-handle"
                    draggableCancel=".rgl-no-drag"
                    compactType="vertical"
                    preventCollision={false}
                    isDraggable={!isPublished}
                    isResizable={false}
                >
                    {layout
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
                                    versionId={versionId}
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
            />
        </Space>
    );
}
