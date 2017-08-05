// @flow
import React from 'react';
import Router from 'next/router';
import { Header, Form, Button, Message } from 'semantic-ui-react';
import { graphql, withApollo, compose } from 'react-apollo';
import { connect } from 'react-redux';
import gql from 'graphql-tag';
import validator from 'validator';

import withData from '../../lib/withData';
import redirect from '../../lib/redirect';
import checkLoggedIn from '../../lib/checkLoggedIn';
import App from '../../components/App';
import Layout from '../../components/Layout';

import * as roomActions from '../../actions/rooms';

import type { Element } from 'react';

class NewRoom extends React.PureComponent {
	static async getInitialProps(context, apolloClient) {
		const { loggedInUser } = await checkLoggedIn(context, apolloClient);

		if (!loggedInUser.user) {
			// Already signed in? No need to continue.
			// Throw them back to the main page
			redirect(context, '/login');
		}

		return { loggedInUser };
	}

	validateAndPost = async (event) => {
		/* global FormData */
		const data = new FormData(event.target);

		event.preventDefault();
		event.stopPropagation();

		const errors = {};
		const name = data.get('name');
		const capacity = data.get('capacity');

		if (validator.isEmpty(name)) {
			errors.name = 'Name is empty';
		}
		if (!validator.isInt(capacity)) {
			errors.capacity = 'Capacity has to be a number';
		}

		this.props.errorSet(errors);

		if (!Object.keys(errors).length) {
			this.props.loadingStart();

			try {
				await this.props.createRoom({ variables: { name, capacity: parseInt(capacity, 10) } });
				this.props.setInitialState();
				Router.push('/rooms');
			}
			catch (error) {
				console.error(error);
				this.props.errorSet({ error });
			}
		}
	};

	render() {
		const { ui, errors } = this.props.rooms;

		return (
			<App>
				<Layout pathname={this.props.url.pathname} loggedInUser={this.props.loggedInUser}>
					<Header as='h1'>Create new room</Header>
					<Form onSubmit={this.validateAndPost} error={ui.error} loading={ui.loading}>
						<Form.Input
							label="Room name"
							name="name"
							error={!!errors.name}
						/>
						<Form.Input
							label="Room capacity"
							name="capacity"
							type="number"
							error={!!errors.capacity}
						/>
						{ui.error &&
						<Message error={ui.error}>
							<Message.Header>Form has errors</Message.Header>
							<Message.List>
								{Object.keys(errors).map(error => (
									<Message.Item key={error}><strong>{errors[error]}</strong></Message.Item>
								))}
							</Message.List>
						</Message>
						}
						<Button color='teal' size='large' type="submit">Create room</Button>
					</Form>
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
	connect(state => ({ rooms: state.rooms }), { ...roomActions }),
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
    `, {
			name: 'createRoom'
		})
)(NewRoom);
