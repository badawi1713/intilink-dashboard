import axios from "axios";
import { updateAccessToken } from "../../../helpers/utils/accessToken";
import { AuthDispatchType, InitialAuthState } from "../../action-types/auth-action-type/auth-action.type";
import * as REDUCER_TYPES from '../../types';

const changeAuthReducer = (payload: InitialAuthState) => {
    return (dispatch: AuthDispatchType) => {
        dispatch({
            type: REDUCER_TYPES.SET_AUTH_REDUCER,
            payload
        })
    }
}

const loginUserAction = (payload: { id: string, password: string }) => async (dispatch: AuthDispatchType) => {
    dispatch({
        type: REDUCER_TYPES.SET_AUTH_REDUCER,
        payload: {
            loading: true,
        },
    });
    try {
        const response = await axios.post('/v1/api/authenticate', payload);
        const { jwt } = await response.data.data;
        axios.defaults.headers.common.Authorization = `Bearer ${jwt}`;
        await updateAccessToken(jwt);
        dispatch({
            type: REDUCER_TYPES.SET_AUTH_REDUCER,
            payload: {
                user: response?.data?.data
            }
        })
        return true;
    } catch (error) {
        console.log(error)
        return false;
    } finally {
        dispatch({
            type: REDUCER_TYPES.SET_AUTH_REDUCER,
            payload: {
                loading: false,
            },
        });
    }
};

const userLogoutAction = () => async (dispatch: AuthDispatchType) => {
    updateAccessToken('');
    dispatch({ type: REDUCER_TYPES.SET_AUTH_REDUCER, payload: { user: null } });
};

export {
    userLogoutAction,
    loginUserAction,
    changeAuthReducer
};
