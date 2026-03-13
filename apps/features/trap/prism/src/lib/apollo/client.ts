import { ApolloClient, InMemoryCache, HttpLink, from } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

const uri = import.meta.env.VITE_R2_TRAP_GQL_SERVICE as string;

const credentials =
  (import.meta.env.VITE_GQL_CREDENTIALS as RequestCredentials | undefined) ??
  "same-origin";

const httpLink = new HttpLink({
  uri,
  credentials,
});

const headerLink = setContext((operation, { headers }) => {
  const screenBase =
    (import.meta.env.VITE_APP_NAME as string | undefined) ?? "risk-research-ui";

  return {
    headers: {
      ...headers,
      "x-user-name":
        (import.meta.env.VITE_USER_NAME as string | undefined) ?? "local-user",
      "x-screen-name": `${screenBase}-${operation.operationName ?? "graphql"}`,
      "x-correlation-id": crypto.randomUUID(),
    },
  };
});

export const apolloClient = new ApolloClient({
  link: from([headerLink, httpLink]),
  cache: new InMemoryCache(),
});