import axios, { AxiosError } from 'axios';
import { AppThunk, RootState } from 'src/store';
import * as REDUCER_TYPES from '../../../types';
import { showMessage } from 'src/store/slices/toast-message-slice';
import {
  InitialPointExchangeProductsState,
  PointExchangeProductsDispatchType,
} from 'src/store/action-types/point-exchange-action-type/point-exchange-products-type/point-exchange-products.type';

const changePointExchangeProductsReducer = (payload: InitialPointExchangeProductsState) => {
  return (dispatch: PointExchangeProductsDispatchType) => {
    dispatch({
      type: REDUCER_TYPES.SET_POINT_EXCHANGE_PRODUCTS_REDUCER,
      payload,
    });
  };
};

const getPointExchangeProductsData = () => {
  return async (dispatch: PointExchangeProductsDispatchType, getState: () => RootState) => {
    const { pointExchangeProductsReducer } = getState();
    const { page, limit, sortType, sortBy, search, groupId } = pointExchangeProductsReducer;

    dispatch({
      type: REDUCER_TYPES.SET_POINT_EXCHANGE_PRODUCTS_REDUCER,
      payload: {
        loading: true,
        error: null,
      },
    });

    try {
      const response = await axios.get(
        `/v1/api/dashboard/tukar-poin?pageNo=${page}&pageSize=${limit}&sort=${sortType}&sortBy=${sortBy}&search=${search}&groupId=${groupId}`,
      );

      const total = +response?.data?.data?.totalElements || 0;
      const data = response?.data?.data?.content || [];

      dispatch({
        type: REDUCER_TYPES.SET_POINT_EXCHANGE_PRODUCTS_REDUCER,
        payload: {
          total,
          data,
        },
      });
    } catch (error) {
      dispatch({
        type: REDUCER_TYPES.SET_POINT_EXCHANGE_PRODUCTS_REDUCER,
        payload: {
          error: `${error}`,
        },
      });
    } finally {
      dispatch({
        type: REDUCER_TYPES.SET_POINT_EXCHANGE_PRODUCTS_REDUCER,
        payload: {
          loading: false,
        },
      });
    }
  };
};

const getProductsCategoryListData = () => {
  return async (dispatch: PointExchangeProductsDispatchType) => {
    dispatch({
      type: REDUCER_TYPES.SET_POINT_EXCHANGE_PRODUCTS_REDUCER,
      payload: {
        loadingList: true,
      },
    });

    try {
      const response = await axios.get(`/v1/api/dashboard/product/list-category`);

      const data = response.data || [];

      dispatch({
        type: REDUCER_TYPES.SET_POINT_EXCHANGE_PRODUCTS_REDUCER,
        payload: {
          productCategoryList: data,
          productCategoryFormList: data,
        },
      });
    } catch (error) {
      dispatch({
        type: REDUCER_TYPES.SET_POINT_EXCHANGE_PRODUCTS_REDUCER,
        payload: {
          productCategoryList: [],
          productCategoryFormList: [],
          loadingList: false,
        },
      });
    } finally {
      dispatch({
        type: REDUCER_TYPES.SET_POINT_EXCHANGE_PRODUCTS_REDUCER,
        payload: {
          loadingList: false,
        },
      });
    }
  };
};

