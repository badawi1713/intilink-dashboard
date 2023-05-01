import axios, { AxiosError } from 'axios';
import { AppThunk, RootState } from 'src/store';
import { showMessage } from 'src/store/slices/toast-message-slice';
import {
  setTransactionsData,
  setTransactionsDetailData,
  setTransactionsDisableLoadingDetail,
  setTransactionsError,
  setTransactionsLoading,
  setTransactionsLoadingDetail,
  setTransactionsLogDetailData,
} from 'src/store/slices/transaction-slice/transactions-slice';

const handleGetTransactionsDetailData =
  (id: number): AppThunk =>
  async (dispatch) => {
    dispatch(setTransactionsLoadingDetail());
    try {
      const response = await axios.get(`/v1/api/dashboard/transaksi/${id}`);
      const data = response.data?.data || null;
      dispatch(setTransactionsDetailData(data));
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
            setTransactionsError(error.message || 'Maaf, sedang terjadi kesalahan')
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
      dispatch(setTransactionsDisableLoadingDetail());
    }
  };

const handleGetTransactionsData =
  (): AppThunk => async (dispatch, getState: () => RootState) => {
    const { transactionsReducer } = getState();
    const { page, sortBy, sortType, limit, search } = transactionsReducer;
    dispatch(setTransactionsLoading());
    try {
      const response = await axios.get(
        `/v1/api/dashboard/transaksi?pageNo=${page}&pageSize=${limit}&sort=${sortType}&sortBy=${sortBy}&search=${search}`
      );
      const payload = {
        data: response.data?.data?.content || [],
        total: +response?.data?.data?.totalElements || 0,
      };
      dispatch(setTransactionsData(payload));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<AxiosErrorType>;
        if (axiosError.response) {
          const { message, code } = axiosError.response.data;
          dispatch(
            setTransactionsError(
              `${code}: ${message}` || 'Maaf, sedang terjadi kesalahan'
            )
          );
        } else {
          dispatch(
            setTransactionsError(error.message || 'Maaf, sedang terjadi kesalahan')
          );
        }
      } else {
        setTransactionsError('Maaf, sedang terjadi kesalahan');
      }
    }
  };

  const handleGetTransactionsLogDetailData =
  (id: string): AppThunk =>
  async (dispatch) => {
    dispatch(setTransactionsLoadingDetail());
    try {
      const response = await axios.get(`/v1/api/dashboard/transaksi/biller-log/${id}`);
      const data = response.data?.data || null;
      dispatch(setTransactionsLogDetailData(data));
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
            setTransactionsError(error.message || 'Maaf, sedang terjadi kesalahan')
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
      dispatch(setTransactionsDisableLoadingDetail());
    }
  };

export { handleGetTransactionsData, handleGetTransactionsDetailData, handleGetTransactionsLogDetailData };

