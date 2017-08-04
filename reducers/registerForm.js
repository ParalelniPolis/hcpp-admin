// @flow
import * as Constants from '../constants/registerForm';

type State = {
  ui: {
    loading: boolean,
    error: boolean
  },
  errors: {
    [string]: string
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
  errors: {}
};

export default (state: State = initialState, action: Action) => {
  switch(action.type) {
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

    case 'APOLLO_MUTATION_ERROR':
      return {
        ...state,
        ui: {
          ...state.ui,
          loading: false,
          error: true
        },
        errors: {
          apollo: action.error.message
        }
      };

    case 'APOLLO_STORE_RESET':
      return initialState;

    default:
      return state;
  }
}