import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { IoPersonCircleOutline, IoTicketOutline, IoHeartOutline, IoLogOutOutline } from 'react-icons/io5';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="main-page-container">
      <h1 className="page-main-heading">
        User <span>Profile</span>
      </h1>

      <div
        style={{
          maxWidth: '520px',
          margin: '0 auto',
          background: '#171f2b',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '32px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          textAlign: 'center',
        }}
      >
        <div style={{ color: 'var(--primary-red)', marginBottom: '16px' }}>
          <IoPersonCircleOutline size={80} />
        </div>

        <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#ffffff', marginBottom: '6px' }}>
          {user?.username}
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '20px' }}>
          {user?.email}
        </p>

        <div style={{ display: 'inline-block', background: 'rgba(229, 9, 20, 0.15)', color: 'var(--primary-red)', padding: '4px 14px', borderRadius: '16px', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '28px' }}>
          Account Role: {user?.role || 'User'}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
          <button
            onClick={() => navigate('/bookings')}
            style={{
              background: '#202937',
              color: '#ffffff',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '12px 18px',
              fontSize: '14px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              transition: 'all 0.2s',
            }}
          >
            <IoTicketOutline color="var(--primary-red)" size={20} />
            View Your Bookings
          </button>

          <button
            onClick={() => navigate('/favorites')}
            style={{
              background: '#202937',
              color: '#ffffff',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '12px 18px',
              fontSize: '14px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              transition: 'all 0.2s',
            }}
          >
            <IoHeartOutline color="var(--primary-red)" size={20} />
            Saved Watchlist / Favorites
          </button>

          {user?.role === 'admin' && (
            <button
              onClick={() => navigate('/admin')}
              style={{
                background: 'rgba(229, 9, 20, 0.1)',
                color: 'var(--primary-red)',
                border: '1px solid var(--primary-red)',
                borderRadius: '8px',
                padding: '12px 18px',
                fontSize: '14px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              Go to Admin Dashboard
            </button>
          )}

          <button
            onClick={handleLogout}
            style={{
              background: 'transparent',
              color: '#ef4444',
              border: '1px solid #ef4444',
              borderRadius: '8px',
              padding: '12px 18px',
              fontSize: '14px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '12px',
            }}
          >
            <IoLogOutOutline size={18} /> Log Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
