import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import articleService from '../services/articleService';
import { AVAILABLE_CATEGORIES } from '../constants/categories';
import ImageUploader from '../components/ImageUploader';
import { PlusCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../utils/errorMessage';

const CreateArticlePage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: AVAILABLE_CATEGORIES[0] || 'Sports',
    images: [],
    tags: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const validate = () => {
    const newErrors = {};

    const trimmedTitle = formData.title.trim();
    if (!trimmedTitle) {
      newErrors.title = 'Please enter an article title.';
    } else if (trimmedTitle.length < 3) {
      newErrors.title = 'Title should be at least 3 characters long.';
    }

    if (!formData.category) {
      newErrors.category = 'Please choose a category.';
    }

    const trimmedDesc = formData.description.trim();
    if (!trimmedDesc) {
      newErrors.description = 'Please write some content for your article.';
    } else if (trimmedDesc.length < 10) {
      newErrors.description = 'Article content should be at least 10 characters long.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleImagesChange = (newImages) => {
    setFormData((prev) => ({ ...prev, images: newImages }));
    if (errors.images) {
      setErrors((prev) => ({ ...prev, images: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) {
      toast.error('Please fill in the required article details.');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        images: Array.isArray(formData.images)
          ? formData.images
          : formData.images
            ? [formData.images]
            : [],
        tags: formData.tags
          ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : [],
      };

      await articleService.createArticle(payload);
      toast.success('Your article has been published successfully!');
      navigate('/my-articles');
    } catch (err) {
      const msg = getErrorMessage(err, 'Unable to publish article. Please try again.');
      setServerError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '680px', margin: '1.5rem auto' }}>
      <div className="card-box" style={{ padding: '2.25rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.65rem', marginBottom: '0.25rem' }}>Create New Article</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Share news, analysis, or thoughts with the community.
          </p>
        </div>

        {serverError && (
          <div className="alert alert-error">
            <AlertCircle size={18} />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Title */}
          <div className="form-group">
            <label className="form-label">Article Title *</label>
            <input
              type="text"
              name="title"
              className={`form-input ${errors.title ? 'has-error' : ''}`}
              placeholder="e.g. The Future of Commercial Space Exploration"
              value={formData.title}
              onChange={handleChange}
            />
            {errors.title && (
              <span className="field-error-msg">{errors.title}</span>
            )}
          </div>

          {/* Category */}
          <div className="form-group">
            <label className="form-label">Category *</label>
            <select
              name="category"
              className={`form-select ${errors.category ? 'has-error' : ''}`}
              value={formData.category}
              onChange={handleChange}
            >
              {AVAILABLE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.category && (
              <span className="field-error-msg">{errors.category}</span>
            )}
          </div>

          {/* Image Uploader */}
          <ImageUploader
            value={formData.images}
            onChange={handleImagesChange}
            error={errors.images}
          />

          {/* Tags */}
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

          {/* Content Description */}
          <div className="form-group">
            <label className="form-label">Article Description / Content *</label>
            <textarea
              name="description"
              className={`form-textarea ${errors.description ? 'has-error' : ''}`}
              rows={8}
              placeholder="Write your article content here..."
              value={formData.description}
              onChange={handleChange}
            />
            {errors.description && (
              <span className="field-error-msg">{errors.description}</span>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.75rem' }}>
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
