// @flow
import * as Constants from '../constants/speakers';

type State = {
	ui: {
		loading: boolean,
		error: boolean
	},
	errors: {
		[string]: string
	},
	photoPreview: string,
	deleteSpeaker: ?string
}

type Action = {
	type: string,
	value: any,
	error: any
}

const initialState = {
	ui: {
		loading: false,
		error: false
	},
	errors: {},
	photoPreview: '',
	deleteSpeaker: null
};

export default (state: State = initialState, action: Action) => {
	switch (action.type) {
		case Constants.LOADING_START:
			return {
				...state,
				ui: {
					...state.ui,
					loading: true
				}
			};

		case Constants.LOADING_END:
			return {
				...state,
				ui: {
					...state.ui,
					loading: false
				}
			};

		case Constants.ERROR_SET:
			return {
				...state,
				ui: {
					...state.ui,
					error: !!Object.keys(action.value).length
				},
				errors: {
					...action.value
				}
			};

		case Constants.SET_PHOTO:
			return {
				...state,
				photoPreview: action.value
			};

		case Constants.OPEN_DELETE_MODAL:
			return {
				...state,
				deleteSpeaker: action.value
			};

		case Constants.CLOSE_DELETE_MODAL:
			return {
				...state,
				deleteSpeaker: null
			};

		case Constants.SET_INITIAL:
			return initialState;

		default:
			return state;
	}
};
