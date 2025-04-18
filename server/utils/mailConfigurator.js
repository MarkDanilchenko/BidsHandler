/**
 * Returns a mail object with the given properties.
 *
 * If `to` is an array, it is joined by a comma and a space.
 * If `html` is not given, a default HTML string is generated.
 *
 * @param {string|string[]} to - The recipient(s) of the mail.
 * @param {string} subject - The subject of the mail.
 * @param {string} text - The text body of the mail.
 * @param {string} [html] - The html body of the mail.
 * @param {string} [username] - The name of the user to be addressed in the mail.
 * @throws {Error} If `to`, `subject` or `text` is not given.
 * @returns {import("nodemailer/lib/mailer").SendMailOptions}
 */
export default function mailConfigurator(to, subject, text, html, username) {
  if (!to || !subject || !text) {
    throw new Error("<To>, <subject> and <text> are required!");
  }

  return {
    from: `no-reply@bidshandler.com`,
    to: Array.isArray(to) ? to.join(", ") : to,
    subject,
    text,
    html:
      html ||
      `<div style='text-align: center; margin-top: 25px'>
            <h3>Dear, ${username || "User"}!</h3>
            <p>${text}</p>
            <hr style='width: 25%; margin-left: auto; margin-right: auto'>
        </div>
        <div style='text-align: center; margin-top: 10px'>
            <p><i>Thanks for using our service! 📑</i></p>
        </div>`,
  };
}
