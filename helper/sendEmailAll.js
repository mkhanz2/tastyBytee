const nodemailer = require('nodemailer');
require('dotenv').config();

function emailConfirmationAll(userEmail, htmlItems, total) {
  const transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_ID,
      pass: process.env.EMAIL_PASS,
    },
  });

  const receiver = {
    from: process.env.EMAIL_ID,
    to: userEmail,
    subject: "Order Confirmation",
    html: `
      <h1>Order Confirmation</h1>
      <p>Hello! Your order has been confirmed.</p>
      <h2>Items Ordered:</h2>
      ${htmlItems}
      <p><strong>Total:</strong> ₹${total}</p>
      <p>Thanks for shopping with TastyBytee!</p>
    `,
    text: `Your total order is ₹${total}. Thanks for shopping with us.`,
  };

  transport.sendMail(receiver, (error, info) => {
    if (error) {
      console.error("Email sending failed:", error);
    } else {
      console.log("Confirmation email sent:", info.response);
    }
  });
}

module.exports = emailConfirmationAll;

