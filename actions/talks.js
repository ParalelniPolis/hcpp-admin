// @flow
import * as Constants from '../constants/talks';

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

export function openDeleteModal(talkId: string) {
	return {
		type: Constants.OPEN_DELETE_MODAL,
		value: talkId
	};
}

export function closeDeleteModal() {
	return {
		type: Constants.CLOSE_DELETE_MODAL
	};
}
