/* eslint-disable  @typescript-eslint/no-explicit-any */
import { WidgetDefinitionLike, WidgetInstanceLike } from '../../types/widget';
import { Modal, message } from 'antd';
import { DesignerWidgetInstance } from '../workflow-designer/types/workflowDesigner.types';
import { useMemo, useState } from 'react';
import { PropertyConfig } from './components/PropertyConfig';
import styles from './WidgetConfigureModal.module.scss';

import { getTemplateVersion, updateDraftVersion } from '../../api/trap';
import { ensureConfigShape } from './helpers/helpers';
type PropertyValue = string | number | boolean;

type WidgetConfigureModalProps = {
    isOpen: boolean;
    onClose: () => void;
    templateId: string;
    versionId: string;
    onSave: (widget: WidgetInstanceLike) => void;
    data: {
        instance: DesignerWidgetInstance;
        definition: WidgetDefinitionLike;
    };
};

export const WidgetConfigureModal = ({
    isOpen,
    data,
    onClose,
    templateId,
    versionId,
    onSave,
}: WidgetConfigureModalProps) => {
    const { definition = {}, instance } = data;
    const { instanceId } = instance;
    const { configSchema = {}, listensToKeys } = definition;

    const supportsCusip = (listensToKeys ?? []).includes('security.cusip');

    const [params, setParams] = useState<Record<string, PropertyValue>>(
        () => instance.config?.params || {}
    );
    const [isLoading, setIsLoading] = useState(false);
    const setField = (k: string, v: PropertyValue) => setParams((prev) => ({ ...prev, [k]: v }));
    const properties = configSchema['properties'];
    const required = configSchema['required'];
    const propertyItems = useMemo(() => {
        if (!properties) return 'No Properties to Configure';

        const propertyKeys = Object.keys(properties);
        return propertyKeys.map((el) => (
            <PropertyConfig
                property={properties[el]}
                key={el}
                setField={setField}
                propertyKey={el}
                required={required.includes(el)}
                currentValue={instance.config?.params?.[el]}
            />
        ));
    }, [properties, required, instance]);

    if (!isOpen) return null; //Don't render on closed

    const save = async () => {
        setIsLoading(true);
        const templateVersion = await getTemplateVersion(templateId, versionId);
        if (!templateVersion || !instance || !definition) return;

        try {
            let changedWidget;
            const nextWidgets = (templateVersion.widgets ?? []).map((w: WidgetInstanceLike) => {
                if (String(w.id) !== instanceId) return w;

                const config = ensureConfigShape(w.config);
                const nextParams: Record<string, PropertyValue> = { ...(config.params ?? {}) };

                const schemaProps = (definition.configSchema?.properties ?? {}) as Record<
                    string,
                    PropertyValue
                >;
                for (const key of Object.keys(schemaProps)) {
                    nextParams[key] = params[key];
                }

                if (!schemaProps.useContextCusip && supportsCusip) {
                    nextParams.__useContextCusip = !!params.__useContextCusip;
                }

                config.params = nextParams;
                changedWidget = { ...w, config };
                return { ...w, config };
            });

            const payload = {
                ...templateVersion,
                theme: templateVersion.theme ?? {},
                defaultContext: templateVersion.defaultContext ?? {},
                layoutVariants: templateVersion.layoutVariants ?? [],
                widgets: nextWidgets,
            };
            await updateDraftVersion(templateId, versionId, payload);
            onClose();

            if (changedWidget) onSave(changedWidget);

            message.success('Saved configuration');
        } catch (e: any) {
            console.log(e);
            message.error(e?.message ?? 'Save failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            open={isOpen}
            onCancel={onClose}
            title={`Configure ${data.definition.name} widget`}
            okText={'Save'}
            onOk={save}
            okButtonProps={{ disabled: isLoading }}
            centered
        >
            <div className={styles.content}>{propertyItems}</div>
        </Modal>
    );
};
