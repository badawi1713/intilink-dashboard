import {
  InitialMasterSettingFeeUplineState,
  MasterSettingFeeUpline,
} from '../../../action-types/masters-type/setting-fee-upline-type/setting-fee-upline-type';
import * as REDUCER_TYPES from '../../../types';

const initialState: InitialMasterSettingFeeUplineState = {
  data: [],
  limit: 5,
  page: 0,
  total: 0,
  sortBy: 'id',
  sortType: 'asc',
  productGroupId: 'Semua',
  search: '',
  userGroupId: 'Semua',
  settingFeeUplineUserList: [],
  settingFeeUplineProductList: [],
  billerList: [],
  settingFeeUplineCategoryFormList: [],
  settingFeeUplineGroupFormList: [],
  loadingList: true,
  loadingPost: false,
  loadingDelete: false,
  loadingDetail: false,
  loading: true,
  error: null,
};

const masterSettingFeeUplineReducer = (state = initialState, action: MasterSettingFeeUpline) => {
  switch (action.type) {
    case REDUCER_TYPES.SET_MASTER_SETTING_FEE_UPLINE_REDUCER:
      return { ...state, ...action.payload };
    default:
      return state;
  }
};

export default masterSettingFeeUplineReducer;
