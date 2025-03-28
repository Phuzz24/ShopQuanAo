const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendVerificationCode = async (email, code) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Mã xác nhận khôi phục mật khẩu',
    html: `
      <h2>Khôi phục mật khẩu</h2>
      <p>Mã xác nhận của bạn là: <strong>${code}</strong></p>
      <p>Mã này có hiệu lực trong 10 phút.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendVerificationCode };