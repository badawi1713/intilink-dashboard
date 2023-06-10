import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type PointMutationDetailData = {
  id: number;
  keterangan: string;
  debet_id: number;
  debet_name: string;
  kredit_id: number;
  kredit_name: string;
  tanggal: string;
  afiliasi: number;
};
interface InitialPointMutationState {
  data?: any[];
  detailData?: null | PointMutationDetailData;
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

const initialState: InitialPointMutationState = {
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

const PointMutationSlice = createSlice({
  name: 'PointMutation',
  initialState,
  reducers: {
    setPointMutationData: (state, action: PayloadAction<{ data: any[]; total: number }>) => {
      state.data = action.payload.data;
      state.total = action.payload.total;
      state.loading = false;
    },
    setPointMutationDetailData: (state, action: PayloadAction<null | PointMutationDetailData>) => {
      state.detailData = action.payload;
      state.loadingDetail = false;
    },
    setPointMutationResetDetailData: (state) => {
      state.detailData = null;
    },
    setPointMutationPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setPointMutationSortType: (state, action: PayloadAction<'asc' | 'desc'>) => {
      state.sortType = action.payload;
    },
    setPointMutationSortBy: (state, action: PayloadAction<string>) => {
      state.sortBy = action.payload;
    },
    setPointMutationLimit: (state, action: PayloadAction<number>) => {
      state.limit = action.payload;
    },
    setPointMutationSearchData: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
      state.page = 0;
    },
    setPointMutationLoadingDetail: (state) => {
      state.loadingDetail = true;
      state.error = null;
    },
    setPointMutationDisableLoadingDetail: (state) => {
      state.loadingDetail = false;
    },
    setPointMutationLoading: (state) => {
      state.loading = true;
      state.error = null;
    },
    setPointMutationError: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    setPointMutationResetState: () => {
      return { ...initialState };
    },
  },
});

export const {
  setPointMutationResetDetailData,
  setPointMutationDisableLoadingDetail,
  setPointMutationResetState,
  setPointMutationSearchData,
  setPointMutationLoading,
  setPointMutationError,
  setPointMutationLoadingDetail,
  setPointMutationPage,
  setPointMutationLimit,
  setPointMutationSortBy,
  setPointMutationSortType,
  setPointMutationData,
  setPointMutationDetailData,
} = PointMutationSlice.actions;

export default PointMutationSlice.reducer;
