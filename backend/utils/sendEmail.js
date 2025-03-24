// backend/utils/sendEmail.js
const nodemailer = require('nodemailer');
require('dotenv').config();

const sendEmail = async (to, subject, htmlContent) => {
  try {
    // Log để kiểm tra biến môi trường
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS);

    // Cấu hình transporter
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Cấu hình email
    const mailOptions = {
      from: `"NeoPlaton Shop" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: htmlContent,
    };

    // Gửi email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

module.exports = sendEmail;