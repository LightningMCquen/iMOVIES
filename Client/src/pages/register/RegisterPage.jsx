import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const isAdminParam = searchParams.get('admin') === 'true';

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(isAdminParam);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !email || !password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      const result = await register({
        username,
        email,
        password,
        role: isAdminMode ? 'admin' : 'user',
      });

      if (result.success) {
        toast.success(`Account created successfully! Welcome, ${username}!`);
        if (result.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/home');
        }
      } else {
        toast.error(result.message || 'Registration failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <span className="logo-i">i</span>
            <span className="logo-movies">Movies</span>
          </div>
          <h2 className="auth-title">
            {isAdminMode ? 'Admin Register' : 'Register'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              placeholder="Enter Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <label className="form-checkbox-label">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
            />
            <span>Show Password</span>
          </label>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </form>

        <div className="auth-footer">
          <div>
            Already have an account?
            <Link to="/login" className="auth-link-red">
              Login
            </Link>
          </div>

          <div>
            {!isAdminMode ? (
              <span>
                Register as an{' '}
                <button
                  type="button"
                  onClick={() => setIsAdminMode(true)}
                  className="auth-link-red"
                  style={{ background: 'none', border: 'none', padding: 0 }}
                >
                  Admin
                </button>
              </span>
            ) : (
              <span>
                Register as a{' '}
                <button
                  type="button"
                  onClick={() => setIsAdminMode(false)}
                  className="auth-link-red"
                  style={{ background: 'none', border: 'none', padding: 0 }}
                >
                  Standard User
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
