import fs from "fs";
import request from "supertest";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, jest } from "@jest/globals";
import { createFakeUser } from "#server/tests/fixtures/user.js";
import { sequelizeConnection, User, Jwt } from "#server/models/index.js";
import { v4 as uuidv4 } from "uuid";
import { badRequestError, notFoundError, unauthorizedError } from "#server/utils/errors.js";
import { response } from "express";

describe("Auth routes:", () => {
  beforeAll(async () => {
    await sequelizeConnection.authenticate();
  });

  afterAll(async () => {
    await sequelizeConnection.close();
  });

  describe("- signout:", () => {
    let mockJwtDestroy;
    let mockUserFindOne;
    let userId = uuidv4();
    let server;

    beforeEach(async () => {
      mockJwtDestroy = jest.spyOn(Jwt, "destroy");

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
            return unauthorizedError(res, "Access token not found!");
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

    test("should find jwt record by user id and delete it, return 200 status code", async () => {
      mockUserFindOne = jest.spyOn(User, "findOne").mockImplementation((options) => {
        return {
          id: options.where.id,
        };
      });

      const response = await request(server)
        .post("/api/v1/auth/signout")
        .set({ "Content-Type": "application/json" })
        .set({ Authorization: `Bearer validAccessToken` });

      expect(jwt.decode).toHaveBeenCalledWith("validAccessToken");
      expect(mockUserFindOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(mockUserFindOne).toHaveReturnedWith({ id: userId });
      expect(mockJwtDestroy).toHaveBeenCalledWith({ where: { userId } });
      expect(response.statusCode).toBe(200);
    });

    test("should return JSON response with message, if user is not found with provided id in jwt payload, and 404 status code", async () => {
      mockUserFindOne = jest.spyOn(User, "findOne").mockImplementation((options) => {
        return null;
      });

      const response = await request(server)
        .post("/api/v1/auth/signout")
        .set({ "Content-Type": "application/json" })
        .set({ Authorization: `Bearer validAccessToken` });

      expect(jwt.decode).toHaveBeenCalledWith("validAccessToken");
      expect(mockUserFindOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(mockUserFindOne).toHaveReturnedWith(null);
      expect(mockJwtDestroy).toHaveBeenCalledTimes(0);
      expect(response.text).toEqual(JSON.stringify({ message: "User not found!" }));
      expect(response.statusCode).toBe(404);
    });

    test("should return JSON response with message, if failed when destroying jwt record, and 400 status code", async () => {
      mockUserFindOne = jest.spyOn(User, "findOne").mockImplementation((options) => {
        return {
          id: options.where.id,
        };
      });
      mockJwtDestroy = jest.spyOn(Jwt, "destroy").mockImplementation((options) => {
        throw new Error("Failed when destroying jwt record!");
      });

      const response = await request(server)
        .post("/api/v1/auth/signout")
        .set({ "Content-Type": "application/json" })
        .set({ Authorization: `Bearer validAccessToken` });

      expect(jwt.decode).toHaveBeenCalledWith("validAccessToken");
      expect(mockUserFindOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(mockUserFindOne).toHaveReturnedWith({ id: userId });
      expect(mockJwtDestroy).toHaveBeenCalledWith({ where: { userId } });
      expect(response.text).toEqual(JSON.stringify({ message: "Failed when destroying jwt record!" }));
      expect(response.statusCode).toBe(400);
    });
  });

  // describe("- refresh token:", () => {
  //   test("", async () => {});

  //   test("", async () => {});

  //   test("", async () => {});
  // });
});
