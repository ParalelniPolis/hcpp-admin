// @flow
import React from 'react';
import { connect } from 'react-redux';
import { graphql, withApollo, compose } from 'react-apollo';
import gql from 'graphql-tag';
import Link from 'next/link';
import Router from 'next/router';
import { Header, Button, Divider, Table, Modal, Label } from 'semantic-ui-react';
import moment from 'moment-timezone';

import type { Element } from 'react';

import App from '../../components/App';
import Layout from '../../components/Layout';
import withData from '../../lib/withData';
import redirect from '../../lib/redirect';
import checkLoggedIn from '../../lib/checkLoggedIn';

import * as talkActions from '../../actions/talks';

type Speaker = {
	id: string,
	displayName: string
}

type Talk = {
	id: string,
	name: string,
	description: string,
	starts: Date,
	ends: Date,
	status: 'ACTIVE' | 'INACTIVE',
	speakers: Array<Speaker>,
	room: {
		name: string
	}
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
	openDeleteModal: Function,
	closeDeleteModal: Function,
	deleteTalk: Function,
	talks: {
		deleteTalk: string
	},
	data: {
		loading: boolean,
		refetch: Function,
		allTalks: Array<Talk>
	}
}

class Talks extends React.PureComponent<Props> {
	static async getInitialProps(context, apolloClient) {
		const { loggedInUser } = await checkLoggedIn(context, apolloClient);

		if (!loggedInUser.user) {
			// Already signed in? No need to continue.
			// Throw them back to the main page
			redirect(context, '/login');
		}

		return { loggedInUser };
	}

	componentDidMount = (): void => {
		Router.onRouteChangeComplete = () => {
			this.props.data.refetch();
		};
	};

	componentWillUnmount = (): void => {
		Router.onRouteChangeComplete = null;
	};

	render(): Element<any> {
		const { data } = this.props;

		return (
			<App>
				<Layout pathname={this.props.url.pathname} loggedInUser={this.props.loggedInUser} wide>
					<Link href="/talks/new">
						<Button primary floated="right" icon="add" content="Create new talk" labelPosition="right" />
					</Link>
					<Header as="h1">Talks</Header>
					<Divider />
					<Table striped columns={7}>
						<Table.Header>
							<Table.Row>
								<Table.HeaderCell width={1}>Status</Table.HeaderCell>
								<Table.HeaderCell width={3}>Name</Table.HeaderCell>
								<Table.HeaderCell width={2}>Starts</Table.HeaderCell>
								<Table.HeaderCell width={2}>Ends</Table.HeaderCell>
								<Table.HeaderCell width={2}>Room</Table.HeaderCell>
								<Table.HeaderCell width={4}>Speakers</Table.HeaderCell>
								<Table.HeaderCell width={2} />
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{!data.loading && data.allTalks.map(talk => (
								<Table.Row key={talk.id}>
									<Table.Cell width={1} singleLine>
										<Label
											size="tiny"
											color={talk.status === 'ACTIVE' ? 'green' : null}
											horizontal
										>
											{talk.status}
										</Label>
									</Table.Cell>
									<Table.Cell width={3} singleLine>
										{talk.name}
									</Table.Cell>
									<Table.Cell width={2} singleLine>
										{talk.starts && moment(talk.starts).format('DD. MM. YYYY - HH:mm')}
									</Table.Cell>
									<Table.Cell width={2} singleLine>
										{talk.ends && moment(talk.ends).format('DD. MM. YYYY - HH:mm')}
									</Table.Cell>
									<Table.Cell width={2} singleLine>
										{talk.room && talk.room.name}
									</Table.Cell>
									<Table.Cell width={4}>
										{talk.speakers.map((speaker, index) => (
											<span key={speaker.id}>{speaker.displayName}{index + 1 !== talk.speakers.length && ', '}</span>
										))}
									</Table.Cell>
									<Table.Cell width={2} singleLine>
										<Button
											primary
											size="tiny"
											icon="edit"
											content="Edit"
											onClick={() => Router.push(`/talks/edit?id=${talk.id}`)}
										/>
										<Button
											negative
											size="tiny"
											icon="trash"
											content="Delete"
											onClick={() => this.props.openDeleteModal(talk.id)}
										/>
									</Table.Cell>
								</Table.Row>
							))}
						</Table.Body>
					</Table>
					<Modal
						size="tiny"
						dimmer="blurring"
						open={!!this.props.talks.deleteTalk}
					>
						<Modal.Header>Delete talk</Modal.Header>
						<Modal.Content>
							Are you sure you want to delete this talk?
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
									await this.props.deleteTalk({ variables: { id: this.props.talks.deleteTalk } });
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
	connect(state => ({ talks: state.talks }), { ...talkActions }),
	graphql(
		// The `signinUser` mutation is provided by graph.cool by default
		gql`
      query talksQuery {
        allTalks {
        	id
        	name
        	description
        	starts
        	ends
        	status
        	speakers {
        		id
        		displayName
        	}
        	room {
        		id
        		name
        	}
        }
      }
    `),
	graphql(
		gql`
			mutation deleteTalk($id: ID!) {
				deleteTalk(
					id: $id
				) {
					id
				}
			}
		`, {
			name: 'deleteTalk',
			options: {
				refetchQueries: ['talksQuery']
			}
		}
	)
)(Talks);
