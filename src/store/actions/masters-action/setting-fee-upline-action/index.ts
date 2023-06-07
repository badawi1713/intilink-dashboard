import axios, { AxiosError } from 'axios';
import { AppThunk, RootState } from 'src/store';
import {
  InitialMasterSettingFeeUplineState,
  MasterSettingFeeUplineDispatchType,
} from '../../../action-types/masters-type/setting-fee-upline-type/setting-fee-upline-type';
import * as REDUCER_TYPES from '../../../types';
import { showMessage } from 'src/store/slices/toast-message-slice';

const changeMasterSettingFeeUplineReducer = (payload: InitialMasterSettingFeeUplineState) => {
  return (dispatch: MasterSettingFeeUplineDispatchType) => {
    dispatch({
      type: REDUCER_TYPES.SET_MASTER_SETTING_FEE_UPLINE_REDUCER,
      payload,
    });
  };
};

const getMasterSettingFeeUplineData = () => {
  return async (dispatch: MasterSettingFeeUplineDispatchType, getState: () => RootState) => {
    const { masterSettingFeeUplineReducer } = getState();
    const { page, limit, sortType, sortBy, search, productGroupId, userGroupId } = masterSettingFeeUplineReducer;

    dispatch({
      type: REDUCER_TYPES.SET_MASTER_SETTING_FEE_UPLINE_REDUCER,
      payload: {
        loading: true,
        error: null,
      },
    });

    try {
      const response = await axios.get(
        `/v1/api/dashboard/user-upline?pageNo=${page}&pageSize=${limit}&sort=${sortType}&sortBy=${sortBy}&search=${search}&produkGroupId=${
          productGroupId === 'Semua' ? '' : productGroupId
        }&userGroupId=${userGroupId === 'Semua' ? '' : userGroupId}`,
      );

      const total = +response?.data?.data?.totalElements || 0;
      const data = response?.data?.data?.content || [];

      dispatch({
        type: REDUCER_TYPES.SET_MASTER_SETTING_FEE_UPLINE_REDUCER,
        payload: {
          total,
          data,
        },
      });
    } catch (error) {
      dispatch({
        type: REDUCER_TYPES.SET_MASTER_SETTING_FEE_UPLINE_REDUCER,
        payload: {
          error: `${error}`,
        },
      });
    } finally {
      dispatch({
        type: REDUCER_TYPES.SET_MASTER_SETTING_FEE_UPLINE_REDUCER,
        payload: {
          loading: false,
        },
      });
    }
  };
};

const getSettingFeeUplineUserListData = () => {
  return async (dispatch: MasterSettingFeeUplineDispatchType) => {
    dispatch({
      type: REDUCER_TYPES.SET_MASTER_SETTING_FEE_UPLINE_REDUCER,
      payload: {
        loadingList: true,
      },
    });

    try {
      const response = await axios.get(`/v1/api/dashboard/user-upline/list-user-group`);

      const data = response.data || [];

      dispatch({
        type: REDUCER_TYPES.SET_MASTER_SETTING_FEE_UPLINE_REDUCER,
        payload: {
          settingFeeUplineUserList: data,
          settingFeeUplineCategoryFormList: data,
        },
      });
    } catch (error) {
      dispatch({
        type: REDUCER_TYPES.SET_MASTER_SETTING_FEE_UPLINE_REDUCER,
        payload: {
          settingFeeUplineUserList: [],
          settingFeeUplineCategoryFormList: [],
          loadingList: false,
        },
      });
    } finally {
      dispatch({
        type: REDUCER_TYPES.SET_MASTER_SETTING_FEE_UPLINE_REDUCER,
        payload: {
          loadingList: false,
        },
      });
    }
  };
};

