export type InitialBanksState = {
  data?: any[];
  page?: number;
  limit?: number;
  total?: number;
  sortBy?: string;
  sortType?: 'asc' | 'desc';
  search?: string;
  groupId?: string;
  categoryId?: string;
  productCategoryList?: any[];
  productGroupList?: any[];
  billerList?: any[];
  productCategoryFormList?: any[];
  productGroupFormList?: any[];
  loadingList?: boolean;
  loadingPost?: boolean;
  loadingDetail?: boolean;
  loadingDelete?: boolean;
  loading?: boolean;
  error?: null | string;
};

export type Banks = {
  type: string;
  payload: InitialBanksState;
};

export type BanksDispatchType = (args: Banks) => Banks;
