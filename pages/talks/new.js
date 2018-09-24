/* eslint-disable jsx-a11y/label-has-for */
// @flow
import React from 'react';
import Router from 'next/router';
import { Header, Form, Button, Message, Divider } from 'semantic-ui-react';
import { graphql, withApollo, compose } from 'react-apollo';
import { connect } from 'react-redux';
import gql from 'graphql-tag';
import validator from 'validator';
import moment from 'moment-timezone';

import type { Element } from 'react';

import withData from '../../lib/withData';
import redirect from '../../lib/redirect';
import checkLoggedIn from '../../lib/checkLoggedIn';
import App from '../../components/App';
import Layout from '../../components/Layout';

import * as talkActions from '../../actions/talks';

type Room = {
	id: string,
	name: string,
	capacity: number
}

type Speaker = {
	id: string,
	displayName: string,
	photo: {
		id: string,
		url: string
	}
}

type Props = {
	errorSet: Function,
	loadingStart: Function,
	createTalk: Function,
	setInitialState: Function,
	url: {
		pathname: string
	},
	loggedInUser: {
		user: {
			name: string
		}
	},
	talks: {
		ui: {
			error: boolean,
			loading: boolean
		},
		errors: {
			name: string,
			starts: string,
			ends: string,
			description: string
		}
	},
	data: {
		loading: boolean,
		allRooms: Array<Room>,
		allSpeakers: Array<Speaker>
	}
}

type State = {
	room: ?string
}

class NewTalk extends React.PureComponent<Props, State> {
	static async getInitialProps(context, apolloClient) {
		const { loggedInUser } = await checkLoggedIn(context, apolloClient);

		if (!loggedInUser.user) {
			// Already signed in? No need to continue.
			// Throw them back to the main page
			redirect(context, '/login');
		}

		return { loggedInUser };
	}

	constructor(props) {
		super(props);

		this.state = {
			room: null
		};
	}

	validateAndPost = async (event): Promise<void> => {
		/* global FormData */
		const data = new FormData(event.target);

		event.preventDefault();
		event.stopPropagation();

		const errors = {};
		const name = data.get('name');
		const description = data.get('description');
		const starts = data.get('starts');
		const ends = data.get('ends');
		const room = data.get('room');

		const formSpeakers = this.props.data.allSpeakers.filter(speaker => (
			data.get(speaker.id) === ''
		));

		const speakers = formSpeakers.map(speaker => speaker.id);

		if (validator.isEmpty(name)) {
			errors.name = 'Name is empty';
		}

		if (!validator.isEmpty(starts) && !validator.isISO8601(starts)) {
			errors.starts = 'Invalid start date';
		}

		if (!validator.isEmpty(ends) && !validator.isISO8601(ends)) {
			errors.ends = 'Invalid end date';
		}

		this.props.errorSet(errors);

		if (!Object.keys(errors).length) {
			this.props.loadingStart();

			try {
				await this.props.createTalk({
					variables: {
						name,
						description,
						starts: starts ? moment.tz(starts, 'Europe/Prague').format() : null,
						ends: ends ? moment.tz(ends, 'Europe/Prague').format() : null,
						room: room || null,
						speakers
					}
				});
				this.props.setInitialState();
				Router.push('/talks');
			}
			catch (error) {
				console.error(error);
				this.props.errorSet({ error });
			}
		}
	};

	handleRoomChange = (e, { value }) => this.setState({ room: value });

	render(): Element<any> {
		const { ui, errors } = this.props.talks;

		const options = this.props.data && this.props.data.allRooms && this.props.data.allRooms.map(room => (
			{ key: room.id, value: room.id, text: `${room.name} - ${room.capacity} seats` }
		));

		return (
			<App>
				<Layout pathname={this.props.url.pathname} loggedInUser={this.props.loggedInUser}>
					<Header as="h1">Create new talk</Header>
					<Divider />
					<Form onSubmit={this.validateAndPost} error={ui.error} loading={ui.loading}>
						<Form.Input
							label="Talk name *"
							name="name"
							error={!!errors.name}
						/>
						<Form.Group widths="equal">
							<Form.Input
								label="Starts"
								name="starts"
								type="datetime-local"
								error={!!errors.starts}
							/>
							<Form.Input
								label="Ends"
								name="ends"
								type="datetime-local"
								error={!!errors.ends}
							/>
							<Form.Select
								label="Room"
								options={options}
								placeholder="Room"
								onChange={this.handleRoomChange}
							/>
							<input
								type="hidden"
								name="room"
								value={this.state.room || ''}
							/>
						</Form.Group>
						<Form.TextArea
							label="Talk description"
							name="description"
							error={!!errors.description}
						/>
						<Form.Group grouped>
							<label>Speakers</label>
							{this.props.data && this.props.data.allSpeakers && this.props.data.allSpeakers.map(speaker => (
								<Form.Checkbox
									width="12"
									key={speaker.id}
									name={speaker.id}
									label={speaker.displayName}
								/>
							))}
						</Form.Group>
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
						<Button color="teal" size="large" type="submit">Create talk</Button>
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
	connect(state => ({ talks: state.talks }), { ...talkActions }),
	graphql(
		gql`
			query eventDataQuery {
        allRooms {
        	id
          name
          capacity
        }
        allSpeakers(
					orderBy: displayName_ASC
				) {
        	id
        	displayName
        	photo {
        		id
        		url
        	}
        }
      }
		`
	),
	graphql(
		// The `signinUser` mutation is provided by graph.cool by default
		gql`
      mutation createTalk($name: String!, $description: String, $starts: DateTime, $ends: DateTime, $room: ID, $speakers: [ID!]) {
        createTalk(
        	name: $name
        	description: $description
        	starts: $starts
        	ends: $ends
        	roomId: $room
        	speakersIds: $speakers
        	status: INACTIVE
        ) {
          id
          name
          description
        }
      }
    `, {
			name: 'createTalk'
		})
)(NewTalk);
