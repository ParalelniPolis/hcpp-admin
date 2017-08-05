// @flow
import React from 'react';
import Router from 'next/router';
import cookie from 'cookie';
import { withApollo, compose } from 'react-apollo';
import { Container, Divider, Dropdown, Grid, Header, Image, List, Menu, Segment } from 'semantic-ui-react';

import redirect from '../lib/redirect';

import type { Element } from 'react';

class Layout extends React.PureComponent {

	signout = () => {
		document.cookie = cookie.serialize('token', '', {
			maxAge: -1 // Expire the cookie immediately
		});

		// Force a reload of all the current queries now that the user is
		// logged in, so we don't accidentally leave any state around.
		this.props.client.resetStore().then(() => {
			// Redirect to a more useful page when signed out
			redirect({}, '/login');
		});
	};

	render(): Element<any> {
		return (
			<div>
				<Menu fixed='top' inverted stackable>
					<Container>
						<Menu.Item header>
							<Image
								size='mini'
								src='/static/images/logo-inverted.png'
								style={{ marginRight: '1.5em' }}
							/>
							HCPP Administration
						</Menu.Item>
						<Menu.Item
							as="a"
							onClick={() => Router.push({ pathname: '/' })}
							active={this.props.pathname === '/'}
						>
							Home
						</Menu.Item>
						<Menu.Item
							as="a"
							onClick={() => Router.push({ pathname: '/speakers' })}
							active={this.props.pathname.includes('/speakers')}
						>
							Speakers
						</Menu.Item>
						<Menu.Item
							as="a"
							onClick={() => Router.push({ pathname: '/talks' })}
							active={this.props.pathname.includes('/talks')}
						>
							Talks
						</Menu.Item>
						<Menu.Item
							as="a"
							onClick={() => Router.push({ pathname: '/rooms' })}
							active={this.props.pathname.includes('/rooms')}
						>
							Rooms
						</Menu.Item>
						<Menu.Item position="right" icon="user" content={this.props.loggedInUser.user.name} />
						<Menu.Item as="a" icon="sign out" onClick={this.signout} content="Log out" />
					</Container>
				</Menu>

				<Container text style={{ marginTop: '7em' }}>
					{this.props.children}
				</Container>
			</div>
		);
	}
}

export default compose(
	// withApollo exposes `this.props.client` used when logging out
	withApollo
)(Layout);
