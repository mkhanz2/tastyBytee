const nodemailer= require('nodemailer')
require('dotenv').config()

function emailconfirmation(userEmail, details){

    const{Title, Description, Experience, Type, Skills}= details

    const transport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_ID,
            pass: process.env.EMAIL_PASS
        }
    })

    const receiver={
        from: process.env.EMAIL_ID,
        to: userEmail,
        subject: "job confirmation",
        html: `
        <h1 style= "color: green" >Job Confirmation</h1>
      <p>We've received your Job application.</p>
      
      <h2>Please find below detials</h2>
      <p><strong>Title:</strong> ${Title}</p>
      <p><strong>Description:</strong> ${Description}</p>
      <p><strong>Experience:</strong> ₹${Experience}</p>
      <p><strong>Type:</strong> ₹${Type}</p>
      <p><strong>Skills:</strong> ₹${Skills}</p>
      
      <p>Thanks for applying, we will keep you posted</p>
        `
    }

    transport.sendMail(receiver,(error,info)=> {
         if (error) {
      console.error("Email sending failed:", error);
    } else {
      console.log("Confirmation email sent:", info.response);
    }
    })
}

module.exports = emailconfirmation;
