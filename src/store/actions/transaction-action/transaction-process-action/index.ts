import axios, { AxiosError } from 'axios';
import { AppThunk, RootState } from 'src/store';
import { showMessage } from 'src/store/slices/toast-message-slice';
import {
  setTransactionProcessData,
  setTransactionProcessDetailData,
  setTransactionProcessDisableLoadingDetail,
  setTransactionProcessError,
  setTransactionProcessLoading,
  setTransactionProcessLoadingDetail,
  setTransactionProcessLogDetailData,
} from 'src/store/slices/transaction-slice/transaction-process-slice';

const handleGetTransactionProcessDetailData =
  (id: number): AppThunk =>
  async (dispatch) => {
    dispatch(setTransactionProcessLoadingDetail());
    try {
      const response = await axios.get(`/v1/api/dashboard/transaksi/proses/${id}`);
      const data = response.data?.data || null;
      dispatch(setTransactionProcessDetailData(data));
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
          dispatch(setTransactionProcessError(error.message || 'Maaf, sedang terjadi kesalahan'));
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
      dispatch(setTransactionProcessDisableLoadingDetail());
    }
  };

const handleGetTransactionProcessData = (): AppThunk => async (dispatch, getState: () => RootState) => {
  const { transactionProcessReducer } = getState();
  const { page, sortBy, sortType, limit, search } = transactionProcessReducer;
  dispatch(setTransactionProcessLoading());
  try {
    const response = await axios.get(
      `/v1/api/dashboard/transaksi/proses?pageNo=${page}&pageSize=${limit}&sort=${sortType}&sortBy=${sortBy}&search=${search}`,
    );
    const payload = {
      data: response.data?.data?.content || [],
      total: +response?.data?.data?.totalElements || 0,
    };
    dispatch(setTransactionProcessData(payload));
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<AxiosErrorType>;
      if (axiosError.response) {
        const { message, code } = axiosError.response.data;
        dispatch(setTransactionProcessError(`${code}: ${message}` || 'Maaf, sedang terjadi kesalahan'));
      } else {
        dispatch(setTransactionProcessError(error.message || 'Maaf, sedang terjadi kesalahan'));
      }
    } else {
      setTransactionProcessError('Maaf, sedang terjadi kesalahan');
    }
  }
};

const handleGetTransactionProcessLogDetailData =
  (id: string): AppThunk =>
  async (dispatch) => {
    dispatch(setTransactionProcessLoadingDetail());
    try {
      const response = await axios.get(`/v1/api/dashboard/transaksi/biller-log/${id}`);
      const data = response.data?.data || [];
      dispatch(setTransactionProcessLogDetailData(data));
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
          dispatch(setTransactionProcessError(error.message || 'Maaf, sedang terjadi kesalahan'));
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
      dispatch(setTransactionProcessDisableLoadingDetail());
    }
  };

export {
  handleGetTransactionProcessData,
  handleGetTransactionProcessDetailData,
  handleGetTransactionProcessLogDetailData,
};
