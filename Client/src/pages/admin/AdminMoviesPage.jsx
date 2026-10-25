import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import Loader from '../../components/loader/Loader';
import { FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-toastify';

const AdminMoviesPage = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const res = await API.get('/movies');
      if (res.data?.success) {
        setMovies(res.data.movies || []);
      }
    } catch (err) {
      console.error('Error fetching admin movies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const handleDeleteMovie = async (movieId, movieName) => {
    if (!window.confirm(`Are you sure you want to delete "${movieName}"? All associated shows will also be deleted.`)) return;

    try {
      const res = await API.delete(`/movies/${movieId}`);
      if (res.data?.success) {
        toast.success(`Deleted "${movieName}"`);
        setMovies(movies.filter((m) => m._id !== movieId));
      }
    } catch (err) {
      toast.error('Failed to delete movie');
    }
  };

  const fallbackPoster = `https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=60`;

  return (
    <div>
      {/* Red Banner Bar (Exact match to admin page 2.png) */}
      <div className="admin-red-banner">Available Movies</div>

      <div className="main-page-container" style={{ paddingTop: 0 }}>
        {loading ? (
          <Loader message="Loading movie catalogue..." />
        ) : movies.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
            <h3>No movies found</h3>
          </div>
        ) : (
          <div className="movies-grid">
            {movies.map((movie) => (
              <div key={movie._id} className="movie-card" style={{ position: 'relative' }}>
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

                  {/* Circular White Button with Red Trash Can on top right (admin page 2.png) */}
                  <button
                    className="admin-movie-delete-btn"
                    onClick={() => handleDeleteMovie(movie._id, movie.movieName)}
                    title={`Delete ${movie.movieName}`}
                  >
                    <FiTrash2 size={15} />
                  </button>
                </div>

                <div className="movie-card-info">
                  <h4 className="movie-card-title">{movie.movieName}</h4>
                  <div className="movie-card-date">{movie.releaseDate}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMoviesPage;
