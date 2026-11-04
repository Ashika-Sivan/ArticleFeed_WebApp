import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import articleService from '../services/articleService';
import EmptyState from '../components/EmptyState';
import Pagination from '../components/Pagination';
import {
  ThumbsUp,
  ThumbsDown,
  ShieldAlert,
  Edit2,
  Trash2,
  PlusCircle,
  Calendar,
  CheckCircle,
  Search,
  X,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { toastConfirm } from '../utils/toastConfirm';

const MyArticlesPage = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState('');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setCurrentPage(1);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadMyArticles = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 5,
      };
      if (debouncedSearch) params.search = debouncedSearch;

      const res = await articleService.getMyArticles(params);
      setArticles(res.articles || []);
      if (res.pagination) {
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error('Failed to load user articles:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch]);

  useEffect(() => {
    loadMyArticles();
  }, [loadMyArticles]);

  const handleDelete = (articleId, title) => {
    toastConfirm({
      message: `Are you sure you want to delete "${title}"?`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          await articleService.deleteArticle(articleId);
          toast.success('Article deleted successfully.');
          loadMyArticles();
        } catch (err) {
          const msg = err.response?.data?.message || 'Failed to delete article.';
          toast.error(msg);
        }
      },
    });
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>My Articles</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Manage the articles you published and monitor engagement statistics.
          </p>
        </div>

        <Link to="/create-article" className="btn btn-primary btn-sm">
          <PlusCircle size={16} />
          <span>Write New Article</span>
        </Link>
      </div>

      {/* Backend Search Bar */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-dim)',
            }}
          />
          <input
            type="text"
            placeholder="Search your articles by title, description, category, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '2.5rem', paddingRight: searchQuery ? '2.5rem' : '0.85rem' }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-dim)',
                cursor: 'pointer',
                padding: '0.2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Clear search"
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <button onClick={loadMyArticles} className="btn btn-secondary" title="Refresh articles">
          <RefreshCw size={16} />
        </button>
      </div>

      {notification && (
        <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
          <CheckCircle size={18} />
          <span>{notification}</span>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
          Loading your articles...
        </div>
      ) : articles.length === 0 ? (
        <EmptyState
          title={debouncedSearch ? 'No Articles Match Your Search' : 'No Articles Published Yet'}
          description={
            debouncedSearch
              ? `No articles found matching "${debouncedSearch}".`
              : "You haven't written any articles yet. Share your first article with readers!"
          }
        >
          {debouncedSearch ? (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="btn btn-secondary btn-sm"
            >
              Clear Search
            </button>
          ) : (
            <Link to="/create-article" className="btn btn-primary btn-sm">
              <PlusCircle size={15} />
              <span>Create Article</span>
            </Link>
          )}
        </EmptyState>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {articles.map((article) => (
              <div
                key={article._id}
                className="card-box"
                style={{
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flex: '1 1 300px' }}>
                  {article.images && article.images[0] && (
                    <img
                      src={article.images[0]}
                      alt={article.title}
                      style={{
                        width: '76px',
                        height: '76px',
                        borderRadius: 'var(--radius-sm)',
                        objectFit: 'cover',
                        flexShrink: 0,
                        border: '1px solid var(--border-color)',
                      }}
                    />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
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
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Calendar size={13} />
                        {new Date(article.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.15rem', marginBottom: '0.35rem' }}>
                      {article.title}
                    </h3>

                    <p
                      style={{
                        color: 'var(--text-muted)',
                        fontSize: '0.875rem',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {article.description}
                    </p>
                  </div>
                </div>

                {/* Engagement Metrics & Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                  {/* Stats */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                      title="Likes"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        fontSize: '0.85rem',
                        color: 'var(--primary)',
                        background: '#eef2ff',
                        padding: '0.3rem 0.6rem',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      <ThumbsUp size={14} />
                      <span>{article.likes?.length || 0}</span>
                    </div>

                    <div
                      title="Dislikes"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        fontSize: '0.85rem',
                        color: 'var(--text-muted)',
                        background: '#f1f5f9',
                        padding: '0.3rem 0.6rem',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      <ThumbsDown size={14} />
                      <span>{article.dislikes?.length || 0}</span>
                    </div>

                    <div
                      title="Blocks"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        fontSize: '0.85rem',
                        color: 'var(--danger)',
                        background: 'var(--danger-bg)',
                        padding: '0.3rem 0.6rem',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      <ShieldAlert size={14} />
                      <span>{article.blockedBy?.length || 0}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      onClick={() => navigate(`/edit-article/${article._id}`)}
                      className="btn btn-secondary btn-sm"
                      title="Edit article"
                    >
                      <Edit2 size={14} />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => handleDelete(article._id, article.title)}
                      className="btn btn-danger btn-sm"
                      title="Delete article"
                    >
                      <Trash2 size={14} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            pagination={pagination}
            onPageChange={(newPage) => {
              setCurrentPage(newPage);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </>
      )}
    </div>
  );
};

export default MyArticlesPage;
