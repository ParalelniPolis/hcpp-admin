// @flow
import React from 'react';
import Router from 'next/router';
import moment from 'moment-timezone';
import { Table, Button, Label } from 'semantic-ui-react';

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
	talk: Talk,
	openDeleteModal: Function
}

const TalkItem = ({ talk, openDeleteModal }: Props) => (
	<Table.Row>
		<Table.Cell width={1} singleLine>
			<Label
				size="tiny"
				color={talk.status === 'ACTIVE' ? 'green' : null}
				horizontal
			>
				{talk.status}
			</Label>
		</Table.Cell>
		<Table.Cell width={3}>
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
				onClick={() => openDeleteModal(talk.id)}
			/>
		</Table.Cell>
	</Table.Row>
);

export default TalkItem;
