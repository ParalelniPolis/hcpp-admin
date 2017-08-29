// @flow
import React from 'react';
import { graphql, withApollo, compose } from 'react-apollo';
import { connect } from 'react-redux';
import gql from 'graphql-tag';
import Link from 'next/link';
import Router from 'next/router';
import { Header, Divider, Button, Modal } from 'semantic-ui-react';

import type { Element } from 'react';

import App from '../../components/App';
import Layout from '../../components/Layout';
import SpeakerList from '../../components/SpeakerList';
import withData from '../../lib/withData';
import redirect from '../../lib/redirect';
import checkLoggedIn from '../../lib/checkLoggedIn';

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
	photo: {
		id: string,
		url: string
	}
}

type Props = {
	deleteSpeaker: Function,
	updateSpeakerPosition: Function,
	openDeleteModal: Function,
	closeDeleteModal: Function,
	url: {
		pathname: string
	},
	loggedInUser: {
		user: {
			name: string
		}
	},
	data: {
		refetch: Function,
		loading: boolean,
		allSpeakers: Array<Speaker>
	},
	speakers: {
		deleteSpeaker: string
	}
}

class Speakers extends React.PureComponent<Props> {
	static async getInitialProps(context, apolloClient) {
		const { loggedInUser } = await checkLoggedIn(context, apolloClient);

		if (!loggedInUser.user) {
			// Already signed in? No need to continue.
			// Throw them back to the main page
			redirect(context, '/login');
		}

		return { loggedInUser };
	}

	componentDidMount(): void {
		Router.onRouteChangeComplete = () => {
			this.props.data.refetch();
		};
	}

	componentWillUnmount(): void {
		Router.onRouteChangeComplete = null;
	}

	moveSpeakerUp = (speakerId: string, speakerPosition: number, previousSpeakerId: string): void => {
		this.props.updateSpeakerPosition({ variables: { id: speakerId, position: speakerPosition - 1 } });
		this.props.updateSpeakerPosition({ variables: { id: previousSpeakerId, position: speakerPosition } });
	};

	moveSpeakerDown = (speakerId: string, speakerPosition: number, nextSpeakerId: string): void => {
		this.props.updateSpeakerPosition({ variables: { id: speakerId, position: speakerPosition + 1 } });
		this.props.updateSpeakerPosition({ variables: { id: nextSpeakerId, position: speakerPosition } });
	};

	render(): Element<any> {
		return (
			<App>
				<Layout pathname={this.props.url.pathname} loggedInUser={this.props.loggedInUser} wide>
					<Link href="/speakers/new">
						<Button primary floated="right" icon="add" content="Create new speaker" labelPosition="right" />
					</Link>
					<Header as="h1">Speakers</Header>
					<Divider />
					<SpeakerList
						loading={this.props.data.loading}
						speakers={this.props.data.allSpeakers}
						moveSpeakerUp={this.moveSpeakerUp}
						moveSpeakerDown={this.moveSpeakerDown}
						openDeleteModal={this.props.openDeleteModal}
					/>
					<Modal
						size="tiny"
						dimmer="blurring"
						open={!!this.props.speakers.deleteSpeaker}
					>
						<Modal.Header>Delete speaker</Modal.Header>
						<Modal.Content>
							Are you sure you want to delete this speaker?
						</Modal.Content>
						<Modal.Actions>
							<Button
								key="no"
								content="No"
								color="red"
								onClick={
									() => { this.props.closeDeleteModal(); }
								}
							/>
							<Button
								key="yes"
								content="Yes"
								color="green"
								onClick={async () => {
									await this.props.deleteSpeaker({ variables: { id: this.props.speakers.deleteSpeaker } });
									this.props.closeDeleteModal();
								}}
							/>
						</Modal.Actions>
					</Modal>
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
	connect(state => ({ speakers: state.speakers }), { ...speakerActions }),
	graphql(
		// The `signinUser` mutation is provided by graph.cool by default
		gql`
      query speakersQuery {
        allSpeakers(orderBy: position_ASC) {
        	id
        	position
        	email
        	phone
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
    `),
	graphql(
		gql`
			mutation deleteSpeaker($id: ID!) {
				deleteSpeaker(
					id: $id
				) {
					id
				}
			}
		`, {
			name: 'deleteSpeaker',
			options: {
				refetchQueries: ['speakersQuery']
			}
		}
	),
	graphql(
		gql`
			mutation updateSpeakerPosition($id: ID!, $position: Int) {
				updateSpeaker(
					id: $id
					position: $position
				) {
					id
				}
			}
		`, {
			name: 'updateSpeakerPosition',
			options: {
				refetchQueries: ['speakersQuery']
			}
		}
	)
)(Speakers);
