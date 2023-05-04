import axios, { AxiosError } from 'axios';
import { AppThunk, RootState } from 'src/store';
import {
  InitialMasterProductsState,
  MasterProductsDispatchType,
} from '../../../action-types/masters-type/products-type/products-type';
import * as REDUCER_TYPES from '../../../types';
import { showMessage } from 'src/store/slices/toast-message-slice';

const changeMasterProductsReducer = (payload: InitialMasterProductsState) => {
  return (dispatch: MasterProductsDispatchType) => {
    dispatch({
      type: REDUCER_TYPES.SET_MASTER_PRODUCTS_REDUCER,
      payload,
    });
  };
};

const getMasterProductsData = () => {
  return async (dispatch: MasterProductsDispatchType, getState: () => RootState) => {
    const { masterProductsReducer } = getState();
    const { page, limit, sortType, sortBy, search, groupId } = masterProductsReducer;

    dispatch({
      type: REDUCER_TYPES.SET_MASTER_PRODUCTS_REDUCER,
      payload: {
        loading: true,
        error: null,
      },
    });

    try {
      const response = await axios.get(
        `/v1/api/dashboard/product?pageNo=${page}&pageSize=${limit}&sort=${sortType}&sortBy=${sortBy}&search=${search}&groupId=${groupId}`,
      );

      const total = +response?.data?.data?.totalElements || 0;
      const data = response?.data?.data?.content || [];

      dispatch({
        type: REDUCER_TYPES.SET_MASTER_PRODUCTS_REDUCER,
        payload: {
          total,
          data,
        },
      });
    } catch (error) {
      dispatch({
        type: REDUCER_TYPES.SET_MASTER_PRODUCTS_REDUCER,
        payload: {
          error: `${error}`,
        },
      });
    } finally {
      dispatch({
        type: REDUCER_TYPES.SET_MASTER_PRODUCTS_REDUCER,
        payload: {
          loading: false,
        },
      });
    }
  };
};

const getProductsCategoryListData = () => {
  return async (dispatch: MasterProductsDispatchType) => {
    dispatch({
      type: REDUCER_TYPES.SET_MASTER_PRODUCTS_REDUCER,
      payload: {
        loadingList: true,
      },
    });

    try {
      const response = await axios.get(`/v1/api/dashboard/product/list-category`);

      const data = response.data || [];

      dispatch({
        type: REDUCER_TYPES.SET_MASTER_PRODUCTS_REDUCER,
        payload: {
          productCategoryList: data,
          productCategoryFormList: data,
        },
      });
    } catch (error) {
      dispatch({
        type: REDUCER_TYPES.SET_MASTER_PRODUCTS_REDUCER,
        payload: {
          productCategoryList: [],
          productCategoryFormList: [],
          loadingList: false,
        },
      });
    } finally {
      dispatch({
        type: REDUCER_TYPES.SET_MASTER_PRODUCTS_REDUCER,
        payload: {
          loadingList: false,
        },
      });
    }
  };
};

const getProductsGroupListData = (id: string) => {
  return async (dispatch: MasterProductsDispatchType) => {
    dispatch({
      type: REDUCER_TYPES.SET_MASTER_PRODUCTS_REDUCER,
      payload: {
        loadingList: true,
      },
    });

    try {
      const response = await axios.get(`/v1/api/dashboard/product/list-group/${id}`);

      const data = response.data || [];

      dispatch({
        type: REDUCER_TYPES.SET_MASTER_PRODUCTS_REDUCER,
        payload: {
          productGroupList: data,
        },
      });
      return data;
    } catch (error) {
      dispatch({
        type: REDUCER_TYPES.SET_MASTER_PRODUCTS_REDUCER,
        payload: {
          productGroupList: [],
          loadingList: false,
        },
      });
      return false;
    } finally {
      dispatch({
        type: REDUCER_TYPES.SET_MASTER_PRODUCTS_REDUCER,
        payload: {
          loadingList: false,
        },
      });
    }
  };
};

