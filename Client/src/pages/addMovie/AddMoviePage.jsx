import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { toast } from 'react-toastify';
import { FiUploadCloud } from 'react-icons/fi';
import { MdOutlineBlock } from 'react-icons/md';

const AddMoviePage = () => {
  const navigate = useNavigate();

  const [movieName, setMovieName] = useState('');
  const [description, setDescription] = useState('');
  const [genres, setGenres] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [runtime, setRuntime] = useState('');
  const [certification, setCertification] = useState('');
  const [trailerUrl, setTrailerUrl] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!movieName || !description || !genres || !releaseDate) {
      toast.error('Please fill in required fields: Movie Name, Description, Genres, and Release Date');
      return;
    }

    try {
      setLoading(true);
      const res = await API.post('/movies', {
        movieName,
        description,
        genres,
        releaseDate,
        runtime: runtime || '150 min',
        certification: certification || 'U/A',
        trailerUrl,
        posterUrl: posterUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500',
      });

      if (res.data?.success) {
        toast.success(`Movie "${movieName}" added successfully!`);
        navigate('/admin/movies');
      } else {
        toast.error(res.data?.message || 'Failed to add movie');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating movie');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-page-container">
      {/* Title (Matches Admin movies 1.png) */}
      <h1 className="page-main-heading">
        Add <span>Movie</span>
      </h1>

      <div className="admin-form-container" style={{ maxWidth: '680px' }}>
        {/* Poster Dropzone Preview Area (Matches Admin movies 1.png red box) */}
        <div
          style={{
            border: '1.5px solid var(--primary-red)',
            borderRadius: '10px',
            height: '180px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(229, 9, 20, 0.02)',
            marginBottom: '24px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {posterUrl ? (
            <img
              src={posterUrl}
              alt="Poster Preview"
              style={{ maxHeight: '100%', objectFit: 'contain' }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div style={{ color: 'var(--primary-red)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <MdOutlineBlock size={30} />
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>Poster Preview / Dropzone</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Movie</label>
              <input
                type="text"
                placeholder="Enter movie name"
                value={movieName}
                onChange={(e) => setMovieName(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <input
                type="text"
                placeholder="Enter movie description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Genres</label>
              <input
                type="text"
                placeholder="Enter movie genres separated by comma"
                value={genres}
                onChange={(e) => setGenres(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Release Date</label>
              <input
                type="text"
                placeholder="dd-mm-yyyy or Mon DD, YYYY"
                value={releaseDate}
                onChange={(e) => setReleaseDate(e.target.value)}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Runtime</label>
              <input
                type="text"
                placeholder="Enter runtime in minutes"
                value={runtime}
                onChange={(e) => setRuntime(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Certification</label>
              <input
                type="text"
                placeholder="Enter movie certification (e.g. U/A)"
                value={certification}
                onChange={(e) => setCertification(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Trailer URL (YouTube)</label>
            <input
              type="text"
              placeholder="https://www.youtube.com/watch?v=..."
              value={trailerUrl}
              onChange={(e) => setTrailerUrl(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Poster Image URL</label>
            <input
              type="text"
              placeholder="https://image.tmdb.org/... or paste image URL"
              value={posterUrl}
              onChange={(e) => setPosterUrl(e.target.value)}
              className="form-input"
            />
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            style={{ width: '130px', marginTop: '12px' }}
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddMoviePage;
