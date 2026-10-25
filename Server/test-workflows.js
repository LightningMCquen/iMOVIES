const http = require("http");

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : "";
    const options = {
      hostname: "localhost",
      port: 8000,
      path: "/api" + path,
      method: method,
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData),
        ...headers,
      },
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on("error", reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log("==================================================");
  console.log("   iMovies Full System Integration Test Suite     ");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    const health = await request("GET", "/health");
    assert(health.status === 200 && health.data.status === "ok", `Health Check API (dbEngine: ${health.data.dbEngine})`);

    // 2. User Login
    const userLogin = await request("POST", "/auth/login", {
      email: "gvvdkumar@gmail.com",
      password: "user123",
    });
    assert(userLogin.status === 200 && userLogin.data.success, "User Login (gvvdkumar@gmail.com)");
    const userToken = userLogin.data?.token;

    // 3. Admin Login
    const adminLogin = await request("POST", "/auth/login", {
      email: "admin@imovies.com",
      password: "admin123",
    });
    assert(adminLogin.status === 200 && adminLogin.data.user.role === "admin", "Admin Login (admin@imovies.com)");
    const adminToken = adminLogin.data?.token;

    // 4. Fetch Movies
    const movies = await request("GET", "/movies");
    assert(movies.status === 200 && movies.data.movies.length >= 6, `Fetched Catalogue: ${movies.data.movies.length} movies`);

    // 5. Fetch Shows for "Og"
    const shows = await request("GET", "/shows?movieName=Og");
    assert(shows.status === 200 && shows.data.shows.length >= 1, `Fetched Shows for 'Og': ${shows.data.shows.length} shows`);
    const testShow = shows.data.shows[0];

    // 6. Lock Seats with a unique seat ID
    const randomSeat = String(Math.floor(100 + Math.random() * 800));
    const lockRes = await request("POST", `/shows/${testShow._id}/lock-seats`, {
      seats: [randomSeat],
      userEmail: "gvvdkumar@gmail.com",
    });
    assert(lockRes.status === 200 && lockRes.data.success, `Temporary Seat Lock (Seat ${randomSeat})`);

    // 7. Book Ticket & Process Payment
    const bookRes = await request("POST", "/bookings", {
      userEmail: "gvvdkumar@gmail.com",
      showId: testShow._id,
      movieName: testShow.movieName,
      theatreName: testShow.theatreName,
      showdate: testShow.showdate,
      showtime: testShow.showtime,
      seats: [randomSeat],
      seatCategory: "Balcony",
      totalPrice: 175,
      paymentMethod: "Credit Card",
    });
    assert(bookRes.status === 201 && bookRes.data.success, `Ticket Booked! Ref: ${bookRes.data.booking?.bookingId}`);

    // 8. Verify in User Bookings
    const userBookings = await request("GET", "/bookings/user?email=gvvdkumar@gmail.com");
    const hasNewBooking = userBookings.data.bookings?.some((b) => b.seats.includes(randomSeat));
    assert(userBookings.status === 200 && hasNewBooking, `Booking Verified in User Orders History (Seat ${randomSeat})`);

    // 9. Admin Dashboard Stats
    const dashRes = await request("GET", "/admin/dashboard");
    assert(dashRes.status === 200 && dashRes.data.stats.totalBookings >= 1, `Admin Dashboard Stats: ${dashRes.data.stats.totalBookings} total bookings, ₹${dashRes.data.stats.totalRevenue} revenue`);

    // 10. Add New Theatre
    const newTheatre = await request("POST", "/theatres", {
      theatreName: "Prasads Multiplex " + Date.now().toString().slice(-4),
      location: "Necklace Road, Hyderabad",
      balconySeatPrice: 250,
      balconySeatCount: 150,
      middleSeatPrice: 180,
      middleSeatCount: 200,
      lowerSeatPrice: 120,
      lowerSeatCount: 100,
    });
    assert(newTheatre.status === 201 && newTheatre.data.success, "Admin Add Theatre");

    // 11. Add New Show
    const newShow = await request("POST", "/shows", {
      theatreName: "Srinivasa",
      movieName: "Og",
      showdate: "Oct 28, 2026",
      showtime: "7:00 PM",
    });
    assert(newShow.status === 201 && newShow.data.success, "Admin Add Show (Srinivasa 7:00 PM)");

    // 12. Add to Favorites
    const favRes = await request("POST", "/favorites", {
      userEmail: "gvvdkumar@gmail.com",
      movieId: movies.data.movies[0]._id,
      movieName: movies.data.movies[0].movieName,
    });
    assert(favRes.status === 200 || favRes.status === 201, `Added to Favorites: ${movies.data.movies[0].movieName}`);

    // 13. Add Rating and Review
    const reviewRes = await request("POST", "/reviews", {
      movieId: movies.data.movies[0]._id,
      movieName: movies.data.movies[0].movieName,
      userEmail: "gvvdkumar@gmail.com",
      userName: "GVVD Kumar",
      rating: 10,
      comment: "Spectacular movie! Visual masterpiece and unforgettable performance.",
    });
    assert(reviewRes.status === 201 && reviewRes.data.success, "Submit Rating & Review");

    console.log("==================================================");
    console.log(`Results: ${passed} Passed, ${failed} Failed`);
    console.log("==================================================");

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error("Test execution error:", err);
    process.exit(1);
  }
}

runTests();
