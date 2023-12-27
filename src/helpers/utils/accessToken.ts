const getAccessToken = () => localStorage.getItem('token') || '';

const updateAccessToken = (token: string) => localStorage.setItem('token', token || '');

export { getAccessToken, updateAccessToken };
