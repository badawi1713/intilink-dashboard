import {
  InitialTransactionAdjustSaldoState,
  TransactionAdjustSaldo,
} from '../../../action-types/transactions-type/adjust-saldo-type/adjust-saldo-type';
import * as REDUCER_TYPES from '../../../types';

const initialState: InitialTransactionAdjustSaldoState = {
  data: [],
  limit: 5,
  page: 0,
  total: 0,
  sortBy: 'id',
  sortType: 'asc',
  categoryId: 'Semua',
  search: '',
  userList: [],
  loadingList: true,
  loadingPost: false,
  loadingDelete: false,
  loadingDetail: false,
  loading: true,
  loadingUserSearch: false,
  error: null,
};

const transactionAdjustSaldoReducer = (state = initialState, action: TransactionAdjustSaldo) => {
  switch (action.type) {
    case REDUCER_TYPES.SET_TRANSACTION_ADJUST_SALDO_REDUCER:
      return { ...state, ...action.payload };
    default:
      return state;
  }
};

export default transactionAdjustSaldoReducer;
