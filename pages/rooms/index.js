// @flow
import React from 'react';
import { graphql, withApollo, compose } from 'react-apollo';
import gql from 'graphql-tag';
import Link from 'next/link';
import { Header, Button, Divider, Segment, Grid } from 'semantic-ui-react';
import App from '../../components/App';
import Layout from '../../components/Layout';
import withData from '../../lib/withData';
import redirect from '../../lib/redirect';
import checkLoggedIn from '../../lib/checkLoggedIn';

class Rooms extends React.PureComponent {
	static async getInitialProps(context, apolloClient) {
		const { loggedInUser } = await checkLoggedIn(context, apolloClient);

		if (!loggedInUser.user) {
			// Already signed in? No need to continue.
			// Throw them back to the main page
			redirect(context, '/login');
		}

		return { loggedInUser };
	}

	componentDidUpdate() {
		this.props.data.refetch();
	}

	render() {
		const { data } = this.props;

		return (
			<App>
				<Layout pathname={this.props.url.pathname} loggedInUser={this.props.loggedInUser}>
					<Link href="/rooms/new">
						<Button primary floated="right" icon="add" content="Create new room" labelPosition="right" />
					</Link>
					<Header as='h1'>Rooms</Header>
					<Divider />
					<Segment.Group>
						<Segment secondary loading={data.loading}>
							<Grid columns={3}>
								<Grid.Column width={12}>
									<strong>Name</strong>
								</Grid.Column>
								<Grid.Column width={4}>
									<strong>Capacity</strong>
								</Grid.Column>
							</Grid>
						</Segment>
						{!data.loading && data.allRooms.map(room => (
							<Segment>
								<Grid columns={3}>
									<Grid.Column width={12}>
										{room.name}
									</Grid.Column>
									<Grid.Column width={2}>
										{room.capacity}
									</Grid.Column>
									<Grid.Column width={2}>
										<Button size="mini">Edit</Button>
									</Grid.Column>
								</Grid>
							</Segment>
						))}
					</Segment.Group>
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
		// The `signinUser` mutation is provided by graph.cool by default
		gql`
      query roomsQuery {
        allRooms {
        	id
          name
          capacity
        }
      }
    `)
)(Rooms);
