// @flow
import React from 'react';
import { Table, Loader } from 'semantic-ui-react';

import SpeakerItem from './SpeakerItem';

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
	loading: boolean,
	speakers: Array<Speaker>,
	moveSpeakerUp: Function,
	moveSpeakerDown: Function,
	openDeleteModal: Function
}

const SpeakerList = ({ loading, speakers, moveSpeakerUp, moveSpeakerDown, openDeleteModal }: Props) => {
	if (loading) {
		return (
			<Loader active inline="centered" />
		);
	}

	return (
		<Table striped columns={7}>
			<Table.Header>
				<Table.Row>
					<Table.HeaderCell width={1} />
					<Table.HeaderCell width={1} />
					<Table.HeaderCell width={1}>Status</Table.HeaderCell>
					<Table.HeaderCell width={3}>Name</Table.HeaderCell>
					<Table.HeaderCell width={3}>E-mail</Table.HeaderCell>
					<Table.HeaderCell width={5}>Bio</Table.HeaderCell>
					<Table.HeaderCell width={2} />
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{speakers.map((speaker, speakerIndex) => (
					<SpeakerItem
						key={speaker.id}
						speaker={speaker}
						speakerIndex={speakerIndex}
						speakersArray={speakers}
						moveSpeakerUp={moveSpeakerUp}
						moveSpeakerDown={moveSpeakerDown}
						openDeleteModal={openDeleteModal}
					/>
				))}
			</Table.Body>
		</Table>
	);
};

export default SpeakerList;
