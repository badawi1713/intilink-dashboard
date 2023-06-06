import axios, { AxiosError } from 'axios';
import { AppThunk, RootState } from 'src/store';
import { showMessage } from 'src/store/slices/toast-message-slice';
import {
  setSaldoMutationData,
  setSaldoMutationDetailData,
  setSaldoMutationDisableLoadingDetail,
  setSaldoMutationError,
  setSaldoMutationLoading,
  setSaldoMutationLoadingDetail,
} from 'src/store/slices/transaction-slice/saldo-mutation-slice';

const handleGetSaldoMutationDetailData =
  (id: number): AppThunk =>
  async (dispatch) => {
    dispatch(setSaldoMutationLoadingDetail());
    try {
      const response = await axios.get(`/v1/api/dashboard/mutasi/${id}`);
      const data = response.data?.data || null;
      dispatch(setSaldoMutationDetailData(data));
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
            setSaldoMutationError(error.message || 'Maaf, sedang terjadi kesalahan')
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
      dispatch(setSaldoMutationDisableLoadingDetail());
    }
  };

const handleGetSaldoMutationData =
  (): AppThunk => async (dispatch, getState: () => RootState) => {
    const { saldoMutationReducer } = getState();
    const { page, sortBy, sortType, limit, search } = saldoMutationReducer;
    dispatch(setSaldoMutationLoading());
    try {
      const response = await axios.get(
        `/v1/api/dashboard/mutasi?pageNo=${page}&pageSize=${limit}&sort=${sortType}&sortBy=${sortBy}&search=${search}`
      );
      const payload = {
        data: response.data?.data?.content || [],
        total: +response?.data?.data?.totalElements || 0,
      };
      dispatch(setSaldoMutationData(payload));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<AxiosErrorType>;
        if (axiosError.response) {
          const { message, code } = axiosError.response.data;
          dispatch(
            setSaldoMutationError(
              `${code}: ${message}` || 'Maaf, sedang terjadi kesalahan'
            )
          );
        } else {
          dispatch(
            setSaldoMutationError(error.message || 'Maaf, sedang terjadi kesalahan')
          );
        }
      } else {
        setSaldoMutationError('Maaf, sedang terjadi kesalahan');
      }
    }
  };

export { handleGetSaldoMutationData, handleGetSaldoMutationDetailData };
