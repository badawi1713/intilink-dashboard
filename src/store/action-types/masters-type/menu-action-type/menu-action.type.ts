export type InitialMasterMenuState = {
    data?: any[],
    page?: number,
    limit?: number,
    total?: number,
    sortBy?: string,
    sortType?: 'asc' | 'desc',
    search?: string,
    menuList?: any[],
    loadingList?: boolean,
    loadingPost?: boolean,
    loadingDetail?: boolean,
    loadingDelete?: boolean,
    loading?: boolean;
    error?: null | string;
};

export type MasterMenuAction = {
    type: string;
    payload: InitialMasterMenuState;
};

export type MasterMenuDispatchType = (args: MasterMenuAction) => MasterMenuAction;
