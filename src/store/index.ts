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
    reducer: reducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            immutableCheck: true,
            serializableCheck: true,
        }).concat(middlewares),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
