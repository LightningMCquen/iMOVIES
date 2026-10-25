import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import Loader from '../../components/loader/Loader';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { IoTicketOutline, IoClose } from 'react-icons/io5';

const UserBookingsPage = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTicket, setActiveTicket] = useState(null);

  const fetchBookings = async () => {
    if (!user?.email) return;
    try {
      setLoading(true);
      const res = await API.get(`/bookings/user?email=${encodeURIComponent(user.email)}`);
      if (res.data?.success) {
        setBookings(res.data.bookings || []);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    try {
      const res = await API.put(`/bookings/${bookingId}/cancel`);
      if (res.data?.success) {
        toast.info('Booking cancelled successfully');
        fetchBookings();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error cancelling booking');
    }
  };

  const fallbackPoster = `https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=60`;

  return (
    <div className="main-page-container">
      {/* Title matches user orders.png */}
      <h1 className="page-main-heading">
        Your <span>Bookings</span>
      </h1>

      {loading ? (
        <Loader message="Loading your booked tickets..." />
      ) : bookings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
          <h3>No bookings found</h3>
          <p style={{ marginTop: '8px' }}>You haven't booked any movie tickets yet.</p>
        </div>
      ) : (
        <div className="orders-grid">
          {bookings.map((b) => (
            <div key={b._id} className="order-card">
              <img
                src={b.posterUrl || fallbackPoster}
                alt={b.movieName}
                className="order-poster"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = fallbackPoster;
                }}
              />

              <div className="order-details">
                <div className="order-field-row">
                  <span className="order-label">Movie:</span>
                  <span className="order-value">{b.movieName}</span>
                </div>

                <div className="order-field-row">
                  <span className="order-label">Theatre:</span>
                  <span className="order-value">{b.theatreName}</span>
                </div>

                <div className="order-field-row">
                  <span className="order-label">Showdate:</span>
                  <span className="order-value">{b.showdate}</span>
                </div>

                <div className="order-field-row">
                  <span className="order-label">showtime:</span>
                  <span className="order-value">{b.showtime}</span>
                </div>

                <div className="order-field-row">
                  <span className="order-label">{b.seatCategory || 'Middle'} Seats:</span>
                  <span className="order-value">{b.seats?.join(', ')}</span>
                </div>

                <div className="order-field-row">
                  <span className="order-label">Total Price:</span>
                  <span className="order-price">{b.totalPrice}₹</span>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                  <button
                    onClick={() => setActiveTicket(b)}
                    style={{
                      background: 'rgba(229, 9, 20, 0.15)',
                      color: 'var(--primary-red)',
                      border: '1px solid rgba(229, 9, 20, 0.3)',
                      borderRadius: '4px',
                      padding: '4px 10px',
                      fontSize: '12px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <IoTicketOutline /> E-Ticket
                  </button>

                  {b.paymentStatus !== 'Cancelled' ? (
                    <button
                      onClick={() => handleCancelBooking(b._id)}
                      className="order-cancel-btn"
                    >
                      Cancel
                    </button>
                  ) : (
                    <span style={{ color: '#ef4444', fontSize: '12px', fontWeight: 600, alignSelf: 'center' }}>
                      Cancelled
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* E-Ticket Modal */}
      {activeTicket && (
        <div className="modal-overlay" onClick={() => setActiveTicket(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setActiveTicket(null)} style={{ background: 'none', color: '#94a3b8', fontSize: '22px' }}>
                <IoClose />
              </button>
            </div>

            <div style={{ padding: '10px 20px 20px' }}>
              <div style={{ color: 'var(--primary-red)', fontSize: '28px', fontWeight: 800, marginBottom: '4px' }}>
                iMovies
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '20px' }}>
                Electronic Boarding Pass
              </div>

              <div style={{ background: '#131922', border: '1px dashed var(--border-color)', borderRadius: '10px', padding: '18px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>MOVIE</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>{activeTicket.movieName}</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>THEATRE</div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff' }}>{activeTicket.theatreName}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>DATE & TIME</div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff' }}>{activeTicket.showdate} | {activeTicket.showtime}</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>SEATS ({activeTicket.seatCategory})</div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--primary-red)' }}>{activeTicket.seats?.join(', ')}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>BOOKING ID</div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>{activeTicket.bookingId}</div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#94a3b8' }}>Total Paid</span>
                  <span style={{ fontSize: '17px', fontWeight: 800, color: '#22c55e' }}>₹{activeTicket.totalPrice}</span>
                </div>
              </div>

              <button
                onClick={() => window.print()}
                className="btn-pill-red"
                style={{ marginTop: '20px', padding: '10px 28px' }}
              >
                Print / Download E-Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserBookingsPage;
