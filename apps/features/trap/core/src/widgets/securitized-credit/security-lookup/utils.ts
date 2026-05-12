export function assetTypeColor(type: string): string {
    return (
        (
            {
                'NA-RMBS': 'blue',
                CMBS: 'purple',
                CLO: 'cyan',
                ABS: 'green',
                AMBS: 'geekblue',
            } as Record<string, string>
        )[type] ?? 'default'
    );
}
