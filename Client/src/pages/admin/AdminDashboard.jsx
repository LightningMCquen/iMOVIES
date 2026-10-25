import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import Loader from '../../components/loader/Loader';
import { toast } from 'react-toastify';
import { BiCameraMovie } from 'react-icons/bi';
import { FiTrash2 } from 'react-icons/fi';
import { IoFilmOutline, IoLocationOutline, IoTimeOutline, IoTicketOutline } from 'react-icons/io5';

const AdminDashboard = () => {
  const [shows, setShows] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await API.get('/admin/dashboard');
      if (res.data?.success) {
        setShows(res.data.shows || []);
        setBookings(res.data.bookings || []);
        setStats(res.data.stats || null);
      }
    } catch (err) {
      console.error('Error fetching admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleDeleteShow = async (showId) => {
    if (!window.confirm('Are you sure you want to delete this show?')) return;
    try {
      const res = await API.delete(`/shows/${showId}`);
      if (res.data?.success) {
        toast.success('Show deleted successfully');
        setShows(shows.filter((s) => s._id !== showId));
      }
    } catch (err) {
      toast.error('Failed to delete show');
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm('Delete this booking record?')) return;
    try {
      const res = await API.delete(`/bookings/${bookingId}`);
      if (res.data?.success) {
        toast.success('Booking deleted');
        setBookings(bookings.filter((b) => b._id !== bookingId));
      }
    } catch (err) {
      toast.error('Failed to delete booking');
    }
  };

  return (
    <div className="main-page-container">
      {loading ? (
        <Loader message="Loading admin dashboard..." />
      ) : (
        <>
          {/* Quick Metrics Bar */}
          {stats && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '16px',
                marginBottom: '36px',
              }}
            >
              <div style={{ background: '#171f2b', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '18px', textAlign: 'center' }}>
                <div style={{ fontSize: '13px', color: '#94a3b8' }}>Total Movies</div>
                <div style={{ fontSize: '26px', fontWeight: 700, color: '#ffffff', marginTop: '4px' }}>{stats.totalMovies}</div>
              </div>
              <div style={{ background: '#171f2b', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '18px', textAlign: 'center' }}>
                <div style={{ fontSize: '13px', color: '#94a3b8' }}>Theatres</div>
                <div style={{ fontSize: '26px', fontWeight: 700, color: '#ffffff', marginTop: '4px' }}>{stats.totalTheatres}</div>
              </div>
              <div style={{ background: '#171f2b', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '18px', textAlign: 'center' }}>
                <div style={{ fontSize: '13px', color: '#94a3b8' }}>Active Shows</div>
                <div style={{ fontSize: '26px', fontWeight: 700, color: '#ffffff', marginTop: '4px' }}>{stats.totalShows}</div>
              </div>
              <div style={{ background: '#171f2b', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '18px', textAlign: 'center' }}>
                <div style={{ fontSize: '13px', color: '#94a3b8' }}>Total Bookings</div>
                <div style={{ fontSize: '26px', fontWeight: 700, color: 'var(--primary-red)', marginTop: '4px' }}>{stats.totalBookings}</div>
              </div>
              <div style={{ background: '#171f2b', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '18px', textAlign: 'center' }}>
                <div style={{ fontSize: '13px', color: '#94a3b8' }}>Gross Revenue</div>
                <div style={{ fontSize: '26px', fontWeight: 700, color: '#22c55e', marginTop: '4px' }}>₹{stats.totalRevenue}</div>
              </div>
            </div>
          )}

          {/* Section 1: Admin Shows (Exact match to Admin Dashboard.png) */}
          <div className="admin-section">
            <h2 className="admin-section-heading">
              Admin <span>Shows</span>
            </h2>

            {shows.length === 0 ? (
              <p style={{ color: '#94a3b8' }}>No shows found. Add a show using the + menu.</p>
            ) : (
              <div className="shows-grid">
                {shows.map((show) => (
                  <div key={show._id} className="admin-show-card">
                    <div className="admin-show-card-top">
                      <BiCameraMovie size={20} color="#ffffff" />
                      <span><strong>Movie:</strong> {show.movieName}</span>
                    </div>

                    <div className="admin-show-card-field">
                      <strong>Theatre:</strong> {show.theatreName}
                    </div>

                    <div className="admin-show-card-field">
                      <strong>Showdate:</strong> {show.showdate}
                    </div>

                    <div className="admin-show-card-field">
                      <strong>Showtime:</strong> {show.showtime}
                    </div>

                    <button
                      className="admin-show-delete-btn"
                      onClick={() => handleDeleteShow(show._id)}
                      title="Delete Show"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: All Bookings (Exact match to Admin Dashboard.png) */}
          <div className="admin-section">
            <h2 className="admin-section-heading">
              All <span>Bookings</span>
            </h2>

            {bookings.length === 0 ? (
              <p style={{ color: '#94a3b8' }}>No bookings recorded yet.</p>
            ) : (
              <div className="shows-grid">
                {bookings.map((b) => (
                  <div key={b._id} className="admin-show-card">
                    <div className="admin-show-card-top">
                      <BiCameraMovie size={18} color="var(--primary-red)" />
                      <span><strong>User:</strong> {b.userEmail}</span>
                    </div>

                    <div className="admin-show-card-field">
                      <strong>Movie:</strong> {b.movieName}
                    </div>

                    <div className="admin-show-card-field">
                      <strong>Theatre:</strong> {b.theatreName}
                    </div>

                    <div className="admin-show-card-field">
                      <strong>Show:</strong> {b.showdate} | {b.showtime}
                    </div>

                    <div className="admin-show-card-field">
                      <strong>Seats:</strong> {b.seats?.join(', ')} ({b.seatCategory})
                    </div>

                    <div className="admin-show-card-field">
                      <strong>Total:</strong> ₹{b.totalPrice} ({b.paymentStatus})
                    </div>

                    <button
                      className="admin-show-delete-btn"
                      onClick={() => handleDeleteBooking(b._id)}
                      title="Delete Booking Record"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
