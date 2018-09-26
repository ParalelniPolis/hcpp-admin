/* eslint-disable jsx-a11y/label-has-for */
// @flow
import React from 'react';
import Router from 'next/router';
import { Header, Form, Button, Message, Grid, Divider, Checkbox } from 'semantic-ui-react';
import { graphql, withApollo, compose } from 'react-apollo';
import Dropzone from 'react-dropzone';
import { connect } from 'react-redux';
import gql from 'graphql-tag';
import validator from 'validator';
import fetch from 'isomorphic-fetch';

import type { Element } from 'react';

import withData from '../../lib/withData';
import redirect from '../../lib/redirect';
import checkLoggedIn from '../../lib/checkLoggedIn';
import App from '../../components/App';
import Layout from '../../components/Layout';

import * as speakerActions from '../../actions/speakers';

type Speaker = {
	id: string,
	position: number,
	email: string,
	phone: string,
	firstName: string,
	lastName: string,
	displayName: string,
	status: 'ACTIVE' | 'INACTIVE',
	shortDescription: string,
	longDescription: string,
	organization: string,
	photo: {
		id: string,
		url: string
	}
}

type Props = {
	imagePreviewAdd: Function,
	errorSet: Function,
	loadingStart: Function,
	updateSpeaker: Function,
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
	data: {
		loading: boolean,
		Speaker: Speaker
	},
	speakers: {
		ui: {
			error: boolean,
			loading: boolean
		},
		errors: {
			displayName: string,
			firstName: string,
			lastName: string,
			email: string,
			phone: string,
			shortDescription: string,
			longDescription: string,
			organization: string
		},
		photoPreview: string
	}
}

class EditSpeaker extends React.PureComponent<Props> {
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

	imageToUpload = null;

	componentDidMount = (): void => {
		Router.onRouteChangeComplete = () => {
			this.props.setInitialState();
		};
	};

	componentWillUnmount = (): void => {
		Router.onRouteChangeComplete = null;
	};

	onDrop = (accepted: Array<Object>): void => {
		if (accepted[0]) {
			this.imageToUpload = accepted[0];
			this.props.imagePreviewAdd(accepted[0].preview);
		}
	};

	validateAndPost = async (event): Promise<void> => {
		/* global FormData */
		const data = new FormData(event.target);
		const imageData = new FormData();

		if (this.imageToUpload) imageData.append('data', this.imageToUpload);

		event.preventDefault();
		event.stopPropagation();

		const errors = {};
		const displayName = data.get('displayName');
		const email = data.get('email');
		const phone = data.get('phone');
		const firstName = data.get('firstName');
		const lastName = data.get('lastName');
		const shortDescription = data.get('shortDescription');
		const longDescription = data.get('longDescription');
		const status = data.get('status');
		const organization = data.get('organization');

		if (validator.isEmpty(displayName)) {
			errors.displayName = 'Display name is empty';
		}
		if (!validator.isEmpty(email) && !validator.isEmail(email)) {
			errors.email = 'E-mail is not valid';
		}
		if (!validator.isEmpty(phone) && !validator.isMobilePhone(phone, 'any')) {
			errors.phone = 'Phone number is not valid';
		}

		this.props.errorSet(errors);

		if (!Object.keys(errors).length) {
			this.props.loadingStart();

			try {
				let photoId = this.props.data.Speaker.photo ? this.props.data.Speaker.photo.id : null;
				if (this.props.speakers.photoPreview) {
					const photoResponse = await fetch(`https://api.graph.cool/file/v1/${process.env.GRAPH_COOL_ID}`, {
						method: 'POST',
						body: imageData
					});
					const photo = await photoResponse.json();
					photoId = await photo.id;
				}

				await this.props.updateSpeaker({
					variables: {
						id: this.props.query.id,
						displayName,
						email: !validator.isEmpty(email) ? validator.normalizeEmail(email) : '',
						phone,
						organization,
						photoId,
						firstName,
						lastName,
						shortDescription,
						longDescription,
						status: status === null ? 'INACTIVE' : 'ACTIVE'
					}
				});
				this.props.setInitialState();
				Router.push('/speakers');
			}
			catch (error) {
				this.props.errorSet({ error });
			}
		}
	};

