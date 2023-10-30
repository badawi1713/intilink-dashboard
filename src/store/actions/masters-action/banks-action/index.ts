import axios, { AxiosError } from 'axios';
import { AppThunk, RootState } from 'src/store';
import * as REDUCER_TYPES from '../../../types';
import { showMessage } from 'src/store/slices/toast-message-slice';
import { InitialBanksState, BanksDispatchType } from 'src/store/action-types/masters-type/banks-type/banks.type';

const changeBanksReducer = (payload: InitialBanksState) => {
  return (dispatch: BanksDispatchType) => {
    dispatch({
      type: REDUCER_TYPES.SET_MASTER_BANKS_REDUCER,
      payload,
    });
  };
};

const getBanksData = () => {
  return async (dispatch: BanksDispatchType, getState: () => RootState) => {
    const { banksReducer } = getState();
    const { page, limit, sortType, sortBy, search } = banksReducer;

    dispatch({
      type: REDUCER_TYPES.SET_MASTER_BANKS_REDUCER,
      payload: {
        loading: true,
        error: null,
      },
    });

    try {
      const response = await axios.get(
        `/v1/api/dashboard/bank?pageNo=${page}&pageSize=${limit}&sort=${sortType}&sortBy=${sortBy}&search=${search}`,
      );

      const total = +response?.data?.data?.totalElements || 0;
      const data = response?.data?.data?.content || [];

      dispatch({
        type: REDUCER_TYPES.SET_MASTER_BANKS_REDUCER,
        payload: {
          total,
          data,
        },
      });
    } catch (error) {
      dispatch({
        type: REDUCER_TYPES.SET_MASTER_BANKS_REDUCER,
        payload: {
          error: `${error}`,
        },
      });
    } finally {
      dispatch({
        type: REDUCER_TYPES.SET_MASTER_BANKS_REDUCER,
        payload: {
          loading: false,
        },
      });
    }
  };
};

const getBanksCategoryListData = () => {
  return async (dispatch: BanksDispatchType) => {
    dispatch({
      type: REDUCER_TYPES.SET_MASTER_BANKS_REDUCER,
      payload: {
        loadingList: true,
      },
    });

    try {
      const response = await axios.get(`/v1/api/dashboard/product/list-category`);

      const data = response.data || [];

      dispatch({
        type: REDUCER_TYPES.SET_MASTER_BANKS_REDUCER,
        payload: {
          productCategoryList: data,
          productCategoryFormList: data,
        },
      });
    } catch (error) {
      dispatch({
        type: REDUCER_TYPES.SET_MASTER_BANKS_REDUCER,
        payload: {
          productCategoryList: [],
          productCategoryFormList: [],
          loadingList: false,
        },
      });
    } finally {
      dispatch({
        type: REDUCER_TYPES.SET_MASTER_BANKS_REDUCER,
        payload: {
          loadingList: false,
        },
      });
    }
  };
};

const getBanksGroupListData = (id: string) => {
  return async (dispatch: BanksDispatchType) => {
    dispatch({
      type: REDUCER_TYPES.SET_MASTER_BANKS_REDUCER,
      payload: {
        loadingList: true,
      },
    });

    try {
      const response = await axios.get(`/v1/api/dashboard/product/list-group/${id}`);

      const data = response.data || [];

      dispatch({
        type: REDUCER_TYPES.SET_MASTER_BANKS_REDUCER,
        payload: {
          productGroupList: data,
        },
      });
      return data;
    } catch (error) {
      dispatch({
        type: REDUCER_TYPES.SET_MASTER_BANKS_REDUCER,
        payload: {
          productGroupList: [],
          loadingList: false,
        },
      });
      return false;
    } finally {
      dispatch({
        type: REDUCER_TYPES.SET_MASTER_BANKS_REDUCER,
        payload: {
          loadingList: false,
        },
      });
    }
  };
};

const addNewBanksData = (formData: any): AppThunk => {
  return async (dispatch) => {
    dispatch({
      type: REDUCER_TYPES.SET_MASTER_BANKS_REDUCER,
      payload: {
        loadingPost: true,
      },
    });

    try {
      await axios.post(`/v1/api/dashboard/bank`, formData);
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
        type: REDUCER_TYPES.SET_MASTER_BANKS_REDUCER,
        payload: {
          loadingPost: false,
        },
      });
    }
  };
};

const editBanksData = (id: string, data: any): AppThunk => {
  return async (dispatch) => {
    dispatch({
      type: REDUCER_TYPES.SET_MASTER_BANKS_REDUCER,
      payload: {
        loadingPost: true,
      },
    });

    try {
      await axios.put(`/v1/api/dashboard/bank`, data);
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
        type: REDUCER_TYPES.SET_MASTER_BANKS_REDUCER,
        payload: {
          loadingPost: false,
        },
      });
    }
  };
};

const deleteBanksData = (id: string): AppThunk => {
  return async (dispatch) => {
    dispatch({
      type: REDUCER_TYPES.SET_MASTER_BANKS_REDUCER,
      payload: {
        loadingDelete: true,
      },
    });

    try {
      await axios.delete(`/v1/api/dashboard/bank/${id}`);
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
        type: REDUCER_TYPES.SET_MASTER_BANKS_REDUCER,
        payload: {
          loadingDelete: false,
        },
      });
    }
  };
};

const getBanksGroupListFormData = (id: string) => {
  return async (dispatch: BanksDispatchType) => {
    dispatch({
      type: REDUCER_TYPES.SET_MASTER_BANKS_REDUCER,
      payload: {
        loadingList: true,
      },
    });

    try {
      const response = await axios.get(`/v1/api/dashboard/product/list-group/${id}`);

      const data = response.data || [];

      dispatch({
        type: REDUCER_TYPES.SET_MASTER_BANKS_REDUCER,
        payload: {
          productGroupFormList: data,
        },
      });
      return data;
    } catch (error) {
      dispatch({
        type: REDUCER_TYPES.SET_MASTER_BANKS_REDUCER,
        payload: {
          productGroupFormList: [],
          loadingList: false,
        },
      });
      return false;
    } finally {
      dispatch({
        type: REDUCER_TYPES.SET_MASTER_BANKS_REDUCER,
        payload: {
          loadingList: false,
        },
      });
    }
  };
};

const getBanksBillerListFormData = () => {
  return async (dispatch: BanksDispatchType) => {
    dispatch({
      type: REDUCER_TYPES.SET_MASTER_BANKS_REDUCER,
      payload: {
        loadingList: true,
      },
    });

    try {
      const response = await axios.get(`/v1/api/dashboard/biller/list`);

      const data = response.data || [];

      dispatch({
        type: REDUCER_TYPES.SET_MASTER_BANKS_REDUCER,
        payload: {
          billerList: data,
        },
      });
    } catch (error) {
      dispatch({
        type: REDUCER_TYPES.SET_MASTER_BANKS_REDUCER,
        payload: {
          billerList: [],
          loadingList: false,
        },
      });
    } finally {
      dispatch({
        type: REDUCER_TYPES.SET_MASTER_BANKS_REDUCER,
        payload: {
          loadingList: false,
        },
      });
    }
  };
};

export {
  addNewBanksData,
  changeBanksReducer,
  deleteBanksData,
  editBanksData,
  getBanksData,
  getBanksCategoryListData,
  getBanksGroupListData,
  getBanksGroupListFormData,
  getBanksBillerListFormData,
};
