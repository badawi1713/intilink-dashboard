import {
  InitialMasterProductGroupState,
  MasterProductGroup,
} from '../../../action-types/masters-type/product-group-type/product-group-type';
import * as REDUCER_TYPES from '../../../types';

const initialState: InitialMasterProductGroupState = {
  data: [],
  limit: 5,
  page: 0,
  total: 0,
  sortBy: 'deleted',
  sortType: 'asc',
  categoryId: '',
  search: '',
  productCategoryList: [],
  loadingList: true,
  loadingPost: false,
  loadingDelete: false,
  loadingDetail: false,
  loading: true,
  error: null,
};

const masterProductGroupReducer = (state = initialState, action: MasterProductGroup) => {
  switch (action.type) {
    case REDUCER_TYPES.SET_MASTER_PRODUCT_GROUP_REDUCER:
      return { ...state, ...action.payload };
    default:
      return state;
  }
};

export default masterProductGroupReducer;
