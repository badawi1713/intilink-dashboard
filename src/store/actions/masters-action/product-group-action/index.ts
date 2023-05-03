import axios, { AxiosError } from 'axios';
import { AppThunk, RootState } from 'src/store';
import {
  InitialMasterProductGroupState,
  MasterProductGroupDispatchType,
} from '../../../action-types/masters-type/product-group-type/product-group-type';
import * as REDUCER_TYPES from '../../../types';
import { showMessage } from 'src/store/slices/toast-message-slice';

const changeMasterProductGroupReducer = (payload: InitialMasterProductGroupState) => {
  return (dispatch: MasterProductGroupDispatchType) => {
    dispatch({
      type: REDUCER_TYPES.SET_MASTER_PRODUCT_GROUP_REDUCER,
      payload,
    });
  };
};

const getMasterProductGroupData = () => {
  return async (dispatch: MasterProductGroupDispatchType, getState: () => RootState) => {
    const { masterProductGroupReducer } = getState();
    const { page, limit, sortType, sortBy, search, categoryId } = masterProductGroupReducer;

    dispatch({
      type: REDUCER_TYPES.SET_MASTER_PRODUCT_GROUP_REDUCER,
      payload: {
        loading: true,
        error: null,
      },
    });

    try {
      const response = await axios.get(
        `/v1/api/dashboard/product-group?pageNo=${page}&pageSize=${limit}&sort=${sortType}&sortBy=${sortBy}&search=${search}&kategoryId=${categoryId}`,
      );

      const total = +response?.data?.data?.totalElements || 0;
      const data = response?.data?.data?.content || [];

      dispatch({
        type: REDUCER_TYPES.SET_MASTER_PRODUCT_GROUP_REDUCER,
        payload: {
          total,
          data,
        },
      });
    } catch (error) {
      dispatch({
        type: REDUCER_TYPES.SET_MASTER_PRODUCT_GROUP_REDUCER,
        payload: {
          error: `${error}`,
        },
      });
    } finally {
      dispatch({
        type: REDUCER_TYPES.SET_MASTER_PRODUCT_GROUP_REDUCER,
        payload: {
          loading: false,
        },
      });
    }
  };
};

const getProductCategoryListData = (): AppThunk => {
  return async (dispatch) => {
    dispatch({
      type: REDUCER_TYPES.SET_MASTER_PRODUCT_GROUP_REDUCER,
      payload: {
        loadingList: true,
      },
    });

    try {
      const response = await axios.get(`/v1/api/dashboard/product-category/list`);

      const data = response.data || [];

      dispatch({
        type: REDUCER_TYPES.SET_MASTER_PRODUCT_GROUP_REDUCER,
        payload: {
          productCategoryList: data,
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
        type: REDUCER_TYPES.SET_MASTER_PRODUCT_GROUP_REDUCER,
        payload: {
          loadingList: false,
        },
      });
    }
  };
};

const addNewProductGroupData = (data: {
  nama: string;
  product_category_id: number;
  keterangan: string;
  id: string;
}): AppThunk => {
  return async (dispatch) => {
    dispatch({
      type: REDUCER_TYPES.SET_MASTER_PRODUCT_GROUP_REDUCER,
      payload: {
        loadingPost: true,
      },
    });

    try {
      await axios.post(`/v1/api/dashboard/product-group`, data);
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
        type: REDUCER_TYPES.SET_MASTER_PRODUCT_GROUP_REDUCER,
        payload: {
          loadingPost: false,
        },
      });
    }
  };
};

const getProductGroupDetailData = (id: number): AppThunk => {
  return async (dispatch) => {
    dispatch({
      type: REDUCER_TYPES.SET_MASTER_PRODUCT_GROUP_REDUCER,
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
        type: REDUCER_TYPES.SET_MASTER_PRODUCT_GROUP_REDUCER,
        payload: {
          loadingDetail: false,
        },
      });
    }
  };
};

const editProductGroupData = (
  id: string,
  data: {
    nama: string;
    product_category_id: number;
    keterangan: string;
    id: string;
  },
): AppThunk => {
  return async (dispatch) => {
    dispatch({
      type: REDUCER_TYPES.SET_MASTER_PRODUCT_GROUP_REDUCER,
      payload: {
        loadingPost: true,
      },
    });

    try {
      await axios.put(`/v1/api/dashboard/product-group/${id}`, data);
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
        type: REDUCER_TYPES.SET_MASTER_PRODUCT_GROUP_REDUCER,
        payload: {
          loadingPost: false,
        },
      });
    }
  };
};

const deleteProductGroupData = (id: number): AppThunk => {
  return async (dispatch) => {
    dispatch({
      type: REDUCER_TYPES.SET_MASTER_PRODUCT_GROUP_REDUCER,
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
        type: REDUCER_TYPES.SET_MASTER_PRODUCT_GROUP_REDUCER,
        payload: {
          loadingDelete: false,
        },
      });
    }
  };
};

export {
  addNewProductGroupData,
  changeMasterProductGroupReducer,
  deleteProductGroupData,
  editProductGroupData,
  getMasterProductGroupData,
  getProductGroupDetailData,
  getProductCategoryListData,
};
