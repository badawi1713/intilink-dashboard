import axios from 'axios';
import { RootState } from 'src/store';
import {
    InitialMasterMenuState,
    MasterMenuDispatchType,
} from '../../../action-types/masters-type/menu-action-type/menu-action.type';
import * as REDUCER_TYPES from '../../../types';

const changeMasterMenuReducer = (payload: InitialMasterMenuState) => {
  return (dispatch: MasterMenuDispatchType) => {
    dispatch({
      type: REDUCER_TYPES.SET_MASTER_MENU_REDUCER,
      payload,
    });
  };
};

const getMasterMenuData = () => {
  return async (
    dispatch: MasterMenuDispatchType,
    getState: () => RootState
  ) => {
    const { masterMenuReducer } = getState();
    const { page, limit, sortType, sortBy, search } = masterMenuReducer;

    dispatch({
      type: REDUCER_TYPES.SET_MASTER_MENU_REDUCER,
      payload: {
        loading: true,
        error: null,
      },
    });

    try {
      const response = await axios.get(
        `/v1/api/dashboard/menu?pageNo=${page}&pageSize=${limit}&sort=${sortType}&sortBy=${sortBy}&search=${search}`
      );

      const total = +response?.data?.data?.totalElements || 0;
      const data = response?.data?.data?.content || [];

      dispatch({
        type: REDUCER_TYPES.SET_MASTER_MENU_REDUCER,
        payload: {
          total,
          data,
        },
      });
    } catch (error) {
      dispatch({
        type: REDUCER_TYPES.SET_MASTER_MENU_REDUCER,
        payload: {
          error: `${error}`,
        },
      });
    } finally {
      dispatch({
        type: REDUCER_TYPES.SET_MASTER_MENU_REDUCER,
        payload: {
          loading: false,
        },
      });
    }
  };
};

const getMenuListData = () => {
  return async (dispatch: MasterMenuDispatchType) => {
    dispatch({
      type: REDUCER_TYPES.SET_MASTER_MENU_REDUCER,
      payload: {
        loadingList: true,
      },
    });

    try {
      const response = await axios.get(`/v1/api/dashboard/menu/list-menu`);

      const data = response.data || [];

      dispatch({
        type: REDUCER_TYPES.SET_MASTER_MENU_REDUCER,
        payload: {
          menuList: data,
        },
      });
    } catch (error) {
      console.log(error);
    } finally {
      dispatch({
        type: REDUCER_TYPES.SET_MASTER_MENU_REDUCER,
        payload: {
          loadingList: false,
        },
      });
    }
  };
};

const addNewMenuData = (data: {
  title: string;
  icon: string;
  link: string;
  parent_id: number;
}) => {
  return async (dispatch: MasterMenuDispatchType) => {
    dispatch({
      type: REDUCER_TYPES.SET_MASTER_MENU_REDUCER,
      payload: {
        loadingPost: true,
      },
    });

    try {
      await axios.post(`/v1/api/dashboard/menu`, data);

      return true;
    } catch (error) {
      console.log(error);
      return false;
    } finally {
      dispatch({
        type: REDUCER_TYPES.SET_MASTER_MENU_REDUCER,
        payload: {
          loadingPost: false,
        },
      });
    }
  };
};

const getMenuDetailData = (id: number) => {
    return async (dispatch: MasterMenuDispatchType) => {
      dispatch({
        type: REDUCER_TYPES.SET_MASTER_MENU_REDUCER,
        payload: {
          loadingDetail: true,
        },
      });
  
      try {
        const response = await axios.get(`/v1/api/dashboard/menu/${id}`);
  
        const data = response.data?.data || {};
          return data;
      } catch (error) {
          console.log(error);
          return false
      } finally {
        dispatch({
          type: REDUCER_TYPES.SET_MASTER_MENU_REDUCER,
          payload: {
            loadingDetail: false,
          },
        });
      }
    };
};
  
const editMenuData = (id: number, data: {
    title: string;
    icon: string;
    link: string;
    parent_id: number;
  }) => {
    return async (dispatch: MasterMenuDispatchType) => {
      dispatch({
        type: REDUCER_TYPES.SET_MASTER_MENU_REDUCER,
        payload: {
          loadingPost: true,
        },
      });
  
      try {
        await axios.put(`/v1/api/dashboard/menu/${id}`, data);
  
        return true;
      } catch (error) {
        console.log(error);
        return false;
      } finally {
        dispatch({
          type: REDUCER_TYPES.SET_MASTER_MENU_REDUCER,
          payload: {
            loadingPost: false,
          },
        });
      }
    };
  };

const deleteMenuData = (id: number) => {
  return async (dispatch: MasterMenuDispatchType) => {
    dispatch({
      type: REDUCER_TYPES.SET_MASTER_MENU_REDUCER,
      payload: {
        loadingDelete: true,
      },
    });

    try {
      await axios.delete(`/v1/api/dashboard/menu/${id}`);

      return true;
    } catch (error) {
      console.log(error);
      return false;
    } finally {
      dispatch({
        type: REDUCER_TYPES.SET_MASTER_MENU_REDUCER,
        payload: {
          loadingDelete: false,
        },
      });
    }
  };
};

export {
    addNewMenuData, changeMasterMenuReducer, deleteMenuData, editMenuData, getMasterMenuData, getMenuDetailData, getMenuListData
};

