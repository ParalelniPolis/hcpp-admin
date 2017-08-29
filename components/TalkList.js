// @flow
import React from 'react';
import { Table, Loader } from 'semantic-ui-react';

import TalkItem from './TalkItem';

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
	loading: boolean,
	talks: Array<Talk>,
	openDeleteModal: Function
}

const TalkList = ({ loading, talks, openDeleteModal }: Props) => {
	if (loading) {
		return (
			<Loader active inline="centered" />
		);
	}

	return (
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
				{talks.map(talk => (
					<TalkItem
						key={talk.id}
						talk={talk}
						openDeleteModal={openDeleteModal}
					/>
				))}
			</Table.Body>
		</Table>
	); };

export default TalkList;
