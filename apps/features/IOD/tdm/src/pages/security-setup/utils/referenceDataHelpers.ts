import type {
    IReferenceDataKeyValue,
    IDropdownOption,
    INormalizedReferenceData,
} from '../lib/types/referenceDataTypes';

export const toSelectOptions = (
    values: IReferenceDataKeyValue[] | undefined
): IDropdownOption[] => {
    if (!values || values.length === 0) {
        return [];
    }

    return values.map((item) => ({
        value: item.FieldDropdownValue,
        label: item.FieldDropdownValue,
        description: item.FieldDropdownDescription,
        id: item.FieldDropdownValueId,
    }));
};

export const getFieldOptions = (
    data: INormalizedReferenceData | null,
    fieldKey: string
): IDropdownOption[] => {
    if (!data) {
        return [];
    }

    const fieldData = data.byKey[fieldKey];
    if (!fieldData) {
        console.warn(`getFieldOptions: Field key "${fieldKey}" not found in reference data`);
        return [];
    }

    return toSelectOptions(fieldData.FieldDropdownValues);
};
