import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react'


export default function TestingPage() {

    const httpLink = new HttpLink({
        uri: import.meta.env.VITE_REACT_APP_TEST_AGQL_URL,
    });

    const testClient = new ApolloClient({
        cache: new InMemoryCache(),
        link: httpLink,
    });

    return (
        <ApolloProvider client={testClient}>
            <div>New Testing App</div>
        </ApolloProvider> 
    )
}