const addNewProductsData = (formData: any): AppThunk => {
  return async (dispatch) => {
    dispatch({
      type: REDUCER_TYPES.SET_MASTER_PRODUCTS_REDUCER,
      payload: {
        loadingPost: true,
      },
    });

    try {
      await axios.post(`/v1/api/dashboard/product`, formData);
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
        type: REDUCER_TYPES.SET_MASTER_PRODUCTS_REDUCER,
        payload: {
          loadingPost: false,
        },
      });
    }
  };
};

const editProductsData = (id: string, data: any): AppThunk => {
  return async (dispatch) => {
    dispatch({
      type: REDUCER_TYPES.SET_MASTER_PRODUCTS_REDUCER,
      payload: {
        loadingPost: true,
      },
    });

    try {
      await axios.put(`/v1/api/dashboard/product/${id}`, data);
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
        type: REDUCER_TYPES.SET_MASTER_PRODUCTS_REDUCER,
        payload: {
          loadingPost: false,
        },
      });
    }
  };
};

const deleteProductsData = (id: string): AppThunk => {
  return async (dispatch) => {
    dispatch({
      type: REDUCER_TYPES.SET_MASTER_PRODUCTS_REDUCER,
      payload: {
        loadingDelete: true,
      },
    });

    try {
      await axios.delete(`/v1/api/dashboard/product/${id}`);
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
        type: REDUCER_TYPES.SET_MASTER_PRODUCTS_REDUCER,
        payload: {
          loadingDelete: false,
        },
      });
    }
  };
};

const getProductsGroupListFormData = (id: string) => {
  return async (dispatch: MasterProductsDispatchType) => {
    dispatch({
      type: REDUCER_TYPES.SET_MASTER_PRODUCTS_REDUCER,
      payload: {
        loadingList: true,
      },
    });

    try {
      const response = await axios.get(`/v1/api/dashboard/product/list-group/${id}`);

      const data = response.data || [];

      dispatch({
        type: REDUCER_TYPES.SET_MASTER_PRODUCTS_REDUCER,
        payload: {
          productGroupFormList: data,
        },
      });
      return data;
    } catch (error) {
      dispatch({
        type: REDUCER_TYPES.SET_MASTER_PRODUCTS_REDUCER,
        payload: {
          productGroupFormList: [],
          loadingList: false,
        },
      });
      return false;
    } finally {
      dispatch({
        type: REDUCER_TYPES.SET_MASTER_PRODUCTS_REDUCER,
        payload: {
          loadingList: false,
        },
      });
    }
  };
};

const getProductsBillerListFormData = () => {
  return async (dispatch: MasterProductsDispatchType) => {
    dispatch({
      type: REDUCER_TYPES.SET_MASTER_PRODUCTS_REDUCER,
      payload: {
        loadingList: true,
      },
    });

    try {
      const response = await axios.get(`/v1/api/dashboard/biller/list`);

      const data = response.data || [];

      dispatch({
        type: REDUCER_TYPES.SET_MASTER_PRODUCTS_REDUCER,
        payload: {
          billerList: data,
        },
      });
    } catch (error) {
      dispatch({
        type: REDUCER_TYPES.SET_MASTER_PRODUCTS_REDUCER,
        payload: {
          billerList: [],
          loadingList: false,
        },
      });
    } finally {
      dispatch({
        type: REDUCER_TYPES.SET_MASTER_PRODUCTS_REDUCER,
        payload: {
          loadingList: false,
        },
      });
    }
  };
};

export {
  addNewProductsData,
  changeMasterProductsReducer,
  deleteProductsData,
  editProductsData,
  getMasterProductsData,
  getProductsCategoryListData,
  getProductsGroupListData,
  getProductsGroupListFormData,
  getProductsBillerListFormData,
};
