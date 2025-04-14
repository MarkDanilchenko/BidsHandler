import request from "supertest";
import { sequelizeConnection } from "#server/models/index.js";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, jest, test } from "@jest/globals";
import jwt from "jsonwebtoken";
import { createFakeUser } from "#server/tests/fixtures/user.js";
import { User, Jwt } from "#server/models/index.js";
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

      jest.spyOn(fs, "unlink").mockImplementation(jest.fn());

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
      expect(fs.unlink).not.toHaveBeenCalled();
      expect(mockUserUpdate).toHaveBeenCalledWith(
        {
          username: user.username,
          first_name: user.firstName,
          last_name: user.lastName,
          gender: user.gender,
          isAdmin: user.isAdmin ?? false,
          avatar: expect.stringMatching(
            /uploads\/avatars\/avatar-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.jpe?g|png$/,
          ),
        },
        { where: { id: userId } },
      );
      expect(response.statusCode).toBe(200);
    });

    test("should return JSON response with message, if user is not found with provided id in jwt payload, and 404 status code", async () => {
      mockUserFindOne = jest.spyOn(User, "findOne").mockImplementation((options) => {
        return null;
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
      expect(mockUserFindOne).toHaveReturnedWith(null);
      expect(fs.unlink).not.toHaveBeenCalled();
      expect(mockUserUpdate).not.toHaveBeenCalled();
      expect(response.text).toEqual(JSON.stringify({ message: "User not found!" }));
      expect(response.statusCode).toBe(404);
    });

    test("should return JSON response with message, if User.update or smth else throws an error, and 400 status code", async () => {
      mockUserFindOne = jest.spyOn(User, "findOne").mockImplementation((options) => {
        return {
          ...user,
          id: options.where.id,
          password: hashedPassword,
          avatar: null,
        };
      });

      mockUserUpdate = jest.spyOn(User, "update").mockImplementation((options) => {
        throw new Error("Something went wrong!");
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
      expect(fs.unlink).not.toHaveBeenCalled();
      expect(mockUserUpdate).toHaveBeenCalledWith(
        {
          username: user.username,
          first_name: user.firstName,
          last_name: user.lastName,
          gender: user.gender,
          isAdmin: user.isAdmin ?? false,
          avatar: expect.stringMatching(
            /uploads\/avatars\/avatar-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.jpe?g|png$/,
          ),
        },
        { where: { id: userId } },
      );
      expect(response.text).toEqual(JSON.stringify({ message: "Something went wrong!" }));
      expect(response.statusCode).toBe(400);
    });

    test("should return JSON response with message, if provided data for update (for example: firstName or lastName) is not valid, and 400 status code", async () => {
      mockUserFindOne = jest.spyOn(User, "findOne").mockImplementation((options) => {
        return;
      });

      mockUserUpdate = jest.spyOn(User, "update").mockImplementation((options) => {
        return;
      });

      const response = await request(server)
        .put("/api/v1/user/profile")
        .set({ "Content-Type": "multipart/form-data" })
        .set({ Authorization: `Bearer validAccessToken` })
        .field("username", user.username)
        .field("firstName", "invalidFirstName" + "123")
        .field("lastName", "invalidLastName" + "456")
        .field("gender", user.gender)
        .field("isAdmin", user.isAdmin)
        .attach("avatar", avatar);

      expect(jwt.decode).not.toHaveBeenCalled();
      expect(mockUserFindOne).not.toHaveBeenCalled();
      expect(fs.unlink).toHaveBeenCalled(); // Avatar will be deleted with the server/middleware/requestValidation.js;
      expect(mockUserUpdate).not.toHaveBeenCalled();
      expect(response.text).toEqual(
        JSON.stringify({
          message: {
            validation: "regex",
            code: "invalid_string",
            message: "Invalid",
            path: ["body", "firstName"],
          },
        }),
      );
      expect(response.statusCode).toBe(400);
    });
  });

  describe("- delete user profile", () => {
    let userId = uuidv4();
    let mockUserFindOne;
    let mockUserDestroy;
    let mockJwtDestroy;
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

    test("should destroy user profile and return 200 status code", async () => {
      mockUserFindOne = jest.spyOn(User, "findOne").mockImplementation((options) => {
        return true;
      });

      mockUserDestroy = jest.spyOn(User, "destroy").mockImplementation((options) => {
        return null;
      });

      mockJwtDestroy = jest.spyOn(Jwt, "destroy").mockImplementation((options) => {
        return null;
      });

      const response = await request(server)
        .delete("/api/v1/user/profile")
        .set({ "Content-Type": "application/json" })
        .set({ Authorization: `Bearer validAccessToken` });

      expect(jwt.decode).toHaveBeenCalledWith("validAccessToken");
      expect(jwt.decode).toHaveReturnedWith({ userId });
      expect(mockUserFindOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(mockUserFindOne).toHaveReturnedWith(true);
      expect(mockUserDestroy).toHaveBeenCalledWith({ where: { id: userId } });
      expect(mockUserDestroy).toHaveReturnedWith(null);
      expect(mockJwtDestroy).toHaveBeenCalledWith({ where: { userId } });
      expect(mockJwtDestroy).toHaveReturnedWith(null);
      expect(response.statusCode).toBe(200);
    });

    test("should return JSON response with message, if user is not found with provided id in jwt payload, and 404 status code", async () => {
      mockUserFindOne = jest.spyOn(User, "findOne").mockImplementation((options) => {
        return null;
      });

      const response = await request(server)
        .delete("/api/v1/user/profile")
        .set({ "Content-Type": "application/json" })
        .set({ Authorization: `Bearer validAccessToken` });

      expect(jwt.decode).toHaveBeenCalledWith("validAccessToken");
      expect(jwt.decode).toHaveReturnedWith({ userId });
      expect(mockUserFindOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(mockUserFindOne).toHaveReturnedWith(null);
      expect(response.text).toEqual(JSON.stringify({ message: "User not found!" }));
      expect(response.statusCode).toBe(404);
    });

    test("should return JSON response with message, if User.destroy or smth else throws an error, and 400 status code", async () => {
      mockUserFindOne = jest.spyOn(User, "findOne").mockImplementation((options) => {
        return true;
      });

      mockUserDestroy = jest.spyOn(User, "destroy").mockImplementation((options) => {
        throw new Error("Something went wrong!");
      });

      mockJwtDestroy = jest.spyOn(Jwt, "destroy").mockImplementation((options) => {
        return null;
      });

      const response = await request(server)
        .delete("/api/v1/user/profile")
        .set({ "Content-Type": "application/json" })
        .set({ Authorization: `Bearer validAccessToken` });

      expect(jwt.decode).toHaveBeenCalledWith("validAccessToken");
      expect(jwt.decode).toHaveReturnedWith({ userId });
      expect(mockUserFindOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(mockUserFindOne).toHaveReturnedWith(true);
      expect(mockUserDestroy).toHaveBeenCalledWith({ where: { id: userId } });
      expect(mockJwtDestroy).not.toHaveBeenCalled();
      expect(response.text).toEqual(JSON.stringify({ message: "Something went wrong!" }));
      expect(response.statusCode).toBe(400);
    });
  });

  describe("- restore user profile", () => {
    let userId = uuidv4();
    let user;
    let mockUserFindOne;
    let mockUserRestore;
    let hashedPassword;
    let server;

    beforeEach(async () => {
      user = createFakeUser();
      hashedPassword = crypto.createHash("sha256").update(user.password).digest("hex");

      server = (await import("#server/server.js")).default;
    });

    afterEach(async () => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    test("should restore user profile and return 200 status code", async () => {
      mockUserFindOne = jest.spyOn(User, "findOne").mockImplementation((options) => {
        return {
          ...user,
          id: userId,
          password: hashedPassword,
          avatar: null,
        };
      });

      mockUserRestore = jest.spyOn(User, "restore").mockImplementation((options) => {
        return null;
      });

      const response = await request(server)
        .patch("/api/v1/user/profile/restore")
        .set({ "Content-Type": "application/json" })
        .send({
          username: user.username,
          password: user.password,
        });

      expect(mockUserFindOne).toHaveBeenCalledWith({ where: { username: user.username }, paranoid: false });
      expect(mockUserFindOne).toHaveReturnedWith({
        ...user,
        id: userId,
        password: hashedPassword,
        avatar: null,
      });
      expect(mockUserRestore).toHaveBeenCalledWith({ where: { username: user.username } });
      expect(mockUserRestore).toHaveReturnedWith(null);
      expect(response.statusCode).toBe(200);
    });

    test("should return JSON response with message, if user is not found with provided username or email, and 404 status code", async () => {
      mockUserFindOne = jest.spyOn(User, "findOne").mockImplementation((options) => {
        return null;
      });

      mockUserRestore = jest.spyOn(User, "restore").mockImplementation((options) => {
        return null;
      });

      const response = await request(server)
        .patch("/api/v1/user/profile/restore")
        .set({ "Content-Type": "application/json" })
        .send({
          username: user.username,
          password: user.password,
        });

      expect(mockUserFindOne).toHaveBeenCalledWith({ where: { username: user.username }, paranoid: false });
      expect(mockUserFindOne).toHaveReturnedWith(null);
      expect(mockUserRestore).not.toHaveBeenCalled();
      expect(response.text).toEqual(JSON.stringify({ message: "User not found!" }));
      expect(response.statusCode).toBe(404);
    });

    test("should return JSON response with message, if provided password is not valid, and 401 status code", async () => {
      mockUserFindOne = jest.spyOn(User, "findOne").mockImplementation((options) => {
        return {
          ...user,
          id: userId,
          password: hashedPassword,
          avatar: null,
        };
      });

      mockUserRestore = jest.spyOn(User, "restore").mockImplementation((options) => {
        return null;
      });

      const response = await request(server)
        .patch("/api/v1/user/profile/restore")
        .set({ "Content-Type": "application/json" })
        .send({
          username: user.username,
          password: "wrongPassword",
        });

      expect(mockUserFindOne).toHaveBeenCalledWith({ where: { username: user.username }, paranoid: false });
      expect(mockUserFindOne).toHaveReturnedWith({
        ...user,
        id: userId,
        password: hashedPassword,
        avatar: null,
      });
      expect(mockUserRestore).not.toHaveBeenCalled();
      expect(response.text).toEqual(JSON.stringify({ message: "Password is not valid!" }));
      expect(response.statusCode).toBe(401);
    });

    test("should return JSON response with message, if User.restore or smth else throws an error, and 400 status code", async () => {
      mockUserFindOne = jest.spyOn(User, "findOne").mockImplementation((options) => {
        return {
          ...user,
          id: userId,
          password: hashedPassword,
          avatar: null,
        };
      });

      mockUserRestore = jest.spyOn(User, "restore").mockImplementation((options) => {
        throw new Error("Something went wrong!");
      });

      const response = await request(server)
        .patch("/api/v1/user/profile/restore")
        .set({ "Content-Type": "application/json" })
        .send({
          username: user.username,
          password: user.password,
        });

      expect(mockUserFindOne).toHaveBeenCalledWith({ where: { username: user.username }, paranoid: false });
      expect(mockUserFindOne).toHaveReturnedWith({
        ...user,
        id: userId,
        password: hashedPassword,
        avatar: null,
      });
      expect(mockUserRestore).toHaveBeenCalledWith({ where: { username: user.username } });
      expect(response.text).toEqual(JSON.stringify({ message: "Something went wrong!" }));
      expect(response.statusCode).toBe(400);
    });
  });
});
