import request from "supertest";
import jwt from "jsonwebtoken";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, jest, test } from "@jest/globals";
import { sequelizeConnection, Bid, User } from "#server/models/index.js";
import { v4 as uuidv4 } from "uuid";
import { createFakeUser } from "#server/tests/fixtures/user.js";
import { unauthorizedError } from "#server/utils/errors.js";

describe("Bids routes:", () => {
  beforeAll(async () => {
    await sequelizeConnection.authenticate();
  });

  afterAll(async () => {
    await sequelizeConnection.close();
  });

  describe("- create a new bid", () => {
    const userId = uuidv4();
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
    const bids = [
      {
        id: "f0a85187-7b03-48aa-b89e-9d8e20a429f8",
        status: "pending",
        message: "Culpa reiciendis eaque praesentium quo corporis quos optio voluptate nulla.",
        authorId: "adb1167d-f532-4819-8da5-2d3987b046ee",
        createdAt: "2025-04-14T18:29:13.963Z",
        updatedAt: "2025-04-14T18:29:13.963Z",
        deletedAt: null,
      },
    ];
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
          rows: bids,
          count: 1,
        };
      });

      const response = await request(server)
        .get("/api/v1/bids/")
        .set({ "Content-Type": "application/json" })
        .set({ Authorization: `Bearer validAccessToken` });

      expect(mockBidFindAndCountAll).toHaveBeenCalledWith({
        limit: 10,
        offset: 0,
      });
      expect(mockBidFindAndCountAll).toHaveReturnedWith({
        rows: bids,
        count: 1,
      });
      expect(response.text).toEqual(JSON.stringify({ bids, count: 1, limit: 10, offset: 0 }));
      expect(response.statusCode).toBe(200);
    });

    test("should return JSON response with message, if findAndCountAll or smth else throws an error, and 400 status code", async () => {
      mockBidFindAndCountAll = jest.spyOn(Bid, "findAndCountAll").mockImplementation(() => {
        throw new Error("Smth goes wrong");
      });

      const response = await request(server)
        .get("/api/v1/bids/")
        .set({ "Content-Type": "application/json" })
        .set({ Authorization: `Bearer validAccessToken` });

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

  describe("- get single bid", () => {
    const bidId = uuidv4();
    const authorId = uuidv4();
    let mockBidFindOne;
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

    test("should return one bid info and 200 status code", async () => {
      mockBidFindOne = jest.spyOn(Bid, "findOne").mockImplementation((options) => {
        return {
          id: bidId,
          status: "pending",
          message: "Culpa reiciendis eaque praesentium quo corporis quos optio voluptate nulla.",
          authorId,
          createdAt: "2025-04-14T18:29:13.963Z",
          updatedAt: "2025-04-14T18:29:13.963Z",
          deletedAt: null,
        };
      });

      const response = await request(server)
        .get(`/api/v1/bids/${bidId}`)
        .set({ "Content-Type": "application/json" })
        .set({ Authorization: `Bearer validAccessToken` });

      expect(mockBidFindOne).toHaveBeenCalledWith({ where: { id: bidId } });
      expect(mockBidFindOne).toHaveReturnedWith({
        id: bidId,
        status: "pending",
        message: "Culpa reiciendis eaque praesentium quo corporis quos optio voluptate nulla.",
        authorId,
        createdAt: "2025-04-14T18:29:13.963Z",
        updatedAt: "2025-04-14T18:29:13.963Z",
        deletedAt: null,
      });
      expect(response.statusCode).toBe(200);
    });

    test("should return JSON response with message, if bid is not found, and 404 status code", async () => {
      mockBidFindOne = jest.spyOn(Bid, "findOne").mockImplementation((options) => {
        return null;
      });

      const response = await request(server)
        .get(`/api/v1/bids/${bidId}`)
        .set({ "Content-Type": "application/json" })
        .set({ Authorization: `Bearer validAccessToken` });

      expect(mockBidFindOne).toHaveBeenCalledWith({ where: { id: bidId } });
      expect(mockBidFindOne).toHaveReturnedWith(null);
      expect(response.text).toEqual(JSON.stringify({ message: "Bid not found!" }));
      expect(response.statusCode).toBe(404);
    });

    test("should return JSON response with message, if Bid.findOne or smth else throws an error, and 400 status code", async () => {
      mockBidFindOne = jest.spyOn(Bid, "findOne").mockImplementation((options) => {
        throw new Error("Smth goes wrong");
      });

      const response = await request(server)
        .get(`/api/v1/bids/${bidId}`)
        .set({ "Content-Type": "application/json" })
        .set({ Authorization: `Bearer validAccessToken` });

      expect(mockBidFindOne).toHaveBeenCalledWith({ where: { id: bidId } });
      expect(response.text).toEqual(JSON.stringify({ message: "Smth goes wrong" }));
      expect(response.statusCode).toBe(400);
    });
  });

  describe("- resolve bid", () => {
    const userId = uuidv4();
    const bidId = uuidv4();
    const user = createFakeUser();
    let mockUserFindOne;
    let mockBidFindOne;
    let mockBidUpdate;
    let server;

    beforeEach(async () => {
      jest.spyOn(jwt, "decode").mockImplementation((accessToken) => {
        if (accessToken !== "validAccessToken") {
          return null;
        }

        return { userId };
      });

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

    test("should process one bid, send an email and return 200 status code", async () => {
      mockUserFindOne = jest.spyOn(User, "findOne").mockImplementation((options) => {
        return {
          id: userId,
          username: user.username,
          email: user.email,
          isAdmin: true,
        };
      });

      mockBidFindOne = jest.spyOn(Bid, "findOne").mockImplementation((options) => true);

      mockBidUpdate = jest.spyOn(Bid, "update").mockImplementation((options) => true);

      const response = await request(server)
        .patch(`/api/v1/bids/${bidId}`)
        .set({ "Content-Type": "application/json" })
        .set({ Authorization: `Bearer validAccessToken` })
        .send({
          status: "resolved",
        });

      expect(jwt.decode).toHaveBeenCalledWith("validAccessToken");
      expect(jwt.decode).toHaveReturnedWith({ userId });
      expect(mockUserFindOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(mockUserFindOne).toHaveReturnedWith({
        id: userId,
        username: user.username,
        email: user.email,
        isAdmin: true,
      });
      expect(mockBidFindOne).toHaveBeenCalledWith({ where: { id: bidId } });
      expect(mockBidFindOne).toHaveReturnedWith(true);
      expect(mockBidUpdate).toHaveBeenCalledWith({ status: "resolved" }, { where: { id: bidId } });
      expect(mockBidUpdate).toHaveReturnedWith(true);
      expect(response.statusCode).toBe(200);
    });

    test("should return JSON response with message, if user is not found with provided id in jwt payload, and 404 status code", async () => {
      mockUserFindOne = jest.spyOn(User, "findOne").mockImplementation((options) => null);

      const response = await request(server)
        .patch(`/api/v1/bids/${bidId}`)
        .set({ "Content-Type": "application/json" })
        .set({ Authorization: `Bearer validAccessToken` })
        .send({
          status: "resolved",
        });

      expect(jwt.decode).toHaveBeenCalledWith("validAccessToken");
      expect(jwt.decode).toHaveReturnedWith({ userId });
      expect(mockUserFindOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(mockUserFindOne).toHaveReturnedWith(null);
      expect(response.text).toEqual(JSON.stringify({ message: "User not found!" }));
      expect(response.statusCode).toBe(404);
    });

    test("should return JSON response with message, if user is not admin, and 401 status code", async () => {
      mockUserFindOne = jest.spyOn(User, "findOne").mockImplementation((options) => {
        return {
          id: userId,
          username: user.username,
          email: user.email,
          isAdmin: false,
        };
      });

      const response = await request(server)
        .patch(`/api/v1/bids/${bidId}`)
        .set({ "Content-Type": "application/json" })
        .set({ Authorization: `Bearer validAccessToken` })
        .send({
          status: "resolved",
        });

      expect(jwt.decode).toHaveBeenCalledWith("validAccessToken");
      expect(jwt.decode).toHaveReturnedWith({ userId });
      expect(mockUserFindOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(mockUserFindOne).toHaveReturnedWith({
        id: userId,
        username: user.username,
        email: user.email,
        isAdmin: false,
      });
      expect(response.text).toEqual(JSON.stringify({ message: "Only admins can process bids!" }));
      expect(response.statusCode).toBe(401);
    });

    test("should return JSON response with message, if bid is not found, and 404 status code", async () => {
      mockUserFindOne = jest.spyOn(User, "findOne").mockImplementation((options) => {
        return {
          id: userId,
          username: user.username,
          email: user.email,
          isAdmin: true,
        };
      });

      mockBidFindOne = jest.spyOn(Bid, "findOne").mockImplementation((options) => {
        return null;
      });

      const response = await request(server)
        .patch(`/api/v1/bids/${bidId}`)
        .set({ "Content-Type": "application/json" })
        .set({ Authorization: `Bearer validAccessToken` })
        .send({
          status: "resolved",
        });

      expect(jwt.decode).toHaveBeenCalledWith("validAccessToken");
      expect(jwt.decode).toHaveReturnedWith({ userId });
      expect(mockUserFindOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(mockUserFindOne).toHaveReturnedWith({
        id: userId,
        username: user.username,
        email: user.email,
        isAdmin: true,
      });
      expect(mockBidFindOne).toHaveBeenCalledWith({ where: { id: bidId } });
      expect(mockBidFindOne).toHaveReturnedWith(null);
      expect(response.text).toEqual(JSON.stringify({ message: "Bid not found!" }));
      expect(response.statusCode).toBe(404);
    });

    test("should return JSON response with message, if Bid.update or smth else throws an error, and 400 status code", async () => {
      mockUserFindOne = jest.spyOn(User, "findOne").mockImplementation((options) => {
        return {
          id: userId,
          username: user.username,
          email: user.email,
          isAdmin: true,
        };
      });

      mockBidFindOne = jest.spyOn(Bid, "findOne").mockImplementation((options) => {
        return true;
      });

      mockBidUpdate = jest.spyOn(Bid, "update").mockImplementation((options) => {
        throw new Error("Smth goes wrong");
      });

      const response = await request(server)
        .patch(`/api/v1/bids/${bidId}`)
        .set({ "Content-Type": "application/json" })
        .set({ Authorization: `Bearer validAccessToken` })
        .send({
          status: "resolved",
        });

      expect(jwt.decode).toHaveBeenCalledWith("validAccessToken");
      expect(jwt.decode).toHaveReturnedWith({ userId });
      expect(mockUserFindOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(mockUserFindOne).toHaveReturnedWith({
        id: userId,
        username: user.username,
        email: user.email,
        isAdmin: true,
      });
      expect(mockBidFindOne).toHaveBeenCalledWith({ where: { id: bidId } });
      expect(mockBidFindOne).toHaveReturnedWith(true);
      expect(mockBidUpdate).toHaveBeenCalledWith({ status: "resolved" }, { where: { id: bidId } });
      expect(response.text).toEqual(JSON.stringify({ message: "Smth goes wrong" }));
      expect(response.statusCode).toBe(400);
    });

    test("should return JSON response with message, if provided status is not valid, and 400 status code", async () => {
      mockUserFindOne = jest.fn();
      mockBidFindOne = jest.fn();
      mockBidUpdate = jest.fn();

      const response = await request(server)
        .patch(`/api/v1/bids/${bidId}`)
        .set({ "Content-Type": "application/json" })
        .set({ Authorization: `Bearer validAccessToken` })
        .send({
          status: "wrongStatus",
        });

      expect(jwt.decode).not.toHaveBeenCalled();
      expect(mockUserFindOne).not.toHaveBeenCalled();
      expect(mockBidFindOne).not.toHaveBeenCalled();
      expect(mockBidUpdate).not.toHaveBeenCalled();
      expect(response.text).toEqual(
        JSON.stringify({
          message: {
            received: "wrongStatus",
            code: "invalid_enum_value",
            options: ["pending", "resolved", "rejected"],
            path: ["body", "status"],
            message: "Invalid enum value. Expected 'pending' | 'resolved' | 'rejected', received 'wrongStatus'",
          },
        }),
      );
      expect(response.statusCode).toBe(400);
    });
  });
});
