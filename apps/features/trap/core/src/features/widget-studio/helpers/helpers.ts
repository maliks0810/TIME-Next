/* eslint-disable  @typescript-eslint/no-explicit-any */
export function ensureConfigShape(config: any): any {
    const c = config && typeof config === 'object' ? { ...config } : {};
    c.params = c.params && typeof c.params === 'object' ? { ...c.params } : {};
    return c;
}

export const createDefaultConfigFromDefinition = (properties: Record<string, any>) => {
    if (!properties) return {};
    return Object.keys(properties).reduce((acc, cur) => {
        if (properties[cur] && 'default' in properties[cur]) {
            return { ...acc, [cur]: properties[cur].default };
        } else return acc;
    }, {});
};
