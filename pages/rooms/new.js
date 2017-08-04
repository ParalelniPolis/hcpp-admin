// @flow
import React from 'react';
import Link from 'next/link';
import Router from 'next/router';
import { Header } from 'semantic-ui-react';
import { graphql, withApollo, compose } from 'react-apollo';
import { connect } from 'react-redux';
import cookie from 'cookie';
import gql from 'graphql-tag';
import validator from 'validator';

import withData from '../../lib/withData';
import redirect from '../../lib/redirect';
import checkLoggedIn from '../../lib/checkLoggedIn';
import App from '../../components/App';
import Layout from '../../components/Layout';

//import * as loginActions from '../../actions/loginForm';

import type { Element } from 'react';

class NewRoom extends React.Component {
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
					<Header as='h1'>Create new room</Header>
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
      mutation createRoom($name: String! $capacity: Int!) {
        createRoom(
        	name: $name
          capacity: $capacity
        ) {
          id
          name
          capacity
        }
      }
    `)
)(NewRoom);