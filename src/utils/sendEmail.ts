import nodemailer from 'nodemailer';
import config from '@/config';

interface IEmailOptions {
  reciverEmail: string;
  subject: string;
  body: string;
}
const sendEmail = async (options: IEmailOptions) => {
  const transporter = nodemailer.createTransport({
    // host: config.smtp_host,
    // port: config.smtp_port,
    service: config.smtp_service,
    auth: {
      user: config.smtp_mail,
      pass: config.smtp_password,
    },
  });
  const mailOptions = {
    from: config.smtp_mail,
    to: options.reciverEmail,
    subject: options.subject,
    html: options.body,
  };

  await transporter.sendMail(mailOptions);
};

export default sendEmail;
