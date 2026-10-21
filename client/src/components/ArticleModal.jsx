import React from 'react';
import { ThumbsUp, ThumbsDown, ShieldAlert, X, Calendar, User, Tag } from 'lucide-react';

const ArticleModal = ({
  article,
  currentUserId,
  onClose,
  onLike,
  onDislike,
  onBlock,
}) => {
  if (!article) return null;

  const isLiked = article.likes?.some(
    (id) => (id?._id || id)?.toString() === currentUserId?.toString()
  );
  const isDisliked = article.dislikes?.some(
    (id) => (id?._id || id)?.toString() === currentUserId?.toString()
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ position: 'relative' }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-muted)',
          }}
          title="Close"
        >
          <X size={20} />
        </button>

        {/* Category & Date */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <span
            style={{
              background: '#eef2ff',
              color: 'var(--primary)',
              fontSize: '0.8rem',
              fontWeight: 600,
              padding: '0.2rem 0.6rem',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            {article.category}
          </span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Calendar size={14} />
            {new Date(article.createdAt).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>

        {/* Title */}
        <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', lineHeight: 1.3 }}>
          {article.title}
        </h2>

        {/* Author info */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.875rem',
            color: 'var(--text-muted)',
            marginBottom: '1.25rem',
          }}
        >
          <User size={15} />
          <span>
            By {article.author?.firstName} {article.author?.lastName}
          </span>
        </div>

        {/* Images if available */}
        {article.images && article.images.length > 0 && (
          <div style={{ marginBottom: '1.25rem' }}>
            {article.images.map((imgUrl, idx) => (
              <img
                key={idx}
                src={imgUrl}
                alt={article.title}
                style={{
                  width: '100%',
                  maxHeight: '300px',
                  objectFit: 'cover',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  marginBottom: '0.5rem',
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ))}
          </div>
        )}

        {/* Full Content */}
        <div
          style={{
            color: 'var(--text-main)',
            fontSize: '0.95rem',
            lineHeight: 1.7,
            whiteSpace: 'pre-line',
            marginBottom: '1.5rem',
          }}
        >
          {article.description}
        </div>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.5rem' }}>
            {article.tags.map((tag, idx) => (
              <span
                key={idx}
                style={{
                  background: '#f1f5f9',
                  color: 'var(--text-muted)',
                  fontSize: '0.8rem',
                  padding: '0.2rem 0.5rem',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
              >
                <Tag size={12} />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Interaction Bar: Like, Dislike, Block */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border-color)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {/* Like */}
            <button
              onClick={() => onLike(article._id)}
              className="btn btn-secondary btn-sm"
              style={{
                borderColor: isLiked ? 'var(--primary)' : 'var(--border-color)',
                color: isLiked ? 'var(--primary)' : 'var(--text-main)',
                background: isLiked ? '#eef2ff' : '#ffffff',
              }}
            >
              <ThumbsUp size={15} />
              <span>{article.likes?.length || 0}</span>
            </button>

            {/* Dislike */}
            <button
              onClick={() => onDislike(article._id)}
              className="btn btn-secondary btn-sm"
              style={{
                borderColor: isDisliked ? 'var(--danger)' : 'var(--border-color)',
                color: isDisliked ? 'var(--danger)' : 'var(--text-main)',
                background: isDisliked ? 'var(--danger-bg)' : '#ffffff',
              }}
            >
              <ThumbsDown size={15} />
              <span>{article.dislikes?.length || 0}</span>
            </button>
          </div>

          {/* Block Button */}
          <button
            onClick={() => onBlock(article._id)}
            className="btn btn-danger btn-sm"
            title="Block this article from showing again"
          >
            <ShieldAlert size={15} />
            <span>Block Article</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArticleModal;
