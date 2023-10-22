import nodemailer, { Transporter } from 'nodemailer';
import ejs from 'ejs';
import path from 'path';
import defaultVars from '../config/defaultVars';

interface EmailOptions {
  email: string;
  subject: string;
  template: string;
  data: { [key: string]: any };
}

const sendMail = async (options: EmailOptions): Promise<void> => {
  const transporter: Transporter = nodemailer.createTransport({
    host: defaultVars.mails.host,
    port: defaultVars.mails.port,
    service: defaultVars.mails.service,
    auth: {
      user: defaultVars.mails.mail,
      pass: defaultVars.mails.password
    }
  });
  const { email, subject, template, data } = options;

  // gate the path to the email file

  const templatePath = path.join(__dirname, '../views', template);

  // render the email template
  const html: string = await ejs.renderFile(templatePath, data);

  const mailOptions = {
    from: defaultVars.mails.mail,
    to: email,
    subject,
    html
  };

  await transporter.sendMail(mailOptions);
};

export default sendMail;
