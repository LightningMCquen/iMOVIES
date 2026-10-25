import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  FiSun,
  FiMoon,
  FiHeart,
  FiLogOut,
  FiPlusCircle,
  FiFilm,
} from 'react-icons/fi';
import {
  IoHomeOutline,
  IoPersonCircleOutline,
  IoTimeOutline,
} from 'react-icons/io5';
import { FaTheaterMasks } from 'react-icons/fa';
import { TbMovie } from 'react-icons/tb';

const Header = ({ searchQuery, setSearchQuery, onSearchSubmit }) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearchSubmit) {
      onSearchSubmit();
    } else {
      navigate(`/home?search=${encodeURIComponent(searchQuery || '')}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isUserPage = location.pathname.startsWith('/home') ||
    location.pathname.startsWith('/movie') ||
    location.pathname.startsWith('/shows') ||
    location.pathname.startsWith('/seats') ||
    location.pathname.startsWith('/bookings') ||
    location.pathname.startsWith('/favorites') ||
    location.pathname.startsWith('/profile');

  const isAdminView = isAdmin && location.pathname.startsWith('/admin');

  return (
    <header className="navbar-container">
      <div className="navbar-content">
        {/* Logo */}
        <Link to={isAdmin ? "/admin" : (isAuthenticated ? "/home" : "/")} className="navbar-logo">
          <span className="logo-i">i</span>
          <span className="logo-movies">Movies</span>
        </Link>

        {/* Center Search Bar (shown on user movies/home pages) */}
        {!isAdminView && isUserPage && (
          <form className="navbar-search" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search movies by title, genre..."
              value={searchQuery || ''}
              onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-btn" title="Search">
              <span className="search-info-i">i</span>
            </button>
          </form>
        )}

        {/* Right Navigation Icons */}
        <div className="navbar-nav-links">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="nav-icon-btn"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <FiSun size={20} /> : <FiMoon size={20} />}
          </button>

          {/* Admin Navigation */}
          {isAdmin ? (
            <>
              {/* Home */}
              <Link to="/admin" className="nav-icon-btn" title="Admin Shows & Dashboard">
                <IoHomeOutline size={21} />
              </Link>

              {/* Admin Movies List (admin page 2.png) */}
              <Link to="/admin/movies" className="nav-icon-btn" title="Manage Movies">
                <TbMovie size={21} />
              </Link>

              {/* Add Dropdown (+) */}
              <div className="dropdown-container">
                <button
                  className="nav-icon-btn"
                  title="Add Movie / Show / Theatre"
                  onClick={() => setShowAddMenu(!showAddMenu)}
                >
                  <FiPlusCircle size={21} />
                </button>
                {showAddMenu && (
                  <div className="dropdown-menu" onClick={() => setShowAddMenu(false)}>
                    <Link to="/admin/add-movie" className="dropdown-item">
                      + Add Movie
                    </Link>
                    <Link to="/admin/add-show" className="dropdown-item">
                      + Add Show
                    </Link>
                    <Link to="/admin/add-theatre" className="dropdown-item">
                      + Add Theatre
                    </Link>
                  </div>
                )}
              </div>

              {/* Theatres */}
              <Link to="/admin/add-theatre" className="nav-icon-btn" title="Add / Manage Theatres">
                <FaTheaterMasks size={20} />
              </Link>

              {/* All Bookings */}
              <Link to="/admin/bookings" className="nav-icon-btn" title="All Bookings">
                <IoTimeOutline size={22} />
              </Link>

              {/* Switch to User View */}
              <Link to="/home" className="nav-pill-btn" title="View Customer Storefront">
                User View
              </Link>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="nav-icon-btn logout-btn"
                title="Log Out"
                aria-label="Logout"
              >
                <FiLogOut size={20} />
              </button>
            </>
          ) : isAuthenticated ? (
            /* User Navigation */
            <>
              <Link to="/home" className="nav-icon-btn" title="Home">
                <IoHomeOutline size={21} />
              </Link>

              <Link to="/favorites" className="nav-icon-btn" title="Favorites">
                <FiHeart size={21} />
              </Link>

              {/* Profile / Bookings Dropdown */}
              <div className="dropdown-container">
                <button
                  className="nav-icon-btn"
                  title="Profile & Bookings"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                >
                  <IoPersonCircleOutline size={24} />
                </button>
                {showProfileMenu && (
                  <div className="dropdown-menu" onClick={() => setShowProfileMenu(false)}>
                    <div className="dropdown-header">
                      <strong>{user?.username}</strong>
                      <span className="dropdown-email">{user?.email}</span>
                    </div>
                    <div className="dropdown-divider"></div>
                    <Link to="/bookings" className="dropdown-item">
                      Your Bookings
                    </Link>
                    <Link to="/favorites" className="dropdown-item">
                      Saved Favorites
                    </Link>
                    <Link to="/profile" className="dropdown-item">
                      My Profile
                    </Link>
                    <div className="dropdown-divider"></div>
                    <button onClick={handleLogout} className="dropdown-item text-danger">
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Guest Navigation */
            <div className="guest-links">
              <Link to="/login" className="btn-login-link">
                Sign In
              </Link>
              <Link to="/register" className="btn-register-link">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
