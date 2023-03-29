import axios from 'axios';
import { FC, useRef } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Layout, SplashScreen } from './components';
import { useAppDispatch } from './hooks/useAppDispatch';
import { useAppSelector } from './hooks/useAppSelector';
import { ForgotPassword, Home, Login, MasterMenu, Page404, ResetPassword } from './pages';
import { userLogoutAction } from './store/actions/auth-action';

const App: FC = () => {
    const dispatch = useAppDispatch();
    const { loading, user } = useAppSelector((state) => state.authReducer);
    const isMounted = useRef<boolean>(true);

    axios.interceptors.response.use(
        (response) => response,
        (error) =>
            new Promise((resolve, reject) => {
                if (
                    error.response?.status === 401 &&
                    error.config &&
                    !error.config.__isRetryRequest
                ) {
                    dispatch(userLogoutAction());
                }
                throw error;
            })
    );

    if (loading) {
        return <SplashScreen />;
    }

    if (user) {
        return (
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path='/master/menu' element={<MasterMenu />} />
                    <Route path="*" element={<Page404 />} />
                </Route>
            </Routes>
        );
    }

    return (
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="*" element={<Page404 />} />
        </Routes>
    );
};

export default App;
