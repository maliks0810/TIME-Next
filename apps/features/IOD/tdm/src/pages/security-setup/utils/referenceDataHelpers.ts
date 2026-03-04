import type {
    IReferenceDataKeyValue,
    IDropdownOption,
    INormalizedReferenceData,
} from '../lib/types/referenceDataTypes';

export const toSelectOptions = (
    values: IReferenceDataKeyValue[] | undefined,
    isSelectValueOptions: boolean | false
): IDropdownOption[] => {
    if (!values || values.length === 0) {
        return [];
    }

    if (isSelectValueOptions) {
        return values.map((item) => {
            const description = item.fieldDropdownValue?.trim();
            const label = description ?? item.fieldDropdownValue;

            return {
                value: item.fieldDropdownValue,
                label,
                description: item.fieldDropdownDescription,
                id: item.fieldDropdownValueId,
            };
        });
    }

    return values.map((item) => {
        const description = item.fieldDropdownDescription?.trim();
        const label = description ?? item.fieldDropdownValue;

        return {
            value: item.fieldDropdownValue,
            label,
            description: item.fieldDropdownDescription,
            id: item.fieldDropdownValueId,
        };
    });
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

    const selectValueOptions: string[] = ['Market Sector'];
    const isSelectValueOptions: boolean = selectValueOptions.includes(fieldKey);
    return toSelectOptions(fieldData.fieldDropdownValues, isSelectValueOptions);
};
