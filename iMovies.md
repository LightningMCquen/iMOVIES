# iMovies — Movie Ticket Booking System

## 1. Project Architecture

### 1.1 Technical Architecture

The iMovies application follows a client–server architecture designed to provide a secure, responsive, and scalable movie-ticket-booking experience. Its major layers are the frontend, backend, database, payment integration, real-time seat management, notifications, and deployment infrastructure.

#### 1.1.1 Frontend Layer (Client)

**Purpose:** Provide an intuitive, responsive interface for customers and administrators.

**Suggested technologies**
- React.js with Vite for the user interface
- Tailwind CSS or Bootstrap for responsive styling
- React Router for page navigation
- Axios or Fetch API for REST API communication
- Secure cookie-based authentication for session/token handling
- Socket.IO/WebSockets for live seat availability and booking updates (optional)

**Key modules**
- User registration, login, and logout
- Movie browsing, searching, filtering, and movie details
- Theater, location, date, and showtime selection
- Seat layout, availability, and selection
- Booking review, confirmation, cancellation, and history
- Payment status and e-ticket display
- User profile, favorites, and watchlist
- Ratings and reviews
- Admin dashboard

#### 1.1.2 Backend Layer (Server)

**Purpose:** Implement business rules, authenticate and authorize requests, coordinate database operations, and integrate with external services.

**Suggested technologies**
- Node.js and Express.js for REST APIs
- JWT-based authentication where appropriate
- `bcrypt` for password hashing
- Mongoose ODM for MongoDB access
- Socket.IO for real-time seat updates (optional)
- Input validation using a schema-validation library

**Core services**
- **Authentication Service:** Registration, login, password verification, and token/session management
- **User Service:** Profile, preferences, favorites, and watch history
- **Movie Service:** Movie catalogue and movie metadata
- **Theater Service:** Theater, screen, and location management
- **Show Service:** Show schedules, pricing, and availability
- **Seat Management Service:** Temporary seat locks and confirmed seat reservations
- **Booking Service:** Booking creation, confirmation, cancellation, and applicable refund workflows
- **Payment Service:** Payment-provider integration and payment-status verification
- **Notification Service:** Booking confirmations, receipts, and reminders by email/SMS where configured
- **Review Service:** Ratings, reviews, and moderation
- **Admin Service:** Authorized administration and reporting

#### 1.1.3 Database Layer

**Purpose:** Persist application data and support reliable querying.

**Technology:** MongoDB, using Mongoose schemas and indexes.

**Main collections**
- **Users:** Account credentials (hashed), profile, contact details, preferences, and role
- **Admins:** Prefer an admin role/permission model associated with an account rather than duplicating user credentials
- **Movies:** Title, description, genre, language, duration, cast, certification, poster, rating, and release date
- **Theaters:** Name, location, screens, and seat configuration
- **Shows:** Movie, theater/screen, date, time, pricing, and status
- **Seats / SeatLocks:** Seat layout and temporary reservation state, scoped to a specific show
- **Bookings:** User, show, selected seats, booking status, amount, and timestamps
- **Payments:** Provider reference, amount, currency, transaction status, and booking reference
- **Favorites:** User-to-movie saved items
- **Reviews:** User, movie, rating, comment, and timestamps

> **Data integrity note:** Seat availability must be scoped to a specific show, not only to a theater or movie. Enforce booking and seat-lock consistency on the server to prevent two customers from purchasing the same seat.

#### 1.1.4 Payment Gateway Integration

**Purpose:** Process online payments without treating a frontend success message as proof of payment.

**Possible providers:** Razorpay, Stripe, or PayPal, depending on deployment region and business requirements.

**Payment flow**
1. The customer reviews the booking and selects a payment method.
2. The frontend requests a payment order/session from the backend.
3. The backend creates the order with the configured payment provider.
4. The provider processes the payment.
5. The backend verifies the provider response or signed webhook.
6. The booking is confirmed only after verified payment success and a successful seat-reservation check.
7. The system records the transaction and sends a confirmation notification.

Never store raw card details in the application database. Keep provider secrets on the server in environment variables.

#### 1.1.5 Real-Time Seat Management

**Purpose:** Reduce double-booking and communicate seat availability changes.

**Recommended flow**
1. A customer selects seats for a particular show.
2. The backend validates availability and creates a short-lived seat lock.
3. Other users receive an availability update through Socket.IO/WebSockets, if enabled.
4. After verified payment, the backend atomically confirms the booking and marks those seats as booked.
5. If the payment fails, is cancelled, or the lock expires, the system releases the temporary lock according to the payment and booking state.

