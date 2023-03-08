import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';
import axios from 'axios';
import { getAccessToken } from './helpers/utils/accessToken';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

axios.interceptors.request.use((request) => {
	const token = getAccessToken();
	request.headers.Authorization = `Bearer ${token}`;
	return request;
}, (error) => Promise.reject(error));

createRoot(document.getElementById('root') as HTMLElement).render(
	<React.StrictMode>
		<BrowserRouter>
			<Provider store={store}>
				<App />
			</Provider>
		</BrowserRouter>
	</React.StrictMode>
);
