export type ChannelId = '1' | '2' | '3' | '4';
export type WidgetValueType =
    | (string | number | boolean | null)[]
    | { [key: string]: string | number | boolean | null }
    | { [key: string]: string | number | boolean | null }[]
    | number
    | boolean
    | string
    | null;

export type ChartData = {
    dates: string[];
    labels: string[];
    series: [];
};
