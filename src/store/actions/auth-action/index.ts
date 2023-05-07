import axios from 'axios';
import { AppThunk } from 'src/store';
import { showMessage } from 'src/store/slices/toast-message-slice';
import { getAccessToken, updateAccessToken } from '../../../helpers/utils/accessToken';
import { AuthDispatchType, InitialAuthState } from '../../action-types/auth-action-type/auth-action.type';
import * as REDUCER_TYPES from '../../types';

const MODE = import.meta.env.VITE_MODE;

const changeAuthReducer = (payload: InitialAuthState) => {
  return (dispatch: AuthDispatchType) => {
    dispatch({
      type: REDUCER_TYPES.SET_AUTH_REDUCER,
      payload,
    });
  };
};

const loginUserAction =
  (payload: { id: string; password: string }): AppThunk =>
  async (dispatch) => {
    let result = false;
    dispatch({
      type: REDUCER_TYPES.SET_AUTH_REDUCER,
      payload: {
        loading: true,
      },
    });
    try {
      const response = await axios.post(MODE === 'PROD' ? '/v1/api/dashboard/auth' : '/v1/api/authenticate', payload);
      const jwt = (await response.data.data.jwt) || '';
      axios.defaults.headers.common.Authorization = `Bearer ${jwt}`;
      updateAccessToken(jwt);
      dispatch({
        type: REDUCER_TYPES.SET_AUTH_REDUCER,
        payload: {
          user: response?.data?.data,
        },
      });
      result = true;
    } catch (error: any) {
      dispatch(
        showMessage({
          message:
            error?.response?.data?.message ||
            error?.response?.message ||
            error?.message ||
            'Maaf, sedang terjadi gangguan.',
          variant: 'error',
        }),
      );
      result = false;
    } finally {
      dispatch({
        type: REDUCER_TYPES.SET_AUTH_REDUCER,
        payload: {
          loading: false,
        },
      });
    }
    return result;
  };

const userLogoutAction = () => (dispatch: AuthDispatchType) => {
  updateAccessToken('');
  dispatch({
    type: REDUCER_TYPES.SET_AUTH_REDUCER,
    payload: { user: null, preload: true },
  });
  setTimeout(() => {
    dispatch({
      type: REDUCER_TYPES.SET_AUTH_REDUCER,
      payload: { preload: false },
    });
  }, 2000);
};

const getAccessTokenAction = (): AppThunk => async (dispatch) => {
  const token = getAccessToken();
  dispatch({
    type: REDUCER_TYPES.SET_AUTH_REDUCER,
    payload: {
      preload: true,
    },
  });
  try {
    if (token) {
      const response = await axios.get('/v1/api/dashboard-access-token');
      dispatch({
        type: REDUCER_TYPES.SET_AUTH_REDUCER,
        payload: {
          user: response?.data?.data,
        },
      });
    } else {
      return false;
    }
  } catch (error: any) {
    dispatch(
      showMessage({
        message:
          error?.response?.data?.message ||
          error?.response?.message ||
          error?.message ||
          'Maaf, sedang terjadi gangguan.',
        variant: 'error',
      }),
    );
  } finally {
    setTimeout(() => {
      dispatch({
        type: REDUCER_TYPES.SET_AUTH_REDUCER,
        payload: {
          preload: false,
        },
      });
    }, 1000);
  }
};

export { changeAuthReducer, getAccessTokenAction, loginUserAction, userLogoutAction };
