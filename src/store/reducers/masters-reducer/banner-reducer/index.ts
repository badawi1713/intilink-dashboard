import { Banner, InitialBannerState } from 'src/store/action-types/banner-action-type/banner-action.type';
import * as REDUCER_TYPES from '../../../types';

const initialState: InitialBannerState = {
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

const bannerReducer = (state = initialState, action: Banner) => {
  switch (action.type) {
    case REDUCER_TYPES.SET_MASTER_BANNER_REDUCER:
      return { ...state, ...action.payload };
    default:
      return state;
  }
};

export default bannerReducer;
