export type InitialMasterPaymentMethodsState = {
  data?: any[];
  page?: number;
  limit?: number;
  total?: number;
  sortBy?: string;
  sortType?: 'asc' | 'desc';
  search?: string;
  groupId?: string;
  categoryId?: string;
  productId?: string;
  typeId?: string;
  paymentMethodCategoryList?: any[];
  paymentMethodTypeList?: any[];
  paymentMethodProductList?: any[];
  billerList?: any[];
  paymentMethodCategoryFormList?: any[];
  paymentMethodGroupFormList?: any[];
  paymentMethodProductFormList?: any[];
  loadingList?: boolean;
  loadingPost?: boolean;
  loadingDetail?: boolean;
  loadingDelete?: boolean;
  loading?: boolean;
  error?: null | string;
};

export type MasterPaymentMethods = {
  type: string;
  payload: InitialMasterPaymentMethodsState;
};

export type MasterPaymentMethodsDispatchType = (args: MasterPaymentMethods) => MasterPaymentMethods;
