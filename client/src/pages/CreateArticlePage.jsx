import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import articleService from '../services/articleService';
import { AVAILABLE_CATEGORIES } from '../constants/categories';
import { PlusCircle, AlertCircle } from 'lucide-react';

const CreateArticlePage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: AVAILABLE_CATEGORIES[0] || 'Sports',
    images: '',
    tags: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim() || !formData.description.trim() || !formData.category) {
      setError('Please provide title, description, and category.');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        images: formData.images.trim()
          ? formData.images.split(',').map((img) => img.trim()).filter(Boolean)
          : [],
        tags: formData.tags
          ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : [],
      };

      await articleService.createArticle(payload);
      navigate('/my-articles');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to publish article.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '640px', margin: '1.5rem auto' }}>
      <div className="card-box" style={{ padding: '2rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.6rem', marginBottom: '0.25rem' }}>Create New Article</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Share news, analysis, or thoughts with the community.
          </p>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Article Title *</label>
            <input
              type="text"
              name="title"
              className="form-input"
              placeholder="e.g. The Future of Commercial Space Exploration"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                name="category"
                className="form-select"
                value={formData.category}
                onChange={handleChange}
                required
              >
                {AVAILABLE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Image URL (Optional)</label>
              <input
                type="url"
                name="images"
                className="form-input"
                placeholder="https://example.com/image.jpg"
                value={formData.images}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Tags (Optional, comma-separated)</label>
            <input
              type="text"
              name="tags"
              className="form-input"
              placeholder="e.g. space, tech, nasa, rocket"
              value={formData.tags}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Article Description / Content *</label>
            <textarea
              name="description"
              className="form-textarea"
              rows={8}
              placeholder="Write your article content here..."
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <PlusCircle size={16} />
              <span>{loading ? 'Publishing...' : 'Publish Article'}</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/my-articles')}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateArticlePage;
