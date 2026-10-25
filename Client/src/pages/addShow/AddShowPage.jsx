import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { toast } from 'react-toastify';

const AddShowPage = () => {
  const navigate = useNavigate();

  const [theatres, setTheatres] = useState([]);
  const [movies, setMovies] = useState([]);
  const [selectedTheatre, setSelectedTheatre] = useState('');
  const [selectedMovie, setSelectedMovie] = useState('');
  const [showdate, setShowdate] = useState('');
  const [showtime, setShowtime] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load existing theatres and movies for dropdowns
    const loadDropdownData = async () => {
      try {
        const [theatresRes, moviesRes] = await Promise.all([
          API.get('/theatres'),
          API.get('/movies'),
        ]);

        if (theatresRes.data?.success) setTheatres(theatresRes.data.theatres || []);
        if (moviesRes.data?.success) setMovies(moviesRes.data.movies || []);
      } catch (err) {
        console.error('Failed to load dropdown data:', err);
      }
    };

    loadDropdownData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedTheatre || !selectedMovie || !showdate || !showtime) {
      toast.error('Please select Theatre, Movie, Show Date, and Showtime');
      return;
    }

    try {
      setLoading(true);

      const foundMovie = movies.find((m) => m.movieName === selectedMovie);

      const res = await API.post('/shows', {
        theatreName: selectedTheatre,
        movieName: selectedMovie,
        movieId: foundMovie?._id,
        showdate,
        showtime,
      });

      if (res.data?.success) {
        toast.success('Show added successfully!');
        navigate('/admin');
      } else {
        toast.error(res.data?.message || 'Failed to add show');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating show');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-page-container">
      {/* Title matches add movies.png */}
      <h1 className="page-main-heading">
        Add <span>Show</span>
      </h1>

      <div className="admin-form-container" style={{ maxWidth: '520px' }}>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Theatres</label>
            <select
              value={selectedTheatre}
              onChange={(e) => setSelectedTheatre(e.target.value)}
              className="form-select"
              required
            >
              <option value="">Select Theatre</option>
              {theatres.map((t) => (
                <option key={t._id} value={t.theatreName}>
                  {t.theatreName} ({t.location})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Movies</label>
            <select
              value={selectedMovie}
              onChange={(e) => setSelectedMovie(e.target.value)}
              className="form-select"
              required
            >
              <option value="">Select Movie</option>
              {movies.map((m) => (
                <option key={m._id} value={m.movieName}>
                  {m.movieName}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Show Date</label>
            <input
              type="text"
              placeholder="dd-mm-yyyy or e.g. Sep 26, 2025"
              value={showdate}
              onChange={(e) => setShowdate(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Showtime</label>
            <input
              type="text"
              placeholder="e.g. 2:00 PM or 21:00"
              value={showtime}
              onChange={(e) => setShowtime(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            style={{ width: '120px', marginTop: '16px' }}
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddShowPage;