Use database transactions or another atomic consistency strategy where supported. A TTL index can help expire lock records, but application logic must still validate expiry and booking status.

#### 1.1.6 Notification Service

The notification service sends booking confirmations, e-tickets, receipts, cancellation updates, and reminders. Email can be integrated through an SMTP provider; SMS or push notifications can be added when credentials and provider configuration are available. Notifications should not expose secrets or sensitive payment data.

#### 1.1.7 Deployment and Infrastructure

**Possible deployment options**
- **Frontend:** Vercel, Netlify, or AWS S3 with CloudFront
- **Backend:** Render, AWS, or another Node.js-compatible hosting provider
- **Database:** MongoDB Atlas or a suitably managed MongoDB deployment
- **CI/CD:** GitHub Actions or GitLab CI
- **Monitoring:** Structured logs, health checks, error tracking (such as Sentry), and process monitoring where appropriate

Choose providers according to budget, regional availability, reliability, and project requirements.

#### 1.1.8 Security Requirements

- Use HTTPS in deployed environments.
- Validate and sanitize untrusted input on the server.
- Hash passwords with `bcrypt` or an equivalent password-hashing algorithm.
- Enforce authentication and role-based authorization for protected endpoints.
- Apply rate limits to login and other abuse-sensitive routes.
- Configure CORS narrowly for trusted frontend origins.
- Keep API keys, database credentials, JWT secrets, and payment-provider secrets in environment variables or a secrets manager.
- Use secure, `HttpOnly`, `SameSite` cookies when cookie-based sessions/tokens are chosen; protect against CSRF where applicable.
- Never trust client-submitted prices, payment status, seat availability, or admin roles.
- Avoid logging passwords, tokens, payment secrets, or unnecessary personal data.

---

### 1.2 Entity-Relationship (ER) Diagram

The iMovies database is organized around the following core entities: **User, Admin/Role, Movie, Theater, Show, Seat, Booking, Payment, Favorite, and Review**. The exact schema may evolve during implementation, but relationships and identifiers should remain explicit.

#### Entities and principal attributes

| Entity | Example attributes |
|---|---|
| User | `userId`, `name`, `email`, `phone`, `passwordHash`, `role`, `createdAt` |
| Admin / Role | `roleId`, `roleName`, `permissions` (or a role field on User) |
| Movie | `movieId`, `title`, `description`, `genre`, `language`, `duration`, `cast`, `certification`, `releaseDate`, `posterUrl` |
| Theater | `theaterId`, `name`, `location`, `screens` |
| Show | `showId`, `movieId`, `theaterId`, `screenId`, `showDate`, `showTime`, `ticketPrice`, `status` |
| Seat | `seatId`, `screenId`, `row`, `seatNumber`, `seatType` |
| Show Seat State | `showId`, `seatId`, `status`, `lockExpiresAt`, `bookingId` |
| Booking | `bookingId`, `userId`, `showId`, `seatIds`, `bookingStatus`, `totalAmount`, `createdAt` |
| Payment | `paymentId`, `bookingId`, `provider`, `providerReference`, `amount`, `currency`, `paymentStatus`, `paidAt` |
| Favorite | `favoriteId`, `userId`, `movieId`, `createdAt` |
| Review | `reviewId`, `userId`, `movieId`, `rating`, `comment`, `createdAt` |

#### Relationships

- One **User** can create many **Bookings**.
- One **Movie** can have many **Shows**.
- One **Theater** can host many **Shows**.
- One **Show** has many seat states; seat availability is tracked per show.
- One **Booking** belongs to one **User** and one **Show**, and includes one or more selected seats.
- A **Booking** can have one or more payment attempts, depending on the payment design.
- A **User** can favorite many **Movies**, and a **Movie** can be favorited by many users.
- A **User** can write many **Reviews**, and a **Movie** can receive many reviews.
- **Admins** manage movies, theaters, shows, bookings, and moderation through role-protected operations.

