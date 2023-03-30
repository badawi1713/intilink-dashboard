export type InitialMasterProductCategoryState = {
    data?: any[],
    page?: number,
    limit?: number,
    total?: number,
    sortBy?: string,
    sortType?: 'asc' | 'desc',
    search?: string,
    loadingList?: boolean,
    loadingPost?: boolean,
    loadingDetail?: boolean,
    loadingDelete?: boolean,
    loading?: boolean;
    error?: null | string;
};

export type MasterProductCategoryAction = {
    type: string;
    payload: InitialMasterProductCategoryState;
};

export type MasterProductCategoryDispatchType = (args: MasterProductCategoryAction) => MasterProductCategoryAction;
