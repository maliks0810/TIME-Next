/* eslint-disable  @typescript-eslint/no-explicit-any */
export function ensureConfigShape(config: any): any {
    const c = config && typeof config === 'object' ? { ...config } : {};
    c.params = c.params && typeof c.params === 'object' ? { ...c.params } : {};
    return c;
}
