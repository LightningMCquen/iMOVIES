import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import Loader from '../../components/loader/Loader';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { IoCheckmarkCircle, IoClose } from 'react-icons/io5';

const SeatsPage = () => {
  const { showId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [show, setShow] = useState(null);
  const [theatre, setTheatre] = useState(null);
  const [movie, setMovie] = useState(null);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [lockedSeats, setLockedSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);

  // Payment checkout modal state
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Credit/Debit Card');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    const fetchShowDetails = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/shows/${showId}`);
        if (res.data?.success) {
          setShow(res.data.show);
          setTheatre(res.data.theatre);
          setMovie(res.data.movie);
          setBookedSeats(res.data.show.bookedSeats || []);
          setLockedSeats(res.data.lockedSeatIds || []);
        }
      } catch (err) {
        toast.error('Failed to load show seats');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchShowDetails();
  }, [showId]);

  if (loading) return <Loader message="Preparing seat layout..." />;
  if (!show) {
    return (
      <div className="main-page-container" style={{ textAlign: 'center', padding: '60px' }}>
        <h2>Show not found</h2>
        <button onClick={() => navigate('/home')} className="btn-pill-red" style={{ marginTop: '16px' }}>
          Back to Movies
        </button>
      </div>
    );
  }

  // Generate seat grids for tiers
  // Balcony: 101 to 140 (or based on theatre.balconySeats)
  // Middle: 201 to 260
  // Lower: 301 to 350
  const balconyPrice = theatre?.balconySeatPrice || 200;
  const middlePrice = theatre?.middleSeatPrice || 130;
  const lowerPrice = theatre?.lowerSeatPrice || 100;

  const balconySeats = Array.from({ length: 30 }, (_, i) => String(150 + i));
  const middleSeats = Array.from({ length: 40 }, (_, i) => String(240 + i));
  const lowerSeats = Array.from({ length: 30 }, (_, i) => String(320 + i));

  const handleSeatClick = (seatNumber) => {
    if (bookedSeats.includes(seatNumber) || lockedSeats.includes(seatNumber)) {
      return;
    }

    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatNumber));
    } else {
      if (selectedSeats.length >= 8) {
        toast.warning('Maximum 8 seats per booking allowed');
        return;
      }
      setSelectedSeats([...selectedSeats, seatNumber]);
    }
  };

  // Determine category and total price
  const getSeatCategory = (seatNum) => {
    if (balconySeats.includes(seatNum)) return 'Balcony';
    if (middleSeats.includes(seatNum)) return 'Middle';
    return 'Lower';
  };

  const calculateTotal = () => {
    return selectedSeats.reduce((sum, seatNum) => {
      const cat = getSeatCategory(seatNum);
      if (cat === 'Balcony') return sum + balconyPrice;
      if (cat === 'Middle') return sum + middlePrice;
      return sum + lowerPrice;
    }, 0);
  };

  const handleProceedToPay = async () => {
    if (!user) {
      toast.info('Please log in to continue booking');
      navigate('/login', { state: { from: { pathname: `/seats/${showId}` } } });
      return;
    }

    if (selectedSeats.length === 0) {
      toast.error('Please select at least one seat');
      return;
    }

    try {
      // Temporary lock seats on server
      await API.post(`/shows/${showId}/lock-seats`, {
        seats: selectedSeats,
        userEmail: user.email,
      });
      setShowCheckoutModal(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Selected seats could not be reserved');
    }
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    try {
      setIsProcessingPayment(true);

      const dominantCategory =
        selectedSeats.length > 0 ? getSeatCategory(selectedSeats[0]) : 'Middle';

      const bookingPayload = {
        userEmail: user.email,
        userId: user._id || user.id,
        showId: show._id,
        movieName: show.movieName,
        theatreName: show.theatreName,
        showdate: show.showdate,
        showtime: show.showtime,
        seats: selectedSeats,
        seatCategory: dominantCategory,
        totalPrice: calculateTotal(),
        posterUrl: movie?.posterUrl || '',
        paymentMethod,
      };

      const res = await API.post('/bookings', bookingPayload);

      if (res.data?.success) {
        toast.success('🎉 Tickets Booked Successfully! Confirmation sent.');
        setShowCheckoutModal(false);
        navigate('/bookings');
      } else {
        toast.error(res.data?.message || 'Booking confirmation failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment processing error');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const renderSeatTier = (title, price, seatList, categoryName) => (
    <div className="seat-tier-section">
      <div className="seat-tier-header">
        <span>
          {title} ({categoryName})
        </span>
        <span>₹{price} / ticket</span>
      </div>
      <div className="seat-grid">
        {seatList.map((seatNum) => {
          const isBooked = bookedSeats.includes(seatNum);
          const isLocked = lockedSeats.includes(seatNum);
          const isSelected = selectedSeats.includes(seatNum);

          let seatClass = 'seat-item';
          if (isBooked) seatClass += ' booked';
          else if (isLocked) seatClass += ' locked';
          else if (isSelected) seatClass += ' selected';

          return (
            <div
              key={seatNum}
              className={seatClass}
              onClick={() => handleSeatClick(seatNum)}
              title={
                isBooked
                  ? 'Booked'
                  : isLocked
                  ? 'Reserved'
                  : isSelected
                  ? 'Selected'
                  : `Seat ${seatNum} - ₹${price}`
              }
            >
              {seatNum}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="main-page-container">
      {/* Show Header */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#ffffff' }}>
          {show.movieName}
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '15px', marginTop: '4px' }}>
          {show.theatreName} Cinema | {show.showdate} at {show.showtime}
        </p>
      </div>

      {/* Screen Arc */}
      <div className="screen-indicator-box">ALL EYES THIS WAY (SCREEN)</div>

      {/* Legend */}
      <div className="seat-legend">
        <div className="legend-item">
          <div className="legend-box" style={{ background: '#222d3d', border: '1px solid #324056' }}></div>
          <span>Available</span>
        </div>
        <div className="legend-item">
          <div className="legend-box" style={{ background: 'var(--primary-red)' }}></div>
          <span>Selected</span>
        </div>
        <div className="legend-item">
          <div className="legend-box" style={{ background: '#171d26', border: '1px solid #1f2733' }}></div>
          <span>Booked</span>
        </div>
      </div>

      {/* Seat Sections */}
      <div style={{ maxWidth: '850px', margin: '0 auto' }}>
        {renderSeatTier('Balcony Section', balconyPrice, balconySeats, 'Balcony')}
        {renderSeatTier('Middle Section', middlePrice, middleSeats, 'Middle')}
        {renderSeatTier('Lower Section', lowerPrice, lowerSeats, 'Lower')}
      </div>

      {/* Sticky Bottom Bar */}
      <div
        style={{
          position: 'sticky',
          bottom: '20px',
          maxWidth: '850px',
          margin: '30px auto 0',
          background: '#171f2b',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ fontSize: '13px', color: '#94a3b8' }}>Selected Seats</div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff' }}>
            {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None selected'}
          </div>
        </div>

        <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div>
            <div style={{ fontSize: '13px', color: '#94a3b8' }}>Total Price</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary-red)' }}>
              ₹{calculateTotal()}
            </div>
          </div>

          <button
            onClick={handleProceedToPay}
            disabled={selectedSeats.length === 0}
            className="btn-pill-red"
            style={{
              opacity: selectedSeats.length === 0 ? 0.5 : 1,
              cursor: selectedSeats.length === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            Book Tickets
          </button>
        </div>
      </div>

      {/* Payment / Checkout Modal */}
      {showCheckoutModal && (
        <div className="modal-overlay" onClick={() => setShowCheckoutModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#ffffff' }}>
                Complete Payment
              </h3>
              <button
                onClick={() => setShowCheckoutModal(false)}
                style={{ background: 'none', color: '#94a3b8', fontSize: '22px' }}
              >
                <IoClose />
              </button>
            </div>

            {/* Booking Summary */}
            <div style={{ background: '#1c2533', padding: '16px', borderRadius: '8px', marginBottom: '20px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', marginBottom: '6px' }}>
                {show.movieName}
              </div>
              <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '4px' }}>
                {show.theatreName} Cinema | {show.showdate} - {show.showtime}
              </div>
              <div style={{ fontSize: '13.5px', color: '#ffffff', marginTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Seats: <strong>{selectedSeats.join(', ')}</strong></span>
                <span style={{ color: 'var(--primary-red)', fontWeight: 700 }}>₹{calculateTotal()}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <form onSubmit={handleConfirmBooking} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="form-select"
                >
                  <option value="Credit/Debit Card">Credit / Debit Card</option>
                  <option value="UPI / QR (PhonePe / GPay)">UPI / QR (PhonePe / GPay / Paytm)</option>
                  <option value="Net Banking">Net Banking</option>
                  <option value="Razorpay / Stripe">Razorpay / Stripe Gateway</option>
                </select>
              </div>

              {paymentMethod.includes('Card') && (
                <>
                  <div className="form-group">
                    <label className="form-label">Card Number</label>
                    <input
                      type="text"
                      placeholder="4111 2222 3333 4444"
                      defaultValue="4111 2222 3333 4444"
                      className="form-input"
                      required
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group">
                      <label className="form-label">Expiry</label>
                      <input type="text" placeholder="MM/YY" defaultValue="12/28" className="form-input" required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">CVV</label>
                      <input type="password" placeholder="•••" defaultValue="123" className="form-input" required />
                    </div>
                  </div>
                </>
              )}

              {paymentMethod.includes('UPI') && (
                <div className="form-group">
                  <label className="form-label">UPI ID</label>
                  <input
                    type="text"
                    placeholder="username@okhdfcbank"
                    defaultValue={`${user.email.split('@')[0]}@upi`}
                    className="form-input"
                    required
                  />
                </div>
              )}

              <button
                type="submit"
                className="btn-pill-red"
                style={{ width: '100%', marginTop: '8px', padding: '12px', fontSize: '15px' }}
                disabled={isProcessingPayment}
              >
                {isProcessingPayment ? 'Verifying & Confirming...' : `Pay ₹${calculateTotal()} & Confirm`}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeatsPage;
