/* eslint-disable  @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from 'react';
import { Button, Input, Modal, Select, Space, Tag, Typography, theme } from 'antd';
import { useTheme, getThemeSurfaceMeta } from '../../../theme/ThemeContext';
import styles from './WidgetPickerModal.module.scss';
import { SimplifiedWidgetView } from './SimplifiedWidgetView';
import { PreviewWidgetsContainer } from './PreviewWidgetsContainer';
import { useDebounced } from '../../../utils/useDebounced';

type WidgetPickerModalProps = {
    open: boolean;
    isPublished: boolean;
    templateId: string;
    widgetSearch: string;
    selectedCategory: string;
    widgetCategories: string[];
    filteredWidgetDefs: any[];
    selectedWidgetDefId: string;
    selectedWidgetVariantId?: string;
    selectedWidgetDef?: any;
    selectedParams: { [key: string]: string | number };
    onClose: () => void;
    onSearchChange: (value: string) => void;
    onCategoryChange: (value: string) => void;
    onSelectWidget: (widgetId: string) => void;
    onSelectVariant: (variantId?: string) => void;
    onSelectParams: (params?: any) => void;
    onAddWidget: () => void;
};

export default function WidgetPickerModal(props: WidgetPickerModalProps) {
    const { token } = theme.useToken();
    const { themeName } = useTheme();
    const surfaceMeta = getThemeSurfaceMeta(themeName);
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    const [isPreviewModeEnabled, setIsPreviewModeEnabled] = useState(false);
    const [paramToUpdate, setParamToUpdate] = useState({ requiredField: '', value: '' });

    const debouncedParams = useDebounced(paramToUpdate);

    useEffect(() => {
        props.onSelectParams((params: { [key: string]: string }) => ({
            ...params,
            [paramToUpdate.requiredField]: paramToUpdate.value,
        }));
    }, [debouncedParams]);

    const selectedWidgetRequiredFields = props.selectedWidgetDef?.configSchema?.required;
    const isSelectedWidgetHasRequiredFields = selectedWidgetRequiredFields?.length > 0;

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

    const modalPanelBackground = surfaceMeta.isGradientTheme
        ? 'rgba(0,0,0,0.32)' // stronger overlay so modal edges are clearer
        : token.colorBgElevated;

    const sidebarBackground = surfaceMeta.isGradientTheme
        ? 'rgba(255,255,255,0.03)'
        : isDarkHud
          ? 'rgba(255,255,255,0.03)'
          : token.colorBgContainer;

    const titleColor = isDarkHud ? '#fff' : token.colorText;
    const secondaryColor = isDarkHud ? 'rgba(255,255,255,0.72)' : token.colorTextSecondary;

    const hasAllRequiredParams = useMemo(
        () =>
            selectedWidgetRequiredFields
                ? selectedWidgetRequiredFields.every((key: string) => !!props.selectedParams[key])
                : true,
        [props.selectedParams, selectedWidgetRequiredFields]
    );

    const addWidgetDisabled =
        !props.selectedWidgetDef || props.isPublished || !props.templateId || !hasAllRequiredParams;

    return (
        <Modal
            title={null}
            open={props.open}
            onCancel={props.onClose}
            footer={null}
            width={1080}
            centered
            className={styles.widgetPickerModal}
            destroyOnHidden
            styles={{
                body: {
                    background: surfaceMeta.isGradientTheme ? 'rgba(0,0,0,0.32)' : undefined,
                },
                content: {
                    padding: 0,
                    overflow: 'hidden',
                    borderRadius: 20,
                    background: modalPanelBackground,
                    boxShadow: '0 12px 40px rgba(0,0,0,0.35)',
                    border: surfaceMeta.isGradientTheme
                        ? '1px solid rgba(255,255,255,0.14)'
                        : `1px solid ${token.colorBorderSecondary}`,
                },
                header: {
                    display: 'none',
                },
            }}
        >
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: '240px minmax(0, 1fr)',
                    minHeight: 640,
                }}
            >
                <div
                    style={{
                        borderRight: surfaceMeta.isGradientTheme
                            ? '1px solid rgba(255,255,255,0.10)'
                            : `1px solid ${token.colorBorderSecondary}`,
                        background: sidebarBackground,
                        padding: '20px 40px 20px 20px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 18,
                        overflowY: 'auto',
                        maxHeight: '78vh',
                    }}
                >
                    <div>
                        <Typography.Title level={4} style={{ margin: 0, color: titleColor }}>
                            Browse Widgets
                        </Typography.Title>
                        <Typography.Text style={{ fontSize: 12, color: secondaryColor }}>
                            Explore widget types and add one to the canvas.
                        </Typography.Text>
                    </div>

                    <div>
                        <Typography.Text strong style={{ fontSize: 12, color: titleColor }}>
                            Search
                        </Typography.Text>
                        <Input.Search
                            placeholder="Search widgets"
                            value={props.widgetSearch}
                            onChange={(e) => props.onSearchChange(e.target.value)}
                            allowClear
                            style={{ marginTop: 8 }}
                        />
                    </div>

                    <div>
                        <Typography.Text strong style={{ fontSize: 12, color: titleColor }}>
                            Categories
                        </Typography.Text>
                        <Space wrap size={[8, 8]} style={{ width: '100%', marginTop: 10 }}>
                            {props.widgetCategories.map((cat) => {
                                const active = props.selectedCategory === cat;
                                return (
                                    <Button
                                        key={cat}
                                        size="small"
                                        type={active ? 'primary' : 'default'}
                                        onClick={() => props.onCategoryChange(cat)}
                                        style={{ borderRadius: 999 }}
                                    >
                                        {cat}
                                    </Button>
                                );
                            })}
                        </Space>
                    </div>

                    <div style={{ marginTop: 'auto' }}>
                        {props.selectedWidgetDef ? (
                            <Space direction="vertical" size={12} style={{ width: '100%' }}>
                                <div>
                                    <Typography.Text
                                        strong
                                        style={{ fontSize: 12, color: titleColor }}
                                    >
                                        Selected
                                    </Typography.Text>
                                    <div style={{ marginTop: 8 }}>
                                        <Tag color="blue" style={{ marginInlineEnd: 0 }}>
                                            {props.selectedWidgetDef.name}
                                        </Tag>
                                    </div>
                                </div>

                                {isSelectedWidgetHasRequiredFields
                                    ? selectedWidgetRequiredFields?.map((requiredField: string) => {
                                          let inputComponent;
                                          if (
                                              props.selectedWidgetDef.configSchema.properties[
                                                  requiredField
                                              ]?.enum
                                          ) {
                                              const selectValue =
                                                  props.selectedParams[requiredField];
                                              inputComponent = (
                                                  <Select
                                                      value={selectValue}
                                                      onChange={(fieldName) =>
                                                          props.onSelectParams(
                                                              (params: {
                                                                  [key: string]: string;
                                                              }) => ({
                                                                  ...params,
                                                                  [requiredField]: fieldName,
                                                              })
                                                          )
                                                      }
                                                      placeholder={
                                                          props.selectedWidgetDef.configSchema
                                                              .properties[requiredField]?.title
                                                      }
                                                      style={{ width: '100%', marginTop: 8 }}
                                                      options={(
                                                          props.selectedWidgetDef.configSchema
                                                              .properties[requiredField]?.enum ?? []
                                                      ).map((fieldName: string) => ({
                                                          value: fieldName,
                                                          label: fieldName,
                                                      }))}
                                                  />
                                              );
                                          } else {
                                              const inputValue =
                                                  props.selectedParams[requiredField];

                                              inputComponent = (
                                                  <Input
                                                      value={inputValue}
                                                      style={{ width: '100%', marginTop: 8 }}
                                                      onChange={(e) =>
                                                          setParamToUpdate({
                                                              requiredField,
                                                              value: e.target.value,
                                                          })
                                                      }
                                                      placeholder={
                                                          props.selectedWidgetDef.configSchema
                                                              .properties[requiredField]?.title
                                                      }
                                                  />
                                              );
                                          }

                                          return (
                                              <div key={requiredField}>
                                                  <Typography.Text
                                                      strong
                                                      style={{ fontSize: 12, color: titleColor }}
                                                  >
                                                      {
                                                          props.selectedWidgetDef.configSchema
                                                              .properties[requiredField]?.title
                                                      }
                                                      *
                                                  </Typography.Text>
                                                  {inputComponent}
                                              </div>
                                          );
                                      })
                                    : null}

                                <div>
                                    <Typography.Text
                                        strong
                                        style={{ fontSize: 12, color: titleColor }}
                                    >
                                        Variant
                                    </Typography.Text>
                                    <Select
                                        value={props.selectedWidgetVariantId}
                                        onChange={props.onSelectVariant}
                                        placeholder="Widget variant"
                                        style={{ width: '100%', marginTop: 8 }}
                                        options={(props.selectedWidgetDef?.variants ?? []).map(
                                            (variant: any) => ({
                                                value: variant.id,
                                                label: variant.label,
                                            })
                                        )}
                                    />
                                </div>

                                <Button
                                    type="primary"
                                    onClick={props.onAddWidget}
                                    disabled={addWidgetDisabled}
                                >
                                    Add Widget to Canvas
                                </Button>
                            </Space>
                        ) : (
                            <Typography.Text style={{ fontSize: 12, color: secondaryColor }}>
                                Select a widget to choose a variant and add it to the canvas.
                            </Typography.Text>
                        )}
                    </div>
                </div>

                <div className={styles.widgetsContainer}>
                    {/* <div
                        style={{
                            display: 'flex',
                            justifyContent: 'end',
                            marginBottom: 8,
                            paddingRight: 16,
                        }}
                    >
                        <Switch
                            checkedChildren="Preview"
                            unCheckedChildren="Compact"
                            defaultChecked
                            onChange={setIsPreviewModeEnabled}
                        />
                    </div> */}
                    {isPreviewModeEnabled ? (
                        <PreviewWidgetsContainer
                            filteredWidgetDefs={props.filteredWidgetDefs}
                            selectedWidgetDefId={props.selectedWidgetDefId}
                            onSelectParams={props.onSelectParams}
                            onSelectWidget={props.onSelectWidget}
                        />
                    ) : (
                        <SimplifiedWidgetView
                            filteredWidgetDefs={props.filteredWidgetDefs}
                            selectedWidgetDefId={props.selectedWidgetDefId}
                            selectedWidgetDef={props.selectedWidgetDef}
                            selectedParams={props.selectedParams}
                            onSelectParams={props.onSelectParams}
                            onSelectWidget={props.onSelectWidget}
                            selectedWidgetVariantId={props.selectedWidgetVariantId}
                        />
                    )}
                </div>
            </div>
        </Modal>
    );
}
