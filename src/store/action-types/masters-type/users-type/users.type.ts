export type InitialMasterUsersState = {
  data?: any[];
  memberData?: any[];
  userVerificationData?: any;
  billerSaldo?: string;
  zonapayId?: string;
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

export type MasterUsersAction = {
  type: string;
  payload: InitialMasterUsersState;
};

export type MasterUsersDispatchType = (args: MasterUsersAction) => MasterUsersAction;
