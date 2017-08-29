// @flow
import React from 'react';
import Router from 'next/router';
import { Table, Button } from 'semantic-ui-react';

type Room = {
	id: string,
	name: string,
	capacity: number
};

type Props = {
	room: Room,
	openDeleteModal: Function
};

const RoomItem = ({ room, openDeleteModal }: Props) => (
	<Table.Row>
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
				onClick={() => openDeleteModal(room.id)}
			/>
		</Table.Cell>
	</Table.Row>
);

export default RoomItem;
