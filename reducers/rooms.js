// @flow
import * as Constants from '../constants/rooms';


type State = {
	ui: {
		loading: boolean,
		error: boolean
	},
	errors: {
		[string]: string
	},
	deleteRoom: ?string,
	editForm: {
		name: ?string,
		capacity: number
	}
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
	deleteRoom: null,
	editForm: {
		name: null,
		capacity: 0
	}
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

		case Constants.OPEN_DELETE_MODAL:
			return {
				...state,
				deleteRoom: action.value
			};

		case Constants.CLOSE_DELETE_MODAL:
			return {
				...state,
				deleteRoom: null
			};

		case Constants.SET_INITIAL:
			return initialState;

		default:
			return state;
	}
};
