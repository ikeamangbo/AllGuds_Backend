const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  auth: {
    user: 'ofapatrick04@gmail.com',
    pass: 'wvhtzyvvhebatjgy',
  },
});

exports.sendEmail = async (to, subject, body) => {
    try {
      const info = await transporter.sendMail({
        from: 'ofapatrick04@gmail.com',
        to,
        subject,
        html: body,
      });
      console.log(`Email sent successfully to ${to}. Message ID: ${info.messageId}`);
    } catch (error) {
      console.error(`Error sending email to ${to}:`, error);
    }
  };
  