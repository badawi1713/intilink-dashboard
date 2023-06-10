import axios, { AxiosError } from 'axios';
import { AppThunk, RootState } from 'src/store';
import { showMessage } from 'src/store/slices/toast-message-slice';
import {
  setPointMutationData,
  setPointMutationDetailData,
  setPointMutationDisableLoadingDetail,
  setPointMutationError,
  setPointMutationLoading,
  setPointMutationLoadingDetail,
} from 'src/store/slices/mutation-slice/point-mutation-slice';

const handleGetPointMutationDetailData =
  (id: number): AppThunk =>
  async (dispatch) => {
    dispatch(setPointMutationLoadingDetail());
    try {
      const response = await axios.get(`/v1/api/dashboard/mutasi/poin/${id}`);
      const data = response.data?.data || null;
      dispatch(setPointMutationDetailData(data));
      return true;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<AxiosErrorType>;
        if (axiosError.response) {
          const { message, code } = axiosError.response.data;
          dispatch(
            showMessage({
              message: `${code}: ${message}` || 'Maaf, sedang terjadi kesalahan',
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
          dispatch(setPointMutationError(error.message || 'Maaf, sedang terjadi kesalahan'));
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
      dispatch(setPointMutationDisableLoadingDetail());
    }
  };

const handleGetPointMutationData = (): AppThunk => async (dispatch, getState: () => RootState) => {
  const { pointMutationReducer } = getState();
  const { page, sortBy, sortType, limit, search } = pointMutationReducer;
  dispatch(setPointMutationLoading());
  try {
    const response = await axios.get(
      `/v1/api/dashboard/mutasi/poin?pageNo=${page}&pageSize=${limit}&sort=${sortType}&sortBy=${sortBy}&search=${search}`,
    );
    const payload = {
      data: response.data?.data?.content || [],
      total: +response?.data?.data?.totalElements || 0,
    };
    dispatch(setPointMutationData(payload));
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<AxiosErrorType>;
      if (axiosError.response) {
        const { message, code } = axiosError.response.data;
        dispatch(setPointMutationError(`${code}: ${message}` || 'Maaf, sedang terjadi kesalahan'));
      } else {
        dispatch(setPointMutationError(error.message || 'Maaf, sedang terjadi kesalahan'));
      }
    } else {
      setPointMutationError('Maaf, sedang terjadi kesalahan');
    }
  }
};

export { handleGetPointMutationData, handleGetPointMutationDetailData };
