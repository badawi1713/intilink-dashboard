import axios, { AxiosError } from 'axios';
import { AppThunk, RootState } from 'src/store';
import {
  InitialTransactionAdjustSaldoState,
  TransactionAdjustSaldoDispatchType,
} from '../../../action-types/transactions-type/adjust-saldo-type/adjust-saldo-type';
import * as REDUCER_TYPES from '../../../types';
import { showMessage } from 'src/store/slices/toast-message-slice';

const changeTransactionAdjustSaldoReducer = (payload: InitialTransactionAdjustSaldoState) => {
  return (dispatch: TransactionAdjustSaldoDispatchType) => {
    dispatch({
      type: REDUCER_TYPES.SET_TRANSACTION_ADJUST_SALDO_REDUCER,
      payload,
    });
  };
};

const getTransactionAdjustSaldoData = () => {
  return async (dispatch: TransactionAdjustSaldoDispatchType, getState: () => RootState) => {
    const { transactionAdjustSaldoReducer } = getState();
    const { page, limit, sortType, sortBy, search } = transactionAdjustSaldoReducer;

    dispatch({
      type: REDUCER_TYPES.SET_TRANSACTION_ADJUST_SALDO_REDUCER,
      payload: {
        loading: true,
        error: null,
      },
    });

    try {
      const response = await axios.get(
        `/v1/api/dashboard/saldo?pageNo=${page}&pageSize=${limit}&sort=${sortType}&sortBy=${sortBy}&filter=${search}`,
      );

      const total = +response?.data?.data?.totalElements || 0;
      const data = response?.data?.data?.content || [];

      dispatch({
        type: REDUCER_TYPES.SET_TRANSACTION_ADJUST_SALDO_REDUCER,
        payload: {
          total,
          data,
        },
      });
    } catch (error) {
      dispatch({
        type: REDUCER_TYPES.SET_TRANSACTION_ADJUST_SALDO_REDUCER,
        payload: {
          error: `${error}`,
        },
      });
    } finally {
      dispatch({
        type: REDUCER_TYPES.SET_TRANSACTION_ADJUST_SALDO_REDUCER,
        payload: {
          loading: false,
        },
      });
    }
  };
};

const getUserListData = (keyword: string): AppThunk => {
  return async (dispatch) => {
    dispatch({
      type: REDUCER_TYPES.SET_TRANSACTION_ADJUST_SALDO_REDUCER,
      payload: {
        loadingUserSearch: true,
      },
    });

    try {
      const response = await axios.get(`/v1/api/dashboard/user/list-dropdown?key=${keyword}`);

      const data = response.data?.data || [];

      dispatch({
        type: REDUCER_TYPES.SET_TRANSACTION_ADJUST_SALDO_REDUCER,
        payload: {
          userList: data,
        },
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<AxiosErrorType>;
        if (axiosError.response) {
          const { message } = axiosError.response.data;
          dispatch(
            showMessage({
              message: `${message}` || 'Maaf, sedang terjadi kesalahan',
              variant: 'error',
            }),
          );
        } else {
          dispatch(
            showMessage({
              message: error.message || 'Maaf, sedang terjadi kesalahan',
              variant: 'error',
            }),
          );
        }
      } else {
        dispatch(
          showMessage({
            message: 'Maaf, sedang terjadi kesalahan',
            variant: 'error',
          }),
        );
      }
    } finally {
      dispatch({
        type: REDUCER_TYPES.SET_TRANSACTION_ADJUST_SALDO_REDUCER,
        payload: {
          loadingUserSearch: false,
        },
      });
    }
  };
};

const addNewAdjustSaldoData = (data: any): AppThunk => {
  return async (dispatch) => {
    dispatch({
      type: REDUCER_TYPES.SET_TRANSACTION_ADJUST_SALDO_REDUCER,
      payload: {
        loadingPost: true,
      },
    });

    try {
      await axios.post(`/v1/api/dashboard/saldo/manual`, data);
      dispatch(
        showMessage({
          message: 'Berhasil menyimpan transaksi penyesuaian saldo!',
          variant: 'success',
        }),
      );
      return true;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<AxiosErrorType>;
        if (axiosError.response) {
          const { message } = axiosError.response.data;
          dispatch(
            showMessage({
              message: `${message}` || 'Maaf, sedang terjadi kesalahan',
              variant: 'error',
            }),
          );
        } else {
          dispatch(
            showMessage({
              message: error.message || 'Maaf, sedang terjadi kesalahan',
              variant: 'error',
            }),
          );
        }
      } else {
        dispatch(
          showMessage({
            message: 'Maaf, sedang terjadi kesalahan',
            variant: 'error',
          }),
        );
      }
      return false;
    } finally {
      dispatch({
        type: REDUCER_TYPES.SET_TRANSACTION_ADJUST_SALDO_REDUCER,
        payload: {
          loadingPost: false,
        },
      });
    }
  };
};

