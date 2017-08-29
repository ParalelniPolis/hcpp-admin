// @flow
import React from 'react';
import Router from 'next/router';
import { Table, Icon, Label, Button } from 'semantic-ui-react';

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
	speaker: Speaker,
	speakerIndex: number,
	speakersArray: Array<Speaker>,
	moveSpeakerUp: Function,
	moveSpeakerDown: Function,
	openDeleteModal: Function
}

const SpeakerItem = ({ speaker, speakerIndex, speakersArray, moveSpeakerUp, moveSpeakerDown, openDeleteModal }: Props) => (
	<Table.Row>
		<Table.Cell width={1} singleLine>
			{speakerIndex !== 0 && <Icon name="arrow up" circular link onClick={() => moveSpeakerUp(speaker.id, speaker.position, speakersArray[speakerIndex - 1].id)} />}
			{speakerIndex !== speakersArray.length - 1 && <Icon name="arrow down" circular link onClick={() => moveSpeakerDown(speaker.id, speaker.position, speakersArray[speakerIndex + 1].id)} />}
		</Table.Cell>
		<Table.Cell width={1} singleLine>
			{speaker.photo ?
				<img src={speaker.photo.url} alt={speaker.displayName} width={40} />
				:
				<img src="/static/images/speaker-avatar.png" alt="" width={40} />
			}
		</Table.Cell>
		<Table.Cell width={1} singleLine>
			<Label
				size="tiny"
				color={speaker.status === 'ACTIVE' ? 'green' : null}
				horizontal
			>
				{speaker.status}
			</Label>
		</Table.Cell>
		<Table.Cell width={3} singleLine>
			{speaker.displayName}
		</Table.Cell>
		<Table.Cell width={3} singleLine>
			{speaker.email &&
			<a href={`mailto:${speaker.email}`}>{speaker.email}</a>
			}
		</Table.Cell>
		<Table.Cell width={5}>
			{speaker.shortDescription}
		</Table.Cell>
		<Table.Cell width={2} textAlign="right" singleLine>
			<Button
				primary
				size="tiny"
				icon="edit"
				content="Edit"
				onClick={() => Router.push(`/speakers/edit?id=${speaker.id}`)}
			/>
			<Button
				negative
				size="tiny"
				icon="trash"
				content="Delete"
				onClick={() => openDeleteModal(speaker.id)}
			/>
		</Table.Cell>
	</Table.Row>
);

export default SpeakerItem;
