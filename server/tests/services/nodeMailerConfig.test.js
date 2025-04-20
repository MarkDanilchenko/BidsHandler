import sendEmail from "#server/services/nodeMailerConfig.js";
import nodemailer from "nodemailer";
import logger from "#server/services/loggerConfig.js";
import { afterEach, beforeEach, expect, jest, test } from "@jest/globals";

describe("sendEmail", () => {
  const mockedMailOptions = {
    from: "no-reply@bidshandler.com",
    to: "xk6t2@example.com",
    subject: "Test subject",
    text: "Test text",
    html: "<h1>Test html</h1>",
  };

  beforeEach(async () => {
    jest.spyOn(logger, "info");
    jest.spyOn(logger, "error");
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  test("should throw an error if mailOptions are not defined", async () => {
    await sendEmail();

    expect(logger.error).toHaveBeenCalledWith("Mail options are not defined!");
    expect(logger.error).toHaveBeenCalledTimes(1);
  }, 10000);

  test("should send email and log a preview URL if using smtp.ethereal.email", async () => {
    jest.spyOn(nodemailer, "getTestMessageUrl").mockImplementation(() => "testUrlToPreview/email");

    await sendEmail(mockedMailOptions);

    expect(logger.info).toHaveBeenCalledWith("Preview URL: testUrlToPreview/email");
    expect(logger.info).toHaveBeenCalledTimes(1);
  }, 10000);

  test("should log an error message if smth goes wrong and sendEmail function fails", async () => {
    jest.spyOn(nodemailer, "getTestMessageUrl").mockImplementationOnce(() => {
      throw new Error("Smth goes wrong");
    });

    await sendEmail(mockedMailOptions);

    expect(logger.error).toHaveBeenCalledWith("Smth goes wrong");
    expect(logger.error).toHaveBeenCalledTimes(1);
  }, 10000);
});
