import {
  InitialPointExchangeProductsState,
  PointExchangeProducts,
} from 'src/store/action-types/point-exchange-action-type/point-exchange-products-type/point-exchange-products.type';
import * as REDUCER_TYPES from '../../../types';

const initialState: InitialPointExchangeProductsState = {
  data: [],
  limit: 5,
  page: 0,
  total: 0,
  sortBy: 'id',
  sortType: 'asc',
  groupId: '',
  search: '',
  categoryId: 'Semua',
  productCategoryList: [],
  productGroupList: [],
  billerList: [],
  productCategoryFormList: [],
  productGroupFormList: [],
  loadingList: true,
  loadingPost: false,
  loadingDelete: false,
  loadingDetail: false,
  loading: true,
  error: null,
};

const pointExchangeProductsReducer = (state = initialState, action: PointExchangeProducts) => {
  switch (action.type) {
    case REDUCER_TYPES.SET_POINT_EXCHANGE_PRODUCTS_REDUCER:
      return { ...state, ...action.payload };
    default:
      return state;
  }
};

export default pointExchangeProductsReducer;
