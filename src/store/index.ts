import { combineReducers, configureStore } from '@reduxjs/toolkit';
import reducers from './reducers';

const middlewares: any[] = [];

const createReducer = () => (state: any, action: never) => {
    const combinedReducer = combineReducers({
        ...reducers,
    });
    return combinedReducer(state, action);
};

const reducer = createReducer();

const store = configureStore({
    reducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            immutableCheck: false,
            serializableCheck: false,
        }).concat(middlewares),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
