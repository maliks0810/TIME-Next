import { ScenarioSummary } from '../../widgets/securitized-credit/new-asset/scenario-matrix/utils/scenarioSummary';

export type ChannelId = '1' | '2' | '3' | '4';
export type WidgetValueType =
    | (string | number | boolean | null)[]
    | { [key: string]: string | number | boolean | null }
    | { [key: string]: string | number | boolean | null }[]
    | ScenarioSummary
    | number
    | boolean
    | string
    | FormData
    | null;

export type ChartData = {
    dates: string[];
    labels: string[];
    series: [];
};
