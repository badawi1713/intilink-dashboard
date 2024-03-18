import authReducer from './auth-reducer';
import masterMenuReducer from './masters-reducer/menu-reducer';
import masterProductCategoryReducer from './masters-reducer/product-category-reducer';
import masterProductGroupReducer from './masters-reducer/product-group-reducer';
import masterProductsReducer from './masters-reducer/products-reducer';
import masterBillerReducer from './masters-reducer/biller-reducer';
import masterUsersReducer from './masters-reducer/users-reducer';
import masterPaymentMethodsReducer from './masters-reducer/payment-methods-reducer';
import masterSettingFeeUplineReducer from './masters-reducer/setting-fee-upline-reducer';
import banksReducer from './masters-reducer/banks-reducer';

import toastMessageReducer from '../slices/toast-message-slice';

import depositReducer from '../slices/transaction-slice/deposit-slice';
import transactionsReducer from '../slices/transaction-slice/transactions-slice';
import transactionProcessReducer from '../slices/transaction-slice/transaction-process-slice';
import transactionAdjustSaldoReducer from './transactions-reducer/adjust-saldo-reducer';

import saldoMutationReducer from '../slices/mutation-slice/saldo-mutation-slice';
import pointMutationReducer from '../slices/mutation-slice/point-mutation-slice';

import pointExchangeProductsReducer from './point-exchange-reducer/point-exchange-products-reducer';

import bannerReducer from './masters-reducer/banner-reducer';

const reducers = {
  banksReducer,
  pointExchangeProductsReducer,
  masterSettingFeeUplineReducer,
  masterPaymentMethodsReducer,
  masterUsersReducer,
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
  transactionAdjustSaldoReducer,
  pointMutationReducer,
  bannerReducer,
};

export default reducers;
