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

  describe("- get bids list", () => {
    let mockBidFindAndCountAll;
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

      server = (await import("#server/server.js")).default;
    });

    afterEach(async () => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    test("should return bids list and 200 status code", async () => {
      mockBidFindAndCountAll = jest.spyOn(Bid, "findAndCountAll").mockImplementation(() => {
        return {
          bids: [
            {
              id: "f0a85187-7b03-48aa-b89e-9d8e20a429f8",
              status: "pending",
              message: "Culpa reiciendis eaque praesentium quo corporis quos optio voluptate nulla.",
              authorId: "adb1167d-f532-4819-8da5-2d3987b046ee",
              createdAt: "2025-04-14T18:29:13.963Z",
              updatedAt: "2025-04-14T18:29:13.963Z",
              deletedAt: null,
            },
          ],
          count: 1,
          limit: 10,
          offset: 0,
        };
      });

      const response = await request(server)
        .get("/api/v1/bids/")
        .set({ "Content-Type": "application/json" })
        .set({ Authorization: `Bearer validAccessToken` })
        .query({
          limit: 10,
          offset: 0,
        });

      expect(mockBidFindAndCountAll).toHaveBeenCalledWith({
        limit: 10,
        offset: 0,
      });
      expect(mockBidFindAndCountAll).toHaveReturnedWith({
        bids: [
          {
            id: "f0a85187-7b03-48aa-b89e-9d8e20a429f8",
            status: "pending",
            message: "Culpa reiciendis eaque praesentium quo corporis quos optio voluptate nulla.",
            authorId: "adb1167d-f532-4819-8da5-2d3987b046ee",
            createdAt: "2025-04-14T18:29:13.963Z",
            updatedAt: "2025-04-14T18:29:13.963Z",
            deletedAt: null,
          },
        ],
        count: 1,
        limit: 10,
        offset: 0,
      });
      expect(response.statusCode).toBe(200);
    });

    test("should return JSON response with message, if findAndCountAll or smth else throws an error, and 400 status code", async () => {
      mockBidFindAndCountAll = jest.spyOn(Bid, "findAndCountAll").mockImplementation(() => {
        throw new Error("Smth goes wrong");
      });

      const response = await request(server)
        .get("/api/v1/bids/")
        .set({ "Content-Type": "application/json" })
        .set({ Authorization: `Bearer validAccessToken` })
        .query({
          limit: 10,
          offset: 0,
        });

      expect(mockBidFindAndCountAll).toHaveBeenCalledWith({
        limit: 10,
        offset: 0,
      });
      expect(response.text).toEqual(JSON.stringify({ message: "Smth goes wrong" }));
      expect(response.statusCode).toBe(400);
    });

    test("should return JSON response with message, if not valid data in req.query, and 400 status code", async () => {
      mockBidFindAndCountAll = jest.fn();

      const response = await request(server)
        .get("/api/v1/bids/")
        .set({ "Content-Type": "application/json" })
        .set({ Authorization: `Bearer validAccessToken` })
        .query({
          limit: "not a number",
          offset: "not a number",
        });

      expect(mockBidFindAndCountAll).not.toHaveBeenCalled();
      expect(response.text).toEqual(
        JSON.stringify({
          message: {
            code: "invalid_type",
            expected: "number",
            received: "nan",
            path: ["query", "limit"],
            message: "Expected number, received nan",
          },
        }),
      );
      expect(response.statusCode).toBe(400);
    });
  });

  describe("", () => {
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

      server = (await import("#server/server.js")).default;
    });

    afterEach(async () => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    test("", async () => {});

    test("", async () => {});
  });

  describe("", () => {
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

      server = (await import("#server/server.js")).default;
    });

    afterEach(async () => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    test("", async () => {});

    test("", async () => {});
  });
});
