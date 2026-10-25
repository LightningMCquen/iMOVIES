import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import Loader from '../../components/loader/Loader';
import { FiTrash2 } from 'react-icons/fi';
import { BiCameraMovie } from 'react-icons/bi';
import { toast } from 'react-toastify';

const AdminBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await API.get('/bookings/all');
      if (res.data?.success) {
        setBookings(res.data.bookings || []);
      }
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this booking record?')) return;
    try {
      await API.delete(`/bookings/${id}`);
      toast.success('Booking deleted');
      setBookings(bookings.filter((b) => b._id !== id));
    } catch (err) {
      toast.error('Failed to delete booking');
    }
  };

  return (
    <div className="main-page-container">
      <h1 className="page-main-heading">
        All <span>Bookings</span>
      </h1>

      {loading ? (
        <Loader message="Loading bookings..." />
      ) : bookings.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#94a3b8' }}>No bookings found.</p>
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
                onClick={() => handleDelete(b._id)}
                title="Delete Record"
              >
                <FiTrash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminBookingsPage;
