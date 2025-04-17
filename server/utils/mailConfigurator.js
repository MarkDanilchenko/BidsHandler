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
      `
        <div style='text-align: center; margin-top: 25px'>
            <h3>Dear, ${username || "User"}!</h3>
            <p>${text}</p>
            <hr style='width: 25%; margin-left: auto; margin-right: auto'>
        </div>
        <div style='text-align: center; margin-top: 10px'>
            <p><i>Thanks for using our service! 📑</i></p>
        </div>
    `,
  };
}
