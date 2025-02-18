import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import handlebars from 'handlebars';

import { IEmailOptions } from '../interface/mail';
import { transporter } from '../config/mail.config';

// resolving file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// email sender utility function
export const sendEmail = async ({
  to,
  subject,
  type,
  context,
}: IEmailOptions) => {
  try {
    const defaultConfig: Record<string, { templateFile: string }> = {
      emailVerification: {
        templateFile: 'verifyEmail.hbs',
      },
      resetPassword: {
        templateFile: 'resetPassword.hbs',
      },
    };

    const config = defaultConfig[type];

    if (!config) {
      throw new Error('Invalid type');
    }

    // handlebar html template
    const templatePath = join(__dirname, '../templates', config.templateFile);
    const templateSource = fs.readFileSync(templatePath, 'utf-8');
    const template = handlebars.compile(templateSource);
    const htmlContent = template(context);

    // mail options to be included
    const mailOptions = {
      from: process.env.EMAIL_FROM!,
      to,
      subject,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
  } catch (error: any) {
    console.error(`Error sending email`, error.message);
    throw new Error('Error sending email');
  }
};
