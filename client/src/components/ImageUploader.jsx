import React, { useState, useRef } from 'react';
import { Upload, Link as LinkIcon, Trash2, Image as ImageIcon, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * Compresses an image file using an HTML5 Canvas to keep base64 payloads compact and fast.
 */
const compressImageFile = (file, maxWidth = 1200, maxHeight = 1200, quality = 0.85) => {
  return new Promise((resolve, reject) => {
    // If SVG or small GIF, read directly without raster canvas
    if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
      img.src = e.target.result;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

const ImageUploader = ({ value = [], onChange, error }) => {
  const [mode, setMode] = useState('upload'); // 'upload' | 'url'
  const [urlInput, setUrlInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  const images = Array.isArray(value) ? value : value ? [value] : [];
  const currentImage = images[0] || '';

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    try {
      setIsProcessing(true);
      const dataUrl = await compressImageFile(file);
      onChange([dataUrl]);
      toast.success('Image added successfully!');
    } catch {
      toast.error('Failed to process image file. Please try another one.');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleUrlAdd = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) {
      toast.error('Please enter an image URL.');
      return;
    }
    const urlRegex = /^https?:\/\/.+/i;
    if (!urlRegex.test(trimmed)) {
      toast.error('Please enter a valid URL starting with http:// or https://');
      return;
    }
    onChange([trimmed]);
    setUrlInput('');
    toast.success('Image link attached!');
  };

  const handleRemove = () => {
    onChange([]);
  };

  return (
    <div className="form-group" style={{ marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <ImageIcon size={15} />
          <span>Article Cover Image (Optional)</span>
        </label>

        {!currentImage && (
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            <button
              type="button"
              className={`btn btn-sm ${mode === 'upload' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.2rem 0.55rem', fontSize: '0.78rem' }}
              onClick={() => setMode('upload')}
            >
              <Upload size={12} />
              <span>Upload File</span>
            </button>
            <button
              type="button"
              className={`btn btn-sm ${mode === 'url' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.2rem 0.55rem', fontSize: '0.78rem' }}
              onClick={() => setMode('url')}
            >
              <LinkIcon size={12} />
              <span>Web Link</span>
            </button>
          </div>
        )}
      </div>

      {/* Image Preview Card if image is chosen */}
      {currentImage ? (
        <div
          className="card-box"
          style={{
            padding: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            background: '#f8fafc',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: 1, minWidth: 0 }}>
            <img
              src={currentImage}
              alt="Article cover preview"
              style={{
                width: '72px',
                height: '56px',
                objectFit: 'cover',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                flexShrink: 0,
              }}
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=300';
              }}
            />
            <div style={{ overflow: 'hidden' }}>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
                Cover Image Selected
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {currentImage.startsWith('data:') ? 'Custom uploaded image (Ready to publish)' : currentImage}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRemove}
            className="btn btn-danger btn-sm"
            style={{ padding: '0.35rem 0.65rem' }}
            title="Remove image"
          >
            <Trash2 size={14} />
            <span>Remove</span>
          </button>
        </div>
      ) : (
        /* Input Modes */
        <div>
          {mode === 'upload' ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: error ? '2px dashed var(--danger)' : '2px dashed #cbd5e1',
                borderRadius: 'var(--radius-md)',
                padding: '1.5rem 1rem',
                textAlign: 'center',
                cursor: 'pointer',
                background: '#f8fafc',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = error ? 'var(--danger)' : '#cbd5e1')}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp, image/gif"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              <div style={{ display: 'inline-flex', padding: '0.65rem', background: '#eef2ff', color: 'var(--primary)', borderRadius: '50%', marginBottom: '0.5rem' }}>
                <Upload size={20} />
              </div>
              <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155', margin: '0 0 0.2rem 0' }}>
                {isProcessing ? 'Processing image...' : 'Click to upload cover image'}
              </p>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                Supports PNG, JPG, or WebP (automatic optimization)
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                placeholder="https://example.com/cover-image.jpg"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleUrlAdd())}
                className="form-input"
              />
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleUrlAdd}
                style={{ flexShrink: 0 }}
              >
                Attach
              </button>
            </div>
          )}
        </div>
      )}

      {error && (
        <span className="field-error-msg">
          <AlertCircle size={14} />
          <span>{error}</span>
        </span>
      )}
    </div>
  );
};

export default ImageUploader;

