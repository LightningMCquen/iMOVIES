import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../../services/api';
import MovieCard from '../../components/movieCard/MovieCard';
import MovieDetailsModal from '../../components/movieDetails/MovieDetailsModal';
import Loader from '../../components/loader/Loader';
import { useAuth } from '../../context/AuthContext';

const GENRES = ['All', 'Action', 'Drama', 'Thriller', 'Comedy', 'Fantasy', 'Horror', 'Historical', 'Sci-Fi'];

const HomePage = ({ searchQuery }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [movies, setMovies] = useState([]);
  const [userFavorites, setUserFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [activeGenre, setActiveGenre] = useState('All');

  const { user } = useAuth();
  const queryParam = searchParams.get('search') || searchQuery || '';

  // Fetch movies
  const fetchMovies = async () => {
    try {
      setLoading(true);
      let url = '/movies';
      const params = {};
      if (queryParam) params.search = queryParam;
      if (activeGenre && activeGenre !== 'All') params.genre = activeGenre;

      const res = await API.get(url, { params });
      if (res.data?.success) {
        setMovies(res.data.movies || []);
      }
    } catch (err) {
      console.error('Error fetching movies:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch favorites for logged in user
  useEffect(() => {
    if (user?.email) {
      API.get(`/favorites?email=${encodeURIComponent(user.email)}`)
        .then((res) => {
          if (res.data?.success) {
            setUserFavorites(res.data.favorites.map((f) => f.movieId));
          }
        })
        .catch(console.error);
    }
  }, [user]);

  useEffect(() => {
    fetchMovies();
  }, [queryParam, activeGenre]);

  const handleToggleFavorite = (movieId, isFav) => {
    if (isFav) {
      setUserFavorites((prev) => [...prev, movieId]);
    } else {
      setUserFavorites((prev) => prev.filter((id) => id !== movieId));
    }
  };

  return (
    <div className="main-page-container">
      {/* Title */}
      <h1 className="page-main-heading">
        Available <span>Movies</span>
      </h1>

      {/* Genre Filter Pills */}
      <div className="genre-filter-bar">
        {GENRES.map((g) => (
          <button
            key={g}
            onClick={() => setActiveGenre(g)}
            className={`genre-pill ${activeGenre === g ? 'active' : ''}`}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <Loader message="Loading available movies..." />
      ) : movies.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
          <h3>No movies found</h3>
          <p style={{ marginTop: '8px' }}>
            {queryParam
              ? `No movies match "${queryParam}". Try a different keyword.`
              : 'Check back soon for new movie releases!'}
          </p>
        </div>
      ) : (
        <div className="movies-grid">
          {movies.map((movie) => (
            <MovieCard
              key={movie._id}
              movie={movie}
              isFavorite={userFavorites.includes(movie._id)}
              onToggleFavorite={handleToggleFavorite}
              onClick={() => setSelectedMovie(movie)}
            />
          ))}
        </div>
      )}

      {/* Movie Details Modal */}
      {selectedMovie && (
        <MovieDetailsModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
        />
      )}
    </div>
  );
};

export default HomePage;
