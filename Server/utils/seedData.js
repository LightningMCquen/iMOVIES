const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const Admin = require("../models/adminModel");
const Movie = require("../models/movieModel");
const Theatre = require("../models/theatreModel");
const Show = require("../models/showModel");
const Booking = require("../models/bookingModel");

const initialMovies = [
  {
    movieName: "Rrr",
    description: "A fearless revolutionary and an officer in the British force, who once shared an unbreakable bond, decide to join hands and embark on a perilous path together.",
    genres: "Action, Drama, Historical",
    releaseDate: "Mar 25, 2022",
    runtime: "187 min",
    certification: "U/A",
    trailerUrl: "https://www.youtube.com/watch?v=NgBoMJy386M",
    posterUrl: "https://image.tmdb.org/t/p/w500/wE0noFU9jxkeIP2e05mzzsUd922.jpg",
    rating: 8.8,
    language: "Telugu, Hindi, Tamil, English",
    cast: "N.T. Rama Rao Jr., Ram Charan, Alia Bhatt, Ajay Devgn",
  },
  {
    movieName: "Baahubali 2: the conclusion",
    description: "Amarendra Baahubali, the heir apparent to the throne of Mahishmati, finds his life in danger after his cousin Bhallaladeva conspires against him.",
    genres: "Action, Drama, Fantasy",
    releaseDate: "Apr 25, 2017",
    runtime: "167 min",
    certification: "U/A",
    trailerUrl: "https://www.youtube.com/watch?v=qD-6d8Wo3do",
    posterUrl: "https://image.tmdb.org/t/p/w500/9JuZ6qf7f4eX75i8aYd4zJ7l6yZ.jpg",
    rating: 8.7,
    language: "Telugu, Hindi, Tamil",
    cast: "Prabhas, Rana Daggubati, Anushka Shetty, Tamannaah",
  },
  {
    movieName: "Og",
    description: "They Call Him OG: A merciless gangster returns to the underworld of Mumbai after ten years to take down rival syndicates.",
    genres: "action thriller",
    releaseDate: "Sep 25, 2025",
    runtime: "160 min",
    certification: "A",
    trailerUrl: "https://www.youtube.com/watch?v=4y33h81fiHQ",
    posterUrl: "https://image.tmdb.org/t/p/w500/bL32gq0V5T1J2V0w8zYm7sT4x5Q.jpg",
    rating: 9.1,
    language: "Telugu, Hindi",
    cast: "Pawan Kalyan, Emraan Hashmi, Priyanka Arul Mohan",
  },
  {
    movieName: "Rajasaab",
    description: "A romantic horror comedy following a man who inherits an ancestral palace steeped in dark comedy and ghostly folklore.",
    genres: "Comedy , Horror , Romantic",
    releaseDate: "Dec 5, 2025",
    runtime: "155 min",
    certification: "U/A",
    trailerUrl: "https://www.youtube.com/watch?v=k9z4o_O_QkE",
    posterUrl: "https://image.tmdb.org/t/p/w500/6y1M8L2H4F2C1v4G3w2S7m0R7sB.jpg",
    rating: 8.4,
    language: "Telugu, Hindi",
    cast: "Prabhas, Malavika Mohanan, Nidhhi Agerwal",
  },
  {
    movieName: "Toxic",
    description: "A fairy tale for grown-ups set in the gritty drug cartel landscapes of 1950s-1970s London and Goa.",
    genres: "Action , Thriller",
    releaseDate: "Oct 1, 2025",
    runtime: "165 min",
    certification: "A",
    trailerUrl: "https://www.youtube.com/watch?v=k3t7y_R7p0A",
    posterUrl: "https://image.tmdb.org/t/p/w500/q7k6T2m8f1B3d0C9w8y5S6t7R4x.jpg",
    rating: 8.9,
    language: "Kannada, Hindi, Telugu",
    cast: "Yash, Kiara Advani, Nayanthara",
  },
  {
    movieName: "Avatar",
    description: "Avatar: Fire and Ash explores Pandora's volcanic regions and introduces the aggressive Ash People na'vi tribe.",
    genres: "Action , Adventure , Fantasy , Sci-Fi",
    releaseDate: "Sep 30, 2025",
    runtime: "192 min",
    certification: "U/A",
    trailerUrl: "https://www.youtube.com/watch?v=d9MyW72ELq0",
    posterUrl: "https://image.tmdb.org/t/p/w500/gK7s2d3C1r5V8z0w3x9S8t7Q4aF.jpg",
    rating: 9.0,
    language: "English, Hindi, Telugu",
    cast: "Sam Worthington, Zoe Saldana, Sigourney Weaver",
  },
  {
    movieName: "The pride of bharat",
    description: "Chhatrapati Shivaji Maharaj - An epic saga portraying the courage, military genius, and establishment of the Maratha Empire.",
    genres: "Historical, Action, Drama",
    releaseDate: "Jan 2, 2026",
    runtime: "170 min",
    certification: "U/A",
    trailerUrl: "https://www.youtube.com/watch?v=m7z8v1c2X3w",
    posterUrl: "https://image.tmdb.org/t/p/w500/m9k3f5t7s1C2r8x9W7q6y3B4n1K.jpg",
    rating: 8.9,
    language: "Hindi, Marathi, Telugu",
    cast: "Vicky Kaushal, Rashmika Mandanna",
  },
  {
    movieName: "G2",
    description: "Major Gopi Varma embarks on an international espionage mission across 12 countries to prevent an apocalyptic threat.",
    genres: "Spy, Action, Thriller",
    releaseDate: "Nov 14, 2025",
    runtime: "150 min",
    certification: "U/A",
    trailerUrl: "https://www.youtube.com/watch?v=v9z3x1y2A3B",
    posterUrl: "https://image.tmdb.org/t/p/w500/5k7r2y9W1x3S8t4C6m8V0z7Q2fA.jpg",
    rating: 8.6,
    language: "Telugu, Hindi",
    cast: "Adivi Sesh, Banita Sandhu, Emraan Hashmi",
  },
  {
    movieName: "Baaghi 4",
    description: "Ronnie takes on his deadliest mission yet in an adrenaline-pumping survival battle against rogue assassins.",
    genres: "Action, Thriller",
    releaseDate: "Sep 5, 2025",
    runtime: "145 min",
    certification: "A",
    trailerUrl: "https://www.youtube.com/watch?v=b4g9h3k2y1x",
    posterUrl: "https://image.tmdb.org/t/p/w500/8y3x2W1r9T4C6s7V8m0Z1f4A3qE.jpg",
    rating: 7.9,
    language: "Hindi",
    cast: "Tiger Shroff, Sanjay Dutt",
  },
  {
    movieName: "Leo",
    description: "A mild-mannered café owner becomes a local hero through an act of violence, triggering repercussions with a violent crime syndicate.",
    genres: "Action, Crime, Thriller",
    releaseDate: "Oct 19, 2023",
    runtime: "164 min",
    certification: "U/A",
    trailerUrl: "https://www.youtube.com/watch?v=Po3jStA673E",
    posterUrl: "https://image.tmdb.org/t/p/w500/bX2vxqnLp05gWfO3t0v9vR1g4wG.jpg",
    rating: 8.1,
    language: "Tamil, Telugu, Hindi",
    cast: "Vijay, Sanjay Dutt, Trisha Krishnan",
  },
];

