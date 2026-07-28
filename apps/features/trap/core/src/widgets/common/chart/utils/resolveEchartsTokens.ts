export type EchartsRoleColors = Record<string, string>;

export function resolveEchartsTokens<T>(option: T, roles: EchartsRoleColors): T {
    const walk = (node: unknown): unknown => {
        if (typeof node === 'string') {
            return node.charAt(0) === '@' && roles[node] ? roles[node] : node;
        }
        if (Array.isArray(node)) return node.map(walk);
        if (node && typeof node === 'object') {
            const out: Record<string, unknown> = {};
            for (const k of Object.keys(node as Record<string, unknown>)) {
                out[k] = walk((node as Record<string, unknown>)[k]);
            }
            return out;
        }
        return node;
    };
    return walk(JSON.parse(JSON.stringify(option))) as T;
}
