import axios from 'axios';
import { FC, useRef } from "react";
import { Route, Routes } from 'react-router-dom';
import { useAppDispatch } from "./hooks/useAppDispatch";
import { useAppSelector } from "./hooks/useAppSelector";
import { ForgotPassword, Home, Login, ResetPassword } from "./pages";
import { userLogoutAction } from './store/actions/auth-action';

const App: FC = () => {

  const dispatch = useAppDispatch();
  const { loading, user } = useAppSelector((state) => state.authReducer);
  const isMounted = useRef<boolean>(true);

  axios.interceptors.response.use(
    (response) => response,
    (error) => new Promise((resolve, reject) => {
      if (
        error.response?.status === 401
        && error.config
        && !error.config.__isRetryRequest
      ) {
        dispatch(userLogoutAction());
      }
      throw error;
    }),
  );

  if (loading) {
    return <div>Loading</div>
  }

  if (user) {
    return (
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

    </Routes>
  )

};

export default App;
