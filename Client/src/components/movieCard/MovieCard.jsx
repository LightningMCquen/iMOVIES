import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiHeart } from 'react-icons/fi';
import { IoCalendarOutline } from 'react-icons/io5';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const MovieCard = ({ movie, isFavorite = false, onToggleFavorite, onClick }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [favorite, setFavorite] = useState(isFavorite);
  const [loadingFav, setLoadingFav] = useState(false);

  // Fallback poster generator if image link fails or is placeholder
  const fallbackPoster = `https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=60`;

  const handleFavoriteClick = async (e) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setLoadingFav(true);
      if (favorite) {
        await API.delete(`/favorites/${movie._id}`);
        setFavorite(false);
      } else {
        await API.post('/favorites', {
          userEmail: user.email,
          movieId: movie._id,
          movieName: movie.movieName,
          posterUrl: movie.posterUrl,
          releaseDate: movie.releaseDate,
          genres: movie.genres,
        });
        setFavorite(true);
      }
      if (onToggleFavorite) onToggleFavorite(movie._id, !favorite);
    } catch (err) {
      console.error('Error toggling favorite:', err);
    } finally {
      setLoadingFav(false);
    }
  };

  return (
    <div className="movie-card" onClick={onClick}>
      <div className="movie-poster-wrapper">
        <img
          src={movie.posterUrl || fallbackPoster}
          alt={movie.movieName}
          className="movie-poster-img"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = fallbackPoster;
          }}
        />
        <button
          className={`favorite-heart-btn ${favorite ? 'active' : ''}`}
          onClick={handleFavoriteClick}
          title={favorite ? 'Remove from favorites' : 'Add to favorites'}
          disabled={loadingFav}
        >
          <FiHeart size={16} fill={favorite ? '#e50914' : 'none'} />
        </button>
      </div>

      <div className="movie-card-info">
        <h4 className="movie-card-title" title={movie.movieName}>
          {movie.movieName}
        </h4>
        <div className="movie-card-date">
          <IoCalendarOutline size={14} />
          <span>{movie.releaseDate}</span>
        </div>
        <div className="movie-card-genre-badge" title={movie.genres}>
          {movie.genres}
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
