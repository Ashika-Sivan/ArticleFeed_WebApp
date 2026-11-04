import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import articleService from '../services/articleService';
import ArticleCard from '../components/ArticleCard';
import ArticleModal from '../components/ArticleModal';
import EmptyState from '../components/EmptyState';
import Pagination from '../components/Pagination';
import { Search, SlidersHorizontal, PlusCircle, RefreshCw, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { toastConfirm } from '../utils/toastConfirm';

const DashboardPage = () => {
  const { user } = useAuth();
  const [articles, setArticles] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 6,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeModalArticle, setActiveModalArticle] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const currentUserId = user?._id || user?.id;
  const userPreferences = user?.preferences || [];

  // Debounce search query to reduce unnecessary backend calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setCurrentPage(1); // Reset to page 1 on search change
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset to page 1 on category change
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  // Fetch feed with backend search & pagination
  const loadFeed = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 6,
      };
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (debouncedSearch) params.search = debouncedSearch;

      const data = await articleService.getFeed(params);
      setArticles(data.articles || []);
      if (data.pagination) {
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error('Failed to load feed:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, debouncedSearch, currentPage]);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  // Unified reaction updater (like / dislike)
  const updateArticleReaction = (articleId, { isLiked, isDisliked }) => {
    const updateItem = (item) => {
      let likes = (item.likes || []).filter(
        (id) => (id?._id || id)?.toString() !== currentUserId?.toString()
      );
      let dislikes = (item.dislikes || []).filter(
        (id) => (id?._id || id)?.toString() !== currentUserId?.toString()
      );

      if (isLiked) likes.push(currentUserId);
      if (isDisliked) dislikes.push(currentUserId);

      return { ...item, likes, dislikes };
    };

    setArticles((prev) =>
      prev.map((item) => (item._id === articleId ? updateItem(item) : item))
    );

    if (activeModalArticle && activeModalArticle._id === articleId) {
      setActiveModalArticle((prev) => updateItem(prev));
    }
  };

  const handleLike = async (articleId) => {
    try {
      const data = await articleService.likeArticle(articleId);
      updateArticleReaction(articleId, data);
    } catch (err) {
      console.error('Error liking article:', err);
    }
  };

  const handleDislike = async (articleId) => {
    try {
      const data = await articleService.dislikeArticle(articleId);
      updateArticleReaction(articleId, data);
    } catch (err) {
      console.error('Error disliking article:', err);
    }
  };

  const handleBlock = (articleId) => {
    toastConfirm({
      message: 'Block this article and hide it from your feed?',
      confirmText: 'Block',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          await articleService.blockArticle(articleId);
          setArticles((prev) => prev.filter((item) => item._id !== articleId));
          if (activeModalArticle?._id === articleId) setActiveModalArticle(null);
          toast.success('Article blocked. You can unblock it anytime in Settings.');
          loadFeed();
        } catch {
          toast.error('Failed to block article.');
        }
      },
    });
  };

  return (
    <div>
      {/* Header controls */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1rem',
          }}
        >
          <div>
            <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Your Feed</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Articles personalized for your selected interests.
            </p>
          </div>

          <Link to="/create-article" className="btn btn-primary btn-sm">
            <PlusCircle size={16} />
            <span>New Article</span>
          </Link>
        </div>

        {/* Category Filter Pills */}
        <div
          className="card-box"
          style={{
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
            marginBottom: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
              Filter:
            </span>
            <button
              onClick={() => handleCategorySelect('All')}
              className={`category-pill ${selectedCategory === 'All' ? 'selected' : ''}`}
            >
              All Interests
            </button>
            {userPreferences.map((pref) => (
              <button
                key={pref}
                onClick={() => handleCategorySelect(pref)}
                className={`category-pill ${selectedCategory === pref ? 'selected' : ''}`}
              >
                {pref}
              </button>
            ))}
          </div>

          <Link
            to="/settings"
            style={{
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontWeight: 500,
            }}
          >
            <SlidersHorizontal size={14} />
            <span>Manage Preferences</span>
          </Link>
        </div>

        {/* Backend Search Bar */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
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
              placeholder="Search articles by title, description, category, or tags..."
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

          <button onClick={loadFeed} className="btn btn-secondary" title="Refresh feed">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {feedbackMessage && (
        <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Feed list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
          Loading your personalized feed...
        </div>
      ) : articles.length === 0 ? (
        <EmptyState
          title={debouncedSearch ? 'No Articles Match Your Search' : 'No Articles Found'}
          description={
            debouncedSearch
              ? `No articles found matching "${debouncedSearch}". Try another search term or clear the filter.`
              : userPreferences.length === 0
                ? "You haven't selected any article preferences yet."
                : 'There are no active articles in this category from other users right now.'
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
            <>
              <Link to="/settings" className="btn btn-secondary btn-sm">
                Update Preferences
              </Link>
              <Link to="/create-article" className="btn btn-primary btn-sm">
                Write an Article
              </Link>
            </>
          )}
        </EmptyState>
      ) : (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {articles.map((article) => (
              <ArticleCard
                key={article._id}
                article={article}
                currentUserId={currentUserId}
                onOpenModal={(art) => setActiveModalArticle(art)}
                onLike={handleLike}
                onDislike={handleDislike}
                onBlock={handleBlock}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          <Pagination
            pagination={pagination}
            onPageChange={(newPage) => {
              setCurrentPage(newPage);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </>
      )}

      {/* Popup Reader */}
      {activeModalArticle && (
        <ArticleModal
          article={activeModalArticle}
          currentUserId={currentUserId}
          onClose={() => setActiveModalArticle(null)}
          onLike={handleLike}
          onDislike={handleDislike}
          onBlock={handleBlock}
        />
      )}
    </div>
  );
};

export default DashboardPage;
