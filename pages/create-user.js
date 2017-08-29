// @flow
import React from 'react';
import Router from 'next/router';
import { Button, Form, Grid, Header, Divider, Message, Segment } from 'semantic-ui-react';
import { graphql, withApollo, compose } from 'react-apollo';
import { connect } from 'react-redux';
import gql from 'graphql-tag';
import validator from 'validator';

import type { Element } from 'react';

import withData from '../lib/withData';
import redirect from '../lib/redirect';
import checkLoggedIn from '../lib/checkLoggedIn';
import App from '../components/App';
import Layout from '../components/Layout';

import * as registerActions from '../actions/registerForm';


type Props = {
	setInitialState: Function,
	errorSet: Function,
	loadingStart: Function,
	create: Function,
	loggedInUser: {
		user: {
			name: string
		}
	},
	url: {
		pathname: string
	},
	registerForm: {
		ui: {
			error: boolean,
			loading: boolean
		},
		errors: {
			name: string,
			email: string,
			password: string,
			passwordAgain: string
		}
	}
}

class CreateUser extends React.PureComponent<Props> {
	static async getInitialProps(context, apolloClient) {
		const { loggedInUser } = await checkLoggedIn(context, apolloClient);

		if (!loggedInUser.user || loggedInUser.user.role !== 'MANAGER') {
			// Already signed in? No need to continue.
			// Throw them back to the main page
			redirect(context, '/login');
		}

		return { loggedInUser };
	}

	componentDidMount = () => {
		Router.onRouteChangeComplete = () => {
			this.props.setInitialState();
		};
	};

	componentWillUnmount = () => {
		Router.onRouteChangeComplete = null;
	};

	validateAndPost = (event) => {
		/* global FormData */
		const data = new FormData(event.target);

		event.preventDefault();
		event.stopPropagation();

		const errors = {};
		const name = data.get('name');
		const email = data.get('email');
		const password = data.get('password');
		const passwordAgain = data.get('passwordAgain');

		if (validator.isEmpty(name)) {
			errors.name = 'Please fill out your name';
		}
		if (!validator.isEmail(email)) {
			errors.email = 'E-mail is invalid';
		}
		if (!validator.isLength(password, { min: 6 })) {
			errors.password = 'Password requires minimum of 6 characters';
		}
		if (!validator.equals(password, passwordAgain)) {
			errors.passwordAgain = 'Passwords do not match';
		}

		this.props.errorSet(errors);

		if (!Object.keys(errors).length) {
			this.props.loadingStart();
			this.props.create({ email, name, password });
		}
	};

	render(): Element<any> {
		const { ui, errors } = this.props.registerForm;

		return (
			<App>
				<Layout pathname={this.props.url.pathname} loggedInUser={this.props.loggedInUser}>
					<Header as="h1">
						Create new account
					</Header>
					<Divider />
					<Grid
						textAlign="center"
						style={{ height: '100%' }}
						verticalAlign="middle"
					>
						<Grid.Column style={{ maxWidth: '100%' }}>
							<Form size="large" onSubmit={this.validateAndPost} error={ui.error} loading={ui.loading}>
								<Segment stacked>
									<Form.Input
										fluid
										icon="user"
										iconPosition="left"
										name="name"
										placeholder="Full name"
										error={!!errors.name}
									/>
									<Form.Input
										fluid
										icon="mail"
										iconPosition="left"
										name="email"
										placeholder="E-mail address"
										error={!!errors.email}
									/>
									<Form.Input
										fluid
										icon="lock"
										iconPosition="left"
										name="password"
										type="password"
										placeholder="Password"
										error={!!errors.password}
									/>
									<Form.Input
										fluid
										icon="lock"
										iconPosition="left"
										name="passwordAgain"
										type="password"
										placeholder="Password again"
										error={!!errors.passwordAgain}
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
									<Button type="submit" color="primary" fluid size="large">Create account</Button>
								</Segment>
							</Form>
						</Grid.Column>
					</Grid>
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
	connect(state => ({ registerForm: state.registerForm }), { ...registerActions }),
	graphql(
		// The `createUser` & `signinUser` mutations are provided by graph.cool by
		// default.
		// Multiple mutations are executed by graphql sequentially
		gql`
      mutation Create($name: String!, $email: String!, $password: String!) {
        createUser(name: $name, role: USER, authProvider: { email: { email: $email, password: $password }}) {
          id
        }
      }
    `,
		{
			// Use an unambiguous name for use in the `props` section below
			name: 'createWithEmail',
			// Apollo's way of injecting new props which are passed to the component
			props: ({
				createWithEmail
			}) => ({
				// `create` is the name of the prop passed to the component
				create: ({ email, name, password }) => {
					createWithEmail({
						variables: {
							email,
							password,
							name: validator.escape(name)
						}
					}).then(() => {
						Router.push('/');
					}).catch((error) => {
						// Something went wrong, such as incorrect password, or no network
						// available, etc.
						console.error(error);
					});
				}
			})
		}
	)
)(CreateUser);