const getProductsGroupListData = (id: string) => {
  return async (dispatch: PointExchangeProductsDispatchType) => {
    dispatch({
      type: REDUCER_TYPES.SET_POINT_EXCHANGE_PRODUCTS_REDUCER,
      payload: {
        loadingList: true,
      },
    });

    try {
      const response = await axios.get(`/v1/api/dashboard/product/list-group/${id}`);

      const data = response.data || [];

      dispatch({
        type: REDUCER_TYPES.SET_POINT_EXCHANGE_PRODUCTS_REDUCER,
        payload: {
          productGroupList: data,
        },
      });
      return data;
    } catch (error) {
      dispatch({
        type: REDUCER_TYPES.SET_POINT_EXCHANGE_PRODUCTS_REDUCER,
        payload: {
          productGroupList: [],
          loadingList: false,
        },
      });
      return false;
    } finally {
      dispatch({
        type: REDUCER_TYPES.SET_POINT_EXCHANGE_PRODUCTS_REDUCER,
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
      type: REDUCER_TYPES.SET_POINT_EXCHANGE_PRODUCTS_REDUCER,
      payload: {
        loadingPost: true,
      },
    });

    try {
      await axios.post(`/v1/api/dashboard/tukar-poin`, formData);
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
        type: REDUCER_TYPES.SET_POINT_EXCHANGE_PRODUCTS_REDUCER,
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
      type: REDUCER_TYPES.SET_POINT_EXCHANGE_PRODUCTS_REDUCER,
      payload: {
        loadingPost: true,
      },
    });

    try {
      await axios.put(`/v1/api/dashboard/tukar-poin`, data);
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
        type: REDUCER_TYPES.SET_POINT_EXCHANGE_PRODUCTS_REDUCER,
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
      type: REDUCER_TYPES.SET_POINT_EXCHANGE_PRODUCTS_REDUCER,
      payload: {
        loadingDelete: true,
      },
    });

    try {
      await axios.delete(`/v1/api/dashboard/tukar-poin/${id}`);
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
        type: REDUCER_TYPES.SET_POINT_EXCHANGE_PRODUCTS_REDUCER,
        payload: {
          loadingDelete: false,
        },
      });
    }
  };
};

const getProductsGroupListFormData = (id: string) => {
  return async (dispatch: PointExchangeProductsDispatchType) => {
    dispatch({
      type: REDUCER_TYPES.SET_POINT_EXCHANGE_PRODUCTS_REDUCER,
      payload: {
        loadingList: true,
      },
    });

    try {
      const response = await axios.get(`/v1/api/dashboard/product/list-group/${id}`);

      const data = response.data || [];

      dispatch({
        type: REDUCER_TYPES.SET_POINT_EXCHANGE_PRODUCTS_REDUCER,
        payload: {
          productGroupFormList: data,
        },
      });
      return data;
    } catch (error) {
      dispatch({
        type: REDUCER_TYPES.SET_POINT_EXCHANGE_PRODUCTS_REDUCER,
        payload: {
          productGroupFormList: [],
          loadingList: false,
        },
      });
      return false;
    } finally {
      dispatch({
        type: REDUCER_TYPES.SET_POINT_EXCHANGE_PRODUCTS_REDUCER,
        payload: {
          loadingList: false,
        },
      });
    }
  };
};

const getProductsBillerListFormData = () => {
  return async (dispatch: PointExchangeProductsDispatchType) => {
    dispatch({
      type: REDUCER_TYPES.SET_POINT_EXCHANGE_PRODUCTS_REDUCER,
      payload: {
        loadingList: true,
      },
    });

    try {
      const response = await axios.get(`/v1/api/dashboard/biller/list`);

      const data = response.data || [];

      dispatch({
        type: REDUCER_TYPES.SET_POINT_EXCHANGE_PRODUCTS_REDUCER,
        payload: {
          billerList: data,
        },
      });
    } catch (error) {
      dispatch({
        type: REDUCER_TYPES.SET_POINT_EXCHANGE_PRODUCTS_REDUCER,
        payload: {
          billerList: [],
          loadingList: false,
        },
      });
    } finally {
      dispatch({
        type: REDUCER_TYPES.SET_POINT_EXCHANGE_PRODUCTS_REDUCER,
        payload: {
          loadingList: false,
        },
      });
    }
  };
};

export {
  addNewProductsData,
  changePointExchangeProductsReducer,
  deleteProductsData,
  editProductsData,
  getPointExchangeProductsData,
  getProductsCategoryListData,
  getProductsGroupListData,
  getProductsGroupListFormData,
  getProductsBillerListFormData,
};
