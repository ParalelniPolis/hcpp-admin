// @flow
import React from 'react';
import { graphql, withApollo, compose } from 'react-apollo';
import gql from 'graphql-tag';
import { Header, Divider, Statistic, Icon, Loader } from 'semantic-ui-react';

import type { Element } from 'react';

import App from '../components/App';
import Layout from '../components/Layout';

import withData from '../lib/withData';
import redirect from '../lib/redirect';
import checkLoggedIn from '../lib/checkLoggedIn';

type Talk = {
	id: string,
	status: 'ACTIVE' | 'INACTIVE'
}

type Speaker = {
	id: string,
	status: 'ACTIVE' | 'INACTIVE'
}

type Props = {
	loggedInUser: {
		user: {
			name: string
		}
	},
	url: {
		pathname: string
	},
	data: {
		allTalks: Array<Talk>,
		allSpeakers: Array<Speaker>
	}
}

class Index extends React.PureComponent<Props> {
	static async getInitialProps(context, apolloClient) {
		const { loggedInUser } = await checkLoggedIn(context, apolloClient);

		if (!loggedInUser.user) {
			// Already signed in? No need to continue.
			// Throw them back to the main page
			redirect(context, '/login');
		}

		return { loggedInUser };
	}

	render(): Element<any> {
		let activeSpeakers = [];
		let activeTalks = [];

		if (this.props.data.loading) {
			return (
				<App>
					<Layout pathname={this.props.url.pathname} loggedInUser={this.props.loggedInUser} wide>
						<Header as="h1">Dashboard</Header>
						<Divider />
						<Loader />
					</Layout>
				</App>
			);
		}

		if (this.props.data && this.props.data.allSpeakers && this.props.data.allTalks) {
			activeSpeakers = this.props.data.allSpeakers.filter(speaker => speaker.status === 'ACTIVE');
			activeTalks = this.props.data.allTalks.filter(talk => talk.status === 'ACTIVE');
		}

		return (
			<App>
				<Layout pathname={this.props.url.pathname} loggedInUser={this.props.loggedInUser} wide>
					<Header as="h1">Dashboard</Header>
					<Divider />

					<Statistic.Group size="huge" style={{ justifyContent: 'center' }}>
						<Statistic>
							<Statistic.Value>
								<Icon name="user" color="green" />
								{activeSpeakers.length}/{this.props.data.allSpeakers.length}
							</Statistic.Value>
							<Statistic.Label>Active Speakers</Statistic.Label>
						</Statistic>

						<Statistic>
							<Statistic.Value>
								<Icon name="comment" color="green" />
								{activeTalks.length}/{this.props.data.allTalks.length}
							</Statistic.Value>
							<Statistic.Label>Active Talks</Statistic.Label>
						</Statistic>
					</Statistic.Group>
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
	graphql(
		gql`
			query dashBoardInfo {
				allTalks {
					id
					status
				}
				allSpeakers {
					id
					status
				}
			}
		`
	)
)(Index);
