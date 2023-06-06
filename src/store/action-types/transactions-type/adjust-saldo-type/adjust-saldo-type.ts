export type InitialTransactionAdjustSaldoState = {
  data?: any[];
  page?: number;
  limit?: number;
  total?: number;
  sortBy?: string;
  sortType?: 'asc' | 'desc';
  categoryId?: string;
  search?: string;
  userList?: any[];
  loadingList?: boolean;
  loadingPost?: boolean;
  loadingDetail?: boolean;
  loadingDelete?: boolean;
  loading?: boolean;
  error?: null | string;
  loadingUserSearch?: boolean;
};

export type TransactionAdjustSaldo = {
  type: string;
  payload: InitialTransactionAdjustSaldoState;
};

export type TransactionAdjustSaldoDispatchType = (args: TransactionAdjustSaldo) => TransactionAdjustSaldo;
