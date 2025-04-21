import nodemailer from "nodemailer";
import { smtpOptions } from "../env.js";
import logger from "./loggerConfig.js";

const testAccount = await nodemailer.createTestAccount();

const transporter = nodemailer.createTransport({
  host: smtpOptions.host || "smtp.ethereal.email",
  port: smtpOptions.port || 587,
  secure: false,
  auth: {
    user: smtpOptions.user || testAccount.user,
    pass: smtpOptions.password || testAccount.pass,
  },
});

/**
 * Sends an email using the transporter.
 *
 * @async
 * @param {SendMailOptions} mailOptions - Email options.
 * @throws {Error} If transporter verification fails or email sending fails.
 */
export default async function sendEmail(mailOptions) {
  try {
    if (!mailOptions) {
      throw new Error("Mail options are not defined!");
    }

    await transporter.verify();

    if (transporter.options.host === "smtp.ethereal.email") {
      const info = await transporter.sendMail(mailOptions);
      const testBackLink = nodemailer.getTestMessageUrl(info);

      logger.info(`Preview URL: ${testBackLink}`);
    } else {
      await transporter.sendMail(mailOptions);

      logger.info("Email sent successfully!");
    }
  } catch (error) {
    logger.error(error.message);
  }
}
