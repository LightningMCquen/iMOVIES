import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { toast } from 'react-toastify';

const AddTheatrePage = () => {
  const navigate = useNavigate();

  const [theatreName, setTheatreName] = useState('');
  const [theatreLocation, setTheatreLocation] = useState('');
  const [balconySeatPrice, setBalconySeatPrice] = useState(200);
  const [balconySeatCount, setBalconySeatCount] = useState(100);
  const [middleSeatPrice, setMiddleSeatPrice] = useState(130);
  const [middleSeatCount, setMiddleSeatCount] = useState(120);
  const [lowerSeatPrice, setLowerSeatPrice] = useState(100);
  const [lowerSeatCount, setLowerSeatCount] = useState(80);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!theatreName || !theatreLocation) {
      toast.error('Theatre Name and Theatre Location are required');
      return;
    }

    try {
      setLoading(true);
      const res = await API.post('/theatres', {
        theatreName,
        location: theatreLocation,
        balconySeatPrice,
        balconySeatCount,
        middleSeatPrice,
        middleSeatCount,
        lowerSeatPrice,
        lowerSeatCount,
      });

      if (res.data?.success) {
        toast.success(`Theatre "${theatreName}" added successfully!`);
        navigate('/admin');
      } else {
        toast.error(res.data?.message || 'Failed to add theatre');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating theatre');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-page-container">
      {/* Title matches Add theater.png */}
      <h1 className="page-main-heading">
        Add <span>Theatre</span>
      </h1>

      <div className="admin-form-container" style={{ maxWidth: '560px' }}>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Theatre Name</label>
            <input
              type="text"
              placeholder="e.g. Srinivasa / Gokul / PVR"
              value={theatreName}
              onChange={(e) => setTheatreName(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Theatre Location</label>
            <input
              type="text"
              placeholder="e.g. KPHB, Hyderabad"
              value={theatreLocation}
              onChange={(e) => setTheatreLocation(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Balcony Seat Price</label>
              <input
                type="number"
                value={balconySeatPrice}
                onChange={(e) => setBalconySeatPrice(Number(e.target.value))}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Balcony Seat Count</label>
              <input
                type="number"
                value={balconySeatCount}
                onChange={(e) => setBalconySeatCount(Number(e.target.value))}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Middle Seat Price</label>
              <input
                type="number"
                value={middleSeatPrice}
                onChange={(e) => setMiddleSeatPrice(Number(e.target.value))}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Middle Seat Count</label>
              <input
                type="number"
                value={middleSeatCount}
                onChange={(e) => setMiddleSeatCount(Number(e.target.value))}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Lower Seat Price</label>
              <input
                type="number"
                value={lowerSeatPrice}
                onChange={(e) => setLowerSeatPrice(Number(e.target.value))}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Lower Seat Count</label>
              <input
                type="number"
                value={lowerSeatCount}
                onChange={(e) => setLowerSeatCount(Number(e.target.value))}
                className="form-input"
                required
              />
            </div>
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

export default AddTheatrePage;
