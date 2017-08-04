// @flow
import React from 'react';
import { graphql, withApollo, compose } from 'react-apollo';
import gql from 'graphql-tag';
import Link from 'next/link';
import { Header, Button } from 'semantic-ui-react';
import App from '../../components/App';
import Layout from '../../components/Layout';
import withData from '../../lib/withData';
import redirect from '../../lib/redirect';
import checkLoggedIn from '../../lib/checkLoggedIn';

class Rooms extends React.Component {
	static async getInitialProps(context, apolloClient) {
		const { loggedInUser } = await checkLoggedIn(context, apolloClient);

		if (!loggedInUser.user) {
			// Already signed in? No need to continue.
			// Throw them back to the main page
			redirect(context, '/login');
		}

		return { loggedInUser };
	}

	render() {
		return (
			<App>
				<Layout pathname={this.props.url.pathname} loggedInUser={this.props.loggedInUser}>
					<Header as='h1'>Rooms</Header>
					<Link href="/rooms/new">
						<Button primary icon="add" size="mini" content="Create new room" labelPosition="right" />
					</Link>
				</Layout>
			</App>
		);
	}
}

export default compose(
	// withData gives us server-side graphql queries before rendering
	withData,
	// withApollo exposes `this.props.client` used when logging out
	withApollo,
	graphql(
		// The `signinUser` mutation is provided by graph.cool by default
		gql`
      query roomsQuery {
        allRooms {
        	id
          name
          capacity
        }
      }
    `)
)(Rooms);
