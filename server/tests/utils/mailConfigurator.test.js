import { afterEach, expect, test, jest } from "@jest/globals";
import mailConfigurator from "#server/utils/mailConfigurator.js";

describe("Generator of the response mails, for the bids processing", () => {
  const options = {
    to: "xk6t2@example.com",
    subject: "Test subject",
    text: "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Nihil dolorum alias quas illo rerum. Soluta aut, vel ex culpa optio voluptatibus non sequi, magnam cumque quos dolorem deserunt ipsam natus?",
    html: "<h1>Test html</h1>",
    username: "John Doe",
    defaultHTML: function (username) {
      return `<div style='text-align: center; margin-top: 25px'>
            <h3>Dear, ${username || "User"}!</h3>
            <p>${this.text}</p>
            <hr style='width: 25%; margin-left: auto; margin-right: auto'>
        </div>
        <div style='text-align: center; margin-top: 10px'>
            <p><i>Thanks for using our service! 📑</i></p>
        </div>`;
    },
  };

  afterEach(async () => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  test("should return a standard mail object, if <to>, <subject> and <text> are provided without any other arguments", () => {
    const mail = mailConfigurator(options.to, options.subject, options.text);

    expect(mail).toEqual({
      from: "no-reply@bidshandler.com",
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.defaultHTML(),
    });
  });

  test("should join an array of recipients with a comma and a space", () => {
    const mail = mailConfigurator(["to1", "to2"], options.subject, options.text);

    expect(mail.to).toBe("to1, to2");
  });

  test("should return a custom mail object, if <to>, <subject> and <text> are provided with other arguments like <html> or <username>", () => {
    const mail = mailConfigurator(options.to, options.subject, options.text, options.html, options.username);

    expect(mail).toEqual({
      from: "no-reply@bidshandler.com",
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });
  });

  test("should throw an error if any of the necessary arguments <to>, <subject> or <text> are not provided", () => {
    expect(() => mailConfigurator()).toThrowError("<To>, <subject> and <text> are required!");
    expect(() => mailConfigurator(options.to)).toThrowError("<To>, <subject> and <text> are required!");
    expect(() => mailConfigurator(options.to, options.subject)).toThrowError(
      "<To>, <subject> and <text> are required!",
    );
  });
});
