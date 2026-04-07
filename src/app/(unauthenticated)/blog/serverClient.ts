import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const uri = "https://blog.jobmaze.ca/graphql"

export const getServerClient = () => new ApolloClient({
    link: new HttpLink({
        uri,
        fetch,
    }),
    cache: new InMemoryCache(),
    defaultOptions: {
        watchQuery: {
            fetchPolicy: 'no-cache',
            errorPolicy: 'ignore',
        },
        query: {
            fetchPolicy: 'no-cache',
            errorPolicy: 'all',
        },
    },
});
