// @flow
import React from 'react';
import { connect } from 'react-redux';
import { graphql, withApollo, compose } from 'react-apollo';
import gql from 'graphql-tag';
import Link from 'next/link';
import Router from 'next/router';
import { Header, Button, Divider, Table, Modal } from 'semantic-ui-react';

import type { Element } from 'react';

import App from '../../components/App';
import Layout from '../../components/Layout';
import withData from '../../lib/withData';
import redirect from '../../lib/redirect';
import checkLoggedIn from '../../lib/checkLoggedIn';

import * as roomActions from '../../actions/rooms';

type Room = {
	id: string,
	name: string,
	capacity: number
}

type Props = {
	openDeleteModal: Function,
	closeDeleteModal: Function,
	deleteRoom: Function,
	loggedInUser: {
		user: {
			name: string
		}
	},
	url: {
		pathname: string
	},
	data: {
		refetch: Function,
		loading: boolean,
		allRooms: Array<Room>
	},
	rooms: {
		deleteRoom: string
	}
}

class Rooms extends React.PureComponent<Props> {
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
					<Link href="/rooms/new">
						<Button primary floated="right" icon="add" content="Create new room" labelPosition="right" />
					</Link>
					<Header as="h1">Rooms</Header>
					<Divider />
					<Table striped columns={3}>
						<Table.Header>
							<Table.Row>
								<Table.HeaderCell width={7}>Name</Table.HeaderCell>
								<Table.HeaderCell width={7}>Capacity</Table.HeaderCell>
								<Table.HeaderCell width={2} />
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{!data.loading && data.allRooms.map(room => (
								<Table.Row key={room.id}>
									<Table.Cell width={3} singleLine>
										{room.name}
									</Table.Cell>
									<Table.Cell width={3} singleLine>
										{room.capacity}
									</Table.Cell>
									<Table.Cell width={2} singleLine>
										<Button
											primary
											size="tiny"
											icon="edit"
											content="Edit"
											onClick={() => Router.push(`/rooms/edit?id=${room.id}`)}
										/>
										<Button
											negative
											size="tiny"
											icon="trash"
											content="Delete"
											onClick={() => this.props.openDeleteModal(room.id)}
										/>
									</Table.Cell>
								</Table.Row>
							))}
						</Table.Body>
					</Table>
					<Modal
						size="tiny"
						dimmer="blurring"
						open={!!this.props.rooms.deleteRoom}
					>
						<Modal.Header>Delete room</Modal.Header>
						<Modal.Content>
							Are you sure you want to delete this room?
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
									await this.props.deleteRoom({ variables: { id: this.props.rooms.deleteRoom } });
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
	connect(state => ({ rooms: state.rooms }), { ...roomActions }),
	graphql(
		// The `signinUser` mutation is provided by graph.cool by default
		gql`
      query roomsQuery {
        allRooms {
        	id
          name
          capacity
        }
      }
    `),
	graphql(
		gql`
			mutation deleteRoom($id: ID!) {
				deleteRoom(
					id: $id
				) {
					id
				}
			}
		`, {
			name: 'deleteRoom',
			options: {
				refetchQueries: ['roomsQuery']
			}
		}
	)
)(Rooms);
