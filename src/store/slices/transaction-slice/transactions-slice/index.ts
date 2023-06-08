import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const TODAY = new Date();
const DATE = new Date();
const YESTERDAY = DATE.setDate(DATE.getDate() - 1);

type TransactionsDetailData = {
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
interface InitialTransactionsState {
  data?: any[];
  logDetailData?: null | any;
  detailData?: null | TransactionsDetailData[];
  page?: number;
  limit?: number;
  total?: number;
  sortBy?: string;
  sortType?: 'asc' | 'desc';
  search?: string;
  startDate?: any;
  endDate?: any;
  filterType?: string;
  loadingList?: boolean;
  loadingPost?: boolean;
  loadingDetail?: boolean;
  loadingDelete?: boolean;
  loading?: boolean;
  error?: null | string;
}

const initialState: InitialTransactionsState = {
  data: [],
  detailData: null,
  logDetailData: null,
  limit: 10,
  page: 0,
  total: 0,
  sortBy: 'id',
  sortType: 'desc',
  search: '',
  startDate: YESTERDAY,
  endDate: TODAY,
  filterType: 'all',
  loadingList: true,
  loadingPost: false,
  loadingDelete: false,
  loadingDetail: false,
  loading: true,
  error: null,
};

const TransactionsSlice = createSlice({
  name: 'Transactions',
  initialState,
  reducers: {
    setTransactionsData: (state, action: PayloadAction<{ data: any[]; total: number }>) => {
      state.data = action.payload.data;
      state.total = action.payload.total;
      state.loading = false;
    },
    setTransactionsLogDetailData: (state, action: PayloadAction<any>) => {
      state.logDetailData = action.payload;
      state.loadingDetail = false;
    },
    setTransactionsDetailData: (state, action: PayloadAction<null | TransactionsDetailData[]>) => {
      state.detailData = action.payload;
      state.loadingDetail = false;
    },
    setTransactionsResetDetailData: (state) => {
      state.detailData = null;
      state.logDetailData = null;
    },
    setTransactionsPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setTransactionsSortType: (state, action: PayloadAction<'asc' | 'desc'>) => {
      state.sortType = action.payload;
    },
    setTransactionsSortBy: (state, action: PayloadAction<string>) => {
      state.sortBy = action.payload;
    },
    setTransactionsStartDate: (state, action: PayloadAction<any>) => {
      state.startDate = action.payload;
    },
    setTransactionsEndDate: (state, action: PayloadAction<any>) => {
      state.endDate = action.payload;
    },
    setTransactionsFilterType: (state, action: PayloadAction<any>) => {
      state.filterType = action.payload;
    },
    setTransactionsLimit: (state, action: PayloadAction<number>) => {
      state.limit = action.payload;
    },
    setTransactionsSearchData: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
      state.page = 0;
    },
    setTransactionsLoadingDetail: (state) => {
      state.loadingDetail = true;
      state.error = null;
    },
    setTransactionsDisableLoadingDetail: (state) => {
      state.loadingDetail = false;
    },
    setTransactionsLoading: (state) => {
      state.loading = true;
      state.error = null;
    },
    setTransactionsError: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    setTransactionsResetState: () => {
      return { ...initialState };
    },
  },
});

export const {
  setTransactionsFilterType,
  setTransactionsEndDate,
  setTransactionsStartDate,
  setTransactionsResetDetailData,
  setTransactionsDisableLoadingDetail,
  setTransactionsResetState,
  setTransactionsSearchData,
  setTransactionsLoading,
  setTransactionsError,
  setTransactionsLoadingDetail,
  setTransactionsPage,
  setTransactionsLimit,
  setTransactionsSortBy,
  setTransactionsSortType,
  setTransactionsData,
  setTransactionsDetailData,
  setTransactionsLogDetailData,
} = TransactionsSlice.actions;

export default TransactionsSlice.reducer;
