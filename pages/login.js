// @flow
import React from 'react';
import Link from 'next/link';
import { Button, Form, Grid, Header, Image, Input, Message, Segment } from 'semantic-ui-react';
import { graphql, withApollo, compose } from 'react-apollo';
import cookie from 'cookie';
import gql from 'graphql-tag';

import withData from '../lib/withData';
import redirect from '../lib/redirect';
import checkLoggedIn from '../lib/checkLoggedIn';
import App from '../components/App';

import type { Element } from 'react';

class Login extends React.Component {
	static async getInitialProps(context, apolloClient) {
		const { loggedInUser } = await checkLoggedIn(context, apolloClient);

		if (loggedInUser.user) {
			// Already signed in? No need to continue.
			// Throw them back to the main page
			redirect(context, '/');
		}

		return {};
	}

	render() {
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
					<Grid.Column style={{ maxWidth: 450 }}>
						<Header as='h2' color='teal' textAlign='center'>
							<Image src='/static/images/logo.png' />
							{' '}Log-in to your account
						</Header>
						<Form onSubmit={this.props.signin} size='large'>
							<Segment stacked>
								<Form.Input
									fluid
									name='email'
									icon='mail'
									iconPosition='left'
									placeholder='E-mail address'
								/>
								<Form.Input
									fluid
									name='password'
									icon='lock'
									iconPosition='left'
									placeholder='Password'
									type='password'
								/>

								<Button color='teal' fluid size='large'>Login</Button>
							</Segment>
						</Form>
						<Message>
							New to us? <Link href='/register'><a>Sign Up</a></Link>
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
				signin: (event) => {
					/* global FormData */
					const data = new FormData(event.target);

					event.preventDefault();
					event.stopPropagation();

					signinWithEmail({
						variables: {
							email: data.get('email'),
							password: data.get('password')
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