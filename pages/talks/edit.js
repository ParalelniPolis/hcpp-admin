/* eslint-disable jsx-a11y/label-has-for */
// @flow
import React from 'react';
import Router from 'next/router';
import { Header, Form, Button, Message, Divider, Checkbox } from 'semantic-ui-react';
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

type Talk = {
	name: string,
	description: string,
	starts: Date,
	ends: Date,
	status: string,
	speakers: Array<Speaker>,
	room: Room
}

type Props = {
	errorSet: Function,
	loadingStart: Function,
	updateTalk: Function,
	setInitialState: Function,
	query: {
		id: string
	},
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
		allSpeakers: Array<Speaker>,
		Talk: Talk
	}
}

type State = {
	room: ?string
}

class EditTalk extends React.PureComponent<Props, State> {
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
		const status = data.get('status');

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
				await this.props.updateTalk({
					variables: {
						id: this.props.query.id,
						name,
						description,
						starts: starts ? moment.tz(starts, 'Europe/Prague').format() : null,
						ends: ends ? moment.tz(ends, 'Europe/Prague').format() : null,
						room: room || null,
						speakers,
						status: status === null ? 'INACTIVE' : 'ACTIVE'
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
		const loading = this.props.data.loading || !this.props.data.Talk;
		const talk = this.props.data.Talk || {};

		const options = this.props.data && this.props.data.allRooms && this.props.data.allRooms.map(room => (
			{ key: room.id, value: room.id, text: `${room.name} - ${room.capacity} seats` }
		));

		return (
			<App>
				<Layout pathname={this.props.url.pathname} loggedInUser={this.props.loggedInUser}>
					<Header as="h1">Edit talk</Header>
					<Divider />
					<Form onSubmit={this.validateAndPost} error={ui.error} loading={ui.loading || loading}>
						{this.props.data && this.props.data.Talk &&
						[
							<Form.Field key="checkbox-field">
								<Checkbox
									label="Active"
									name="status"
									defaultChecked={talk && talk.status === 'ACTIVE'}
									slider
								/>
							</Form.Field>,
							<Form.Input
								key="name-input"
								label="Talk name *"
								name="name"
								error={!!errors.name}
								defaultValue={talk.name}
							/>,
							<Form.Group widths="equal" key="form-group-1">
								<Form.Input
									label="Starts"
									name="starts"
									type="datetime-local"
									error={!!errors.starts}
									defaultValue={moment.tz(talk.starts, 'Europe/Prague').format('YYYY-MM-DDTHH:mm')}
								/>
								<Form.Input
									label="Ends"
									name="ends"
									type="datetime-local"
									error={!!errors.ends}
									defaultValue={moment.tz(talk.ends, 'Europe/Prague').format('YYYY-MM-DDTHH:mm')}
								/>
								<Form.Select
									label="Room"
									options={options}
									placeholder="Room"
									onChange={this.handleRoomChange}
									defaultValue={talk.room && talk.room.id}
								/>
								<input
									type="hidden"
									name="room"
									value={this.state.room || (talk.room ? talk.room.id : '')}
								/>
							</Form.Group>,
							<Form.TextArea
								key="form-textarea"
								label="Talk description"
								name="description"
								error={!!errors.description}
								defaultValue={talk.description}
							/>,
							<Form.Group grouped key="form-group-2">
								<label>Speakers</label>
								{this.props.data && this.props.data.allSpeakers && this.props.data.allSpeakers.map(speaker => (
									<Form.Checkbox
										width="12"
										key={speaker.id}
										name={speaker.id}
										label={speaker.displayName}
										defaultChecked={!!talk.speakers.find(eventSpeaker => eventSpeaker.id === speaker.id)}
									/>
								))}
							</Form.Group>
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
						<Button color="teal" size="large" type="submit">Update talk</Button>
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
			query eventDataQuery($id: ID!) {
				Talk(id: $id) {
					id
					name
					description
					starts
					ends
					status
					room {
						id
						name
					}
					speakers {
						id
						displayName
					}
				}
        allRooms {
        	id
          name
          capacity
        }
        allSpeakers {
        	id
        	displayName
        	photo {
        		id
        		url
        	}
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
      mutation updateTalk($id: ID!, $name: String!, $description: String, $starts: DateTime, $ends: DateTime, $room: ID, $speakers: [ID!], $status: TalkStatus!) {
        updateTalk(
        	id: $id
        	name: $name
        	description: $description
        	starts: $starts
        	ends: $ends
        	roomId: $room
        	speakersIds: $speakers
        	status: $status
        ) {
          id
        }
      }
    `, {
			name: 'updateTalk'
		})
)(EditTalk);