const getAdjustSaldoDetailData = (id: number): AppThunk => {
  return async (dispatch) => {
    dispatch({
      type: REDUCER_TYPES.SET_TRANSACTION_ADJUST_SALDO_REDUCER,
      payload: {
        loadingDetail: true,
      },
    });

    try {
      const response = await axios.get(`/v1/api/dashboard/product-group/${id}`);

      const data = response.data?.data || {};
      return data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<AxiosErrorType>;
        if (axiosError.response) {
          const { message } = axiosError.response.data;
          dispatch(
            showMessage({
              message: `${message}` || 'Maaf, sedang terjadi kesalahan',
              variant: 'error',
            }),
          );
        } else {
          dispatch(
            showMessage({
              message: error.message || 'Maaf, sedang terjadi kesalahan',
              variant: 'error',
            }),
          );
        }
      } else {
        dispatch(
          showMessage({
            message: 'Maaf, sedang terjadi kesalahan',
            variant: 'error',
          }),
        );
      }
      return false;
    } finally {
      dispatch({
        type: REDUCER_TYPES.SET_TRANSACTION_ADJUST_SALDO_REDUCER,
        payload: {
          loadingDetail: false,
        },
      });
    }
  };
};

const editAdjustSaldoData = (data: any): AppThunk => {
  return async (dispatch) => {
    dispatch({
      type: REDUCER_TYPES.SET_TRANSACTION_ADJUST_SALDO_REDUCER,
      payload: {
        loadingPost: true,
      },
    });

    try {
      await axios.put(`/v1/api/dashboard/product-group`, data);
      dispatch(
        showMessage({
          message: `Berhasil mengubah data dengan Zonapay ID: ${data?.user_id}`,
          variant: 'success',
        }),
      );
      return true;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<AxiosErrorType>;
        if (axiosError.response) {
          const { message } = axiosError.response.data;
          dispatch(
            showMessage({
              message: `${message}` || 'Maaf, sedang terjadi kesalahan',
              variant: 'error',
            }),
          );
        } else {
          dispatch(
            showMessage({
              message: error.message || 'Maaf, sedang terjadi kesalahan',
              variant: 'error',
            }),
          );
        }
      } else {
        dispatch(
          showMessage({
            message: 'Maaf, sedang terjadi kesalahan',
            variant: 'error',
          }),
        );
      }
      return false;
    } finally {
      dispatch({
        type: REDUCER_TYPES.SET_TRANSACTION_ADJUST_SALDO_REDUCER,
        payload: {
          loadingPost: false,
        },
      });
    }
  };
};

const deleteAdjustSaldoData = (id: number): AppThunk => {
  return async (dispatch) => {
    dispatch({
      type: REDUCER_TYPES.SET_TRANSACTION_ADJUST_SALDO_REDUCER,
      payload: {
        loadingDelete: true,
      },
    });

    try {
      await axios.delete(`/v1/api/dashboard/product-group/${id}`);
      dispatch(
        showMessage({
          message: `Berhasil menghapus data dengan ID: ${id}`,
          variant: 'success',
        }),
      );
      return true;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<AxiosErrorType>;
        if (axiosError.response) {
          const { message } = axiosError.response.data;
          dispatch(
            showMessage({
              message: `${message}` || 'Maaf, sedang terjadi kesalahan',
              variant: 'error',
            }),
          );
        } else {
          dispatch(
            showMessage({
              message: error.message || 'Maaf, sedang terjadi kesalahan',
              variant: 'error',
            }),
          );
        }
      } else {
        dispatch(
          showMessage({
            message: 'Maaf, sedang terjadi kesalahan',
            variant: 'error',
          }),
        );
      }
      return false;
    } finally {
      dispatch({
        type: REDUCER_TYPES.SET_TRANSACTION_ADJUST_SALDO_REDUCER,
        payload: {
          loadingDelete: false,
        },
      });
    }
  };
};

export {
  addNewAdjustSaldoData,
  changeTransactionAdjustSaldoReducer,
  deleteAdjustSaldoData,
  editAdjustSaldoData,
  getTransactionAdjustSaldoData,
  getAdjustSaldoDetailData,
  getUserListData,
};
