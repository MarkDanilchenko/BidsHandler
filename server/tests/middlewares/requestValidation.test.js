import fs from "fs";
import validateRequest from "#server/middleware/requestValidation.js";
import { expect, jest } from "@jest/globals";
import { z } from "zod";

describe("Request validation middleware:", () => {
  let schema;
  let req;
  let res;
  let next;

  beforeEach(() => {
    schema = z.object({
      body: z.object({
        username: z.string().regex(/^[a-zA-Z0-9-_.]{2,16}$/gi),
      }),
    });
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      end: jest.fn(),
    };
    req = {
      headers: {},
      body: {},
      query: {},
      params: {},
      files: {},
    };
    next = jest.fn();

    jest.spyOn(fs, "unlink").mockImplementation(jest.fn());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should call next() if request data is valid", () => {
    req.body = {
      username: "validUsername",
    };

    validateRequest(schema)(req, res, next);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.send).not.toHaveBeenCalled();
    expect(res.end).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  test("should return 400 with JSON message if request data is invalid", () => {
    req.body = {
      username: "?=_<>!@#$%^&*()",
    };

    validateRequest(schema)(req, res, next);

    expect(res.status).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalled();
    expect(res.end).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  test("should unlink files if request contains files and validation fails, and return 400 with JSON message", () => {
    req.body = {
      username: "?=_<>!@#$%^&*()",
    };
    req.files = {
      avatar: [
        {
          path: "path/to/avatar.jpg",
        },
      ],
    };

    validateRequest(schema)(req, res, next);

    expect(res.status).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalled();
    expect(res.end).toHaveBeenCalled();
    expect(fs.unlink).toHaveBeenCalled();
    expect(fs.unlink).toHaveBeenCalledWith("path/to/avatar.jpg", expect.any(Function));
    expect(next).not.toHaveBeenCalled();
  });
});
