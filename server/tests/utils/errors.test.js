import { badRequestError, notFoundError, unauthorizedError } from "#server/utils/errors.js";
import { jest, test } from "@jest/globals";

describe("Response custom errors:", () => {
  const res = {
    status: jest.fn(),
    send: jest.fn(),
    end: jest.fn(),
  };

  describe("- badRequestError", () => {
    test("should return a 400 status code and a JSON response with a message", () => {
      badRequestError(res, "User is already registered!");

      expect(res.status).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalled();
      expect(res.send).toHaveBeenCalledWith(JSON.stringify({ message: "User is already registered!" }));
      expect(res.end).toHaveBeenCalled();
    });

    test("should return a 400 status code and a JSON response with a default message if no additional message is provided", () => {
      badRequestError(res);

      expect(res.status).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalled();
      expect(res.send).toHaveBeenCalledWith({ message: "Bad request!" });
      expect(res.end).toHaveBeenCalled();
    });
  });

  describe("- notFoundError", () => {
    test("should return a 404 status code and a JSON response with a message", () => {
      notFoundError(res, "User not found!");

      expect(res.status).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalled();
      expect(res.send).toHaveBeenCalledWith(JSON.stringify({ message: "User not found!" }));
      expect(res.end).toHaveBeenCalled();
    });

    test("should return a 404 status code and a JSON response with a default message if no additional message is provided", () => {
      notFoundError(res);

      expect(res.status).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalled();
      expect(res.send).toHaveBeenCalledWith({ message: "Not found!" });
      expect(res.end).toHaveBeenCalled();
    });
  });

  describe("- unauthorizedError", () => {
    test("should return a 401 status code and a JSON response with a message", () => {
      unauthorizedError(res, "Not authorized!");

      expect(res.status).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.send).toHaveBeenCalled();
      expect(res.send).toHaveBeenCalledWith(JSON.stringify({ message: "Not authorized!" }));
      expect(res.end).toHaveBeenCalled();
    });

    test("should return a 401 status code and a JSON response with a default message if no additional message is provided", () => {
      unauthorizedError(res);

      expect(res.status).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.send).toHaveBeenCalled();
      expect(res.send).toHaveBeenCalledWith({ message: "Unauthorized!" });
      expect(res.end).toHaveBeenCalled();
    });
  });
});
