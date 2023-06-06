import {
  InitialMasterProductsState,
  MasterProducts,
} from '../../../action-types/masters-type/products-type/products-type';
import * as REDUCER_TYPES from '../../../types';

const initialState: InitialMasterProductsState = {
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

const masterProductsReducer = (state = initialState, action: MasterProducts) => {
  switch (action.type) {
    case REDUCER_TYPES.SET_MASTER_PRODUCTS_REDUCER:
      return { ...state, ...action.payload };
    default:
      return state;
  }
};

export default masterProductsReducer;