	render(): Element<any> {
		const { ui, errors, photoPreview } = this.props.speakers;
		const loading = this.props.data.loading || !this.props.data.Speaker;
		const speaker = this.props.data.Speaker || {};

		return (
			<App>
				<Layout pathname={this.props.url.pathname} loggedInUser={this.props.loggedInUser}>
					<Header as="h1">Edit speaker</Header>
					<Divider />
					<Form onSubmit={this.validateAndPost} error={ui.error} loading={ui.loading || loading}>
						{this.props.data && this.props.data.Speaker &&
						[
							<Grid columns={2} key="grid-1">
								<Grid.Column width={6}>
									<Form.Field>
										<label htmlFor="photo">Speaker image</label>
										<Dropzone
											accept="image/jpeg, image/png"
											maxSize={1000000}
											inputProps={{ id: 'photo', name: 'photo' }}
											onDrop={this.onDrop}
											multiple={false}
											className="dropzone"
											acceptClassName="accept"
											rejectClassName="reject"
											style={{
												backgroundImage: speaker.photo ? `url(${speaker.photo.url})` : `url(${photoPreview})`
											}}
										>
											{!(photoPreview || speaker.photo) && 'Add speaker image'}
										</Dropzone>
									</Form.Field>
								</Grid.Column>
								<Grid.Column width={10}>
									<Form.Field>
										<Checkbox
											label="Active"
											name="status"
											defaultChecked={speaker && speaker.status === 'ACTIVE'}
											slider
										/>
									</Form.Field>
									<Form.Input
										label="Display name *"
										name="displayName"
										error={!!errors.displayName}
										defaultValue={speaker && speaker.displayName}
									/>
									<Form.Input
										label="First name"
										name="firstName"
										error={!!errors.firstName}
										defaultValue={speaker && speaker.firstName}
									/>
									<Form.Input
										label="Last name"
										name="lastName"
										error={!!errors.lastName}
										defaultValue={speaker && speaker.lastName}
									/>
								</Grid.Column>
							</Grid>,
							<Grid key="grid-2">
								<Grid.Column>
									<Form.Input
										label="E-mail"
										name="email"
										error={!!errors.email}
										defaultValue={speaker && speaker.email}
									/>
									<Form.Input
										label="Phone number"
										name="phone"
										error={!!errors.phone}
										defaultValue={speaker && speaker.phone}
									/>
									<Form.Input
										label="Organization"
										name="organization"
										error={!!errors.organization}
										defaultValue={speaker && speaker.organization}
									/>
									<Form.Input
										label="Short description"
										name="shortDescription"
										error={!!errors.shortDescription}
										defaultValue={speaker && speaker.shortDescription}
									/>
									<Form.TextArea
										label="Long description"
										name="longDescription"
										error={!!errors.longDescription}
										defaultValue={speaker && speaker.longDescription}
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
									<Button color="teal" size="large" type="submit">Update speaker</Button>
								</Grid.Column>
							</Grid>
						]}
					</Form>
				</Layout>
				<style>{`
					.dropzone {
						display: inline-flex;
						align-items: center;
						justify-content: center;
						width: 200px;
						height: 200px;
						border: 2px dashed #555;
						border-radius: 4px;
						background-size: cover;
						background-position: center;
						background-repeat: no-repeat;
					}

					.dropzone.accept {
						background-color: #eee;
					}

					.dropzone.reject {
						background-color: #ff3333;
					}
				`}
				</style>
			</App>
		);
	}
}

export default compose(
	// withData gives us server-side graphql queries before rendering
	withData,
	// withApollo exposes `this.props.client` used when logging out
	withApollo,
	connect(state => ({ speakers: state.speakers }), { ...speakerActions }),
	graphql(
		gql`query oneSpeaker($id: ID!) {
			Speaker(id: $id){
    		id
      	position
      	email
      	phone
      	organization
      	firstName
      	lastName
        displayName
       	status
       	shortDescription
       	longDescription
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
		gql`
      mutation updateSpeaker($id: ID!, $displayName: String! $email: String, $organization: String, $firstName: String, $lastName: String, $shortDescription: String, $longDescription: String, $phone: String, $photoId: ID, $status: SpeakerStatus!) {
        updateSpeaker(
        	id: $id
        	displayName: $displayName
        	email: $email
        	phone: $phone
        	organization: $organization
        	firstName: $firstName
        	lastName: $lastName
        	shortDescription: $shortDescription
        	longDescription: $longDescription
        	photoId: $photoId
        	status: $status,
        ) {
        	id
        }
      }
    `, {
			name: 'updateSpeaker'
		})
)(EditSpeaker);
