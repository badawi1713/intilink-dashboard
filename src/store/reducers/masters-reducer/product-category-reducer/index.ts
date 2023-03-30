import { InitialMasterProductCategoryState, MasterProductCategoryAction } from '../../../action-types/masters-type/product-category-type/product-category.type';
import * as REDUCER_TYPES from '../../../types';

const initialState: InitialMasterProductCategoryState = {
    data: [],
    limit: 5,
    page: 0,
    total: 0,
    sortBy: 'deleted',
    sortType: 'asc',
    search: '',
    loadingList: true,
    loadingPost: false,
    loadingDelete: false,
    loadingDetail: false,
    loading: true,
    error: null,
};

const masterProductCategoryReducer = (state = initialState, action: MasterProductCategoryAction) => {
    switch (action.type) {
        case REDUCER_TYPES.SET_MASTER_PRODUCT_CATEGORY_REDUCER:
            return { ...state, ...action.payload };
        default:
            return state;
    }
};

export default masterProductCategoryReducer;
