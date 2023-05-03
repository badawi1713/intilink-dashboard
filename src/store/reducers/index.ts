import authReducer from './auth-reducer';
import masterMenuReducer from './masters-reducer/menu-reducer';
import masterProductCategoryReducer from './masters-reducer/product-category-reducer';
import masterProductGroupReducer from './masters-reducer/product-group-reducer';
import masterProductsReducer from './masters-reducer/products-reducer';
import masterBillerReducer from './masters-reducer/biller-reducer';

import toastMessageReducer from '../slices/toast-message-slice';
import depositReducer from '../slices/transaction-slice/deposit-slice';
import transactionsReducer from '../slices/transaction-slice/transactions-slice';
import transactionProcessReducer from '../slices/transaction-slice/transaction-process-slice';
import saldoMutationReducer from '../slices/transaction-slice/saldo-mutation-slice';

const reducers = {
  authReducer,
  masterMenuReducer,
  masterProductCategoryReducer,
  masterProductGroupReducer,
  toastMessageReducer,
  depositReducer,
  transactionsReducer,
  transactionProcessReducer,
  saldoMutationReducer,
  masterProductsReducer,
  masterBillerReducer,
};

export default reducers;
