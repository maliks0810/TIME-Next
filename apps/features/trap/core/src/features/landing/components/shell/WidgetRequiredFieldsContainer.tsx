/* eslint-disable  @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { Input, Select, Typography } from 'antd';

import { useActiveCanvas } from '../shell/activeCanvas';

export const WidgetRequiredFieldsContainer = () => {
    const [paramToUpdate, setParamToUpdate] = useState({ requiredField: '', value: '' });

    const activeCanvas = useActiveCanvas();

    useEffect(() => {
        activeCanvas?.onWidgetParamsSelect((params: { [key: string]: string }) => ({
            ...params,
            [paramToUpdate.requiredField]: paramToUpdate.value,
        }));
    }, [paramToUpdate]);
    const selectedWidgetRequiredFields = activeCanvas?.selectedWidgetDef?.configSchema?.required;

    const isSelectedWidgetHasRequiredFields = selectedWidgetRequiredFields?.length > 0;

    const getOptions = (field: any) => {
        // If the property has options field then it depends on another field.
        if (field.options) {
            const selectedOption = field.options.find((option: any) => {
                return (
                    activeCanvas?.selectedWidgetParams[option.condition.key] ===
                    option.condition.value
                );
            });

            if (selectedOption) return selectedOption.options;
        }
        return undefined;
    };
    return isSelectedWidgetHasRequiredFields
        ? selectedWidgetRequiredFields?.map((requiredField: string) => {
              let inputComponent;
              if (activeCanvas?.selectedWidgetDef?.configSchema?.properties[requiredField]?.enum) {
                  const selectValue = activeCanvas?.selectedWidgetParams[requiredField];
                  const selectOptions =
                      (getOptions(
                          activeCanvas?.selectedWidgetDef?.configSchema.properties[requiredField]
                      ) ||
                          activeCanvas?.selectedWidgetDef?.configSchema.properties[requiredField]
                              ?.enum) ??
                      [];
                  inputComponent = (
                      <Select
                          value={selectValue}
                          onChange={(fieldName) =>
                              activeCanvas?.onWidgetParamsSelect(
                                  (params: { [key: string]: string }) => ({
                                      ...params,
                                      [requiredField]: fieldName,
                                  })
                              )
                          }
                          placeholder={
                              activeCanvas?.selectedWidgetDef?.configSchema.properties[
                                  requiredField
                              ]?.title
                          }
                          style={{
                              width: '100%',
                          }}
                          options={selectOptions.map((fieldName: string) => ({
                              value: fieldName,
                              label: fieldName,
                          }))}
                      />
                  );
              } else {
                  const inputValue = activeCanvas?.selectedWidgetParams[requiredField];

                  inputComponent = (
                      <Input
                          value={inputValue}
                          style={{
                              width: '100%',
                          }}
                          onChange={(e) =>
                              setParamToUpdate({
                                  requiredField,
                                  value: e.target.value,
                              })
                          }
                          placeholder={
                              activeCanvas?.selectedWidgetDef?.configSchema?.properties[
                                  requiredField
                              ]?.title
                          }
                      />
                  );
              }

              return (
                  <div key={requiredField} style={{ marginTop: 8 }}>
                      <Typography.Text strong style={{ fontSize: 12 }}>
                          {
                              activeCanvas?.selectedWidgetDef?.configSchema?.properties[
                                  requiredField
                              ]?.title
                          }
                          *
                      </Typography.Text>
                      {inputComponent}
                  </div>
              );
          })
        : null;
};
