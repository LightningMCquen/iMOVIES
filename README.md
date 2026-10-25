# iMovies — Complete Movie Ticket Booking Application

A full-stack, production-ready Movie Ticket Booking Application built with **React.js (Vite)** on the frontend, **Node.js & Express.js** on the backend, and **MongoDB (Mongoose)** for persistence.

The user interface and workflows are built to match the reference screenshots and documentation in [`iMovies.md`](file:///c:/Users/naiti/OneDrive/Desktop/iMovies/iMovies.md).

---

## 🌟 Key Features

1. **Pixel-Perfect UI (Referenced from Screenshots)**:
   - **Landing Page** (`/`): Black background, "Welcome to iMovies", description, and pill-shaped "Sign In" (red) and "Sign Up" (outline) buttons (`Landing page.png`).
   - **Login Page** (`/login`): Red-bordered dark card, iMovies branding, Email & Password with "Show Password" toggle, red Submit button, and registration link (`Login page.png`).
   - **Register Page** (`/register`): Username, email, password, confirm password, and dual registration mode for Users and Administrators (`Register page.png`).
   - **Movie Storefront / Home** (`/home`): Movie cards grid with title, release date, red genre pills, favorite heart button, genre filter bar, and search bar with the red `i` button (`userproducts.png`).
   - **User Bookings History** (`/bookings`): Horizontal booking cards displaying movie poster, theatre, show date, show time, seat tiers & seat numbers, total price in ₹, e-ticket view, and cancellation options (`user orders.png`).
   - **Admin Shows & Dashboard** (`/admin`): Metrics bar (total movies, theatres, shows, bookings, revenue), active show schedules with delete action, and live bookings list (`Admin Dashboard.png`).
   - **Admin Movies Catalogue** (`/admin/movies`): Red "Available Movies" banner bar and movie cards with round delete buttons on the poster (`admin page 2.png`).
   - **Add Movie** (`/admin/add-movie`): Form matching `Admin movies 1.png` with poster preview, movie name, description, genres, release date, runtime, certification, and YouTube trailer.
   - **Add Show** (`/admin/add-show`): Form matching `add movies.png` with Theatres dropdown, Movies dropdown, Show Date, and Showtime.
   - **Add Theatre** (`/admin/add-theatre`): Form matching `Add theater.png` with Theatre name, location, and tiered seat pricing/capacities (Balcony, Middle, Lower).

2. **Real-time Seat Selection & Booking System**:
   - Visual screen indicator with tiered seat layout (Balcony, Middle, Lower).
   - Temporary seat locking (5-minute lock prevents double-booking).
   - Real-time price calculation based on selected seats.
   - Checkout modal with multiple payment methods (Card, UPI / QR, Net Banking, Gateway simulation).
   - Instant ticket generation with e-ticket view and printable boarding pass.

3. **Ratings, Reviews & Favorites Watchlist**:
   - Movie details popup with embedded YouTube trailer player.
   - Star rating and review submission.
   - Save / remove movies from favorites watchlist.

4. **Security & MVC Architecture**:
   - JWT authentication with secure password hashing (`bcryptjs`).
   - Role-based authorization (`UserProtection` and `AdminProtection` middleware).
   - Centralized error handling and input validation.
   - Dual-engine database support: Connects to local MongoDB/Atlas via `MONGODB_CONNECTION_LINK`, and automatically falls back to an embedded persistent database engine (`Server/data/`) for instant zero-config startup.

---

## 📁 Project Structure

```text
iMovies/
├── Client/                         # React frontend (Vite)
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── header/Header.jsx          # Top navbar matching user & admin views
│   │   │   ├── loader/Loader.jsx          # Suspense fallback spinner
│   │   │   ├── movieCard/MovieCard.jsx    # Movie card component
│   │   │   ├── movieDetails/MovieDetailsModal.jsx # Details, trailer, reviews
│   │   │   └── protection/Protection.jsx  # Route guards (User & Admin)
│   │   ├── context/
│   │   │   ├── AuthContext.jsx            # User authentication state
│   │   │   └── ThemeContext.jsx           # Dark / light theme toggle
│   │   ├── pages/
│   │   │   ├── landing/LandingPage.jsx    # Landing page (Landing page.png)
│   │   │   ├── login/LoginPage.jsx        # Login page (Login page.png)
│   │   │   ├── register/RegisterPage.jsx  # Register page (Register page.png)
│   │   │   ├── home/HomePage.jsx          # Available movies (userproducts.png)
│   │   │   ├── movieShows/MovieShowsPage.jsx # Shows for selected movie
│   │   │   ├── seatsPage/SeatsPage.jsx    # Real-time seat selection & booking
│   │   │   ├── bookings/UserBookingsPage.jsx # User bookings (user orders.png)
│   │   │   ├── favoriteshows/FavoritesPage.jsx # Favorites / watchlist
│   │   │   ├── profile/ProfilePage.jsx    # User profile & logout
│   │   │   ├── admin/AdminDashboard.jsx   # Admin shows (Admin Dashboard.png)
│   │   │   ├── admin/AdminMoviesPage.jsx  # Available movies banner (admin page 2.png)
│   │   │   ├── admin/AdminBookingsPage.jsx# Admin bookings management
│   │   │   ├── addMovie/AddMoviePage.jsx  # Add movie form (Admin movies 1.png)
│   │   │   ├── addShow/AddShowPage.jsx    # Add show form (add movies.png)
│   │   │   └── addTheatre/AddTheatrePage.jsx # Add theatre form (Add theater.png)
│   │   ├── services/
│   │   │   └── api.js                     # Axios instance with auth interceptor
│   │   ├── App.jsx                        # Lazy-loaded routes and layout
│   │   ├── main.jsx                       # Entry point
│   │   └── index.css                      # Complete styling matching screenshots
│   ├── package.json
│   └── vite.config.js
│
├── Server/                         # Express & Node.js backend
│   ├── middlewares/
│   │   └── fetchUser.js                   # JWT token & admin role verification
│   ├── models/
│   │   ├── userModel.js                   # User model
│   │   ├── adminModel.js                  # Admin model
│   │   ├── movieModel.js                  # Movie schema & model
│   │   ├── theatreModel.js                # Theatre schema & model
│   │   ├── showModel.js                   # Show schedule & seat locks
│   │   ├── bookingModel.js                # Booking & ticket records
│   │   ├── favoriteModel.js               # Watchlist / favorites
│   │   ├── reviewModel.js                 # Reviews & ratings
│   │   └── dbAdapter.js                   # Dual-engine MongoDB & persistent fallback
│   ├── routes/
│   │   ├── authRoutes.js                  # Register & login
│   │   ├── movieRoutes.js                 # Movies CRUD
│   │   ├── theatreRoutes.js               # Theatres CRUD
│   │   ├── showRoutes.js                  # Shows & seat locks
│   │   ├── bookingRoutes.js               # Bookings, payments, cancellations
│   │   ├── favoriteRoutes.js              # Favorites
│   │   ├── reviewRoutes.js                # Reviews
│   │   └── adminRoutes.js                 # Dashboard statistics
│   ├── utils/
│   │   ├── mailer.js                      # Email notification service
│   │   ├── cleanupService.js              # Seat-lock auto expiry
│   │   ├── reminderService.js             # Show reminder routine
│   │   └── seedData.js                    # Auto-seeds exact screenshot data
│   ├── data/                              # Persistent storage directory
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   ├── server.js                          # Express server entry point
│   └── test-workflows.js                  # 13-step end-to-end integration test suite
│
├── Output screenshots/                    # Reference screenshots
├── iMovies.md                             # Architectural documentation
└── README.md                              # Run instructions and project overview
```

---

## 🔑 Pre-Configured Demo Accounts

The database comes pre-seeded with initial movies, theatres, shows, and demo bookings:

| Role | Email | Password | Access |
|---|---|---|---|
| **Demo Customer** | `gvvdkumar@gmail.com` | `user123` | Browsing, seat booking, order history (`user orders.png`), reviews |
| **Administrator** | `admin@imovies.com` | `admin123` | Shows list, movies banner, adding movies/shows/theatres |

*(You can also register new customer or admin accounts anytime via the Register page!)*

---

## 🚀 Running the Application Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher; tested on v24.22)
- npm (v9 or higher)

*(MongoDB is optional: if you have local MongoDB or MongoDB Atlas running, set `MONGODB_CONNECTION_LINK` in `Server/.env`. Otherwise, the server automatically runs using its high-performance embedded storage engine with zero external setup required!)*

---

### Step 1: Start the Backend Server

Open a terminal at the project root and navigate to `Server`:

```bash
cd Server
npm install
node server.js
```

The backend server will start on:
👉 **`http://localhost:8000`** (API Base: `http://localhost:8000/api`)

---

### Step 2: Start the Frontend Client

Open a second terminal at the project root and navigate to `Client`:

```bash
cd Client
npm install
npm run dev
```

The Vite dev server will start on:
👉 **`http://localhost:5173`**

---

### Step 3: Open in Browser & Explore

1. Open `http://localhost:5173` in your browser.
2. Click **Sign In** and log in with `gvvdkumar@gmail.com` / `user123` (or click **Sign Up** to create an account).
3. Browse the movie catalogue on `/home`.
4. Click on **Og** or any other movie to view the trailer and movie details.
5. Click **Book Tickets** to view showtimes for theatres like **Srinivasa** or **Gokul**.
6. Select your seats in the Balcony, Middle, or Lower tier and click **Book Tickets**.
7. Complete payment in the modal and view your newly confirmed ticket in **Your Bookings** (`/bookings`)!
8. Click the user icon and log in as **`admin@imovies.com`** / **`admin123`** to access the Admin Dashboard (`/admin`), Available Movies with delete options (`/admin/movies`), Add Movie (`/admin/add-movie`), Add Show (`/admin/add-show`), and Add Theatre (`/admin/add-theatre`).

---

## 🧪 Running the Automated Integration Tests

To run the automated 13-step end-to-end test suite:

```bash
cd Server
node test-workflows.js
```

Test results output:
```text
==================================================
   iMovies Full System Integration Test Suite     
==================================================
✅ [PASS] Health Check API
✅ [PASS] User Login (gvvdkumar@gmail.com)
✅ [PASS] Admin Login (admin@imovies.com)
✅ [PASS] Fetched Catalogue: 10 movies
✅ [PASS] Fetched Shows for 'Og': 3 shows
✅ [PASS] Temporary Seat Lock (Seat 155)
✅ [PASS] Ticket Booked! Ref: BK199943
✅ [PASS] Booking Verified in User Orders History
✅ [PASS] Admin Dashboard Stats: 4 total bookings, ₹810 revenue
✅ [PASS] Admin Add Theatre (Prasads Multiplex)
✅ [PASS] Admin Add Show (Prasads Multiplex 7:00 PM)
✅ [PASS] Added to Favorites: Leo
✅ [PASS] Submit Rating & Review
==================================================
Results: 13 Passed, 0 Failed
==================================================
```
