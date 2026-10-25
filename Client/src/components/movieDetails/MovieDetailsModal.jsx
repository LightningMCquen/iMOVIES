import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoClose, IoTimeOutline, IoCalendarOutline, IoStar, IoPlayCircleOutline } from 'react-icons/io5';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const MovieDetailsModal = ({ movie, onClose }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [userRating, setUserRating] = useState(9);
  const [userComment, setUserComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (movie?._id) {
      API.get(`/reviews/${movie._id}`)
        .then((res) => {
          if (res.data?.success) setReviews(res.data.reviews || []);
        })
        .catch(console.error);
    }
  }, [movie]);

  if (!movie) return null;

  const handleBookTickets = () => {
    navigate(`/shows/${encodeURIComponent(movie.movieName)}`);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    if (!userComment.trim()) return;

    try {
      setSubmittingReview(true);
      const res = await API.post('/reviews', {
        movieId: movie._id,
        movieName: movie.movieName,
        userEmail: user.email,
        userName: user.username,
        rating: userRating,
        comment: userComment,
      });

      if (res.data?.success) {
        setReviews([res.data.review, ...reviews]);
        setUserComment('');
      }
    } catch (err) {
      console.error('Failed to submit review:', err);
    } finally {
      setSubmittingReview(false);
    }
  };

  // Extract YouTube embed URL if trailerUrl is provided
  const getEmbedUrl = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=0&rel=0` : null;
  };

  const embedUrl = getEmbedUrl(movie.trailerUrl);
  const fallbackPoster = `https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=60`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '780px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {movie.movieName}
          </h2>
          <button
            onClick={onClose}
            style={{ background: 'transparent', color: 'var(--text-secondary)', fontSize: '24px' }}
          >
            <IoClose />
          </button>
        </div>

        {/* Top Details Grid */}
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '20px' }}>
          <img
            src={movie.posterUrl || fallbackPoster}
            alt={movie.movieName}
            style={{ width: '160px', height: '230px', objectFit: 'cover', borderRadius: '8px' }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = fallbackPoster;
            }}
          />

          <div style={{ flex: 1, minWidth: '240px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b', fontWeight: 600 }}>
                <IoStar size={16} /> {movie.rating || 8.8} / 10
              </span>
              <span className="movie-card-genre-badge">{movie.genres}</span>
              <span style={{ background: '#253041', color: '#94a3b8', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                {movie.certification || 'U/A'}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '16px', color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <IoCalendarOutline size={15} /> {movie.releaseDate}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <IoTimeOutline size={15} /> {movie.runtime || '150 min'}
              </span>
            </div>

            {movie.language && (
              <p style={{ fontSize: '13px', color: '#cbd5e1' }}>
                <strong style={{ color: '#94a3b8' }}>Languages:</strong> {movie.language}
              </p>
            )}

            {movie.cast && (
              <p style={{ fontSize: '13px', color: '#cbd5e1' }}>
                <strong style={{ color: '#94a3b8' }}>Cast:</strong> {movie.cast}
              </p>
            )}

            <p style={{ fontSize: '13.5px', color: '#cbd5e1', lineHeight: '1.5', marginTop: '6px' }}>
              {movie.description}
            </p>

            <button
              onClick={handleBookTickets}
              className="btn-pill-red"
              style={{ marginTop: '12px', alignSelf: 'flex-start', padding: '9px 24px' }}
            >
              Book Tickets
            </button>
          </div>
        </div>

        {/* Trailer Embed */}
        {embedUrl && (
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontSize: '15px', color: 'var(--text-primary)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <IoPlayCircleOutline size={18} color="var(--primary-red)" /> Official Trailer
            </h4>
            <div style={{ position: 'relative', paddingBottom: '45%', height: 0, overflow: 'hidden', borderRadius: '8px' }}>
              <iframe
                src={embedUrl}
                title="Trailer"
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* Ratings and Reviews Section */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '18px' }}>
          <h4 style={{ fontSize: '16px', color: 'var(--text-primary)', marginBottom: '12px' }}>
            User Reviews & Ratings
          </h4>

          {/* Post review form */}
          {user ? (
            <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label style={{ fontSize: '13px', color: '#94a3b8' }}>Your Rating:</label>
                <select
                  value={userRating}
                  onChange={(e) => setUserRating(Number(e.target.value))}
                  className="form-select"
                  style={{ width: '80px', padding: '6px 10px' }}
                >
                  {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {n} ★
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  placeholder="Share your thoughts on this movie..."
                  value={userComment}
                  onChange={(e) => setUserComment(e.target.value)}
                  className="form-input"
                  required
                />
                <button type="submit" className="btn-pill-red" style={{ padding: '8px 18px', whiteSpace: 'nowrap' }} disabled={submittingReview}>
                  Post Review
                </button>
              </div>
            </form>
          ) : (
            <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '14px' }}>
              Please <span style={{ color: 'var(--primary-red)', cursor: 'pointer' }} onClick={() => navigate('/login')}>sign in</span> to rate and review.
            </p>
          )}

          {/* List reviews */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '180px', overflowY: 'auto' }}>
            {reviews.length === 0 ? (
              <p style={{ fontSize: '13px', color: '#64748b' }}>No reviews yet. Be the first to review!</p>
            ) : (
              reviews.map((r, i) => (
                <div key={i} style={{ background: '#1c2533', padding: '10px 14px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                    <strong>{r.userName}</strong>
                    <span style={{ color: '#f59e0b' }}>★ {r.rating}/10</span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#cbd5e1' }}>{r.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetailsModal;
