import axios from 'axios';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { Toast } from './components';
import { getAccessToken } from './helpers/utils/accessToken';
import './index.css';
import store from './store';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

axios.interceptors.request.use(
  (request) => {
    const token = getAccessToken();
    request.headers.Authorization = `Bearer ${token}`;
    return request;
  },
  (error) => Promise.reject(error)
);

createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <App />
        <Toast />
      </Provider>
    </BrowserRouter>
  </React.StrictMode>
);
