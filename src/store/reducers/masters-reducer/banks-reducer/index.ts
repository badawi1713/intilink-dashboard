import { InitialBanksState, Banks } from 'src/store/action-types/masters-type/banks-type/banks.type';
import * as REDUCER_TYPES from '../../../types';

const initialState: InitialBanksState = {
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

const banksReducer = (state = initialState, action: Banks) => {
  switch (action.type) {
    case REDUCER_TYPES.SET_MASTER_BANKS_REDUCER:
      return { ...state, ...action.payload };
    default:
      return state;
  }
};

export default banksReducer;
