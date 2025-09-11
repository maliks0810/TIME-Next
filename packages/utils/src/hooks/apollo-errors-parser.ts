// //Tries to parse an error object that may be an Apollo error and contain
// //graphQLErrors.

// import { CombinedGraphQLErrors } from "@apollo/client/errors";



// // import { ApolloError } from '@apollo/client';

// export const parseApolloErrors = (err: Error): Error | AggregateError => {
//     //We only care about Apollo errors
//     const apolloError = err as CombinedGraphQLErrors

//     if (!apolloError) {
//         return err;
//     }

//     return new AggregateError(
//         apolloError.map(
//             (e) =>
//                 new Error(
//                     (e?.extensions?.response as any)?.body
//                         ? (e?.extensions?.response as any).body
//                         : e.message
//                 )
//         ),
//         err.message
//     );
// };
