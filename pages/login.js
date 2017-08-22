// @flow
import React from 'react';
import Link from 'next/link';
import Router from 'next/router';
import { Button, Form, Grid, Header, Image, Message, Segment } from 'semantic-ui-react';
import { graphql, withApollo, compose } from 'react-apollo';
import { connect } from 'react-redux';
import cookie from 'cookie';
import gql from 'graphql-tag';
import validator from 'validator';

import type { Element } from 'react';

import withData from '../lib/withData';
import redirect from '../lib/redirect';
import checkLoggedIn from '../lib/checkLoggedIn';
import App from '../components/App';

import * as loginActions from '../actions/loginForm';

type Props = {
	setInitialState: Function,
	errorSet: Function,
	loadingStart: Function,
	signin: Function,
	loginForm: {
		ui: {
			error: boolean,
			loading: boolean
		},
		errors: {
			email: string,
			password: string
		}
	}
}

class Login extends React.PureComponent<Props> {
	static async getInitialProps(context, apolloClient): Object {
		const { loggedInUser } = await checkLoggedIn(context, apolloClient);

		if (loggedInUser.user) {
			// Already signed in? No need to continue.
			// Throw them back to the main page
			redirect(context, '/');
		}

		return {};
	}

	componentDidMount = (): void => {
		Router.onRouteChangeComplete = () => {
			this.props.setInitialState();
		};
	};

	componentWillUnmount = (): void => {
		Router.onRouteChangeComplete = null;
	};

	validateAndPost = (event): void => {
		/* global FormData */
		const data = new FormData(event.target);

		event.preventDefault();
		event.stopPropagation();

		const errors = {};
		const email = data.get('email');
		const password = data.get('password');

		if (!validator.isEmail(email)) {
			errors.email = 'E-mail is invalid';
		}
		if (validator.isEmpty(password)) {
			errors.password = 'Password required';
		}

		this.props.errorSet(errors);

		if (!Object.keys(errors).length) {
			this.props.loadingStart();
			this.props.signin({ email, password });
		}
	};

	render(): Element<any> {
		const { ui, errors } = this.props.loginForm;

		return (
			<App>
				<style jsx global>{`
					body {
						display: flex;
						justify-content: center;
						align-items: center;
					}
    		`}
				</style>
				<Grid
					textAlign="center"
					style={{ height: '100%' }}
					verticalAlign="middle"
				>
					<Grid.Column style={{ maxWidth: 450 }}>
						<Header as="h2" color="teal" textAlign="center">
							<Image src="/static/images/logo.png" />
							{' '}Log-in to your account
						</Header>
						<Form size="large" onSubmit={this.validateAndPost} error={ui.error} loading={ui.loading}>
							<Segment stacked>
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
								<Button color="teal" fluid size="large" type="submit">Login</Button>
							</Segment>
						</Form>
						<Message>
							New to us? <Link href="/register"><a>Sign Up</a></Link>
						</Message>
					</Grid.Column>
				</Grid>
			</App>
		);
	}
}

export default compose(
	// withData gives us server-side graphql queries before rendering
	withData,
	// withApollo exposes `this.props.client` used when logging out
	withApollo,
	connect(state => ({ loginForm: state.loginForm }), { ...loginActions }),
	graphql(
		// The `signinUser` mutation is provided by graph.cool by default
		gql`
      mutation Signin($email: String!, $password: String!) {
        signinUser(email: { email: $email, password: $password }) {
          token
        }
      }
    `,
		{
			// Use an unambiguous name for use in the `props` section below
			name: 'signinWithEmail',
			// Apollo's way of injecting new props which are passed to the component
			props: ({
				signinWithEmail,
				// `client` is provided by the `withApollo` HOC
				ownProps: { client }
			}) => ({
				// `signin` is the name of the prop passed to the component
				signin: ({ email, password }) => {
					signinWithEmail({
						variables: {
							email,
							password
						}
					}).then(({ data: { signinUser: { token } } }) => {
						// Store the token in cookie
						document.cookie = cookie.serialize('token', token, {
							maxAge: 30 * 24 * 60 * 60 // 30 days
						});

						// Force a reload of all the current queries now that the user is
						// logged in
						client.resetStore().then(() => {
							// Now redirect to the homepage
							redirect({}, '/');
						});
					}).catch((error) => {
						// Something went wrong, such as incorrect password, or no network
						// available, etc.
						console.error(error);
					});
				}
			})
		}
	)
)(Login);
