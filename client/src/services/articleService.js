import api from './api';

export const articleService = {
  async getFeed(params = {}) {
    const res = await api.get('/articles/feed', { params });
    return res.data;
  },

  async getArticle(id) {
    const res = await api.get(`/articles/${id}`);
    return res.data;
  },

  async getMyArticles() {
    const res = await api.get('/articles/my');
    return res.data;
  },

  async createArticle(data) {
    const res = await api.post('/articles', data);
    return res.data;
  },

  async updateArticle(id, data) {
    const res = await api.put(`/articles/${id}`, data);
    return res.data;
  },

  async deleteArticle(id) {
    const res = await api.delete(`/articles/${id}`);
    return res.data;
  },

  async likeArticle(id) {
    const res = await api.post(`/articles/${id}/like`);
    return res.data;
  },

  async dislikeArticle(id) {
    const res = await api.post(`/articles/${id}/dislike`);
    return res.data;
  },

  async blockArticle(id) {
    const res = await api.post(`/articles/${id}/block`);
    return res.data;
  },
};

export default articleService;
