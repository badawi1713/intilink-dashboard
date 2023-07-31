import { AuthAction, InitialAuthState } from '../../action-types/auth-action-type/auth-action.type';
import * as REDUCER_TYPES from '../../types';

const initialState: InitialAuthState = {
  user: null,
  loading: false,
  preload: true,
  error: null,
};

const authReducer = (state = initialState, action: AuthAction) => {
  switch (action.type) {
    case REDUCER_TYPES.SET_AUTH_REDUCER:
      return { ...state, ...action.payload };
    default:
      return state;
  }
};

export default authReducer;
