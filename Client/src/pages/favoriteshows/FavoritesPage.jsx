import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import Loader from '../../components/loader/Loader';
import { useAuth } from '../../context/AuthContext';
import { FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-toastify';

const FavoritesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    if (!user?.email) return;
    try {
      setLoading(true);
      const res = await API.get(`/favorites?email=${encodeURIComponent(user.email)}`);
      if (res.data?.success) {
        setFavorites(res.data.favorites || []);
      }
    } catch (err) {
      console.error('Error fetching favorites:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [user]);

  const handleRemove = async (movieId) => {
    try {
      await API.delete(`/favorites/${movieId}`);
      toast.info('Removed from favorites');
      setFavorites(favorites.filter((f) => f.movieId !== movieId));
    } catch (err) {
      toast.error('Failed to remove favorite');
    }
  };

  const fallbackPoster = `https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=60`;

  return (
    <div className="main-page-container">
      <h1 className="page-main-heading">
        Your <span>Favorites</span>
      </h1>

      {loading ? (
        <Loader message="Loading your favorite movies..." />
      ) : favorites.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
          <h3>No favorite movies yet</h3>
          <p style={{ marginTop: '8px' }}>
            Browse movies and click the heart icon to save them to your watchlist.
          </p>
          <button onClick={() => navigate('/home')} className="btn-pill-red" style={{ marginTop: '16px' }}>
            Browse Movies
          </button>
        </div>
      ) : (
        <div className="movies-grid">
          {favorites.map((fav) => (
            <div key={fav._id} className="movie-card" style={{ position: 'relative' }}>
              <div className="movie-poster-wrapper">
                <img
                  src={fav.posterUrl || fallbackPoster}
                  alt={fav.movieName}
                  className="movie-poster-img"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = fallbackPoster;
                  }}
                />
                <button
                  className="admin-movie-delete-btn"
                  onClick={() => handleRemove(fav.movieId)}
                  title="Remove from favorites"
                >
                  <FiTrash2 size={15} />
                </button>
              </div>

              <div className="movie-card-info">
                <h4 className="movie-card-title">{fav.movieName}</h4>
                <div className="movie-card-date">{fav.releaseDate}</div>
                <div className="movie-card-genre-badge">{fav.genres}</div>
                <button
                  onClick={() => navigate(`/shows/${encodeURIComponent(fav.movieName)}`)}
                  className="btn-pill-red"
                  style={{ marginTop: '10px', padding: '6px 12px', fontSize: '13px' }}
                >
                  Book Tickets
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
