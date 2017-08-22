// @flow
import * as Constants from '../constants/speakers';

export function loadingStart() {
	return {
		type: Constants.LOADING_START
	};
}

export function loadingEnd() {
	return {
		type: Constants.LOADING_END
	};
}

export function errorSet(errors: Object) {
	return {
		type: Constants.ERROR_SET,
		value: errors
	};
}

export function setInitialState() {
	return {
		type: Constants.SET_INITIAL
	};
}

export function imagePreviewAdd(photoUrl: string) {
	return {
		type: Constants.SET_PHOTO,
		value: photoUrl
	};
}

export function openDeleteModal(speakerId: string) {
	return {
		type: Constants.OPEN_DELETE_MODAL,
		value: speakerId
	};
}

export function closeDeleteModal() {
	return {
		type: Constants.CLOSE_DELETE_MODAL
	};
}
