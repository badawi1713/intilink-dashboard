import axios from 'axios';
import { RootState } from 'src/store';
import {
  InitialMasterProductsState,
  MasterProductsDispatchType,
} from '../../../action-types/masters-type/products-type/products-type';
import * as REDUCER_TYPES from '../../../types';

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
        },
      });
    } catch (error) {
      dispatch({
        type: REDUCER_TYPES.SET_MASTER_PRODUCTS_REDUCER,
        payload: {
          productCategoryList: [],
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

const addNewProductsData = (data: { name: string; product_category_id: number }) => {
  return async (dispatch: MasterProductsDispatchType) => {
    dispatch({
      type: REDUCER_TYPES.SET_MASTER_PRODUCTS_REDUCER,
      payload: {
        loadingPost: true,
      },
    });

    try {
      await axios.post(`/v1/api/dashboard/product`, data);

      return true;
    } catch (error) {
      console.log(error);
      return false;
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

const getProductsDetailData = (id: number) => {
  return async (dispatch: MasterProductsDispatchType) => {
    dispatch({
      type: REDUCER_TYPES.SET_MASTER_PRODUCTS_REDUCER,
      payload: {
        loadingDetail: true,
      },
    });

    try {
      const response = await axios.get(`/v1/api/dashboard/product/${id}`);

      const data = response.data?.data || {};
      return data;
    } catch (error) {
      console.log(error);
      return false;
    } finally {
      dispatch({
        type: REDUCER_TYPES.SET_MASTER_PRODUCTS_REDUCER,
        payload: {
          loadingDetail: false,
        },
      });
    }
  };
};

const editProductsData = (
  id: number,
  data: {
    name: string;
    product_category_id: number;
  },
) => {
  return async (dispatch: MasterProductsDispatchType) => {
    dispatch({
      type: REDUCER_TYPES.SET_MASTER_PRODUCTS_REDUCER,
      payload: {
        loadingPost: true,
      },
    });

    try {
      await axios.put(`/v1/api/dashboard/product/${id}`, data);

      return true;
    } catch (error) {
      console.log(error);
      return false;
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

const deleteProductsData = (id: number) => {
  return async (dispatch: MasterProductsDispatchType) => {
    dispatch({
      type: REDUCER_TYPES.SET_MASTER_PRODUCTS_REDUCER,
      payload: {
        loadingDelete: true,
      },
    });

    try {
      await axios.delete(`/v1/api/dashboard/product/${id}`);

      return true;
    } catch (error) {
      console.log(error);
      return false;
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

export {
  addNewProductsData,
  changeMasterProductsReducer,
  deleteProductsData,
  editProductsData,
  getMasterProductsData,
  getProductsDetailData,
  getProductsCategoryListData,
  getProductsGroupListData,
};
