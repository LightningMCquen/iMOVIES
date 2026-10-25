const nodemailer = require("nodemailer");

// Create test or configurable transporter
let transporter;

const initMailer = async () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Development fallback with mock logger
    transporter = {
      sendMail: async (options) => {
        console.log("-----------------------------------------");
        console.log(`[MAIL NOTIFICATION] To: ${options.to}`);
        console.log(`[SUBJECT] ${options.subject}`);
        console.log(`[BODY]\n${options.text || options.html}`);
        console.log("-----------------------------------------");
        return { messageId: "dev-mock-mail-" + Date.now() };
      },
    };
  }
};

initMailer().catch(console.error);

const sendBookingConfirmation = async (booking) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || '"iMovies Ticket Booking" <tickets@imovies.com>',
      to: booking.userEmail,
      subject: `🎉 Booking Confirmed! Ticket #${booking.bookingId} - ${booking.movieName}`,
      html: `
        <div style="font-family: Arial, sans-serif; background: #111; color: #fff; padding: 25px; border-radius: 10px;">
          <h2 style="color: #e50914; margin-bottom: 5px;">iMovies Booking Confirmation</h2>
          <p>Thank you for booking with iMovies! Here are your ticket details:</p>
          <div style="background: #1c2330; padding: 20px; border-radius: 8px; border: 1px solid #e50914;">
            <h3 style="color: #fff; margin-top: 0;">${booking.movieName}</h3>
            <p><strong>Booking ID:</strong> ${booking.bookingId}</p>
            <p><strong>Theatre:</strong> ${booking.theatreName}</p>
            <p><strong>Date & Time:</strong> ${booking.showdate} | ${booking.showtime}</p>
            <p><strong>Seats (${booking.seatCategory}):</strong> ${booking.seats.join(", ")}</p>
            <p><strong>Total Amount:</strong> ₹${booking.totalPrice}</p>
            <p><strong>Status:</strong> <span style="color: #4ade80;">Confirmed</span></p>
          </div>
          <p style="margin-top: 20px; font-size: 12px; color: #999;">Please show this email or e-ticket at the cinema entrance.</p>
        </div>
      `,
    };

    return await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending booking email:", error.message);
  }
};

const sendCancellationNotification = async (booking) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || '"iMovies Support" <support@imovies.com>',
      to: booking.userEmail,
      subject: `Booking Cancelled - #${booking.bookingId} (${booking.movieName})`,
      text: `Your booking #${booking.bookingId} for "${booking.movieName}" at ${booking.theatreName} on ${booking.showdate} at ${booking.showtime} has been cancelled. If any refund is applicable, it will be credited within 3-5 business days.`,
    };

    return await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending cancellation email:", error.message);
  }
};

module.exports = {
  sendBookingConfirmation,
  sendCancellationNotification,
};