const initialTheatres = [
  {
    theatreName: "Srinivasa",
    location: "KPHB Main Road, Hyderabad",
    balconySeatPrice: 175,
    middleSeatPrice: 130,
    lowerSeatPrice: 100,
    balconySeats: 100,
    middleSeats: 120,
    lowerSeats: 80,
  },
  {
    theatreName: "Gokul",
    location: "Erradgadda Metro Complex, Hyderabad",
    balconySeatPrice: 200,
    middleSeatPrice: 150,
    lowerSeatPrice: 100,
    balconySeats: 100,
    middleSeats: 120,
    lowerSeats: 80,
  },
];

const seedDatabase = async () => {
  try {
    // 1. Seed Admin & Demo User
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("admin123", salt);
    const userHashedPassword = await bcrypt.hash("user123", salt);

    let admin = await User.findOne({ email: "admin@imovies.com" });
    if (!admin) {
      admin = await User.create({
        username: "Admin",
        email: "admin@imovies.com",
        password: hashedPassword,
        role: "admin",
      });
      await Admin.create({
        username: "Admin",
        email: "admin@imovies.com",
        password: hashedPassword,
        role: "admin",
      });
      console.log("Seeded Admin account: admin@imovies.com / admin123");
    }

    let demoUser = await User.findOne({ email: "gvvdkumar@gmail.com" });
    if (!demoUser) {
      demoUser = await User.create({
        username: "GVVD Kumar",
        email: "gvvdkumar@gmail.com",
        password: userHashedPassword,
        role: "user",
      });
      console.log("Seeded Demo user: gvvdkumar@gmail.com / user123");
    }

    // 2. Seed Movies
    const existingMoviesCount = await Movie.countDocuments();
    if (existingMoviesCount === 0) {
      await Movie.insertMany(initialMovies);
      console.log("Seeded initial movies catalog.");
    }

    // 3. Seed Theatres
    const existingTheatresCount = await Theatre.countDocuments();
    if (existingTheatresCount === 0) {
      await Theatre.insertMany(initialTheatres);
      console.log("Seeded initial theatres.");
    }

    // 4. Seed Shows
    const existingShowsCount = await Show.countDocuments();
    if (existingShowsCount === 0) {
      const ogMovie = await Movie.findOne({ movieName: "Og" });
      const g2Movie = await Movie.findOne({ movieName: "G2" });
      const bharatMovie = await Movie.findOne({ movieName: "The pride of bharat" });

      const initialShows = [
        {
          movieName: "Og",
          movieId: ogMovie?._id,
          theatreName: "Srinivasa",
          showdate: "Sep 25, 2025",
          showtime: "2:00 PM",
          bookedSeats: [],
        },
        {
          movieName: "Og",
          movieId: ogMovie?._id,
          theatreName: "Srinivasa",
          showdate: "Sep 25, 2025",
          showtime: "4:00 PM",
          bookedSeats: [],
        },
        {
          movieName: "Og",
          movieId: ogMovie?._id,
          theatreName: "Srinivasa",
          showdate: "Sep 26, 2025",
          showtime: "9:00 PM",
          bookedSeats: ["162", "261", "262"],
        },
        {
          movieName: "G2",
          movieId: g2Movie?._id,
          theatreName: "Gokul",
          showdate: "Nov 14, 2025",
          showtime: "2:00 PM",
          bookedSeats: [],
        },
        {
          movieName: "G2",
          movieId: g2Movie?._id,
          theatreName: "Gokul",
          showdate: "Nov 14, 2025",
          showtime: "6:00 PM",
          bookedSeats: [],
        },
        {
          movieName: "The pride of bharat",
          movieId: bharatMovie?._id,
          theatreName: "Gokul",
          showdate: "Jan 2, 2026",
          showtime: "9:30 PM",
          bookedSeats: ["198"],
        },
      ];

      const insertedShows = await Show.insertMany(initialShows);
      console.log("Seeded initial shows.");

      // 5. Seed Bookings for demo user gvvdkumar@gmail.com exactly matching 'user orders.png'
      const ogShow = insertedShows.find((s) => s.showdate === "Sep 26, 2025");
      const bharatShow = insertedShows.find((s) => s.movieName === "The pride of bharat");

      const initialBookings = [
        {
          bookingId: "BK912831",
          userEmail: "gvvdkumar@gmail.com",
          userId: demoUser._id,
          showId: ogShow?._id,
          movieName: "Og",
          theatreName: "Srinivasa",
          showdate: "Sep 26, 2025",
          showtime: "21:00",
          seatCategory: "Middle",
          seats: ["261", "262"],
          totalPrice: 260,
          posterUrl: ogMovie?.posterUrl || "",
          paymentStatus: "Paid",
        },
        {
          bookingId: "BK912832",
          userEmail: "gvvdkumar@gmail.com",
          userId: demoUser._id,
          showId: ogShow?._id,
          movieName: "Og",
          theatreName: "Srinivasa",
          showdate: "Sep 26, 2025",
          showtime: "21:00",
          seatCategory: "Balcony",
          seats: ["162"],
          totalPrice: 175,
          posterUrl: ogMovie?.posterUrl || "",
          paymentStatus: "Paid",
        },
        {
          bookingId: "BK912833",
          userEmail: "gvvdkumar@gmail.com",
          userId: demoUser._id,
          showId: bharatShow?._id,
          movieName: "The pride of bharat",
          theatreName: "Gokul",
          showdate: "Jan 2, 2026",
          showtime: "21:30",
          seatCategory: "Balcony",
          seats: ["198"],
          totalPrice: 200,
          posterUrl: bharatMovie?.posterUrl || "",
          paymentStatus: "Paid",
        },
      ];

      await Booking.insertMany(initialBookings);
      console.log("Seeded initial demo bookings matching user orders screenshot.");
    }
  } catch (error) {
    console.error("Seeding error:", error);
  }
};

module.exports = { seedDatabase };
