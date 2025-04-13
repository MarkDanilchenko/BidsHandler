import request from "supertest";
import jwt from "jsonwebtoken";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, jest, test } from "@jest/globals";
import { sequelizeConnection } from "#server/models/index.js";

describe("Bids routes:", () => {
  beforeAll(async () => {
    await sequelizeConnection.authenticate();
  });

  afterAll(async () => {
    await sequelizeConnection.close();
  });

  describe("- create a new bid", () => {
    let server;

    beforeEach(async () => {
      jest.unstable_mockModule("#server/middleware/jwtValidation.js", () => ({
        default: jest.fn((req, res, next) => {
          const bearer = req.headers.authorization;

          if (!bearer || bearer.split(" ")[1] !== "validAccessToken") {
            return unauthorizedError(res, "Access token not found or is not valid!");
          }

          next();
        }),
      }));

      jest.spyOn(jwt, "decode").mockImplementation((accessToken) => {
        if (accessToken !== "validAccessToken") {
          return null;
        }

        return { userId };
      });

      server = (await import("#server/server.js")).default;
    });

    afterEach(async () => {
      jest.resetModules();
      jest.clearAllMocks();
    });

    test("should create a new bid", async () => {});
    test("should return JSON response with message, if user is not found with provided id in jwt payload, and 404 status code", async () => {});
    test("should return JSON response with message, if Bid.create or smth else throws an error, and 400 status code", async () => {});
  });
});
