import React from 'react';
import ReactDOM from 'react-dom/client';
// import { QueryClientProvider } from '@tanstack/react-query';
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import App from './App';
// import { queryClient } from './lib/queryClient';
import { apolloClient } from './lib/apollo/client';
import { ApolloProvider } from '@platform/utils';

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <ApolloProvider client={apolloClient}>
            {/* <QueryClientProvider client={queryClient}> */}
                <App />
                {/* <ReactQueryDevtools initialIsOpen={false} /> */}
            {/* </QueryClientProvider> */}
        </ApolloProvider>
    </React.StrictMode>
)
