import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import Loader from '../../components/loader/Loader';
import { IoCalendarOutline, IoLocationOutline, IoTimeOutline } from 'react-icons/io5';

const MovieShowsPage = () => {
  const { movieName } = useParams();
  const navigate = useNavigate();
  const [shows, setShows] = useState([]);
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch shows for this movie
        const showsRes = await API.get(`/shows?movieName=${encodeURIComponent(movieName)}`);
        const fetchedShows = showsRes.data?.shows || [];
        setShows(fetchedShows);

        // Fetch movie details
        const moviesRes = await API.get(`/movies?search=${encodeURIComponent(movieName)}`);
        if (moviesRes.data?.movies?.length > 0) {
          const match = moviesRes.data.movies.find(
            (m) => m.movieName.toLowerCase() === movieName.toLowerCase()
          ) || moviesRes.data.movies[0];
          setMovie(match);
        }

        // Set initial selected date
        if (fetchedShows.length > 0) {
          setSelectedDate(fetchedShows[0].showdate);
        }
      } catch (err) {
        console.error('Error fetching shows:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [movieName]);

  // Extract unique dates
  const uniqueDates = [...new Set(shows.map((s) => s.showdate))];

  // Filter shows by selected date
  const filteredShows = selectedDate
    ? shows.filter((s) => s.showdate === selectedDate)
    : shows;

  // Group by theatre
  const theatreMap = {};
  filteredShows.forEach((show) => {
    if (!theatreMap[show.theatreName]) {
      theatreMap[show.theatreName] = [];
    }
    theatreMap[show.theatreName].push(show);
  });

  const fallbackPoster = `https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=60`;

  return (
    <div className="main-page-container">
      {loading ? (
        <Loader message="Loading available showtimes..." />
      ) : (
        <>
          {/* Movie Banner Header */}
          <div
            style={{
              background: '#171f2b',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '24px',
              display: 'flex',
              gap: '24px',
              alignItems: 'center',
              marginBottom: '32px',
              flexWrap: 'wrap',
            }}
          >
            <img
              src={movie?.posterUrl || fallbackPoster}
              alt={movieName}
              style={{ width: '110px', height: '160px', objectFit: 'cover', borderRadius: '8px' }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = fallbackPoster;
              }}
            />
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>
                {movieName}
              </h1>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '8px' }}>
                <span className="movie-card-genre-badge">{movie?.genres || 'Action, Thriller'}</span>
                <span style={{ background: '#253041', color: '#94a3b8', padding: '3px 8px', borderRadius: '4px', fontSize: '12px' }}>
                  {movie?.certification || 'U/A'}
                </span>
                <span style={{ color: '#94a3b8', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <IoTimeOutline /> {movie?.runtime || '150 min'}
                </span>
              </div>
              <p style={{ color: '#cbd5e1', fontSize: '13.5px', maxWidth: '700px' }}>
                {movie?.description}
              </p>
            </div>
          </div>

          {/* Date Selector Tabs */}
          {uniqueDates.length > 0 && (
            <div style={{ display: 'flex', gap: '12px', marginBottom: '28px', overflowX: 'auto', paddingBottom: '6px' }}>
              {uniqueDates.map((date) => (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className={`genre-pill ${selectedDate === date ? 'active' : ''}`}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 20px', fontSize: '14px' }}
                >
                  <IoCalendarOutline />
                  <span>{date}</span>
                </button>
              ))}
            </div>
          )}

          {/* Theatres & Showtimes */}
          {Object.keys(theatreMap).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px 20px', color: '#94a3b8' }}>
              <h3>No shows scheduled for this movie yet</h3>
              <p style={{ marginTop: '8px' }}>
                Please check back later or select another movie from the catalogue.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {Object.entries(theatreMap).map(([theatreName, tShows]) => (
                <div
                  key={theatreName}
                  style={{
                    background: '#171f2b',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    padding: '20px 24px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <IoLocationOutline color="var(--primary-red)" size={20} />
                    <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#ffffff' }}>
                      {theatreName} Cinema
                    </h3>
                  </div>

                  <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                    {tShows.map((show) => (
                      <button
                        key={show._id}
                        onClick={() => navigate(`/seats/${show._id}`)}
                        style={{
                          background: '#202937',
                          color: '#ffffff',
                          border: '1px solid #334155',
                          borderRadius: '8px',
                          padding: '10px 18px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '4px',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'var(--primary-red)';
                          e.currentTarget.style.color = 'var(--primary-red)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#334155';
                          e.currentTarget.style.color = '#ffffff';
                        }}
                      >
                        <span style={{ fontSize: '15px', fontWeight: 600 }}>{show.showtime}</span>
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>4K Dolby Atmos</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MovieShowsPage;
