export type InitialMasterMenuState = {
    data?: any[],
    page?: number,
    limit?: number,
    total?: number,
    sortBy?: string,
    sortType?: string,
    search?: string,
    loading?: boolean;
    error?: null | string;
};

export type MasterMenuAction = {
    type: string;
    payload: InitialMasterMenuState;
};

export type MasterMenuDispatchType = (args: MasterMenuAction) => MasterMenuAction;
