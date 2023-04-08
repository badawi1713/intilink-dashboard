import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ShowMessageType {
  message?: string;
  variant?: 'info' | 'error' | 'success' | 'warning';
  hideDuration?: number;
}

interface InitialToastMessageState {
    message?: string;
    variant?: 'info' | 'error' | 'success' | 'warning';
    show?: boolean;
    hideDuration?: number;
}

const initialState: InitialToastMessageState = {
    message: '',
    variant: 'info',
    show: false,
    hideDuration: 6000
};

const toastMessageSlice = createSlice({
  name: 'toastMessage',
  initialState,
  reducers: {
    showMessage: (state, action: PayloadAction<ShowMessageType>) => {
      state.show = true;
      state.message = action.payload.message || 'Toast message';
      state.variant = action.payload.variant || state.variant;
      state.hideDuration = action.payload.hideDuration || state.hideDuration;
    },
    hideMessage: (state) => {
      state.show = false;
    }
  },
});

export const { showMessage, hideMessage } = toastMessageSlice.actions;

export default toastMessageSlice.reducer;