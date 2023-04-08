import axios from 'axios';
import { FC, useEffect, useRef } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { Layout, SplashScreen } from './components';
import { useAppDispatch } from './hooks/useAppDispatch';
import { useAppSelector } from './hooks/useAppSelector';
import {
  ForgotPassword,
  Home,
  Login,
  MasterMenu,
  Page404,
  ResetPassword,
} from './pages';
import ProductCategory from './pages/apps/master-ppob/pages/product-category';
import ProductGroup from './pages/apps/master-ppob/pages/product-group';
import SubProductGroup from './pages/apps/master-ppob/pages/product-group/pages/sub-product-group';
import { Deposit } from './pages/apps/transaction';
import {
  getAccessTokenAction,
  userLogoutAction,
} from './store/actions/auth-action';

const App: FC = () => {
  const dispatch = useAppDispatch();
  const { loading, user, preload } = useAppSelector(
    (state) => state.authReducer
  );
  const navigate = useNavigate();
  const isMounted = useRef<boolean>(true);

  useEffect(() => {
    if (isMounted.current) {
      dispatch(getAccessTokenAction());
      isMounted.current = false;
    }
  }, [dispatch]);

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
          navigate('/');
        }
        throw error;
      })
  );

  if (loading || preload) {
    return <SplashScreen />;
  }

  if (user) {
    return (
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="master/menu" element={<MasterMenu />} />
          <Route path="master/ppob">
            <Route index element={<Navigate to="product-category" replace />} />
            <Route path="product-category" element={<ProductCategory />} />
            <Route path="product-group">
              <Route index element={<ProductGroup />} />
              <Route path="sub-product-group" element={<SubProductGroup />} />
            </Route>
          </Route>
          <Route path="transaction">
            <Route index element={<Navigate to="deposit" replace />} />
            <Route path="deposit" element={<Deposit />} />
          </Route>
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
