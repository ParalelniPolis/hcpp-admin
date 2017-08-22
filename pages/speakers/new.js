/* eslint-disable jsx-a11y/label-has-for */
// @flow
import React from 'react';
import Router from 'next/router';
import { Header, Form, Button, Message, Grid, Divider } from 'semantic-ui-react';
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

type Props = {
	imagePreviewAdd: Function,
	errorSet: Function,
	loadingStart: Function,
	createSpeaker: Function,
	setInitialState: Function,
	url: {
		pathname: string
	},
	loggedInUser: {
		user: {
			name: string
		}
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
			longDescription: string
		},
		photoPreview: string
	}
}

class NewSpeaker extends React.PureComponent<Props> {
	static async getInitialProps(context, apolloClient) {
		const { loggedInUser } = await checkLoggedIn(context, apolloClient);

		if (!loggedInUser.user) {
			// Already signed in? No need to continue.
			// Throw them back to the main page
			redirect(context, '/login');
		}

		return { loggedInUser };
	}

	imageToUpload = null;

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

		imageData.append('data', this.imageToUpload);

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
				let photoId = null;
				if (this.props.speakers.photoPreview) {
					const photoResponse = await fetch('https://api.graph.cool/file/v1/cj5tidgts2joz01226i3j4zbp', {
						method: 'POST',
						body: imageData
					});
					const photo = await photoResponse.json();
					photoId = await photo.id;
				}

				await this.props.createSpeaker({
					variables: {
						displayName: validator.escape(displayName),
						email: !validator.isEmpty(email) ? validator.normalizeEmail(email) : '',
						phone,
						photoId,
						firstName: validator.escape(firstName),
						lastName: validator.escape(lastName),
						shortDescription: validator.escape(shortDescription),
						longDescription: validator.escape(longDescription)
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

		return (
			<App>
				<Layout pathname={this.props.url.pathname} loggedInUser={this.props.loggedInUser}>
					<Header as="h1">Create new speaker</Header>
					<Divider />
					<Form onSubmit={this.validateAndPost} error={ui.error} loading={ui.loading}>
						<Grid columns={2}>
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
											backgroundImage: `url(${photoPreview})`
										}}
									>
										{!photoPreview && 'Add speaker image'}
									</Dropzone>
								</Form.Field>
							</Grid.Column>
							<Grid.Column width={10}>
								<Form.Input
									label="Display name *"
									name="displayName"
									error={!!errors.displayName}
								/>
								<Form.Input
									label="First name"
									name="firstName"
									error={!!errors.firstName}
								/>
								<Form.Input
									label="Last name"
									name="lastName"
									error={!!errors.lastName}
								/>
							</Grid.Column>
						</Grid>
						<Grid>
							<Grid.Column>
								<Form.Input
									label="E-mail"
									name="email"
									error={!!errors.email}
								/>
								<Form.Input
									label="Phone number"
									name="phone"
									error={!!errors.phone}
								/>
								<Form.Input
									label="Short description"
									name="shortDescription"
									error={!!errors.shortDescription}
								/>
								<Form.TextArea
									label="Long description"
									name="longDescription"
									error={!!errors.longDescription}
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
								<Button color="teal" size="large" type="submit">Create speaker</Button>
							</Grid.Column>
						</Grid>
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
				`}</style>
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
		gql`
      mutation createSpeaker($displayName: String! $email: String, $firstName: String, $lastName: String, $shortDescription: String, $longDescription: String, $phone: String, $photoId: ID) {
        createSpeaker(
        	displayName: $displayName
        	email: $email
        	phone: $phone
        	firstName: $firstName
        	lastName: $lastName
        	shortDescription: $shortDescription
        	longDescription: $longDescription
        	status: INACTIVE,
        	photoId: $photoId
        ) {
          id
        }
      }
    `, {
			name: 'createSpeaker'
		})
)(NewSpeaker);
