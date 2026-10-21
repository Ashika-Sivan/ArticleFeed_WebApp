import api from './api';

export const userService = {
  async updateProfile(data) {
    const res = await api.put('/users/profile', data);
    return res.data;
  },

  async changePassword(data) {
    const res = await api.put('/users/change-password', data);
    return res.data;
  },

  async updatePreferences(preferences) {
    const res = await api.put('/users/preferences', { preferences });
    return res.data;
  },
};

export default userService;
