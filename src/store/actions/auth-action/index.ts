import axios from 'axios';
import { AppThunk } from 'src/store';
import { showMessage } from 'src/store/slices/toast-message-slice';
import { updateAccessToken } from '../../../helpers/utils/accessToken';
import {
    AuthDispatchType,
    InitialAuthState,
} from '../../action-types/auth-action-type/auth-action.type';
import * as REDUCER_TYPES from '../../types';

const changeAuthReducer = (payload: InitialAuthState) => {
    return (dispatch: AuthDispatchType) => {
        dispatch({
            type: REDUCER_TYPES.SET_AUTH_REDUCER,
            payload,
        });
    };
};

const loginUserAction =
    (payload: { id: string; password: string }): AppThunk => async (dispatch) => {
        dispatch({
            type: REDUCER_TYPES.SET_AUTH_REDUCER,
            payload: {
                loading: true,
            },
        });
        try {
            const response = await axios.post('/v1/api/authenticate', payload);
            const jwt = (await response.data.data.jwt) || '';
            axios.defaults.headers.common.Authorization = `Bearer ${jwt}`;
            await updateAccessToken(jwt);
            dispatch({
                type: REDUCER_TYPES.SET_AUTH_REDUCER,
                payload: {
                    user: response?.data?.data,
                },
            });
            return true;
        } catch (error: any) {
            dispatch(showMessage({message: error?.response?.data?.message  || error?.response?.message || error?.message || 'Maaf, sedang terjadi gangguan.', variant: 'error'}))
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
    dispatch({ type: REDUCER_TYPES.SET_AUTH_REDUCER, payload: { user: null, loading: true } });
    setTimeout(() => {
        dispatch({ type: REDUCER_TYPES.SET_AUTH_REDUCER, payload: { loading: false } });
    }, 2000);
};

const getAccessTokenAction = (): AppThunk => async (dispatch) => {
        dispatch({
            type: REDUCER_TYPES.SET_AUTH_REDUCER,
            payload: {
                preload: true,
            },
        });
        try {
            const response = await axios.get('/v1/api/dashboard-access-token');
            dispatch({
                type: REDUCER_TYPES.SET_AUTH_REDUCER,
                payload: {
                    user: response?.data?.data,
                },
            });
        } catch (error: any) {
            dispatch(showMessage({message: error?.response?.data?.message  || error?.response?.message || error?.message || 'Maaf, sedang terjadi gangguan.', variant: 'error'}))
        } finally {
            setTimeout(() => {
                dispatch({
                    type: REDUCER_TYPES.SET_AUTH_REDUCER,
                    payload: {
                        preload: false,
                    },
                });
            }, 1000)
        }
    };


export { changeAuthReducer, getAccessTokenAction, loginUserAction, userLogoutAction };

