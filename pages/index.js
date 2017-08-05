// @flow
import React from 'react';
import { withApollo, compose } from 'react-apollo';
import withData from '../lib/withData';
import redirect from '../lib/redirect';
import checkLoggedIn from '../lib/checkLoggedIn';

class Index extends React.PureComponent {
	static async getInitialProps(context, apolloClient) {
		const { loggedInUser } = await checkLoggedIn(context, apolloClient);

		if (loggedInUser.user) {
			// Already signed in? No need to continue.
			// Throw them back to the main page
			redirect(context, '/speakers');
		}
		else {
			redirect(context, '/login');
		}

		return {};
	}

	render() {
		return null;
	}
}

export default compose(
	// withData gives us server-side graphql queries before rendering
	withData,
	// withApollo exposes `this.props.client` used when logging out
	withApollo
)(Index);
