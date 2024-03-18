import axios from 'axios';
import { FC, useEffect, useRef } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { Layout, SplashScreen } from './components';
import { useAppDispatch } from './hooks/useAppDispatch';
import { useAppSelector } from './hooks/useAppSelector';
import { ForgotPassword, Home, Login, MasterMenu, Page404, ResetPassword } from './pages';
import Biller from './pages/apps/master-ppob/pages/biller/Biller';
import ProductCategory from './pages/apps/master-ppob/pages/product-category';
import ProductGroup from './pages/apps/master-ppob/pages/product-group';
import SubProductGroup from './pages/apps/master-ppob/pages/product-group/pages/sub-product-group';
import Products from './pages/apps/master-ppob/pages/products';
import { AdjustSaldo, Deposit, TransactionProcess, Transactions } from './pages/apps/transaction';
import { getAccessTokenAction, userLogoutAction } from './store/actions/auth-action';
import MasterUsers from './pages/apps/master-users';
import PaymentMethods from './pages/apps/master-ppob/pages/payment-methods';
import SettingFeeUpline from './pages/apps/master-ppob/pages/setting-fee-upline';
import { PointMutation, SaldoMutation } from './pages/apps/mutation';
import { PointExchangeProducts } from './pages/apps/point-exchange';
import MasterBank from './pages/apps/master-ppob/pages/master-bank';
import Banner from './pages/apps/master-ppob/pages/banner';

const App: FC = () => {
  const dispatch = useAppDispatch();
  const { user, preload } = useAppSelector((state) => state.authReducer);
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
      new Promise(() => {
        if (error.response?.status === 401 && error.config && !error.config.__isRetryRequest) {
          dispatch(userLogoutAction());
          navigate('/');
        }
        throw error;
      }),
  );

  if (preload) {
    return <SplashScreen />;
  }

  if (user) {
    return (
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="master/user" element={<MasterUsers />} />
          <Route path="master/menu" element={<MasterMenu />} />
          <Route path="master/ppob">
            <Route index element={<Navigate to="product-category" replace />} />
            <Route path="product-category" element={<ProductCategory />} />
            <Route path="tf-bank" element={<MasterBank />} />
            <Route path="products" element={<Products />} />
            <Route path="cara-bayar" element={<PaymentMethods />} />
            <Route path="banner" element={<Banner />} />
            <Route path="product-group">
              <Route index element={<ProductGroup />} />
              <Route path="sub-product-group" element={<SubProductGroup />} />
            </Route>
            <Route path="biller" element={<Biller />} />
            <Route path="setting-fee-upline" element={<SettingFeeUpline />} />
          </Route>
          <Route path="transaction">
            <Route index element={<Navigate to="proses-transaksi" replace />} />
            <Route path="deposit" element={<Deposit />} />
            <Route path="transaksi" element={<Transactions />} />
            <Route path="proses-transaksi" element={<TransactionProcess />} />
            <Route path="mutasi" element={<SaldoMutation />} />
            <Route path="adjust-saldo" element={<AdjustSaldo />} />
          </Route>
          <Route path="mutasi">
            <Route index element={<Navigate to="mutasi-poin" replace />} />
            <Route path="mutasi-poin" element={<PointMutation />} />
            <Route path="mutasi-saldo" element={<SaldoMutation />} />
          </Route>
          <Route path="tukar-poin">
            <Route index element={<Navigate to="produk" replace />} />
            <Route path="produk" element={<PointExchangeProducts />} />
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