For implementation, use references between MongoDB documents where appropriate, add indexes for frequently queried fields, and enforce uniqueness where required (for example, email and a user's favorite relationship). The ER diagram supplied with the project can be used as a visual reference; update it to reflect the final implemented schema.

---

### 1.3 Features

1. **User registration and authentication:** Create accounts, log in and out securely, and protect authenticated operations.
2. **Movie catalogue:** Browse movie posters and details including title, genre, language, duration, ratings, cast, and release date.
3. **Search and filters:** Search by title and filter by genre, language, rating, location, or date where supported.
4. **Theater and show management:** Let authorized administrators manage theaters, screens, show schedules, and prices.
5. **Seat selection and availability:** Display a show-specific seat layout and current availability.
6. **Ticket booking:** Create, confirm, cancel, and view bookings according to the booking policy.
7. **Secure payments:** Integrate a supported payment provider and record verified payment outcomes.
8. **E-tickets:** Generate a booking confirmation with a booking reference and ticket details.
9. **Watchlist and favorites:** Save movies for later.
10. **Reviews and ratings:** Let eligible users rate and review movies, with moderation controls.
11. **Admin dashboard:** Manage catalogue data, shows, theaters, bookings, users, and reports.
12. **Notifications:** Send booking confirmations, receipts, and relevant reminders through configured channels.
13. **Booking history:** View past and upcoming bookings and their current status.
14. **Error handling and observability:** Return consistent API errors, maintain useful logs, and expose health checks.

---

### 1.4 Roles and Responsibilities

#### User / Customer

- Register, log in, and manage account details.
- Browse, search, and filter movies.
- View theater details and showtimes.
- Check seat availability and select seats.
- Review booking details and complete payment.
- Access tickets and booking history.
- Cancel or request changes to a booking when policy permits.
- Maintain a favorites list.
- Submit ratings and reviews.

#### Admin

- Manage movie information, posters, and metadata.
- Manage theaters, screens, shows, and ticket prices.
- Monitor bookings, payment states, and seat availability.
- Manage user access and handle booking-related issues.
- Review operational reports and revenue summaries.
- Moderate reviews and maintain platform integrity.

**Authorization rule:** Admin-only operations must be enforced by backend middleware or equivalent server-side authorization, not merely by hiding controls in the frontend.

---

### 1.5 User Flow

#### Customer Flow

1. The customer registers or logs in.
2. The customer browses, searches, or filters the movie catalogue.
3. The customer selects a movie.
4. The customer chooses a theater, date, and showtime.
5. The system loads the seat layout and current availability for that show.
6. The customer selects seats.
7. The backend validates availability and temporarily locks the selected seats.
8. The customer reviews the seats, price, and booking details.
9. The customer confirms and proceeds to payment.
10. The payment provider processes the transaction.
11. The backend verifies payment and confirms the booking only if the reservation is still valid.
12. The system displays the booking confirmation and generates ticket details.
13. A confirmation notification is sent through configured channels.
14. The customer can view booking history and, where permitted, cancel a booking or submit a review.

#### Payment Failure Flow

1. The payment fails, is cancelled, or cannot be verified.
2. The system keeps the booking in an appropriate pending/failed state.
3. The backend applies the configured retry and seat-lock policy.
4. Seats are released when it is safe to do so.
5. The customer can retry payment or choose another method.

#### Admin Flow

1. The admin signs in to the protected dashboard.
2. The admin creates or updates movies, theaters, screens, and show schedules.
3. The admin monitors bookings and payment statuses.
4. The admin reviews reports and handles customer issues.
5. The admin moderates reviews and updates catalogue information as needed.

#### Main System Relationships

- `Movie → Show → Show Seat State`
- `Theater → Show`
- `Screen → Seat`
- `User → Booking → Payment`
- `Booking → Show`
- `Booking → Seat reservations`
- `User → Favorite → Movie`
- `User → Review → Movie`
- `Admin → Movie / Theater / Show Management`

---

### 1.6 MVC Pattern

The iMovies backend uses the **Model–View–Controller (MVC)** pattern to separate data access, request handling, and API routing. In a REST API, the “View” is generally represented by the HTTP response contract rather than server-rendered pages; routes map HTTP requests to controller functions.

#### Model Layer

- Defines Mongoose schemas and document relationships.
- Performs database reads and writes.
- Applies schema-level validation and indexes.
- Examples: `User`, `Movie`, `Theater`, `Show`, `Seat`, `Booking`, `Payment`, `Favorite`, and `Review`.

#### View / API Response Layer

- Defines the response structure returned to the frontend.
- Uses consistent JSON formats and appropriate HTTP status codes.
- Keeps presentation concerns in the frontend for a REST-based application.
- Avoids embedding business rules directly in route definitions.

#### Controller Layer

- Receives validated request data from routes and middleware.
- Coordinates the required business operations.
- Calls service/model functions and handles success or failure responses.
- Examples: `authController`, `movieController`, `showController`, `bookingController`, `paymentController`, and `reviewController`.

#### Recommended Service and Middleware Layers

For a maintainable project, add supporting layers around MVC:

- **Routes:** Map endpoints to middleware and controllers.
- **Middleware:** Authentication, authorization, validation, rate limiting, and centralized error handling.
- **Services:** Hold business rules such as seat locking, booking confirmation, payment verification, and notification delivery.
- **Repositories / Models:** Encapsulate database access where useful.
- **Utilities:** Shared helpers such as logging, ticket generation, and response formatting.

#### Example Request Lifecycle

1. A client sends an HTTP request to an API endpoint.
2. The route matches the endpoint and applies required middleware.
3. Middleware authenticates the request and validates its input.
4. The controller invokes the appropriate service.
5. The service applies business rules and calls models to access MongoDB.
6. The controller returns a consistent JSON response with the appropriate status code.
7. Centralized error middleware handles unexpected errors without exposing internal details.

#### Benefits of MVC

- **Separation of concerns:** Each layer has a clear responsibility.
- **Maintainability:** Changes are easier to isolate and review.
- **Scalability:** New modules can be added without placing all logic in routes.
- **Reusability:** Services and model operations can be reused.
- **Testability:** Controllers, services, and models can be tested independently.
- **Team collaboration:** Developers can work on distinct modules with clearer boundaries.

---

## 2. Project Setup and Configuration

This section describes how to create the iMovies project structure and initialize the React client and Node.js server.

### 2.1 Creating the Project Folder

1. Create a new folder named `iMovies` (or use your preferred project name).
2. Inside the project folder, create two folders:
   - `Client` — the React frontend
   - `Server` — the Node.js/Express backend
3. Open the main `iMovies` folder in Visual Studio Code.

The initial folder structure should look like this:

```text
iMovies/
├── Client/
└── Server/
```

### 2.2 Client Setup

**Description:** Set up the React frontend using Vite.

1. Open the `Client` folder's terminal in VS Code. If the terminal is at the project root instead, run `cd Client` first.
2. Create the React application using Vite:

```bash
npm create vite@latest . -- --template react
```

3. If the setup wizard asks for a framework, select **React**. If it asks for a variant, select **JavaScript**.
4. Install dependencies:

```bash
npm install
```

5. Start the development server:

```bash
npm run dev
```

6. Open the local URL printed in the terminal (Vite commonly uses `http://localhost:5173`).

> **Note:** Because the command above initializes Vite inside the current `Client` folder, do not run `cd client` afterward. If you are at the project root, enter the folder with `cd Client` before running the Vite command and installing packages. Folder-name capitalization matters on Linux.

### 2.3 Server Setup

**Description:** Initialize the Node.js backend in the `Server` folder.

1. Open the `Server` folder's terminal in VS Code. If you are at the project root, run:

```bash
cd Server
```

2. Initialize a Node.js project:

```bash
npm init -y
```

3. Create the main server file:

```text
server.js
```

4. Create the following folders for organizing backend code:

```text
models/
controllers/
routes/
```

The server folder should initially look like this:

```text
Server/
├── controllers/
├── models/
├── routes/
├── server.js
└── package.json
```

These folders have the following responsibilities:

- **`models/`** — Mongoose schemas and database-related models.
- **`controllers/`** — request handling and coordination of application operations.
- **`routes/`** — API endpoint definitions that connect requests to controller functions.
- **`server.js`** — backend entry point, where the Express application and middleware can be configured.

> **Next setup step:** The server still needs its required dependencies, environment configuration, database connection, and start scripts before it can run. Install and configure these according to the implementation plan and the project's actual requirements.

---

## 3. Architecture Diagram References

The project reference images illustrate these concepts:

1. **Service architecture:** Frontend, API gateway, movie service, notification service, database, and external movie/email APIs.
2. **ER diagram:** User, Admin, Movie, Show, Theater, Booking, Favorite, and related attributes.
3. **User flow diagram:** Registration through movie selection, seat selection, payment, booking confirmation, notifications, history, and reviews.
4. **MVC diagram:** User request, routes/view, controller, models, and database operations.

Treat these images as conceptual references, not as proof that every depicted service has already been implemented. Keep the diagrams aligned with the actual code and final database schema.

---

## 3. Backend Development

### 3.1 Backend Structure

The supplied backend screenshot shows an existing Node.js/Express backend organized into middleware, models, routes, utilities, environment configuration, and a server entry point. The structure below reflects that project layout.

```text
backend/
├── middlewares/
│   └── fetchUser.js
├── models/
│   ├── adminModel.js
│   ├── bookingModel.js
│   ├── favoriteModel.js
│   ├── movieModel.js
│   ├── reviewModel.js
│   ├── showModel.js
│   ├── theatreModel.js
│   └── userModel.js
├── routes/
│   ├── adminRoutes.js
│   ├── authRoutes.js
│   ├── bookingRoutes.js
│   ├── favoriteRoutes.js
│   ├── movieRoutes.js
│   ├── reviewRoutes.js
│   ├── showRoutes.js
│   └── theatreRoutes.js
├── utils/
│   ├── mailer.js
│   ├── reminderService.js
│   └── cleanupService.js
├── .env
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── server.js
```

The screenshot also shows `node_modules/` and several PDF/query files. `node_modules/` is generated by npm and should not be committed. Keep project reports in a documentation folder (for example, `docs/`) rather than mixing them with application code.

**Directory responsibilities**
- **`middlewares/`** — shared request middleware, such as authentication and authorization.
- **`models/`** — Mongoose schemas and database models.
- **`routes/`** — Express API route definitions.
- **`utils/`** — shared services and helpers, such as email delivery and scheduled cleanup.
- **`.env`** — local secrets and configuration; do not commit this file.
- **`.env.example`** — safe list of required environment variable names with placeholder values.
- **`server.js`** — configures Express, middleware, routes, database startup, and server lifecycle.

### 3.2 Backend Development and Description

#### 3.2.1 Set Up the Express Server

1. Open the backend folder in the VS Code terminal.
2. Initialize the Node.js project if it has not already been initialized:

```bash
npm init -y
```

3. Install the core dependencies (only install packages that the project does not already have):

```bash
npm install express mongoose dotenv cors
```

4. Create or maintain the server entry file. The supplied project screenshot uses `server.js`; use that as the entry point unless the project has already standardized on `index.js`. Avoid maintaining two competing entry files.
5. Create a `.env` file for configuration, for example:

```dotenv
PORT=3000
MONGODB_CONNECTION_LINK=mongodb://127.0.0.1:27017/Imovies
```

6. Configure Express middleware, including CORS and JSON body parsing. Express has built-in JSON parsing through `express.json()`, so a separate `body-parser` package is generally not required for JSON requests.
7. Start listening only after the database connection succeeds. This prevents the API from accepting requests while its database is unavailable.

Example startup outline:

```js
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Mount route files here, for example:
// app.use("/api/auth", authRoutes);
// app.use("/api/movies", movieRoutes);

const PORT = process.env.PORT || 3000;

// Connect to MongoDB before calling app.listen(...).
```

Configure CORS with the frontend's trusted origin in production instead of allowing every origin indiscriminately. The full connection pattern is documented in Section 4.2.

#### 3.2.2 User Authentication

- Implement registration, login, and logout/session invalidation according to the chosen authentication design.
- Hash passwords before saving them; never store plaintext passwords.
- Validate request bodies and return consistent errors for invalid credentials or duplicate accounts.
- Add authentication middleware to protected routes.
- Add role-based authorization for admin-only routes.
- Keep secrets in environment variables and never return password hashes or tokens unnecessarily in API responses.

The existing screenshot includes `middlewares/fetchUser.js`, which appears intended to identify the authenticated user. Verify that it validates the credential securely and handles missing, invalid, or expired tokens before relying on it.

#### 3.2.3 Define API Routes

Create separate route files for the major application areas, matching the existing project structure:

- `authRoutes.js` — registration and login
- `movieRoutes.js` — movie catalogue and movie details
- `theatreRoutes.js` — theater management
- `showRoutes.js` — showtimes and show-specific availability
- `bookingRoutes.js` — booking creation, retrieval, and cancellation
- `favoriteRoutes.js` — favorites/watchlist
- `reviewRoutes.js` — ratings and reviews
- `adminRoutes.js` — authorized administration

Route handlers should validate inputs and call controllers or services rather than placing all business logic directly in route files. Use consistent URL conventions and HTTP status codes.

#### 3.2.4 Implement Data Models and CRUD Operations

Define Mongoose schemas and models for the entities described in the ER section, including users, admins/roles, movies, theaters, shows, bookings, favorites, and reviews. Add payment records and show-specific seat reservation state where required by the implemented features.

Implement the required Create, Read, Update, and Delete operations, applying authorization and validation to every operation. Do not allow clients to set trusted fields such as payment status, admin role, or final booking status without server-side verification.

#### 3.2.5 Error Handling

- Add centralized Express error-handling middleware.
- Return an appropriate HTTP status code and a consistent JSON error structure.
- Distinguish validation errors, authentication failures, authorization failures, missing resources, conflicts, and unexpected server errors.
- Log useful diagnostic details on the server without exposing stack traces, secrets, or internal implementation details to clients.
- Handle rejected asynchronous route operations and database errors.
- Add health checks and useful startup/shutdown logging.

---

## 4. Database Development

### 4.1 Configure MongoDB

iMovies uses MongoDB as its document database and Mongoose as its Object Data Modeling (ODM) library.

From the backend project directory, install Mongoose if it is not already present:

```bash
npm install mongoose
```

Then:

1. Ensure MongoDB is installed locally or that a MongoDB Atlas cluster is available.
2. Store the database URI in the backend `.env` file.
3. Create the database connection before starting the HTTP server.
4. Define Mongoose schemas and models for the entities in the ER diagram.
5. Add indexes and constraints where appropriate, and validate data at the API and schema levels.

Example environment variable:

```dotenv
MONGODB_CONNECTION_LINK=mongodb://127.0.0.1:27017/Imovies
```

For a hosted database, use the provider's connection string instead. Keep credentials private and URL-encode special characters in credentials when required by the connection URI format.

### 4.2 Create the Database Connection

**Description:** The application should establish a successful database connection before accepting API requests that depend on MongoDB.

#### Example connection code

```js
const mongoose = require("mongoose");

const mongoUri = process.env.MONGODB_CONNECTION_LINK;

async function connectToMongo() {
  if (!mongoUri) {
    throw new Error("MONGODB_CONNECTION_LINK is not configured");
  }

  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB");
}

module.exports = connectToMongo;
```

Load environment variables before calling this function, for example with `require("dotenv").config()` in the server entry point. Start the HTTP server only after `connectToMongo()` resolves; if the initial connection fails, log the error and exit with a failure status so the deployment environment can restart or report the service.

#### Connection string explained

Example:

```text
mongodb://127.0.0.1:27017/Imovies
```

- **`mongodb://`** — MongoDB connection URI scheme.
- **`127.0.0.1`** — the local machine. Use this only when MongoDB is running on the same machine as the backend.
- **`27017`** — MongoDB's default port.
- **`Imovies`** — the database name. MongoDB typically creates the database when data is first written.

Older examples may include `useNewUrlParser: true` and `useUnifiedTopology: true`. These options are no longer needed with current MongoDB Node.js drivers and current Mongoose versions; follow the documentation for the version installed in this project.

A connection error should be handled clearly. Check that MongoDB is running, the URI is correct, network access is allowed, and any required Atlas IP access rules and credentials are configured. Avoid repeatedly starting multiple connection attempts without coordinating them with the application's shutdown/reconnection strategy.

### 4.3 Create Schemas and Models

**Description:** Create Mongoose schemas based on the ER diagram and the fields required by the application. The screenshots supplied with the project are reference examples for the user, admin, movie, booking, theater, and show models.

#### 4.3.1 User Schema

The user model should contain the fields needed for account identity and profile management, such as:

- Username or display name
- Email address (required and unique)
- Password hash (required; never store the plaintext password)
- Optional contact/profile fields
- Role or permissions, if user and admin accounts share one model
- Creation and update timestamps

Validate email format and normalize it consistently. Enforce uniqueness at the database index level as well as handling duplicate-key errors in the API.

#### 4.3.2 Admin Schema

The supplied admin-model screenshot shows `username`, `email`, and `password` fields. If a separate admin model is retained, it should follow the same password-hashing and validation requirements as the user model. For many applications, a shared account model with explicit roles and server-side authorization is simpler and avoids duplicate authentication logic.

#### 4.3.3 Movie Schema

The supplied movie-model screenshot includes fields such as:

- `movieName` — required movie title
- `description` — required description
- `genres` — one or more genres
- `releaseDate` — a valid date
- Additional movie metadata as needed, such as language, duration, cast, certification, poster URL, and rating

Use Mongoose validation for required fields, string length, data types, and allowed values. Validate dates as valid dates rather than accepting arbitrary strings.

#### 4.3.4 Booking Schema

The supplied booking-model screenshot includes:

- `bookingId`
- `userEmail`
- `showId`
- `ticketsData`

The screenshot appears to use `requires: true` for `ticketsData`; in Mongoose, the correct option is `required: true`. In the final schema, prefer references to `userId` and `showId` where practical, and store the selected seat identifiers, total amount, booking status, and timestamps. Calculate the amount on the server from trusted show pricing rather than accepting a client-supplied total.

#### 4.3.5 Theater Schema

The supplied theater-model screenshot includes fields such as:

- `theatreName`
- `theatreId`
- `location`
- `balconySeatPrice`
- `middleSeatPrice`
- `lowerSeatPrice`
- `balconySeats`
- `middleSeats`
- `lowerSeats`

Validate seat counts and prices with suitable numeric constraints. For a more flexible design, model screens and seat definitions separately, and track the status of each seat for each show. This avoids treating a theater's permanent seat layout as the same thing as real-time show availability.

#### 4.3.6 Show Schema

The supplied show-model screenshot includes:

- `adminEmail`
- `showId`
- `movieId`
- `theatreName`
- `showdate`
- `showtime`
- `tickets`

Prefer references to movie and theater/screen documents where possible, with a valid date/time representation and show-specific pricing or availability data. If the current project relies on string identifiers, validate them consistently and plan any schema migration before changing the format.

#### Schema Implementation Checklist

- Keep model names and filenames consistent.
- Use `required`, type validation, length limits, and allowed-value validation where appropriate.
- Add `timestamps: true` where creation/update times are useful.
- Define indexes for commonly searched fields and enforce unique identifiers where needed.
- Hash passwords before saving and never expose password hashes in normal API responses.
- Keep booking/payment status changes on the backend.
- Test valid records, missing required fields, duplicate values, and invalid data.

## 5. Implementation Notes

- Confirm the repository's existing framework and package versions before changing the stack.
- Keep configuration in environment variables and provide a safe `.env.example` containing placeholders only.
- Never commit real credentials, tokens, or payment secrets.
- Use consistent API response and error formats.
- Validate all important business rules on the server.
- Test authentication, authorization, seat-lock expiry, concurrent booking attempts, payment verification, and failure recovery.
- Document setup commands, environment variables, migrations/seed steps if applicable, and deployment requirements.

---

## 5. Frontend Development

### 5.1 Frontend Structure

The iMovies frontend is built with React and Vite. The structure shown in the supplied screenshots includes a `frontend` application with route-level pages, reusable UI components, hooks, styles, and shared utilities. The exact folder names may vary as the project evolves.

A recommended structure is:

```text
frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── header/
│   │   ├── footer/
│   │   ├── loader/
│   │   └── protection/
│   ├── hooks/
│   ├── pages/
│   │   ├── landing/
│   │   ├── home/
│   │   ├── login/
│   │   ├── register/
│   │   ├── movieDetails/
│   │   ├── movieShows/
│   │   ├── seatsPage/
│   │   ├── bookings/
│   │   ├── profile/
│   │   ├── favoriteshows/
│   │   ├── addMovie/
│   │   ├── addShow/
│   │   ├── addTheatre/
│   │   ├── admin/
│   │   └── adminBookings/
│   ├── services/
│   ├── assets/
│   ├── App.jsx
│   ├── main.jsx
│   └── style.scss
├── package.json
└── vite.config.js
```

This is a recommended organization based on the supplied screenshots, not a claim that every listed directory already exists in the project.

### 5.2 Development and Explanation

#### 1. Install the Required Tools and Libraries

The frontend uses React and Vite. The screenshots show dependencies including React Router, Axios, React Toastify, React Icons, Sass, Chart.js, and UI/animation libraries. Depending on the pages being implemented, the project may also use Bootstrap, Material UI, Ant Design (`antd`), `react-bootstrap`, or `mdb-react-ui-kit`.

Create a React app with Vite:

```bash
npm create vite@latest frontend -- --template react
cd frontend
npm install
```

Install routing, API, and UI packages as needed:

```bash
npm install react-router-dom axios react-toastify react-icons
npm install bootstrap react-bootstrap
```

Install any additional UI libraries only if the project uses them. For example, Material UI, Ant Design, and MDB React UI Kit are alternatives; installing all component libraries is not necessary.

#### 2. Configure Routing

Use `react-router-dom` to define navigation between pages such as:

- `/` — landing or home page
- `/login` — user login
- `/register` — user registration
- `/movies` — movie listings
- `/movie/:movieId` — movie details
- `/shows/:movieName` — available shows
- `/seats/:showId` — seat selection
- `/bookings` — user booking history
- `/profile` — user profile
- `/favorites` — favorite movies or shows
- `/admin` — admin dashboard
- `/admin/movies`, `/admin/shows`, `/admin/theatres` — administration pages

Use `<Link>` or `<NavLink>` for internal navigation. Protect restricted routes with authentication and role-based components such as `UserProtection` and `AdminProtection`.

The supplied `App` screenshot demonstrates lazy-loaded page components with `React.lazy()` and a `Suspense` fallback loader. This can reduce the initial JavaScript bundle and display a loading indicator while a page is loaded.

#### 3. Design Reusable UI Components

Create reusable components such as:

- Header and Footer
- Loader
- Login and Registration forms
- Movie cards and movie-details popup
- Show and seat-selection views
- Booking summary and confirmation
- Admin navigation and management forms

Use Bootstrap, Material UI, Ant Design, or another consistent styling system to build a responsive interface. Prefer a consistent design system rather than mixing component libraries unnecessarily. Use CSS Grid or Flexbox for layout.

#### 4. Implement Frontend Logic

Connect the React application to backend APIs using Axios. Example login request:

```javascript
axios.post('/api/auth/login', userData);
```

The actual API base URL should be configured for the local development environment or deployment environment.

Use React hooks appropriately:

- `useState` — form values, local UI state, and selected seats.
- `useEffect` — loading data when a page or component mounts or its dependencies change.
- `useContext` — shared authentication or application state when appropriate.
- Custom hooks such as `useFetch` — reusable data-fetching logic.

Handle loading, empty, success, and error states. Show user-friendly feedback through React Toastify or a comparable notification component. Do not expose passwords, authentication tokens, or other secrets in console logs.

#### 5. Role-Based Interfaces

Show or hide admin functions based on the authenticated user's role. Protect administrative API endpoints on the backend as well; hiding a frontend link alone is not security.

The supplied screenshots illustrate these frontend areas:

- **App routing:** lazy-loaded pages, browser routing, protected routes, and a loading fallback.
- **Movie details popup:** displays movie information and selects an appropriate poster or fallback image.
- **Movie Shows:** retrieves shows for a movie through a custom fetch hook and sorts showtimes.
- **Admin Movies:** the admin movie-management interface.
- **Movie Shows administration:** the show-management interface.

The screenshots are reference material for the project documentation; the actual UI and file names should be verified against the source code.

---

## 6. Project Execution

### 6.1 Steps to Run the Project

Run the frontend and backend in separate terminals. The commands below assume the folders are named `client` and `server`, as in the initial setup instructions. If the existing repository uses `frontend` and `backend`, substitute those actual folder names consistently.

#### Step 1: Install and Start the Frontend

Open a terminal in the frontend directory:

```bash
cd client
npm install
npm run dev
```

Vite normally displays a local development URL similar to:

```text
http://localhost:5173
```

Use the exact URL printed in the terminal if it differs.

#### Step 2: Install Backend Dependencies

Open a second terminal and navigate to the backend directory. For the initial structure this may be:

```bash
cd server
npm install
```

If the repository uses `backend` instead, run `cd backend` from the project root. Ensure the backend's `package.json` includes the scripts and dependencies used by the project.

Typical dependencies for the described backend include:

```bash
npm install express mongoose cors dotenv bcryptjs jsonwebtoken
npm install --save-dev nodemon
```

Install only packages required by the actual source code. The screenshots show a backend entry point named `server.js` in one version, while these execution notes refer to `index.js`; use the entry point that actually exists, or standardize the project on one filename.

#### Step 3: Configure Environment Variables

Create a `.env` file in the backend directory. Keep real credentials out of source control and add `.env` to `.gitignore`.

Example for a local MongoDB database:

```env
PORT=8000
MONGO_URI=mongodb://127.0.0.1:27017/Imovies
JWT_SECRET=replace_with_a_long_random_secret
```

Use the environment variable name expected by the backend code. The screenshots show `MONGODB_CONNECTION_LINK` in one connection example, while this guide uses `MONGO_URI`; these names are not interchangeable unless the code is updated to match. Never commit a real JWT secret or database password to a public repository.

#### Step 4: Start the Backend

If the entry point is `index.js` and Nodemon is installed:

```bash
npx nodemon index.js
```

If the entry point is `server.js`, run:

```bash
npx nodemon server.js
```

Alternatively, define a suitable `dev` script in `package.json` and run `npm run dev`.

The backend is expected to listen on a URL similar to:

```text
http://localhost:8000
```

This depends on the configured port and the server's startup code. Ensure the MongoDB connection succeeds before the application begins accepting requests. If the frontend and backend use different origins, configure CORS for the frontend's development URL.

#### Step 5: Verify the Application

1. Confirm MongoDB is running and the backend reports a successful database connection.
2. Confirm the backend starts without import, configuration, or port errors.
3. Open the Vite URL in a browser.
4. Test registration and login.
5. Browse movies and movie details.
6. Open available shows and check seat availability.
7. Test booking and payment flows using the project's configured payment mode.
8. Verify booking history, favorites, reviews, and admin routes where implemented.
9. Check the browser console and backend terminal for errors.

### 6.2 Output Structure

**Screenshots to be added later.** This section is reserved for screenshots of the running iMovies application, including:

- Landing page and movie listings
- Login and registration pages
- Movie details page or popup
- Movie showtimes and seat selection
- Booking summary and confirmation
- User booking history and favorites
- Admin dashboard and movie management
- Admin show and theatre management
- Backend startup and successful database connection

Add each screenshot with a short caption describing the page, its purpose, and the result demonstrated.
