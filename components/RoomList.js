// @flow
import React from 'react';
import { Table, Loader } from 'semantic-ui-react';

import RoomItem from './RoomItem';

type Room = {
	id: string,
	name: string,
	capacity: number
}

type Props = {
	loading: boolean,
	rooms: Array<Room>,
	openDeleteModal: Function
}

const RoomList = ({ loading, rooms, openDeleteModal }: Props) => {
	if (loading) {
		return (
			<Loader active inline="centered" />
		);
	}

	return (
		<Table striped columns={3}>
			<Table.Header>
				<Table.Row>
					<Table.HeaderCell width={7}>Name</Table.HeaderCell>
					<Table.HeaderCell width={7}>Capacity</Table.HeaderCell>
					<Table.HeaderCell width={2} />
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{rooms.map(room => (
					<RoomItem
						key={room.id}
						room={room}
						openDeleteModal={openDeleteModal}
					/>
				))}
			</Table.Body>
		</Table>
	);
};

export default RoomList;
