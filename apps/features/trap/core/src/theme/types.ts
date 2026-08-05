export type ThemeName =
    | 'default'
    | 'dark'
    | 'holiday'
    | 'ocean'
    | 'sunset'
    | 'forest'
    | 'neonMint'
    | 'solarizedLight'
    | 'solarizedDark'
    | 'vaporwave'
    | 'neonGlow'
    | 'plumGradient'
    | 'goldGradient'
    | 'greenGradient'
    | 'blueGradient'
    | 'cyberpunk'
    | 'matrix'
    | 'dreamy'
    | 'ink'
    | 'dumpsterFire'
    // TCW-brand Default is carried by "default"/"dark" (rebuilt on the brand palette below).
    // Wealth is ported from the Credit Research Portal, with a light+dark pair.
    | 'wealthLight'
    | 'wealthDark';

export type ThemeMode = 'light' | 'dark';

// The curated, user-facing set: a family groups a light and/or dark variant. The Themes drawer
// renders one row per family (name · light tile · dark tile); a missing mode shows an empty slot.
export type ThemeGroup = 'Core' | 'Specialty';
export type ThemeFamily = {
    id: string;
    name: string;
    description: string;
    group: ThemeGroup;
    modes: Partial<Record<ThemeMode, ThemeName>>;
};
