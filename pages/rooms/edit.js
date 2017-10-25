// @flow
import React from 'react';
import Router from 'next/router';
import { Header, Form, Button, Message, Divider } from 'semantic-ui-react';
import { graphql, withApollo, compose } from 'react-apollo';
import { connect } from 'react-redux';
import gql from 'graphql-tag';
import validator from 'validator';

import type { Element } from 'react';

import withData from '../../lib/withData';
import redirect from '../../lib/redirect';
import checkLoggedIn from '../../lib/checkLoggedIn';
import App from '../../components/App';
import Layout from '../../components/Layout';

import * as roomActions from '../../actions/rooms';

type Room = {
	id: string,
	name: string,
	capacity: number
}

type Props = {
	setInitialState: Function,
	errorSet: Function,
	loadingStart: Function,
	updateRoom: Function,
	loggedInUser: {
		user: {
			name: string
		}
	},
	url: {
		pathname: string
	},
	query: {
		id: string
	},
	data: {
		loading: Function,
		Room: Room
	},
	rooms: {
		ui: {
			error: boolean,
			loading: boolean
		},
		errors: {
			name: string,
			capacity: string
		}
	}
}

type State = {
	room: {
		name: string,
		capacity: number
	}
}

class EditRoom extends React.PureComponent<Props, State> {
	static async getInitialProps(context, apolloClient) {
		const { query } = context;
		const { loggedInUser } = await checkLoggedIn(context, apolloClient);

		if (!loggedInUser.user) {
			// Already signed in? No need to continue.
			// Throw them back to the main page
			redirect(context, '/login');
		}

		return { loggedInUser, query };
	}

	componentDidMount = (): void => {
		Router.onRouteChangeComplete = () => {
			this.props.setInitialState();
		};
	};

	componentWillUnmount = (): void => {
		Router.onRouteChangeComplete = null;
	};

	validateAndPost = async (event): Promise<void> => {
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
				await this.props.updateRoom({
					variables: {
						id: this.props.query.id,
						name,
						capacity: parseInt(capacity, 10)
					}
				});
				this.props.setInitialState();
				Router.push('/rooms');
			}
			catch (error) {
				this.props.errorSet({ error });
			}
		}
	};

	render(): Element<any> {
		const { ui, errors } = this.props.rooms;
		const room: Room = this.props.data.Room || {};
		const loading = this.props.data.loading || !this.props.data.Room;

		return (
			<App>
				<Layout pathname={this.props.url.pathname} loggedInUser={this.props.loggedInUser}>
					<Header as="h1">Edit room</Header>
					<Divider />
					<Form onSubmit={this.validateAndPost} error={ui.error} loading={ui.loading || loading}>
						{this.props.data && this.props.data.Room &&
						[
							<Form.Input
								key="name"
								label="Room name"
								name="name"
								error={!!errors.name}
								defaultValue={room.name}
							/>,
							<Form.Input
								key="capacity"
								label="Room capacity"
								name="capacity"
								type="number"
								error={!!errors.capacity}
								defaultValue={room.capacity}
							/>
						]}
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
						<Button color="teal" size="large" type="submit">Update room</Button>
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
		gql`query oneRoom($id: ID!) {
			Room(id: $id){
    		id
      	name
      	capacity
  		}
		}
		`, {
			options: ({ query }) => ({
				variables: {
					id: query.id
				}
			})
		}
	),
	graphql(
		// The `signinUser` mutation is provided by graph.cool by default
		gql`
      mutation createRoom($id: ID!, $name: String! $capacity: Int!) {
        updateRoom(
        	id: $id
        	name: $name
          capacity: $capacity
        ) {
          id
          name
          capacity
        }
      }
    `, {
			name: 'updateRoom'
		})
)(EditRoom);
