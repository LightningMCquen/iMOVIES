import React, { Suspense, lazy, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/header/Header';
import Loader from './components/loader/Loader';
import { UserProtection, AdminProtection } from './components/protection/Protection';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Lazy loaded page components
const LandingPage = lazy(() => import('./pages/landing/LandingPage'));
const LoginPage = lazy(() => import('./pages/login/LoginPage'));
const RegisterPage = lazy(() => import('./pages/register/RegisterPage'));
const HomePage = lazy(() => import('./pages/home/HomePage'));
const MovieShowsPage = lazy(() => import('./pages/movieShows/MovieShowsPage'));
const SeatsPage = lazy(() => import('./pages/seatsPage/SeatsPage'));
const UserBookingsPage = lazy(() => import('./pages/bookings/UserBookingsPage'));
const FavoritesPage = lazy(() => import('./pages/favoriteshows/FavoritesPage'));
const ProfilePage = lazy(() => import('./pages/profile/ProfilePage'));

// Admin pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminMoviesPage = lazy(() => import('./pages/admin/AdminMoviesPage'));
const AddMoviePage = lazy(() => import('./pages/addMovie/AddMoviePage'));
const AddShowPage = lazy(() => import('./pages/addShow/AddShowPage'));
const AddTheatrePage = lazy(() => import('./pages/addTheatre/AddTheatrePage'));
const AdminBookingsPage = lazy(() => import('./pages/admin/AdminBookingsPage'));

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();

  // Hide global navbar only on plain landing page if desired, or keep everywhere
  const isLandingPage = location.pathname === '/';

  return (
    <div className="app-container">
      {!isLandingPage && (
        <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      )}

      <main className="main-content">
        <Suspense fallback={<Loader message="Loading page..." />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/home" element={<HomePage searchQuery={searchQuery} />} />
            <Route path="/shows/:movieName" element={<MovieShowsPage />} />
            <Route
              path="/seats/:showId"
              element={
                <UserProtection>
                  <SeatsPage />
                </UserProtection>
              }
            />
            <Route
              path="/bookings"
              element={
                <UserProtection>
                  <UserBookingsPage />
                </UserProtection>
              }
            />
            <Route
              path="/favorites"
              element={
                <UserProtection>
                  <FavoritesPage />
                </UserProtection>
              }
            />
            <Route
              path="/profile"
              element={
                <UserProtection>
                  <ProfilePage />
                </UserProtection>
              }
            />

            {/* Admin Protected Routes */}
            <Route
              path="/admin"
              element={
                <AdminProtection>
                  <AdminDashboard />
                </AdminProtection>
              }
            />
            <Route
              path="/admin/movies"
              element={
                <AdminProtection>
                  <AdminMoviesPage />
                </AdminProtection>
              }
            />
            <Route
              path="/admin/add-movie"
              element={
                <AdminProtection>
                  <AddMoviePage />
                </AdminProtection>
              }
            />
            <Route
              path="/admin/add-show"
              element={
                <AdminProtection>
                  <AddShowPage />
                </AdminProtection>
              }
            />
            <Route
              path="/admin/add-theatre"
              element={
                <AdminProtection>
                  <AddTheatrePage />
                </AdminProtection>
              }
            />
            <Route
              path="/admin/bookings"
              element={
                <AdminProtection>
                  <AdminBookingsPage />
                </AdminProtection>
              }
            />

            {/* Fallback to home */}
            <Route path="*" element={<HomePage searchQuery={searchQuery} />} />
          </Routes>
        </Suspense>
      </main>

      <ToastContainer
        position="bottom-right"
        autoClose={3500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
}

export default App;
