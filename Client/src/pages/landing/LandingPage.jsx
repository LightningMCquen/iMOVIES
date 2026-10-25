import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="landing-hero-container">
      <div className="landing-content">
        <h1 className="landing-title">
          Welcome to <span>iMovies</span>
        </h1>
        <p className="landing-subtitle">
          Your ultimate destination for the latest blockbusters and timeless classics
        </p>
        <div className="landing-btn-group">
          <Link to="/login" className="btn-pill-red">
            Sign In
          </Link>
          <Link to="/register" className="btn-pill-outline">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
