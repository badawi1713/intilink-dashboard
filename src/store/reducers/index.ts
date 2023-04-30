import authReducer from './auth-reducer';
import masterMenuReducer from './masters-reducer/menu-reducer';
import masterProductCategoryReducer from './masters-reducer/product-category-reducer';
import masterProductGroupReducer from './masters-reducer/product-group-reducer';

import toastMessageReducer from '../slices/toast-message-slice';
import depositReducer from '../slices/transaction-slice/deposit-slice';
import transactionsReducer from '../slices/transaction-slice/transactions-slice';
import transactionProcessReducer from '../slices/transaction-slice/transaction-process-slice'

const reducers = {
  authReducer,
  masterMenuReducer,
  masterProductCategoryReducer,
  masterProductGroupReducer,
  toastMessageReducer,
  depositReducer,
  transactionsReducer,
  transactionProcessReducer
};

export default reducers;
