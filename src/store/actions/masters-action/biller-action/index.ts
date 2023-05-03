import axios, { AxiosError } from 'axios';
import { AppThunk, RootState } from 'src/store';
import {
  InitialMasterBillerState,
  MasterBillerDispatchType,
} from '../../../action-types/masters-type/biller-type/biller.type';
import * as REDUCER_TYPES from '../../../types';
import { showMessage } from 'src/store/slices/toast-message-slice';

const changeMasterBillerReducer = (payload: InitialMasterBillerState) => {
  return (dispatch: MasterBillerDispatchType) => {
    dispatch({
      type: REDUCER_TYPES.SET_MASTER_BILLER_REDUCER,
      payload,
    });
  };
};

const getMasterBillerData = () => {
  return async (dispatch: MasterBillerDispatchType, getState: () => RootState) => {
    const { masterBillerReducer } = getState();
    const { page, limit, sortType, sortBy, search } = masterBillerReducer;

    dispatch({
      type: REDUCER_TYPES.SET_MASTER_BILLER_REDUCER,
      payload: {
        loading: true,
        error: null,
      },
    });

    try {
      const response = await axios.get(
        `/v1/api/dashboard/biller?pageNo=${page}&pageSize=${limit}&sort=${sortType}&sortBy=${sortBy}&search=${search}`,
      );

      const total = +response?.data?.data?.totalElements || 0;
      const data = response?.data?.data?.content || [];

      dispatch({
        type: REDUCER_TYPES.SET_MASTER_BILLER_REDUCER,
        payload: {
          total,
          data,
        },
      });
    } catch (error) {
      dispatch({
        type: REDUCER_TYPES.SET_MASTER_BILLER_REDUCER,
        payload: {
          error: `${error}`,
        },
      });
    } finally {
      dispatch({
        type: REDUCER_TYPES.SET_MASTER_BILLER_REDUCER,
        payload: {
          loading: false,
        },
      });
    }
  };
};

const addNewBillerData = (payload: any): AppThunk => {
  return async (dispatch) => {
    dispatch({
      type: REDUCER_TYPES.SET_MASTER_BILLER_REDUCER,
      payload: {
        loadingPost: true,
      },
    });

    try {
      await axios.post(`/v1/api/dashboard/biller`, payload);
      dispatch(
        showMessage({
          message: 'Berhasil menambahkan data baru!',
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
        type: REDUCER_TYPES.SET_MASTER_BILLER_REDUCER,
        payload: {
          loadingPost: false,
        },
      });
    }
  };
};

const getBillerDetailData = (id: number): AppThunk => {
  return async (dispatch) => {
    dispatch({
      type: REDUCER_TYPES.SET_MASTER_BILLER_REDUCER,
      payload: {
        loadingDetail: true,
      },
    });

    try {
      const response = await axios.get(`/v1/api/dashboard/biller/${id}`);

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
        type: REDUCER_TYPES.SET_MASTER_BILLER_REDUCER,
        payload: {
          loadingDetail: false,
        },
      });
    }
  };
};

const editBillerData = (id: string, payload: any): AppThunk => {
  return async (dispatch) => {
    dispatch({
      type: REDUCER_TYPES.SET_MASTER_BILLER_REDUCER,
      payload: {
        loadingPost: true,
      },
    });

    try {
      await axios.put(`/v1/api/dashboard/biller/${id}`, payload);
      dispatch(
        showMessage({
          message: `Berhasil mengubah data dengan ID: ${id}`,
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
        type: REDUCER_TYPES.SET_MASTER_BILLER_REDUCER,
        payload: {
          loadingPost: false,
        },
      });
    }
  };
};

const deleteBillerData = (id: number): AppThunk => {
  return async (dispatch) => {
    dispatch({
      type: REDUCER_TYPES.SET_MASTER_BILLER_REDUCER,
      payload: {
        loadingDelete: true,
      },
    });

    try {
      await axios.delete(`/v1/api/dashboard/biller/${id}`);
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
        type: REDUCER_TYPES.SET_MASTER_BILLER_REDUCER,
        payload: {
          loadingDelete: false,
        },
      });
    }
  };
};

const getBillerSaldoData = (id: number): AppThunk => {
  return async (dispatch) => {
    dispatch({
      type: REDUCER_TYPES.SET_MASTER_BILLER_REDUCER,
      payload: {
        loadingDetail: true,
      },
    });

    try {
      const response = await axios.get(`/v1/api/dashboard/biller/cek-saldo/${id}`);

      const data = response.data?.data?.keterangan || '';
      dispatch({
        type: REDUCER_TYPES.SET_MASTER_BILLER_REDUCER,
        payload: {
          billerSaldo: data,
          loadingDetail: false,
        },
      });
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
        type: REDUCER_TYPES.SET_MASTER_BILLER_REDUCER,
        payload: {
          loadingDetail: false,
        },
      });
    }
  };
};

export {
  addNewBillerData,
  changeMasterBillerReducer,
  deleteBillerData,
  editBillerData,
  getMasterBillerData,
  getBillerDetailData,
  getBillerSaldoData,
};
