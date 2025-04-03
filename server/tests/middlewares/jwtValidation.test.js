import jwt from "jsonwebtoken";
import { jest } from "@jest/globals";
import { expressOptions } from "#server/env.js";
import validateJwt from "#server/middleware/jwtValidation.js";

describe("JWT middleware validation:", () => {
  let res;
  let next;

  beforeEach(() => {
    res = {
      status: jest.fn(),
      send: jest.fn(),
      end: jest.fn(),
    };
    next = jest.fn();

    jest.spyOn(jwt, "verify").mockImplementation((accessToken, secret, cb) => {
      if (accessToken !== "validAccessToken") {
        return cb(new Error("Access token is not valid!"));
      }

      return cb(null);
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should call next() if accessToken is valid", () => {
    const req = {
      headers: {
        authorization: "Bearer validAccessToken",
      },
    };

    validateJwt(req, res, next);

    expect(jwt.verify).toHaveBeenCalled();
    expect(jwt.verify).toHaveBeenCalledWith(
      req.headers.authorization.split(" ")[1],
      expressOptions.jwtSecret,
      expect.any(Function),
    );
    expect(next).toHaveBeenCalled();
  });

  test("should return Unauthorized error with JSON message and 401 status code if accessToken is not present", () => {
    const req = {
      headers: {},
    };

    validateJwt(req, res, next);

    expect(jwt.verify).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  test("should return Unauthorized error with JSON message and 401 status code if accessToken is not valid", () => {
    const req = {
      headers: {
        authorization: "Bearer invalidAccessToken",
      },
    };

    validateJwt(req, res, next);

    expect(jwt.verify).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });
});
