import axios, { AxiosError } from 'axios';
import { AppThunk, RootState } from 'src/store';
import { showMessage } from 'src/store/slices/toast-message-slice';
import {
  setDepositData,
  setDepositDetailData,
  setDepositDisableLoadingDetail,
  setDepositError,
  setDepositLoading,
  setDepositLoadingDetail,
} from 'src/store/slices/transaction-slice/deposit-slice';

const handleGetDepositDetailData =
  (id: number): AppThunk =>
  async (dispatch) => {
    dispatch(setDepositLoadingDetail());
    try {
      const response = await axios.get(`/v1/api/dashboard/deposit/${id}`);
      const data = response.data?.data || null;
      dispatch(setDepositDetailData(data));
      return true;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<AxiosErrorType>;
        if (axiosError.response) {
          const { message, code } = axiosError.response.data;
          dispatch(
            showMessage({
              message:
                `${code}: ${message}` || 'Maaf, sedang terjadi kesalahan',
              variant: 'error',
            })
          );
        } else {
          dispatch(
            showMessage({
              message: error.message || 'Maaf, sedang terjadi kesalahan',
              variant: 'error',
            })
          );
          dispatch(
            setDepositError(error.message || 'Maaf, sedang terjadi kesalahan')
          );
        }
      } else {
        dispatch(
          showMessage({
            message: 'Maaf, sedang terjadi kesalahan',
            variant: 'error',
          })
        );
      }
      return false;
    } finally {
      dispatch(setDepositDisableLoadingDetail());
    }
  };

const handleGetDepositData =
  (): AppThunk => async (dispatch, getState: () => RootState) => {
    const { depositReducer } = getState();
    const { page, sortBy, sortType, limit, search } = depositReducer;
    dispatch(setDepositLoading());
    try {
      const response = await axios.get(
        `/v1/api/dashboard/deposit?pageNo=${page}&pageSize=${limit}&sort=${sortType}&sortBy=${sortBy}&search=${search}`
      );
      const payload = {
        data: response.data?.data?.content || [],
        total: +response?.data?.data?.totalElements || 0,
      };
      dispatch(setDepositData(payload));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<AxiosErrorType>;
        if (axiosError.response) {
          const { message, code } = axiosError.response.data;
          dispatch(
            setDepositError(
              `${code}: ${message}` || 'Maaf, sedang terjadi kesalahan'
            )
          );
        } else {
          dispatch(
            setDepositError(error.message || 'Maaf, sedang terjadi kesalahan')
          );
        }
      } else {
        setDepositError('Maaf, sedang terjadi kesalahan');
      }
    }
  };

export { handleGetDepositData, handleGetDepositDetailData };
