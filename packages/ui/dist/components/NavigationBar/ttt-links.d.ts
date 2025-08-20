export type TTTNames = "TRAP" | "TOD" | "TIP";
interface LinkDetails {
    title: TTTNames;
    url: string;
    disabled: boolean;
}
export declare const TTTLinks: Record<TTTNames, LinkDetails>;
export {};
