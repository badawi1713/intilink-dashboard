import axios from 'axios';
import { RootState } from 'src/store';
import {
    InitialMasterProductCategoryState,
    MasterProductCategoryDispatchType,
} from '../../../action-types/masters-type/product-category-type/product-category.type';
import * as REDUCER_TYPES from '../../../types';

const changeMasterProductCategoryReducer = (payload: InitialMasterProductCategoryState) => {
  return (dispatch: MasterProductCategoryDispatchType) => {
    dispatch({
      type: REDUCER_TYPES.SET_MASTER_PRODUCT_CATEGORY_REDUCER,
      payload,
    });
  };
};

const getMasterProductCategoryData = () => {
  return async (
    dispatch: MasterProductCategoryDispatchType,
    getState: () => RootState
  ) => {
    const { masterProductCategoryReducer } = getState();
    const { page, limit, sortType, sortBy, search } = masterProductCategoryReducer;

    dispatch({
      type: REDUCER_TYPES.SET_MASTER_PRODUCT_CATEGORY_REDUCER,
      payload: {
        loading: true,
        error: null,
      },
    });

    try {
      const response = await axios.get(
        `/v1/api/dashboard/product-category?pageNo=${page}&pageSize=${limit}&sort=${sortType}&sortBy=${sortBy}&search=${search}`
      );

      const total = +response?.data?.data?.totalElements || 0;
      const data = response?.data?.data?.content || [];

      dispatch({
        type: REDUCER_TYPES.SET_MASTER_PRODUCT_CATEGORY_REDUCER,
        payload: {
          total,
          data,
        },
      });
    } catch (error) {
      dispatch({
        type: REDUCER_TYPES.SET_MASTER_PRODUCT_CATEGORY_REDUCER,
        payload: {
          error: `${error}`,
        },
      });
    } finally {
      dispatch({
        type: REDUCER_TYPES.SET_MASTER_PRODUCT_CATEGORY_REDUCER,
        payload: {
          loading: false,
        },
      });
    }
  };
};



const addNewProductCategoryData = (formData: any) => {
  return async (dispatch: MasterProductCategoryDispatchType) => {
    dispatch({
      type: REDUCER_TYPES.SET_MASTER_PRODUCT_CATEGORY_REDUCER,
      payload: {
        loadingPost: true,
      },
    });

    try {
      await axios.post(`/v1/api/dashboard/product-category`, formData);

      return true;
    } catch (error) {
      console.log(error);
      return false;
    } finally {
      dispatch({
        type: REDUCER_TYPES.SET_MASTER_PRODUCT_CATEGORY_REDUCER,
        payload: {
          loadingPost: false,
        },
      });
    }
  };
};

const getProductCategoryDetailData = (id: number) => {
    return async (dispatch: MasterProductCategoryDispatchType) => {
      dispatch({
        type: REDUCER_TYPES.SET_MASTER_PRODUCT_CATEGORY_REDUCER,
        payload: {
          loadingDetail: true,
        },
      });
  
      try {
        const response = await axios.get(`/v1/api/dashboard/product-category/${id}`);
  
        const data = response.data?.data || {};
          return data;
      } catch (error) {
          console.log(error);
          return false
      } finally {
        dispatch({
          type: REDUCER_TYPES.SET_MASTER_PRODUCT_CATEGORY_REDUCER,
          payload: {
            loadingDetail: false,
          },
        });
      }
    };
};
  
const editProductCategoryData = (id: number, formData: any) => {
    return async (dispatch: MasterProductCategoryDispatchType) => {
      dispatch({
        type: REDUCER_TYPES.SET_MASTER_PRODUCT_CATEGORY_REDUCER,
        payload: {
          loadingPost: true,
        },
      });
  
      try {
        await axios.put(`/v1/api/dashboard/product-category/${id}`, formData);
  
        return true;
      } catch (error) {
        console.log(error);
        return false;
      } finally {
        dispatch({
          type: REDUCER_TYPES.SET_MASTER_PRODUCT_CATEGORY_REDUCER,
          payload: {
            loadingPost: false,
          },
        });
      }
    };
  };

const deleteProductCategoryData = (id: number) => {
  return async (dispatch: MasterProductCategoryDispatchType) => {
    dispatch({
      type: REDUCER_TYPES.SET_MASTER_PRODUCT_CATEGORY_REDUCER,
      payload: {
        loadingDelete: true,
      },
    });

    try {
      await axios.delete(`/v1/api/dashboard/product-category/${id}`);

      return true;
    } catch (error) {
      console.log(error);
      return false;
    } finally {
      dispatch({
        type: REDUCER_TYPES.SET_MASTER_PRODUCT_CATEGORY_REDUCER,
        payload: {
          loadingDelete: false,
        },
      });
    }
  };
};

export {
    addNewProductCategoryData, changeMasterProductCategoryReducer, deleteProductCategoryData, editProductCategoryData, getMasterProductCategoryData, getProductCategoryDetailData
};

