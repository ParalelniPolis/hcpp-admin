// @flow
import React from 'react';
import Link from 'next/link';
import Router from 'next/router';
import { Button, Form, Grid, Header, Image, Input, Message, Segment } from 'semantic-ui-react';
import { graphql, withApollo, compose } from 'react-apollo';
import { connect } from 'react-redux';
import cookie from 'cookie';
import gql from 'graphql-tag';
import validator from 'validator';

import withData from '../lib/withData';
import redirect from '../lib/redirect';
import checkLoggedIn from '../lib/checkLoggedIn';
import App from '../components/App';

import * as registerActions from '../actions/registerForm';

import type { Element } from 'react';

class Register extends React.Component {
	static async getInitialProps(context, apolloClient) {
		const { loggedInUser } = await checkLoggedIn(context, apolloClient);

		if (loggedInUser.user) {
			// Already signed in? No need to continue.
			// Throw them back to the main page
			redirect(context, '/');
		}

		return {};
	}

	componentDidMount = () => {
		Router.onRouteChangeStart = url => {
			this.props.setInitialState();
		};
	};

	componentWillUnmount = () => {
		Router.onRouteChangeStart = null;
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

		if(!Object.keys(errors).length) {
			this.props.loadingStart();
			this.props.create({ email, name, password });
    }
	};

	render() {
		const { ui, errors } = this.props.registerForm;

		return (
			<App>
				<style jsx global>{`
      body {
      	display: flex;
      	justify-content: center;
      	align-items: center;
      }
    `}</style>
				<Grid
					textAlign='center'
					style={{ height: '100%' }}
					verticalAlign='middle'
				>
					<Grid.Column style={{ width: 320 }}>
						<Header as='h2' color='teal' textAlign='center'>
							<Image src='/static/images/logo.png' />
							{' '}Create new account
						</Header>
						<Form size='large' onSubmit={this.validateAndPost} error={ui.error} loading={ui.loading}>
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
								<Button type='submit' color='teal' fluid size='large'>Create account</Button>
							</Segment>
						</Form>
						<Message>
							Already have an account? <Link href='/login'><a>Log in</a></Link>
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
        signinUser(email: { email: $email, password: $password }) {
          token
        }
      }
    `,
		{
			// Use an unambiguous name for use in the `props` section below
			name: 'createWithEmail',
			// Apollo's way of injecting new props which are passed to the component
			props: ({
								createWithEmail,
								// `client` is provided by the `withApollo` HOC
								ownProps: { client }
							}) => ({
				// `create` is the name of the prop passed to the component
				create: ({ email, name, password }) => {

					createWithEmail({
						variables: {
							email: email,
							password: password,
							name: validator.escape(name)
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
)(Register);
