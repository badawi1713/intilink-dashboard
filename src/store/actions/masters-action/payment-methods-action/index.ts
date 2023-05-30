import axios, { AxiosError } from 'axios';
import { AppThunk, RootState } from 'src/store';
import { showMessage } from 'src/store/slices/toast-message-slice';
import {
  InitialMasterPaymentMethodsState,
  MasterPaymentMethodsDispatchType,
} from '../../../action-types/masters-type/payment-methods-type/payment-methods.type';
import * as REDUCER_TYPES from '../../../types';

const changeMasterPaymentMethodsReducer = (payload: InitialMasterPaymentMethodsState) => {
  return (dispatch: MasterPaymentMethodsDispatchType) => {
    dispatch({
      type: REDUCER_TYPES.SET_MASTER_PAYMENT_METHODS_REDUCER,
      payload,
    });
  };
};

const getPaymentMethodsProductListData = () => {
  return async (dispatch: MasterPaymentMethodsDispatchType) => {
    dispatch({
      type: REDUCER_TYPES.SET_MASTER_PAYMENT_METHODS_REDUCER,
      payload: {
        loadingList: true,
      },
    });

    try {
      const response = await axios.get(`/v1/api/dashboard/cara-bayar/list-deposit`);

      const data = response.data || [];

      dispatch({
        type: REDUCER_TYPES.SET_MASTER_PAYMENT_METHODS_REDUCER,
        payload: {
          paymentMethodProductList: data,
          paymentMethodProductFormList: data,
        },
      });
      return data;
    } catch (error) {
      dispatch({
        type: REDUCER_TYPES.SET_MASTER_PAYMENT_METHODS_REDUCER,
        payload: {
          paymentMethodProductList: [],
          paymentMethodProductFormList: [],
          loadingList: false,
        },
      });
    } finally {
      dispatch({
        type: REDUCER_TYPES.SET_MASTER_PAYMENT_METHODS_REDUCER,
        payload: {
          loadingList: false,
        },
      });
    }
  };
};

const getMasterPaymentMethodsData = () => {
  return async (dispatch: MasterPaymentMethodsDispatchType, getState: () => RootState) => {
    const { masterPaymentMethodsReducer } = getState();
    const { page, limit, sortType, sortBy, search, productId, typeId } = masterPaymentMethodsReducer;

    dispatch({
      type: REDUCER_TYPES.SET_MASTER_PAYMENT_METHODS_REDUCER,
      payload: {
        loading: true,
        error: null,
      },
    });

    try {
      const response = await axios.get(
        `/v1/api/dashboard/cara-bayar?pageNo=${page}&pageSize=${limit}&sort=${sortType}&sortBy=${sortBy}&search=${search}&productId=${
          productId === 'Semua' ? '' : productId
        }&type=${typeId}`,
      );

      const total = +response?.data?.data?.length || 0;
      const data = response?.data?.data || [];

      dispatch({
        type: REDUCER_TYPES.SET_MASTER_PAYMENT_METHODS_REDUCER,
        payload: {
          total,
          data,
        },
      });
    } catch (error) {
      dispatch({
        type: REDUCER_TYPES.SET_MASTER_PAYMENT_METHODS_REDUCER,
        payload: {
          error: `${error}`,
        },
      });
    } finally {
      dispatch({
        type: REDUCER_TYPES.SET_MASTER_PAYMENT_METHODS_REDUCER,
        payload: {
          loading: false,
        },
      });
    }
  };
};

const addNewPaymentMethodsData = (formData: any): AppThunk => {
  return async (dispatch) => {
    dispatch({
      type: REDUCER_TYPES.SET_MASTER_PAYMENT_METHODS_REDUCER,
      payload: {
        loadingPost: true,
      },
    });

    try {
      await axios.post(`/v1/api/dashboard/cara-bayar`, formData);
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
    } finally {
      dispatch({
        type: REDUCER_TYPES.SET_MASTER_PAYMENT_METHODS_REDUCER,
        payload: {
          loadingPost: false,
        },
      });
    }
  };
};

const editPaymentMethodsData = (id: string, data: any): AppThunk => {
  return async (dispatch) => {
    dispatch({
      type: REDUCER_TYPES.SET_MASTER_PAYMENT_METHODS_REDUCER,
      payload: {
        loadingPost: true,
      },
    });

    try {
      await axios.put(`/v1/api/dashboard/cara-bayar/${id}`, data);
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
    } finally {
      dispatch({
        type: REDUCER_TYPES.SET_MASTER_PAYMENT_METHODS_REDUCER,
        payload: {
          loadingPost: false,
        },
      });
    }
  };
};

const deletePaymentMethodsData = (id: string): AppThunk => {
  return async (dispatch) => {
    dispatch({
      type: REDUCER_TYPES.SET_MASTER_PAYMENT_METHODS_REDUCER,
      payload: {
        loadingDelete: true,
      },
    });

    try {
      await axios.delete(`/v1/api/dashboard/cara-bayar/${id}`);
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
    } finally {
      dispatch({
        type: REDUCER_TYPES.SET_MASTER_PAYMENT_METHODS_REDUCER,
        payload: {
          loadingDelete: false,
        },
      });
    }
  };
};

const getPaymentMethodsGroupListFormData = (id: string) => {
  return async (dispatch: MasterPaymentMethodsDispatchType) => {
    dispatch({
      type: REDUCER_TYPES.SET_MASTER_PAYMENT_METHODS_REDUCER,
      payload: {
        loadingList: true,
      },
    });

    try {
      const response = await axios.get(`/v1/api/dashboard/cara-bayar/list-group/${id}`);

      const data = response.data || [];

      dispatch({
        type: REDUCER_TYPES.SET_MASTER_PAYMENT_METHODS_REDUCER,
        payload: {
          paymentMethodGroupFormList: data,
        },
      });
      return data;
    } catch (error) {
      dispatch({
        type: REDUCER_TYPES.SET_MASTER_PAYMENT_METHODS_REDUCER,
        payload: {
          paymentMethodGroupFormList: [],
          loadingList: false,
        },
      });
      return false;
    } finally {
      dispatch({
        type: REDUCER_TYPES.SET_MASTER_PAYMENT_METHODS_REDUCER,
        payload: {
          loadingList: false,
        },
      });
    }
  };
};

const getPaymentMethodsBillerListFormData = () => {
  return async (dispatch: MasterPaymentMethodsDispatchType) => {
    dispatch({
      type: REDUCER_TYPES.SET_MASTER_PAYMENT_METHODS_REDUCER,
      payload: {
        loadingList: true,
      },
    });

    try {
      const response = await axios.get(`/v1/api/dashboard/biller/list`);

      const data = response.data || [];

      dispatch({
        type: REDUCER_TYPES.SET_MASTER_PAYMENT_METHODS_REDUCER,
        payload: {
          billerList: data,
        },
      });
    } catch (error) {
      dispatch({
        type: REDUCER_TYPES.SET_MASTER_PAYMENT_METHODS_REDUCER,
        payload: {
          billerList: [],
          loadingList: false,
        },
      });
    } finally {
      dispatch({
        type: REDUCER_TYPES.SET_MASTER_PAYMENT_METHODS_REDUCER,
        payload: {
          loadingList: false,
        },
      });
    }
  };
};

export {
  addNewPaymentMethodsData,
  changeMasterPaymentMethodsReducer,
  deletePaymentMethodsData,
  editPaymentMethodsData,
  getMasterPaymentMethodsData,
  getPaymentMethodsBillerListFormData,
  getPaymentMethodsGroupListFormData,
  getPaymentMethodsProductListData,
};
