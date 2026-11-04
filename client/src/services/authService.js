import api, { setAccessToken, clearAccessToken } from './api';

export const authService = {
  async register(data) {
    const res = await api.post('/auth/register', data);
    if (res.data?.accessToken) setAccessToken(res.data.accessToken);
    return res.data;
  },

  async login(credentials) {
    const res = await api.post('/auth/login', credentials);
    if (res.data?.accessToken) setAccessToken(res.data.accessToken);
    return res.data;
  },

  async refresh() {
    const res = await api.post('/auth/refresh');
    if (res.data?.accessToken) setAccessToken(res.data.accessToken);
    return res.data;
  },

  async logout() {
    const res = await api.post('/auth/logout');
    clearAccessToken();
    return res.data;
  },

  async getMe() {
    const res = await api.get('/auth/me');
    return res.data;
  },
};

export default authService;
