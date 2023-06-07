export type InitialMasterSettingFeeUplineState = {
  data?: any[];
  page?: number;
  limit?: number;
  total?: number;
  sortBy?: string;
  sortType?: 'asc' | 'desc';
  search?: string;
  productGroupId?: string;
  userGroupId?: string;
  settingFeeUplineUserList?: any[];
  settingFeeUplineProductList?: any[];
  billerList?: any[];
  settingFeeUplineCategoryFormList?: any[];
  settingFeeUplineGroupFormList?: any[];
  loadingList?: boolean;
  loadingPost?: boolean;
  loadingDetail?: boolean;
  loadingDelete?: boolean;
  loading?: boolean;
  error?: null | string;
};

export type MasterSettingFeeUpline = {
  type: string;
  payload: InitialMasterSettingFeeUplineState;
};

export type MasterSettingFeeUplineDispatchType = (args: MasterSettingFeeUpline) => MasterSettingFeeUpline;
