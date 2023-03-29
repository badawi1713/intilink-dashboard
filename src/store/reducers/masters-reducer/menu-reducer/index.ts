import { InitialMasterMenuState, MasterMenuAction } from '../../../action-types/masters-type/menu-action-type/menu-action.type';
import * as REDUCER_TYPES from '../../../types';

const initialState: InitialMasterMenuState = {
    data: [],
    limit: 5,
    page: 0,
    total: 0,
    sortBy: 'deleted',
    sortType: 'asc',
    search: '',
    loading: false,
    error: null,
};

const masterMenuReducer = (state = initialState, action: MasterMenuAction) => {
    switch (action.type) {
        case REDUCER_TYPES.SET_MASTER_MENU_REDUCER:
            return { ...state, ...action.payload };
        default:
            return state;
    }
};

export default masterMenuReducer;
