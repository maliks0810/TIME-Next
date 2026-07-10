import { createClient, Client } from 'graphql-ws';
import { getIdentityHeaders } from './getIdentityHeaders';
// ws(s):// derived from the same env var api.ts uses
const WS_URL = (import.meta.env.VITE_APP_GRAPHQL_URL as string).replace(/^http/, 'ws');
let client: Client | null = null;
function getWsClient(): Client {
    if (!client) {
        client = createClient({
            url: WS_URL,
            lazy: true,
            retryAttempts: 5,
            connectionParams: () => ({ headers: getIdentityHeaders() }),
        });
    }
    return client;
}
export type WidgetExecutionResult = {
    widgetDefinitionId: string;
    variantId: string;
    datasetId: string;
    result: Record<string, unknown>;
};
export function subscribeWidget(
    input: {
        widgetDefinitionId: string;
        variantId: string;
        params?: Record<string, unknown>;
        context?: Record<string, unknown>;
        mode?: 'MOCK' | 'LIVE';
    },
    onData: (payload: WidgetExecutionResult) => void,
    onError?: (err: unknown) => void
): () => void {
    const dispose = getWsClient().subscribe<{ subscribeWidget: WidgetExecutionResult }>(
        {
            query: `
       subscription SubscribeWidget($input: ExecuteWidgetInput!) {
         subscribeWidget(input: $input) {
           widgetDefinitionId
           variantId
           datasetId
           result
         }
       }
     `,
            variables: { input },
        },
        {
            next: (msg) => {
                if (msg.data?.subscribeWidget) onData(msg.data.subscribeWidget);
            },
            error: (err) => onError?.(err),
            complete: () => {},
        }
    );
    return dispose;
}
