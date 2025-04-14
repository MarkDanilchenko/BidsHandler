import request from "supertest";
import jwt from "jsonwebtoken";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, jest, test } from "@jest/globals";
import { sequelizeConnection, Bid } from "#server/models/index.js";
import { v4 as uuidv4 } from "uuid";

describe("Bids routes:", () => {
  beforeAll(async () => {
    await sequelizeConnection.authenticate();
  });

  afterAll(async () => {
    await sequelizeConnection.close();
  });

  describe("- create a new bid", () => {
    let userId = uuidv4();
    const options = {
      message: "Test message",
      authorId: userId,
    };
    let mockBidCreate;
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
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    test("should create a new bid", async () => {
      mockBidCreate = jest.spyOn(Bid, "create").mockImplementation((options) => {
        return null;
      });

      const response = await request(server)
        .post("/api/v1/bids/")
        .set({ "Content-Type": "application/json" })
        .set({ Authorization: `Bearer validAccessToken` })
        .send({
          message: "Test message",
        });

      expect(jwt.decode).toHaveBeenCalledWith("validAccessToken");
      expect(jwt.decode).toHaveReturnedWith({ userId });
      expect(mockBidCreate).toHaveBeenCalledWith(options);
      expect(mockBidCreate).toHaveReturnedWith(null);
      expect(response.statusCode).toBe(200);
    });

    test("should return JSON response with message, if user is not found with provided id in jwt payload while creating a new bid, and 400 status code", async () => {
      mockBidCreate = jest.spyOn(Bid, "create").mockImplementation((options) => {
        throw new Error('insert or update on table "bids" violates foreign key constraint "bids_authorId_fkey"');
      });

      const response = await request(server)
        .post("/api/v1/bids/")
        .set({ "Content-Type": "application/json" })
        .set({ Authorization: `Bearer validAccessToken` })
        .send({
          message: "Test message",
        });

      expect(jwt.decode).toHaveBeenCalledWith("validAccessToken");
      expect(jwt.decode).toHaveReturnedWith({ userId });
      expect(mockBidCreate).toHaveBeenCalledWith(options);
      expect(response.text).toEqual(
        JSON.stringify({
          message: 'insert or update on table "bids" violates foreign key constraint "bids_authorId_fkey"',
        }),
      );
      expect(response.statusCode).toBe(400);
    });
  });

  describe("", () => {});

  describe("", () => {});

  describe("", () => {});
});
