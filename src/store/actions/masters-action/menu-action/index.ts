import axios from 'axios';
import { RootState } from 'src/store';
import { InitialMasterMenuState, MasterMenuDispatchType } from '../../../action-types/masters-type/menu-action-type/menu-action.type';
import * as REDUCER_TYPES from '../../../types';

const changeMasterMenuReducer = (payload: InitialMasterMenuState) => {
    return (dispatch: MasterMenuDispatchType) => {
        dispatch({
            type: REDUCER_TYPES.SET_MASTER_MENU_REDUCER,
            payload,
        });
    };
};

const getMasterMenuData = () => {
    return async (dispatch: MasterMenuDispatchType, getState: () => RootState) => {

        const { masterMenuReducer } = getState()
        const { page, limit, sortType, sortBy } = masterMenuReducer;

        dispatch({
            type: REDUCER_TYPES.SET_MASTER_MENU_REDUCER,
            payload: {
                loading: true,
                error: null
            }
        });

        try {
            const response = await axios.get(`/v1/api/dashboard/menu?pageNo=${page}&pageSize=${limit}&sort=${sortType}&sortBy=${sortBy}`)
            
            const total = +response?.data?.data?.totalElements || 0;
            const data = response?.data?.data?.content || [];

            dispatch({
                type: REDUCER_TYPES.SET_MASTER_MENU_REDUCER,
                payload: {
                    total,
                    data
                }
            })

        } catch (error) {
            dispatch({
                type: REDUCER_TYPES.SET_MASTER_MENU_REDUCER,
                payload: {
                    error: `${error}`
                }
            });
        } finally {
            dispatch({
                type: REDUCER_TYPES.SET_MASTER_MENU_REDUCER,
                payload: {
                    loading: false
                }
            });
        }

    }
}
export { changeMasterMenuReducer, getMasterMenuData };

