export type InitialMasterBillerState = {
  data?: any[];
  page?: number;
  limit?: number;
  total?: number;
  sortBy?: string;
  sortType?: 'asc' | 'desc';
  search?: string;
  loadingList?: boolean;
  loadingPost?: boolean;
  loadingDetail?: boolean;
  loadingDelete?: boolean;
  loading?: boolean;
  error?: null | string;
};

export type MasterBillerAction = {
  type: string;
  payload: InitialMasterBillerState;
};

export type MasterBillerDispatchType = (args: MasterBillerAction) => MasterBillerAction;
