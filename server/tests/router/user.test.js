import request from "supertest";
import { sequelizeConnection } from "#server/models/index.js";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, jest, test } from "@jest/globals";
import jwt from "jsonwebtoken";
import { createFakeUser } from "#server/tests/fixtures/user.js";
import { User } from "#server/models/index.js";
import { v4 as uuidv4 } from "uuid";
import { unauthorizedError } from "#server/utils/errors.js";
import crypto from "crypto";
import fs from "fs";

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
    let hashedPassword;
    let server;

    beforeEach(async () => {
      user = createFakeUser();
      hashedPassword = crypto.createHash("sha256").update(user.password).digest("hex");
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

    test("should return 200 OK and user profile", async () => {
      mockUserFindOne = jest.spyOn(User, "findOne").mockImplementation((options) => {
        return {
          ...user,
          id: options.where.id,
          password: hashedPassword,
        };
      });

      const response = await request(server)
        .get("/api/v1/user/profile")
        .set({ "Content-Type": "application/json" })
        .set({ Authorization: `Bearer validAccessToken` });

      expect(jwt.decode).toHaveBeenCalledWith("validAccessToken");
      expect(jwt.decode).toHaveReturnedWith({ userId });
      expect(mockUserFindOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(mockUserFindOne).toHaveReturnedWith({
        ...user,
        id: userId,
        password: undefined,
      });
      expect(response.text).toEqual(JSON.stringify({ ...user, id: userId, password: undefined }));
      expect(response.statusCode).toBe(200);
    });

    test("should return JSON response with message, if user is not found with provided id in jwt payload, and 404 status code", async () => {
      mockUserFindOne = jest.spyOn(User, "findOne").mockImplementation((options) => {
        return null;
      });

      const response = await request(server)
        .get("/api/v1/user/profile")
        .set({ "Content-Type": "application/json" })
        .set({ Authorization: `Bearer validAccessToken` });

      expect(jwt.decode).toHaveBeenCalledWith("validAccessToken");
      expect(jwt.decode).toHaveReturnedWith({ userId });
      expect(mockUserFindOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(mockUserFindOne).toHaveReturnedWith(null);
      expect(response.text).toEqual(JSON.stringify({ message: "User not found!" }));
      expect(response.statusCode).toBe(404);
    });

    test("should return JSON response with message, if User.findOne or smth else throws an error, and 400 status code", async () => {
      mockUserFindOne = jest.spyOn(User, "findOne").mockImplementation((options) => {
        throw new Error("Failed when finding user!");
      });

      const response = await request(server)
        .get("/api/v1/user/profile")
        .set({ "Content-Type": "application/json" })
        .set({ Authorization: `Bearer validAccessToken` });

      expect(jwt.decode).toHaveBeenCalledWith("validAccessToken");
      expect(jwt.decode).toHaveReturnedWith({ userId });
      expect(mockUserFindOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(response.text).toEqual(JSON.stringify({ message: "Failed when finding user!" }));
      expect(response.statusCode).toBe(400);
    });
  });

  describe("- update user profile", () => {
    let userId = uuidv4();
    let user;
    let avatar;
    let mockUserFindOne;
    let mockUserUpdate;
    let hashedPassword;
    let server;

    beforeEach(async () => {
      user = createFakeUser();
      avatar = fs.createReadStream("./assets/IMG/avatar.png");
      hashedPassword = crypto.createHash("sha256").update(user.password).digest("hex");
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

    test("should return 200 OK when updated successfully", async () => {
      mockUserFindOne = jest.spyOn(User, "findOne").mockImplementation((options) => {
        return {
          ...user,
          id: options.where.id,
          password: hashedPassword,
          avatar: null,
        };
      });

      mockUserUpdate = jest.spyOn(User, "update").mockImplementation((options) => {
        return;
      });

      const response = await request(server)
        .put("/api/v1/user/profile")
        .set({ "Content-Type": "multipart/form-data" })
        .set({ Authorization: `Bearer validAccessToken` })
        .field("username", user.username)
        .field("firstName", user.firstName)
        .field("lastName", user.lastName)
        .field("gender", user.gender)
        .field("isAdmin", user.isAdmin)
        .attach("avatar", avatar);

      expect(jwt.decode).toHaveBeenCalledWith("validAccessToken");
      expect(jwt.decode).toHaveReturnedWith({ userId });
      expect(mockUserFindOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(mockUserFindOne).toHaveReturnedWith({
        ...user,
        id: userId,
        password: hashedPassword,
        avatar: null,
      });
      expect(mockUserUpdate).toHaveBeenCalledWith(
        {
          username: user.username,
          first_name: user.firstName,
          last_name: user.lastName,
          gender: user.gender,
          isAdmin: user.isAdmin ? "true" : "false",
          avatar: expect.stringMatching(
            /uploads\/avatars\/avatar-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.jpe?g|png$/,
          ),
        },
        { where: { id: userId } },
      );
      expect(response.statusCode).toBe(200);
    });

    test("", async () => {});

    test("", async () => {});

    test("", async () => {});
  });
});
