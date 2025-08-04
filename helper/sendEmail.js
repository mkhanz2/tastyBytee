const nodemailer = require('nodemailer');
require('dotenv').config();

function emailConfirmation(userEmail, itemDetails) {
  const { itemName, productDescription, price, shipment, totalPrice } = itemDetails;

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
      <h1 style= "color: red" >Order Confirmation</h1>
      <p>Hello! Your order has been confirmed.</p>
      
      <h2>Order Details</h2>
      <p><strong>Item:</strong> ${itemName}</p>
      <p><strong>Description:</strong> ${productDescription}</p>
      <p><strong>Price:</strong> ₹${price}</p>
      <p><strong>Shipping:</strong> ₹${shipment}</p>
      <p><strong>Total:</strong> ₹${totalPrice}</p>
      
      <p>Thanks for shopping with TastyBytee!</p>
    `,
  };

  transport.sendMail(receiver, (error, info) => {
    if (error) {
      console.error("Email sending failed:", error);
    } else {
      console.log("Confirmation email sent:", info.response);
    }
  });
}

module.exports = emailConfirmation;
