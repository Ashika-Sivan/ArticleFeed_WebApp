import React from 'react';
import { ThumbsUp, ThumbsDown, ShieldAlert, Calendar, User, Eye } from 'lucide-react';

const ArticleCard = ({
  article,
  currentUserId,
  onOpenModal,
  onLike,
  onDislike,
  onBlock,
}) => {
  const isLiked = article.likes?.some(
    (id) => (id?._id || id)?.toString() === currentUserId?.toString()
  );
  const isDisliked = article.dislikes?.some(
    (id) => (id?._id || id)?.toString() === currentUserId?.toString()
  );

  return (
    <div
      className="card-box"
      style={{
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        transition: 'border-color 0.15s ease',
      }}
    >
      <div>
        {/* Header: Category & Date */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.6rem',
          }}
        >
          <span
            style={{
              background: '#eef2ff',
              color: 'var(--primary)',
              fontSize: '0.78rem',
              fontWeight: 600,
              padding: '0.15rem 0.5rem',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            {article.category}
          </span>

          <span
            style={{
              fontSize: '0.8rem',
              color: 'var(--text-dim)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            <Calendar size={13} />
            {new Date(article.createdAt).toLocaleDateString()}
          </span>
        </div>

        {/* Thumbnail if image exists */}
        {article.images && article.images.length > 0 && (
          <img
            src={article.images[0]}
            alt={article.title}
            style={{
              width: '100%',
              height: '140px',
              objectFit: 'cover',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '0.75rem',
              border: '1px solid var(--border-color)',
            }}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        )}

        {/* Title */}
        <h3
          style={{
            fontSize: '1.15rem',
            marginBottom: '0.4rem',
            cursor: 'pointer',
            lineHeight: 1.35,
          }}
          onClick={() => onOpenModal(article)}
        >
          {article.title}
        </h3>

        {/* Description snippet */}
        <p
          style={{
            color: 'var(--text-muted)',
            fontSize: '0.875rem',
            lineHeight: 1.5,
            marginBottom: '0.75rem',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {article.description}
        </p>

        {/* Author */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.825rem',
            color: 'var(--text-dim)',
            marginBottom: '1rem',
          }}
        >
          <User size={13} />
          <span>
            {article.author?.firstName} {article.author?.lastName}
          </span>
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '0.75rem',
          borderTop: '1px solid var(--border-color)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {/* Like */}
          <button
            onClick={() => onLike(article._id)}
            className="btn btn-secondary btn-sm"
            style={{
              padding: '0.3rem 0.55rem',
              borderColor: isLiked ? 'var(--primary)' : 'var(--border-color)',
              color: isLiked ? 'var(--primary)' : 'var(--text-main)',
              background: isLiked ? '#eef2ff' : '#ffffff',
            }}
            title="Like"
          >
            <ThumbsUp size={14} />
            <span style={{ fontSize: '0.8rem' }}>{article.likes?.length || 0}</span>
          </button>

          {/* Dislike */}
          <button
            onClick={() => onDislike(article._id)}
            className="btn btn-secondary btn-sm"
            style={{
              padding: '0.3rem 0.55rem',
              borderColor: isDisliked ? 'var(--danger)' : 'var(--border-color)',
              color: isDisliked ? 'var(--danger)' : 'var(--text-main)',
              background: isDisliked ? 'var(--danger-bg)' : '#ffffff',
            }}
            title="Dislike"
          >
            <ThumbsDown size={14} />
            <span style={{ fontSize: '0.8rem' }}>{article.dislikes?.length || 0}</span>
          </button>

          {/* Block */}
          <button
            onClick={() => onBlock(article._id)}
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.3rem 0.45rem', color: 'var(--text-dim)' }}
            title="Block article"
          >
            <ShieldAlert size={14} />
          </button>
        </div>

        {/* View Details */}
        <button
          onClick={() => onOpenModal(article)}
          className="btn btn-secondary btn-sm"
          style={{ padding: '0.3rem 0.65rem', fontSize: '0.825rem' }}
        >
          <Eye size={14} />
          <span>Read</span>
        </button>
      </div>
    </div>
  );
};

export default ArticleCard;
