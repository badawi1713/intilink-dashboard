import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type SaldoMutationDetailData = {
  id: number;
  keterangan: string;
  produk_name: string;
  user_debit_id: number;
  user_debit_name: string;
  user_kredit_id: number;
  user_kredit_name: string;
  created_date: string;
};
interface InitialSaldoMutationState {
  data?: any[];
  detailData?: null | SaldoMutationDetailData;
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

const initialState: InitialSaldoMutationState = {
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

const SaldoMutationSlice = createSlice({
  name: 'SaldoMutation',
  initialState,
  reducers: {
    setSaldoMutationData: (
      state,
      action: PayloadAction<{ data: any[]; total: number }>
    ) => {
      state.data = action.payload.data;
      state.total = action.payload.total;
      state.loading = false;
    },
    setSaldoMutationDetailData: (
      state,
      action: PayloadAction<null | SaldoMutationDetailData>
    ) => {
      state.detailData = action.payload;
      state.loadingDetail = false;
    },
    setSaldoMutationResetDetailData: (state) => {
      state.detailData = null;
    },
    setSaldoMutationPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setSaldoMutationSortType: (state, action: PayloadAction<'asc' | 'desc'>) => {
      state.sortType = action.payload;
    },
    setSaldoMutationSortBy: (state, action: PayloadAction<string>) => {
      state.sortBy = action.payload;
    },
    setSaldoMutationLimit: (state, action: PayloadAction<number>) => {
      state.limit = action.payload;
    },
    setSaldoMutationSearchData: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
      state.page = 0;
    },
    setSaldoMutationLoadingDetail: (state) => {
      state.loadingDetail = true;
      state.error = null;
    },
    setSaldoMutationDisableLoadingDetail: (state) => {
      state.loadingDetail = false;
    },
    setSaldoMutationLoading: (state) => {
      state.loading = true;
      state.error = null;
    },
    setSaldoMutationError: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    setSaldoMutationResetState: () => {
      return { ...initialState };
    },
  },
});

export const {
  setSaldoMutationResetDetailData,
  setSaldoMutationDisableLoadingDetail,
  setSaldoMutationResetState,
  setSaldoMutationSearchData,
  setSaldoMutationLoading,
  setSaldoMutationError,
  setSaldoMutationLoadingDetail,
  setSaldoMutationPage,
  setSaldoMutationLimit,
  setSaldoMutationSortBy,
  setSaldoMutationSortType,
  setSaldoMutationData,
  setSaldoMutationDetailData,
} = SaldoMutationSlice.actions;

export default SaldoMutationSlice.reducer;
