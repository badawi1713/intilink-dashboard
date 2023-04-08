import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface InitialDepositState {
  data?: any[];
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
  limit: 5,
  page: 0,
  total: 0,
  sortBy: 'deleted',
  sortType: 'asc',
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
    setData: (state, action: PayloadAction<any[]>) => {
      state.data = action.payload;
    },
    setLoadingDetail: (state) => {
      state.loadingDelete = true;
      state.error = null;
    },
    setLoading: (state) => {
      state.loading = true;
      state.error = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { setLoading, setError, setLoadingDetail } = depositSlice.actions;

export default depositSlice.reducer;
