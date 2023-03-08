export type InitialAuthState = {
    user?: any;
    loading?: boolean;
    error?: null | string;
};

export type AuthAction = {
    type: string;
    payload: InitialAuthState;
};

export type AuthDispatchType = (args: AuthAction) => AuthAction;
