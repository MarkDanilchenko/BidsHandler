import request from "supertest";
import { afterAll, beforeAll, beforeEach, expect, jest } from "@jest/globals";
import { sequelizeConnection, User, Bid, Comment } from "#server/models/index.js";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { unauthorizedError } from "#server/utils/errors.js";

describe("BidComments routes:", () => {
  beforeAll(async () => {
    await sequelizeConnection.authenticate();
  });

  afterAll(async () => {
    await sequelizeConnection.close();
  });

  describe("- create bid comment", () => {
    const userId = uuidv4();
    const bidId = uuidv4();
    let mockUserFindOne;
    let mockBidFindOne;
    let mockCommentCreate;
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

    test("should create a new bid comment and return 201 status code", async () => {
      mockUserFindOne = jest.spyOn(User, "findOne").mockImplementation(() => {
        return true;
      });

      mockBidFindOne = jest.spyOn(Bid, "findOne").mockImplementation(() => {
        return true;
      });

      mockCommentCreate = jest.spyOn(Comment, "create").mockImplementation(() => {
        return true;
      });

      const response = await request(server)
        .post(`/api/v1/bids/${bidId}/comments/`)
        .set({ "Content-Type": "application/json" })
        .set({ Authorization: `Bearer validAccessToken` })
        .send({
          message: "Test message",
        });

      expect(jwt.decode).toHaveBeenCalledWith("validAccessToken");
      expect(jwt.decode).toHaveReturnedWith({ userId });
      expect(mockUserFindOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(mockUserFindOne).toHaveReturnedWith(true);
      expect(mockBidFindOne).toHaveBeenCalledWith({ where: { id: bidId } });
      expect(mockBidFindOne).toHaveReturnedWith(true);
      expect(mockCommentCreate).toHaveBeenCalledWith({
        message: "Test message",
        authorId: userId,
        bidId,
      });
      expect(mockCommentCreate).toHaveReturnedWith(true);
      expect(response.statusCode).toBe(201);
    });

    test("should return JSON response with message, if user is not found with provided id in jwt payload, and 404 status code", async () => {
      mockUserFindOne = jest.spyOn(User, "findOne").mockImplementation(() => null);
      mockBidFindOne = jest.fn();
      mockCommentCreate = jest.fn();

      const response = await request(server)
        .post(`/api/v1/bids/${bidId}/comments/`)
        .set({ "Content-Type": "application/json" })
        .set({ Authorization: `Bearer validAccessToken` })
        .send({
          message: "Test message",
        });

      expect(jwt.decode).toHaveBeenCalledWith("validAccessToken");
      expect(jwt.decode).toHaveReturnedWith({ userId });
      expect(mockUserFindOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(mockUserFindOne).toHaveReturnedWith(null);
      expect(mockBidFindOne).not.toHaveBeenCalled();
      expect(mockCommentCreate).not.toHaveBeenCalled();
      expect(response.text).toEqual(JSON.stringify({ message: "User not found!" }));
      expect(response.statusCode).toBe(404);
    });

    test("should return JSON response with message, if related bid is not found, and 404 status code", async () => {
      mockUserFindOne = jest.spyOn(User, "findOne").mockImplementation(() => true);
      mockBidFindOne = jest.spyOn(Bid, "findOne").mockImplementation(() => null);
      mockCommentCreate = jest.fn();

      const response = await request(server)
        .post(`/api/v1/bids/${bidId}/comments/`)
        .set({ "Content-Type": "application/json" })
        .set({ Authorization: `Bearer validAccessToken` })
        .send({
          message: "Test message",
        });

      expect(jwt.decode).toHaveBeenCalledWith("validAccessToken");
      expect(jwt.decode).toHaveReturnedWith({ userId });
      expect(mockUserFindOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(mockUserFindOne).toHaveReturnedWith(true);
      expect(mockBidFindOne).toHaveBeenCalledWith({ where: { id: bidId } });
      expect(mockBidFindOne).toHaveReturnedWith(null);
      expect(mockCommentCreate).not.toHaveBeenCalled();
      expect(response.text).toEqual(JSON.stringify({ message: "Bid not found!" }));
      expect(response.statusCode).toBe(404);
    });

    test("should return JSON response with message, if Comment.create or smth else throws an error, and 400 status code", async () => {
      mockUserFindOne = jest.spyOn(User, "findOne").mockImplementation(() => true);
      mockBidFindOne = jest.spyOn(Bid, "findOne").mockImplementation(() => true);
      mockCommentCreate = jest.spyOn(Comment, "create").mockImplementation(() => {
        throw new Error("Smth goes wrong");
      });

      const response = await request(server)
        .post(`/api/v1/bids/${bidId}/comments/`)
        .set({ "Content-Type": "application/json" })
        .set({ Authorization: `Bearer validAccessToken` })
        .send({
          message: "Test message",
        });

      expect(jwt.decode).toHaveBeenCalledWith("validAccessToken");
      expect(jwt.decode).toHaveReturnedWith({ userId });
      expect(mockUserFindOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(mockUserFindOne).toHaveReturnedWith(true);
      expect(mockBidFindOne).toHaveBeenCalledWith({ where: { id: bidId } });
      expect(mockBidFindOne).toHaveReturnedWith(true);
      expect(mockCommentCreate).toHaveBeenCalledWith({
        message: "Test message",
        authorId: userId,
        bidId,
      });
      expect(response.text).toEqual(JSON.stringify({ message: "Smth goes wrong" }));
      expect(response.statusCode).toBe(400);
    });

    test("should return JSON response with message, if access token is not valid, and 400 status code", async () => {
      mockUserFindOne = jest.fn();
      mockBidFindOne = jest.fn();
      mockCommentCreate = jest.fn();

      const response = await request(server)
        .post(`/api/v1/bids/${bidId}/comments/`)
        .set({ "Content-Type": "application/json" })
        .set({ Authorization: `Bearer notValidAccessToken` })
        .send({
          message: "Test message",
        });

      expect(jwt.decode).not.toHaveBeenCalled();
      expect(mockUserFindOne).not.toHaveBeenCalled();
      expect(mockBidFindOne).not.toHaveBeenCalled();
      expect(mockCommentCreate).not.toHaveBeenCalled();
      expect(response.text).toEqual(JSON.stringify({ message: "Access token not found or is not valid!" }));
      expect(response.statusCode).toBe(401);
    });
  });

  describe("- get a bid's comments", () => {
    const userId = uuidv4();
    const bidId = uuidv4();
    const comments = [
      {
        id: uuidv4(),
        message: "Test message",
        authorId: userId,
        bidId,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
      {
        id: uuidv4(),
        message: "Another test message",
        authorId: userId,
        bidId,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
    ];
    let mockCommentFindAndCountAll;
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

    test("should return list of comments, related to bid and 200 status code", async () => {
      mockCommentFindAndCountAll = jest.spyOn(Comment, "findAndCountAll").mockImplementation(() => {
        return {
          rows: comments,
          count: 2,
        };
      });

      const response = await request(server)
        .get(`/api/v1/bids/${bidId}/comments/`)
        .set({ "Content-Type": "application/json" })
        .set({ Authorization: `Bearer validAccessToken` });

      expect(mockCommentFindAndCountAll).toHaveBeenCalledWith({
        where: { bidId },
        limit: 10,
        offset: 0,
      });
      expect(mockCommentFindAndCountAll).toHaveReturnedWith({
        rows: comments,
        count: 2,
      });
      expect(response.text).toEqual(JSON.stringify({ comments, count: 2, limit: 10, offset: 0 }));
      expect(response.statusCode).toBe(200);
    });

    test("should return JSON response with message, if access token is not valid, and 401 status code", async () => {
      mockCommentFindAndCountAll = jest.fn();

      const response = await request(server)
        .get(`/api/v1/bids/${bidId}/comments/`)
        .set({ "Content-Type": "application/json" })
        .set({ Authorization: `Bearer notValidAccessToken` });

      expect(mockCommentFindAndCountAll).not.toHaveBeenCalled();
      expect(response.text).toEqual(JSON.stringify({ message: "Access token not found or is not valid!" }));
      expect(response.statusCode).toBe(401);
    });

    test("should return JSON response with message, if there are no related comments or bid does not exist with provided id in params, and 404 status code", async () => {
      mockCommentFindAndCountAll = jest.spyOn(Comment, "findAndCountAll").mockImplementation(() => {
        return {
          rows: [],
          count: 0,
        };
      });

      const response = await request(server)
        .get(`/api/v1/bids/${bidId}/comments/`)
        .set({ "Content-Type": "application/json" })
        .set({ Authorization: `Bearer validAccessToken` });

      expect(mockCommentFindAndCountAll).toHaveBeenCalledWith({
        where: { bidId },
        limit: 10,
        offset: 0,
      });
      expect(mockCommentFindAndCountAll).toHaveReturnedWith({
        rows: [],
        count: 0,
      });
      expect(response.text).toEqual(JSON.stringify({ message: "Comments not found!" }));
      expect(response.statusCode).toBe(404);
    });
  });

  describe("- edit bid's comment", () => {
    const userId = uuidv4();
    const bidId = uuidv4();
    const commentId = uuidv4();
    let mockUserFindOne;
    let mockBidFindOne;
    let mockCommentFindOne;
    let mockCommentUpdate;
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

    test("should edit comment, that is related to bid and user and return 200 status code", async () => {
      mockUserFindOne = jest.spyOn(User, "findOne").mockImplementation(() => true);

      mockBidFindOne = jest.spyOn(Bid, "findOne").mockImplementation(() => true);

      mockCommentFindOne = jest.spyOn(Comment, "findOne").mockImplementation(() => true);

      mockCommentUpdate = jest.spyOn(Comment, "update").mockImplementation(() => true);

      const response = await request(server)
        .patch(`/api/v1/bids/${bidId}/comments/${commentId}`)
        .set({ "Content-Type": "application/json" })
        .set({ Authorization: `Bearer validAccessToken` })
        .send({
          message: "Test message",
        });

      expect(jwt.decode).toHaveBeenCalledWith("validAccessToken");
      expect(jwt.decode).toHaveReturnedWith({ userId });
      expect(mockUserFindOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(mockBidFindOne).toHaveBeenCalledWith({ where: { id: bidId } });
      expect(mockCommentFindOne).toHaveBeenCalledWith({ where: { id: commentId } });
      expect(mockCommentUpdate).toHaveBeenCalledWith(
        { message: "Test message" },
        { where: { id: commentId, authorId: userId, bidId } },
      );
      expect(response.statusCode).toBe(200);
    });

    test("should return JSON response with message, if related bid/comment/user is not found, and 404 status code", async () => {
      mockUserFindOne = jest.spyOn(User, "findOne").mockImplementation(() => null);
      mockBidFindOne = jest.fn();
      mockCommentFindOne = jest.fn();
      mockCommentUpdate = jest.fn();

      const response = await request(server)
        .patch(`/api/v1/bids/${bidId}/comments/${commentId}`)
        .set({ "Content-Type": "application/json" })
        .set({ Authorization: `Bearer validAccessToken` })
        .send({
          message: "Test message",
        });

      expect(jwt.decode).toHaveBeenCalledWith("validAccessToken");
      expect(jwt.decode).toHaveReturnedWith({ userId });
      expect(mockUserFindOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(mockUserFindOne).toHaveReturnedWith(null);
      expect(mockBidFindOne).not.toHaveBeenCalled();
      expect(mockCommentFindOne).not.toHaveBeenCalled();
      expect(mockCommentUpdate).not.toHaveBeenCalled();
      expect(response.text).toEqual(JSON.stringify({ message: "User not found!" }));
      expect(response.statusCode).toBe(404);
    });

    test("should return JSON response with message, if Comment.update or smth else throws an error, and 400 status code", async () => {
      mockUserFindOne = jest.spyOn(User, "findOne").mockImplementation(() => true);
      mockBidFindOne = jest.spyOn(Bid, "findOne").mockImplementation(() => true);
      mockCommentFindOne = jest.spyOn(Comment, "findOne").mockImplementation(() => true);

      mockCommentUpdate = jest.spyOn(Comment, "update").mockImplementation(() => {
        throw new Error("Smth goes wrong");
      });

      const response = await request(server)
        .patch(`/api/v1/bids/${bidId}/comments/${commentId}`)
        .set({ "Content-Type": "application/json" })
        .set({ Authorization: `Bearer validAccessToken` })
        .send({
          message: "Test message",
        });

      expect(jwt.decode).toHaveBeenCalledWith("validAccessToken");
      expect(jwt.decode).toHaveReturnedWith({ userId });
      expect(mockUserFindOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(mockBidFindOne).toHaveBeenCalledWith({ where: { id: bidId } });
      expect(mockCommentFindOne).toHaveBeenCalledWith({ where: { id: commentId } });
      expect(mockCommentUpdate).toHaveBeenCalledWith(
        { message: "Test message" },
        { where: { id: commentId, authorId: userId, bidId } },
      );
      expect(response.text).toEqual(JSON.stringify({ message: "Smth goes wrong" }));
      expect(response.statusCode).toBe(400);
    });
  });

  describe("- delete bid's comment", () => {
    const userId = uuidv4();
    const bidId = uuidv4();
    const commentId = uuidv4();
    let mockUserFindOne;
    let mockBidFindOne;
    let mockCommentFindOne;
    let mockCommentDestroy;
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

    test("should delete comment, that is related to bid and user and return 200 status code", async () => {
      mockUserFindOne = jest.spyOn(User, "findOne").mockImplementation(() => true);

      mockBidFindOne = jest.spyOn(Bid, "findOne").mockImplementation(() => true);

      mockCommentFindOne = jest.spyOn(Comment, "findOne").mockImplementation(() => true);

      mockCommentDestroy = jest.spyOn(Comment, "destroy").mockImplementation(() => true);

      const response = await request(server)
        .delete(`/api/v1/bids/${bidId}/comments/${commentId}`)
        .set({ "Content-Type": "application/json" })
        .set({ Authorization: `Bearer validAccessToken` });

      expect(jwt.decode).toHaveBeenCalledWith("validAccessToken");
      expect(jwt.decode).toHaveReturnedWith({ userId });
      expect(mockUserFindOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(mockBidFindOne).toHaveBeenCalledWith({ where: { id: bidId } });
      expect(mockCommentFindOne).toHaveBeenCalledWith({ where: { id: commentId } });
      expect(mockCommentDestroy).toHaveBeenCalledWith({ where: { id: commentId, authorId: userId, bidId } });
      expect(response.statusCode).toBe(204);
    });

    test("should return JSON response with message, if related bid/comment/user is not found, and 404 status code", async () => {
      mockUserFindOne = jest.spyOn(User, "findOne").mockImplementation(() => true);

      mockBidFindOne = jest.spyOn(Bid, "findOne").mockImplementation(() => null);

      mockCommentFindOne = jest.fn();

      mockCommentDestroy = jest.fn();

      const response = await request(server)
        .delete(`/api/v1/bids/${bidId}/comments/${commentId}`)
        .set({ "Content-Type": "application/json" })
        .set({ Authorization: `Bearer validAccessToken` });

      expect(jwt.decode).toHaveBeenCalledWith("validAccessToken");
      expect(jwt.decode).toHaveReturnedWith({ userId });
      expect(mockUserFindOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(mockBidFindOne).toHaveBeenCalledWith({ where: { id: bidId } });
      expect(mockCommentFindOne).not.toHaveBeenCalled();
      expect(mockCommentDestroy).not.toHaveBeenCalled();
      expect(response.text).toEqual(JSON.stringify({ message: "Bid not found!" }));
      expect(response.statusCode).toBe(404);
    });

    test("should return JSON response with message, if Comment.destroy or smth else throws an error, and 400 status code", async () => {
      mockUserFindOne = jest.spyOn(User, "findOne").mockImplementation(() => true);

      mockBidFindOne = jest.spyOn(Bid, "findOne").mockImplementation(() => true);

      mockCommentFindOne = jest.spyOn(Comment, "findOne").mockImplementation(() => true);

      mockCommentDestroy = jest.spyOn(Comment, "destroy").mockImplementation(() => {
        throw new Error("Smth goes wrong");
      });

      const response = await request(server)
        .delete(`/api/v1/bids/${bidId}/comments/${commentId}`)
        .set({ "Content-Type": "application/json" })
        .set({ Authorization: `Bearer validAccessToken` });

      expect(jwt.decode).toHaveBeenCalledWith("validAccessToken");
      expect(jwt.decode).toHaveReturnedWith({ userId });
      expect(mockUserFindOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(mockBidFindOne).toHaveBeenCalledWith({ where: { id: bidId } });
      expect(mockCommentFindOne).toHaveBeenCalledWith({ where: { id: commentId } });
      expect(mockCommentDestroy).toHaveBeenCalledWith({ where: { id: commentId, authorId: userId, bidId } });
      expect(response.text).toEqual(JSON.stringify({ message: "Smth goes wrong" }));
      expect(response.statusCode).toBe(400);
    });
  });
});
