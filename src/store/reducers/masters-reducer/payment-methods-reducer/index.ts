import {
  InitialMasterPaymentMethodsState,
  MasterPaymentMethods,
} from '../../../action-types/masters-type/payment-methods-type/payment-methods.type';
import * as REDUCER_TYPES from '../../../types';

const initialState: InitialMasterPaymentMethodsState = {
  data: [],
  limit: 5,
  page: 0,
  total: 0,
  sortBy: 'deleted',
  sortType: 'asc',
  search: '',
  categoryId: 'Semua',
  productId: '',
  typeId: 'mini_market',
  paymentMethodTypeList: [
    {
      id: 'mini_market',
      name: 'Minimarket',
    },
    {
      id: 'atm',
      name: 'ATM',
    },
    {
      id: 'mobile_banking',
      name: 'Mobile Banking',
    },
    {
      id: 'internet_banking',
      name: 'Internet Banking',
    },
  ],
  paymentMethodProductList: [],
  billerList: [],
  paymentMethodCategoryFormList: [],
  paymentMethodGroupFormList: [],
  paymentMethodProductFormList: [],
  loadingList: true,
  loadingPost: false,
  loadingDelete: false,
  loadingDetail: false,
  loading: true,
  error: null,
};

const masterPaymentMethodsReducer = (state = initialState, action: MasterPaymentMethods) => {
  switch (action.type) {
    case REDUCER_TYPES.SET_MASTER_PAYMENT_METHODS_REDUCER:
      return { ...state, ...action.payload };
    default:
      return state;
  }
};

export default masterPaymentMethodsReducer;
