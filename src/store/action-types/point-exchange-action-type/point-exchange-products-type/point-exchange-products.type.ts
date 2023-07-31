export type InitialPointExchangeProductsState = {
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

export type PointExchangeProducts = {
  type: string;
  payload: InitialPointExchangeProductsState;
};

export type PointExchangeProductsDispatchType = (args: PointExchangeProducts) => PointExchangeProducts;
