import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type DepositDetailData = {
  id: number;
  nominal: number;
  bank: string;
  biller: string;
  admin_type: number;
  admin_type_name: string;
  admin_nominal: number;
  total_bayar: number;
  kode_bayar: string;
  status_id: number;
  status_name: string;
  user_id: number;
  user_name: string;
  created_date: string;
  expired_date: string;
  biller_trx_id: string;
  reff_id: string;
};
interface InitialDepositState {
  data?: any[];
  detailData?: null | DepositDetailData;
  page?: number;
  limit?: number;
  total?: number;
  sortBy?: string;
  sortType?: 'asc' | 'desc';
  search?: string;
  loadingList?: boolean;
  loadingPost?: boolean;
  loadingDetail?: boolean;
  loadingDelete?: boolean;
  loading?: boolean;
  error?: null | string;
}

const initialState: InitialDepositState = {
  data: [],
  detailData: null,
  limit: 10,
  page: 0,
  total: 0,
  sortBy: 'id',
  sortType: 'desc',
  search: '',
  loadingList: true,
  loadingPost: false,
  loadingDelete: false,
  loadingDetail: false,
  loading: true,
  error: null,
};

const depositSlice = createSlice({
  name: 'deposit',
  initialState,
  reducers: {
    setDepositData: (
      state,
      action: PayloadAction<{ data: any[]; total: number }>
    ) => {
      state.data = action.payload.data;
      state.total = action.payload.total;
      state.loading = false;
    },
    setDepositDetailData: (
      state,
      action: PayloadAction<null | DepositDetailData>
    ) => {
      state.detailData = action.payload;
      state.loadingDetail = false;
    },
    setDepositResetDetailData: (state) => {
      state.detailData = null;
    },
    setDepositPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setDepositSortType: (state, action: PayloadAction<'asc' | 'desc'>) => {
      state.sortType = action.payload;
    },
    setDepositSortBy: (state, action: PayloadAction<string>) => {
      state.sortBy = action.payload;
    },
    setDepositLimit: (state, action: PayloadAction<number>) => {
      state.limit = action.payload;
    },
    setDepositSearchData: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
      state.page = 0;
    },
    setDepositLoadingDetail: (state) => {
      state.loadingDetail = true;
      state.error = null;
    },
    setDepositDisableLoadingDetail: (state) => {
      state.loadingDetail = false;
    },
    setDepositLoading: (state) => {
      state.loading = true;
      state.error = null;
    },
    setDepositError: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    setDepositEnablePostLoading: (state) => {
      state.loadingPost = true
    },
    setDepositDisablePostLoading: (state) => {
      state.loadingPost = false
    },
    setDepositResetState: () => {
      return { ...initialState };
    },
  },
});

export const {
  setDepositResetDetailData,
  setDepositDisableLoadingDetail,
  setDepositResetState,
  setDepositSearchData,
  setDepositLoading,
  setDepositError,
  setDepositLoadingDetail,
  setDepositPage,
  setDepositLimit,
  setDepositSortBy,
  setDepositSortType,
  setDepositData,
  setDepositDetailData,
  setDepositEnablePostLoading,
  setDepositDisablePostLoading
} = depositSlice.actions;

export default depositSlice.reducer;
