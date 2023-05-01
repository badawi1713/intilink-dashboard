export type InitialMasterProductsState = {
    data?: any[],
    page?: number,
    limit?: number,
    total?: number,
    sortBy?: string,
    sortType?: 'asc' | 'desc',
    search?: string,
    groupId?: string,
    productCategoryList?: any[],
    productGroupList?: any[],
    loadingList?: boolean,
    loadingPost?: boolean,
    loadingDetail?: boolean,
    loadingDelete?: boolean,
    loading?: boolean;
    error?: null | string;
};

export type MasterProducts = {
    type: string;
    payload: InitialMasterProductsState;
};

export type MasterProductsDispatchType = (args: MasterProducts) => MasterProducts;
