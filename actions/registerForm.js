// @flow
import * as Constants from '../constants/registerForm';

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
