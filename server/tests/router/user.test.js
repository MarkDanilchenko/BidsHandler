import request from "supertest";
import { sequelizeConnection } from "#server/models/index.js";
import { afterAll, afterEach, beforeAll, describe, expect, jest, test } from "@jest/globals";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";
import { createFakeUser } from "#server/tests/fixtures/user.js";
import { User } from "#server/models/index.js";
import { v4 as uuidv4 } from "uuid";

describe("User routes:", () => {
  beforeAll(async () => {
    await sequelizeConnection.authenticate();
  });

  afterAll(async () => {
    await sequelizeConnection.close();
  });

  describe("- retrieve user profile", () => {
    let userId = uuidv4();
    let user;
    let mockUserFindOne;
    let server;

    beforeEach(async () => {
      user = createFakeUser();
      jest.spyOn(jwt, "decode").mockImplementation((accessToken) => {
        if (accessToken !== "validAccessToken") {
          return null;
        }

        return { userId };
      });

      jest.unstable_mockModule("");

      server = (await import("#server/server.js")).default;
    });

    afterEach(async () => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    test("should return 200 OK and user profile", async () => {
      mockUserFindOne = jest.spyOn(User, "findOne").mockImplementation((options) => {
        return {
          ...user,
          id: options.where.id,
          password: "hashedPassword",
        };
      });

      const response = await request(server)
        .get("/api/v1/user/profile")
        .set({ "Content-Type": "application/json" })
        .set({ Authorization: `Bearer validAccessToken` });

      expect(jwt.decode).toHaveBeenCalledWith("validAccessToken");
      expect(mockUserFindOne).toHaveBeenNthCalledWith({
        where: {
          id: userId,
        },
      });
      expect(mockUserFindOne).toHaveReturnedWith({
        ...user,
        id: userId,
        password: "hashedPassword",
      });
      expect(response.text).toEqual(JSON.stringify({ ...user, id: userId }));
      expect(response.statusCode).toBe(200);
    });
    test("should return JSON response with message, if user is not found with provided id in jwt payload, and 404 status code", async () => {});
    test("should return JSON response with message, if jwt.decode or smth else throws an error, and 400 status code", async () => {});
  });
});
