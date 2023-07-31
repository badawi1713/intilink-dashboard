import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type TransactionProcessDetailData = {
  id: number;
  denom: number;
  status: string;
  keterangan: string;
  produk_name: string;
  id_pel: string;
  admin: number;
  harga_up: number;
  total_bayar: number;
  reff_id: string;
  created_date: string;
};
interface InitialTransactionProcessState {
  data?: any[];
  detailData?: null | TransactionProcessDetailData;
  logDetailData?: null | any;
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

const initialState: InitialTransactionProcessState = {
  data: [],
  detailData: null,
  logDetailData: null,
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

const TransactionProcessSlice = createSlice({
  name: 'TransactionProcess',
  initialState,
  reducers: {
    setTransactionProcessData: (state, action: PayloadAction<{ data: any[]; total: number }>) => {
      state.data = action.payload.data;
      state.total = action.payload.total;
      state.loading = false;
    },
    setTransactionProcessLogDetailData: (state, action: PayloadAction<any>) => {
      state.logDetailData = action.payload;
      state.loadingDetail = false;
    },
    setTransactionProcessDetailData: (state, action: PayloadAction<null | TransactionProcessDetailData>) => {
      state.detailData = action.payload;
      state.loadingDetail = false;
    },
    setTransactionProcessResetDetailData: (state) => {
      state.detailData = null;
      state.loadingDetail = false;
    },
    setTransactionProcessPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setTransactionProcessSortType: (state, action: PayloadAction<'asc' | 'desc'>) => {
      state.sortType = action.payload;
    },
    setTransactionProcessSortBy: (state, action: PayloadAction<string>) => {
      state.sortBy = action.payload;
    },
    setTransactionProcessLimit: (state, action: PayloadAction<number>) => {
      state.limit = action.payload;
    },
    setTransactionProcessSearchData: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
      state.page = 0;
    },
    setTransactionProcessLoadingDetail: (state) => {
      state.loadingDetail = true;
      state.error = null;
    },
    setTransactionProcessDisableLoadingDetail: (state) => {
      state.loadingDetail = false;
    },
    setTransactionProcessLoading: (state) => {
      state.loading = true;
      state.error = null;
    },
    setTransactionProcessError: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    setTransactionProcessResetState: () => {
      return { ...initialState };
    },
  },
});

export const {
  setTransactionProcessResetDetailData,
  setTransactionProcessDisableLoadingDetail,
  setTransactionProcessResetState,
  setTransactionProcessSearchData,
  setTransactionProcessLoading,
  setTransactionProcessError,
  setTransactionProcessLoadingDetail,
  setTransactionProcessPage,
  setTransactionProcessLimit,
  setTransactionProcessSortBy,
  setTransactionProcessSortType,
  setTransactionProcessData,
  setTransactionProcessDetailData,
  setTransactionProcessLogDetailData,
} = TransactionProcessSlice.actions;

export default TransactionProcessSlice.reducer;