const getSettingFeeUplineProductListData = () => {
  return async (dispatch: MasterSettingFeeUplineDispatchType) => {
    dispatch({
      type: REDUCER_TYPES.SET_MASTER_SETTING_FEE_UPLINE_REDUCER,
      payload: {
        loadingList: true,
      },
    });

    try {
      const response = await axios.get(`/v1/api/dashboard/user-upline/list-produk-group`);

      const data = response.data || [];

      dispatch({
        type: REDUCER_TYPES.SET_MASTER_SETTING_FEE_UPLINE_REDUCER,
        payload: {
          settingFeeUplineProductList: data,
        },
      });
      return data;
    } catch (error) {
      dispatch({
        type: REDUCER_TYPES.SET_MASTER_SETTING_FEE_UPLINE_REDUCER,
        payload: {
          settingFeeUplineProductList: [],
          loadingList: false,
        },
      });
      return false;
    } finally {
      dispatch({
        type: REDUCER_TYPES.SET_MASTER_SETTING_FEE_UPLINE_REDUCER,
        payload: {
          loadingList: false,
        },
      });
    }
  };
};

const addNewSettingFeeUplineData = (formData: any): AppThunk => {
  return async (dispatch) => {
    dispatch({
      type: REDUCER_TYPES.SET_MASTER_SETTING_FEE_UPLINE_REDUCER,
      payload: {
        loadingPost: true,
      },
    });

    try {
      await axios.post(`/v1/api/dashboard/user-upline`, formData);
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
        type: REDUCER_TYPES.SET_MASTER_SETTING_FEE_UPLINE_REDUCER,
        payload: {
          loadingPost: false,
        },
      });
    }
  };
};

const editSettingFeeUplineData = (id: string, data: any): AppThunk => {
  return async (dispatch) => {
    dispatch({
      type: REDUCER_TYPES.SET_MASTER_SETTING_FEE_UPLINE_REDUCER,
      payload: {
        loadingPost: true,
      },
    });

    try {
      await axios.put(`/v1/api/dashboard/user-upline/${id}`, data);
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
        type: REDUCER_TYPES.SET_MASTER_SETTING_FEE_UPLINE_REDUCER,
        payload: {
          loadingPost: false,
        },
      });
    }
  };
};

const deleteSettingFeeUplineData = (id: string): AppThunk => {
  return async (dispatch) => {
    dispatch({
      type: REDUCER_TYPES.SET_MASTER_SETTING_FEE_UPLINE_REDUCER,
      payload: {
        loadingDelete: true,
      },
    });

    try {
      await axios.delete(`/v1/api/dashboard/user-upline/${id}`);
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
        type: REDUCER_TYPES.SET_MASTER_SETTING_FEE_UPLINE_REDUCER,
        payload: {
          loadingDelete: false,
        },
      });
    }
  };
};

const getSettingFeeUplineGroupListFormData = (id: string) => {
  return async (dispatch: MasterSettingFeeUplineDispatchType) => {
    dispatch({
      type: REDUCER_TYPES.SET_MASTER_SETTING_FEE_UPLINE_REDUCER,
      payload: {
        loadingList: true,
      },
    });

    try {
      const response = await axios.get(`/v1/api/dashboard/user-upline/list-group/${id}`);

      const data = response.data || [];

      dispatch({
        type: REDUCER_TYPES.SET_MASTER_SETTING_FEE_UPLINE_REDUCER,
        payload: {
          settingFeeUplineGroupFormList: data,
        },
      });
      return data;
    } catch (error) {
      dispatch({
        type: REDUCER_TYPES.SET_MASTER_SETTING_FEE_UPLINE_REDUCER,
        payload: {
          settingFeeUplineGroupFormList: [],
          loadingList: false,
        },
      });
      return false;
    } finally {
      dispatch({
        type: REDUCER_TYPES.SET_MASTER_SETTING_FEE_UPLINE_REDUCER,
        payload: {
          loadingList: false,
        },
      });
    }
  };
};

export {
  addNewSettingFeeUplineData,
  changeMasterSettingFeeUplineReducer,
  deleteSettingFeeUplineData,
  editSettingFeeUplineData,
  getMasterSettingFeeUplineData,
  getSettingFeeUplineUserListData,
  getSettingFeeUplineProductListData,
  getSettingFeeUplineGroupListFormData,
};
