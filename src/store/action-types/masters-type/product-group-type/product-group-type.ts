export type InitialMasterProductGroupState = {
  data?: any[];
  page?: number;
  limit?: number;
  total?: number;
  sortBy?: string;
  sortType?: 'asc' | 'desc';
  categoryId?: string;
  search?: string;
  productCategoryList?: any[];
  loadingList?: boolean;
  loadingPost?: boolean;
  loadingDetail?: boolean;
  loadingDelete?: boolean;
  loading?: boolean;
  error?: null | string;
};

export type MasterProductGroup = {
  type: string;
  payload: InitialMasterProductGroupState;
};

export type MasterProductGroupDispatchType = (args: MasterProductGroup) => MasterProductGroup;
