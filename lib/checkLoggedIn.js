import gql from 'graphql-tag';

export default (context, apolloClient) => (
	apolloClient.query({
		query: gql`
      query getUser {
        user {
          id
          name
          email
          role
        }
      }
    `
	}).then(({ data }) => {
		return { loggedInUser: data };
	}).catch(() => {
		// Fail gracefully
		return { loggedInUser: {} };
	})
);
