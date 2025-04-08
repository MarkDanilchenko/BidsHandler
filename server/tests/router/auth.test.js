import fs from "fs";
import request from "supertest";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, jest, test } from "@jest/globals";
import { createFakeUser } from "#server/tests/fixtures/user.js";
import { sequelizeConnection, User, Jwt } from "#server/models/index.js";
import { v4 as uuidv4 } from "uuid";
import { unauthorizedError } from "#server/utils/errors.js";
import { expressOptions } from "#server/env.js";
import { Op } from "sequelize";

describe("Auth routes:", () => {
  beforeAll(async () => {
    await sequelizeConnection.authenticate();
  });

  afterAll(async () => {
    await sequelizeConnection.close();
  });

  describe("- signout:", () => {
    let userId = uuidv4();
    let mockJwtDestroy;
    let mockUserFindOne;
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

    test("should delete users related refresh jwt record from database, return 200 status code", async () => {
      mockUserFindOne = jest.spyOn(User, "findOne").mockImplementation((options) => {
        return {
          id: options.where.id,
        };
      });

      mockJwtDestroy = jest.spyOn(Jwt, "destroy").mockImplementation((options) => {
        return null;
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

      mockJwtDestroy = jest.spyOn(Jwt, "destroy");

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

    test("should return JSON response with message, if destroying jwt record or smth else throws an error, and 400 status code", async () => {
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

  describe("- refresh token:", () => {
    let userId = uuidv4();
    let refresh_token = uuidv4();
    let mockUserFindOne;
    let mockJwtFindOne;
    let mockJwtDestroy;
    let server;

    beforeEach(async () => {
      jest.spyOn(jwt, "decode").mockImplementation((accessToken) => {
        if (accessToken !== "expiredAccessToken") {
          return null;
        }

        return { userId };
      });

      jest.spyOn(jwt, "verify").mockImplementation((refresh, secret, cb) => {
        if (!refresh || refresh !== refresh_token) {
          return cb(new Error("Refresh token is not provided or is not valid!"));
        }

        if (!secret) {
          return cb(new Error("Secret is not provided!"));
        }

        return cb(null);
      });

      server = (await import("#server/server.js")).default;
    });

    afterEach(async () => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    test("should return new access token and 200 status code", async () => {
      mockUserFindOne = jest.spyOn(User, "findOne").mockImplementation((options) => {
        return {
          id: options.where.id,
        };
      });

      mockJwtFindOne = jest.spyOn(Jwt, "findOne").mockImplementation((options) => {
        return {
          refresh_token,
        };
      });

      mockJwtDestroy = jest.spyOn(Jwt, "destroy").mockImplementation((options) => {
        return null;
      });

      const response = await request(server)
        .post("/api/v1/auth/refresh")
        .set({ "Content-Type": "application/json" })
        .set({ Authorization: `Bearer expiredAccessToken` });

      expect(jwt.decode).toHaveBeenCalledWith("expiredAccessToken");
      expect(mockUserFindOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(mockUserFindOne).toHaveReturnedWith({ id: userId });
      expect(mockJwtFindOne).toHaveBeenCalledWith({ where: { userId } });
      expect(mockJwtFindOne).toHaveReturnedWith({ refresh_token });
      expect(jwt.verify).toHaveBeenCalledWith(refresh_token, expressOptions.jwtSecret, expect.any(Function));
      expect(response.text).toEqual(expect.stringContaining('"accessToken":'));
      expect(response.statusCode).toBe(200);
    });

    test("should return JSON response with message, if no access token is found in request header, and 401 status code", async () => {
      const response = await request(server).post("/api/v1/auth/refresh").set({ "Content-Type": "application/json" });

      expect(response.statusCode).toBe(401);
      expect(response.text).toEqual(JSON.stringify({ message: "Access token not found!" }));
    });

    test("should return JSON response with message, if access token can not be decoded and user is not found with provided id in payload, and 404 status code", async () => {
      mockUserFindOne = jest.spyOn(User, "findOne").mockImplementation((options) => {
        return null;
      });

      const response = await request(server)
        .post("/api/v1/auth/refresh")
        .set({ "Content-Type": "application/json" })
        .set({ Authorization: `Bearer expiredAccessToken` });

      expect(jwt.decode).toHaveBeenCalledWith("expiredAccessToken");
      expect(mockUserFindOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(mockUserFindOne).toHaveReturnedWith(null);
      expect(response.statusCode).toBe(404);
      expect(response.text).toEqual(JSON.stringify({ message: "User not found!" }));
    });

    test("should return JSON response with message, if there is no related refresh token in database for user, and 401 status code", async () => {
      mockUserFindOne = jest.spyOn(User, "findOne").mockImplementation((options) => {
        return {
          id: options.where.id,
        };
      });

      mockJwtFindOne = jest.spyOn(Jwt, "findOne").mockImplementation((options) => {
        return null;
      });

      const response = await request(server)
        .post("/api/v1/auth/refresh")
        .set({ "Content-Type": "application/json" })
        .set({ Authorization: `Bearer expiredAccessToken` });

      expect(jwt.decode).toHaveBeenCalledWith("expiredAccessToken");
      expect(mockUserFindOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(mockUserFindOne).toHaveReturnedWith({ id: userId });
      expect(mockJwtFindOne).toHaveBeenCalledWith({ where: { userId } });
      expect(mockJwtFindOne).toHaveReturnedWith(null);
      expect(response.text).toEqual(JSON.stringify({ message: "Refresh token not found! User is not signed in." }));
      expect(response.statusCode).toBe(401);
    });

    test("should return JSON response with message, if related refresh token is expired, destroy it, and 401 status code", async () => {
      mockUserFindOne = jest.spyOn(User, "findOne").mockImplementation((options) => {
        return {
          id: options.where.id,
        };
      });

      mockJwtFindOne = jest.spyOn(Jwt, "findOne").mockImplementation((options) => {
        return {
          refresh_token: refresh_token + ".expired",
        };
      });

      mockJwtDestroy = jest.spyOn(Jwt, "destroy").mockImplementation((options) => {
        return null;
      });

      const response = await request(server)
        .post("/api/v1/auth/refresh")
        .set({ "Content-Type": "application/json" })
        .set({ Authorization: `Bearer expiredAccessToken` });

      expect(jwt.decode).toHaveBeenCalledWith("expiredAccessToken");
      expect(mockUserFindOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(mockUserFindOne).toHaveReturnedWith({ id: userId });
      expect(mockJwtFindOne).toHaveBeenCalledWith({ where: { userId } });
      expect(mockJwtFindOne).toHaveReturnedWith({ refresh_token: refresh_token + ".expired" });
      expect(jwt.verify).toHaveBeenCalledWith(
        refresh_token + ".expired",
        expressOptions.jwtSecret,
        expect.any(Function),
      );
      expect(mockJwtDestroy).toHaveBeenCalledWith({ where: { userId } });
      expect(mockJwtDestroy).toHaveReturnedWith(null);
      expect(response.text).toEqual(JSON.stringify({ message: "Refresh token is not valid! User is not signed in." }));
      expect(response.statusCode).toBe(401);
    });

    test("should return JSON response with message, if jwt decode or smth else throws an error, and 400 status code", async () => {
      jest.spyOn(jwt, "decode").mockImplementation(() => {
        throw new Error("Smth goes wrong");
      });

      const response = await request(server)
        .post("/api/v1/auth/refresh")
        .set({ "Content-Type": "application/json" })
        .set({ Authorization: `Bearer expiredAccessToken` });

      expect(jwt.decode).toHaveBeenCalledWith("expiredAccessToken");
      expect(jwt.decode).toThrow(new Error("Smth goes wrong"));
      expect(response.text).toEqual(JSON.stringify({ message: "Smth goes wrong" }));
      expect(response.statusCode).toBe(400);
    });
  });

  describe("- signup:", () => {
    let user;
    let avatar;
    let mockUserFindOne;
    let mockUserCreate;
    let server;

    beforeEach(async () => {
      user = createFakeUser();
      avatar = fs.createReadStream("./assets/IMG/avatar.png");

      server = (await import("#server/server.js")).default;
    });

    afterEach(async () => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    test("should create a new user and return 201 status code", async () => {
      mockUserFindOne = jest.spyOn(User, "findOne").mockImplementation((options) => {
        return null;
      });

      mockUserCreate = jest.spyOn(User, "create").mockImplementation((options) => {
        return null;
      });

      const response = await request(server)
        .post("/api/v1/auth/signup")
        .set({ "Content-Type": "multipart/form-data" })
        .field("username", user.username)
        .field("firstName", user.firstName)
        .field("lastName", user.lastName)
        .field("email", user.email)
        .field("password", user.password)
        .field("gender", user.gender)
        .field("isAdmin", user.isAdmin)
        .attach("avatar", avatar);

      expect(mockUserFindOne).toHaveBeenCalledWith({
        where: {
          [Op.or]: [{ username: user.username }, { email: user.email }],
        },
        paranoid: false,
      });
      expect(mockUserFindOne).toHaveReturnedWith(null);
      expect(mockUserCreate).toHaveBeenCalled();
      expect(response.statusCode).toBe(201);
    });

    test("should return JSON response with message, if request data (for this example: username) is invalid, and 400 status code", async () => {
      const notValidUsername = user.username.slice(0, 5) + "=<>!?";

      mockUserFindOne = jest.spyOn(User, "findOne");

      mockUserCreate = jest.spyOn(User, "create");

      const response = await request(server)
        .post("/api/v1/auth/signup")
        .set({ "Content-Type": "multipart/form-data" })
        .field("username", notValidUsername)
        .field("firstName", user.firstName)
        .field("lastName", user.lastName)
        .field("email", user.email)
        .field("password", user.password)
        .field("gender", user.gender)
        .field("isAdmin", user.isAdmin)
        .attach("avatar", avatar);

      expect(response.text).toEqual(
        JSON.stringify({
          message: {
            validation: "regex",
            code: "invalid_string",
            message: "Invalid",
            path: ["body", "username"],
          },
        }),
      );
      expect(mockUserFindOne).toHaveBeenCalledTimes(0);
      expect(mockUserCreate).toHaveBeenCalledTimes(0);
      expect(response.statusCode).toBe(400);
    });

    test("should return JSON response with message, if user with provided email or username is already registered/existed, and 400 status code", async () => {
      mockUserFindOne = jest.spyOn(User, "findOne").mockImplementation((options) => {
        return true;
      });

      const response = await request(server)
        .post("/api/v1/auth/signup")
        .set({ "Content-Type": "multipart/form-data" })
        .field("username", user.username)
        .field("firstName", user.firstName)
        .field("lastName", user.lastName)
        .field("email", user.email)
        .field("password", user.password)
        .field("gender", user.gender)
        .field("isAdmin", user.isAdmin)
        .attach("avatar", avatar);

      expect(mockUserFindOne).toHaveBeenCalledWith({
        where: {
          [Op.or]: [{ username: user.username }, { email: user.email }],
        },
        paranoid: false,
      });
      expect(mockUserFindOne).toHaveReturnedWith(true);
      expect(response.text).toEqual(
        JSON.stringify({
          message: "User already exists",
        }),
      );
      expect(response.statusCode).toBe(400);
    });

    test("should return JSON response with message, if smth goes wrong, and 400 status code", async () => {
      mockUserFindOne = jest.spyOn(User, "findOne").mockImplementation((options) => {
        return false;
      });

      mockUserCreate = jest.spyOn(User, "create").mockImplementation((options) => {
        throw new Error("Smth goes wrong");
      });

      const response = await request(server)
        .post("/api/v1/auth/signup")
        .set({ "Content-Type": "multipart/form-data" })
        .field("username", user.username)
        .field("firstName", user.firstName)
        .field("lastName", user.lastName)
        .field("email", user.email)
        .field("password", user.password)
        .field("gender", user.gender)
        .field("isAdmin", user.isAdmin)
        .attach("avatar", avatar);

      expect(mockUserFindOne).toHaveBeenCalledWith({
        where: {
          [Op.or]: [{ username: user.username }, { email: user.email }],
        },
        paranoid: false,
      });
      expect(mockUserFindOne).toHaveReturnedWith(false);
      expect(mockUserCreate).toHaveBeenCalled();
      expect(response.text).toEqual(JSON.stringify({ message: "Smth goes wrong" }));
      expect(response.statusCode).toBe(400);
    });
  });

  describe("- signin:", () => {
    let user;
    let hashedPassword;
    let mockUserFindOne;
    let mockJwtFindOne;
    let mockJwtCreate;
    let mockJwtUpdate;
    let mockJwtSign;
    let server;
    let userId;

    beforeEach(async () => {
      user = createFakeUser();
      userId = uuidv4();
      hashedPassword = crypto.createHash("sha256").update(user.password).digest("hex");

      server = (await import("#server/server.js")).default;
    });

    afterEach(async () => {
      jest.resetAllMocks();
      jest.clearAllMocks();
    });

    test("should return access token and 200 status code if authentication succeed. Related refresh token should be created accordingly", async () => {
      mockUserFindOne = jest.spyOn(User, "findOne").mockImplementation((options) => {
        if (options.where.username === user.username || options.where.email === user.email) {
          return { ...user, id: userId, password: hashedPassword };
        }
      });

      mockJwtFindOne = jest.spyOn(Jwt, "findOne").mockImplementation((options) => {
        return null;
      });

      mockJwtCreate = jest.spyOn(Jwt, "create").mockImplementation((options) => {
        return;
      });

      const response = await request(server)
        .get("/api/v1/auth/signin")
        .set({ "Content-Type": "application/json" })
        .send({
          username: user.username,
          password: user.password,
        });

      expect(mockUserFindOne).toHaveBeenCalledWith({
        where: {
          username: user.username,
        },
      });
      expect(mockUserFindOne).toHaveReturnedWith({
        ...user,
        id: userId,
        password: hashedPassword,
      });
      expect(mockJwtFindOne).toHaveBeenCalled();
      expect(mockJwtFindOne).toHaveReturnedWith(null);
      expect(mockJwtCreate).toHaveBeenCalled();
      expect(response.text).toEqual(expect.stringContaining('"accessToken":'));
      expect(response.statusCode).toBe(200);
    });

    test("should return access token and 200 status code if authentication succeed. Jwt refresh token should be updated", async () => {
      mockUserFindOne = jest.spyOn(User, "findOne").mockImplementation((options) => {
        if (options.where.username === user.username || options.where.email === user.email) {
          return { ...user, id: userId, password: hashedPassword };
        }
      });

      mockJwtFindOne = jest.spyOn(Jwt, "findOne").mockImplementation((options) => {
        return true;
      });

      mockJwtCreate = jest.spyOn(Jwt, "create").mockImplementation((options) => {
        return;
      });

      mockJwtUpdate = jest.spyOn(Jwt, "update").mockImplementation((options) => {
        return;
      });

      const response = await request(server)
        .get("/api/v1/auth/signin")
        .set({ "Content-Type": "application/json" })
        .send({
          username: user.username,
          password: user.password,
        });

      expect(mockUserFindOne).toHaveBeenCalledWith({
        where: {
          username: user.username,
        },
      });
      expect(mockUserFindOne).toHaveReturnedWith({
        ...user,
        id: userId,
        password: hashedPassword,
      });
      expect(mockJwtFindOne).toHaveBeenCalled();
      expect(mockJwtFindOne).toBeTruthy();
      expect(mockJwtCreate).not.toHaveBeenCalled();
      expect(mockJwtUpdate).toHaveBeenCalled();
      expect(response.text).toEqual(expect.stringContaining('"accessToken":'));
      expect(response.statusCode).toBe(200);
    });

    test("should return JSON response with message, if user with provided username or email is not found, and 404 status code", async () => {
      mockUserFindOne = jest.spyOn(User, "findOne").mockImplementation((options) => {
        return null;
      });

      mockJwtFindOne = jest.spyOn(Jwt, "findOne").mockImplementation((options) => {
        return;
      });

      const response = await request(server)
        .get("/api/v1/auth/signin")
        .set({ "Content-Type": "application/json" })
        .send({
          username: user.username,
          password: user.password,
        });

      expect(mockUserFindOne).toHaveBeenCalledWith({
        where: {
          username: user.username,
        },
      });
      expect(mockUserFindOne).toHaveReturnedWith(null);
      expect(mockJwtFindOne).not.toHaveBeenCalled();
      expect(response.text).toEqual(JSON.stringify({ message: "User not found!" }));
      expect(response.statusCode).toBe(404);
    });

    test("should return JSON response with message, if provided password is not valid, and 401 status code", async () => {
      mockUserFindOne = jest.spyOn(User, "findOne").mockImplementation((options) => {
        if (options.where.username === user.username || options.where.email === user.email) {
          return { ...user, id: userId, password: hashedPassword };
        }
      });

      mockJwtFindOne = jest.spyOn(Jwt, "findOne").mockImplementation((options) => {
        return;
      });

      const response = await request(server)
        .get("/api/v1/auth/signin")
        .set({ "Content-Type": "application/json" })
        .send({
          username: user.username,
          password: "wrongPassword",
        });

      expect(mockUserFindOne).toHaveBeenCalledWith({
        where: {
          username: user.username,
        },
      });
      expect(mockUserFindOne).toHaveReturnedWith({
        ...user,
        id: userId,
        password: hashedPassword,
      });
      expect(mockJwtFindOne).not.toHaveBeenCalled();
      expect(response.text).toEqual(JSON.stringify({ message: "Wrong password!" }));
      expect(response.statusCode).toBe(401);
    });

    test("should return JSON response with message, if failed when signing jwt, and 400 status code", async () => {
      mockUserFindOne = jest.spyOn(User, "findOne").mockImplementation((options) => {
        if (options.where.username === user.username || options.where.email === user.email) {
          return { ...user, id: userId, password: hashedPassword };
        }
      });

      mockJwtSign = jest.spyOn(jwt, "sign").mockImplementation((options) => {
        throw new Error("Failed when signing jwt!");
      });

      const response = await request(server)
        .get("/api/v1/auth/signin")
        .set({ "Content-Type": "application/json" })
        .send({
          username: user.username,
          password: user.password,
        });

      expect(mockUserFindOne).toHaveBeenCalledWith({
        where: {
          username: user.username,
        },
      });
      expect(jwt.sign).toHaveBeenCalled();
      expect(response.text).toEqual(JSON.stringify({ message: "Failed when signing jwt!" }));
      expect(response.statusCode).toBe(400);
    });
  });
});
