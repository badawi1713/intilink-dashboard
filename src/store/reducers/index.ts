import authReducer from './auth-reducer';
import masterMenuReducer from './masters-reducer/menu-reducer';
import masterProductCategoryReducer from './masters-reducer/product-category-reducer';
import masterProductGroupReducer from './masters-reducer/product-group-reducer';

import toastMessageReducer from '../slices/toast-message-slice';

const reducers = {
    authReducer,
    masterMenuReducer,
    masterProductCategoryReducer,
    masterProductGroupReducer,
    toastMessageReducer
};

export default reducers;
