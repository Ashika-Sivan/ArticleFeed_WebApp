import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import articleService from '../services/articleService';
import { AVAILABLE_CATEGORIES } from '../constants/categories';
import ImageUploader from '../components/ImageUploader';
import { AlertCircle, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../utils/errorMessage';

const EditArticlePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    images: [],
    tags: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const res = await articleService.getArticle(id);
        const art = res.article;
        setFormData({
          title: art.title || '',
          description: art.description || '',
          category: art.category || AVAILABLE_CATEGORIES[0],
          images: Array.isArray(art.images) ? art.images : art.images ? [art.images] : [],
          tags: art.tags && art.tags.length > 0 ? art.tags.join(', ') : '',
        });
      } catch (err) {
        const msg = getErrorMessage(err, 'Failed to load article.');
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

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
    setError('');

    if (!validate()) {
      toast.error('Please fill in the required article details.');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        images: Array.isArray(formData.images)
          ? formData.images
          : formData.images
            ? [formData.images]
            : [],
        tags: formData.tags.trim()
          ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : [],
      };

      await articleService.updateArticle(id, payload);
      toast.success('Your changes have been saved successfully!');
      navigate('/my-articles');
    } catch (err) {
      const msg = getErrorMessage(err, 'Unable to update article. Please try again.');
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
        Loading article details...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '680px', margin: '1.5rem auto' }}>
      <div className="card-box" style={{ padding: '2.25rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.65rem', marginBottom: '0.25rem' }}>Edit Article</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Modify your article details and save changes.
          </p>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={18} />
            <span>{error}</span>
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
              placeholder="Article title"
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
              placeholder="e.g. space, tech, nasa"
              value={formData.tags}
              onChange={handleChange}
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Article Description / Content *</label>
            <textarea
              name="description"
              className={`form-textarea ${errors.description ? 'has-error' : ''}`}
              rows={8}
              placeholder="Article content"
              value={formData.description}
              onChange={handleChange}
            />
            {errors.description && (
              <span className="field-error-msg">{errors.description}</span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.75rem' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <Save size={16} />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
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

export default EditArticlePage;
