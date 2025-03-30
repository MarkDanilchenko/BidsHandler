import fs from "fs";
import request from "supertest";
import server from "#server/server.js";
import crypto from "crypto";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, jest } from "@jest/globals";
import { createFakeUser } from "#server/tests/fixtures/user.js";
import { sequelizeConnection, User, Jwt } from "#server/models/index.js";

describe("Auth routes:", () => {
  beforeAll(async () => {
    await sequelizeConnection.authenticate();
  });

  afterAll(async () => {
    await sequelizeConnection.close();
  });

  describe("- signup:", () => {
    let user;
    let avatar;
    let mockUserFindOne;
    let mockUserCreate;

    beforeAll(() => {
      user = createFakeUser();
    });

    beforeEach(() => {
      avatar = fs.createReadStream("./assets/IMG/avatar.png");

      mockUserFindOne = jest.spyOn(User, "findOne");
      mockUserCreate = jest.spyOn(User, "create").mockImplementation(() => true);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    test("should create a new user in the system and return 201 status code", async () => {
      mockUserFindOne.mockResolvedValue(false);

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

      expect(mockUserFindOne).toHaveBeenCalledTimes(1);
      expect(mockUserCreate).toHaveBeenCalledTimes(1);
      expect(response.statusCode).toBe(201);
    });

    test("should return JSON response with message, if request data (for this example: username) is invalid, and 400 status code", async () => {
      const response = await request(server)
        .post("/api/v1/auth/signup")
        .set({ "Content-Type": "multipart/form-data" })
        .field("username", user.username.slice(0, 5) + "=<>!?")
        .field("firstName", user.firstName)
        .field("lastName", user.lastName)
        .field("email", user.email)
        .field("password", user.password)
        .field("gender", user.gender)
        .field("isAdmin", user.isAdmin)
        .attach("avatar", avatar);

      expect(mockUserFindOne).toHaveBeenCalledTimes(0);
      expect(mockUserCreate).toHaveBeenCalledTimes(0);
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
      expect(response.statusCode).toBe(400);
    });

    test("should return JSON response with message, if user with provided email or username is already registered, and 400 status code", async () => {
      mockUserFindOne.mockResolvedValue(true);

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

      expect(mockUserFindOne).toHaveBeenCalledTimes(1);
      expect(mockUserCreate).toHaveBeenCalledTimes(0);
      expect(response.text).toEqual(
        JSON.stringify({
          message: "User already exists",
        }),
      );
      expect(response.statusCode).toBe(400);
    });
  });

  describe("- signin:", () => {
    let user;
    let hashedPassword;
    let mockJwtFindOne;
    let mockJwtCreate;
    let mockJwtUpdate;

    beforeAll(() => {
      // Create fake user without avatar;
      user = createFakeUser();
      hashedPassword = crypto.createHash("sha256").update(user.password).digest("hex");
    });

    beforeEach(async () => {
      await User.create({
        username: user.username,
        first_name: user.firstName,
        last_name: user.lastName,
        email: user.email,
        password: hashedPassword,
        gender: user.gender,
        isAdmin: user.isAdmin,
      });

      mockJwtFindOne = jest.spyOn(Jwt, "findOne");
      mockJwtCreate = jest.spyOn(Jwt, "create");
      mockJwtUpdate = jest.spyOn(Jwt, "update");
    });

    afterEach(async () => {
      jest.restoreAllMocks();

      await User.destroy({
        where: {
          username: user.username,
        },
        force: true,
      });
    });

    test("should return access token and 200 status code if authentication succeed. Jwt refresh token should be created", async () => {
      mockJwtFindOne.mockResolvedValue(false);

      const response = await request(server)
        .get("/api/v1/auth/signin")
        .set({ "Content-Type": "application/json" })
        .send({
          username: user.username,
          password: user.password,
        });

      expect(mockJwtFindOne).toHaveBeenCalledTimes(1);
      expect(mockJwtCreate).toHaveBeenCalledTimes(1);
      expect(mockJwtUpdate).toHaveBeenCalledTimes(0);
      expect(response.text).toEqual(expect.stringContaining('"accessToken":'));
      expect(response.statusCode).toBe(200);
    });

    test("should return access token and 200 status code if authentication succeed. Jwt refresh token should be updated", async () => {
      mockJwtFindOne.mockResolvedValue(true);

      const response = await request(server)
        .get("/api/v1/auth/signin")
        .set({ "Content-Type": "application/json" })
        .send({
          username: user.username,
          password: user.password,
        });

      expect(mockJwtFindOne).toHaveBeenCalledTimes(1);
      expect(mockJwtCreate).toHaveBeenCalledTimes(0);
      expect(mockJwtUpdate).toHaveBeenCalledTimes(1);
      expect(response.text).toEqual(expect.stringContaining('"accessToken":'));
      expect(response.statusCode).toBe(200);
    });

    test("should return JSON response with message, if user with provided username or email is not found, and 404 status code", async () => {
      jest.spyOn(User, "findOne").mockResolvedValue(false);

      const response = await request(server)
        .get("/api/v1/auth/signin")
        .set({ "Content-Type": "application/json" })
        .send({
          username: user.username,
          password: user.password,
        });

      expect(mockJwtFindOne).toHaveBeenCalledTimes(0);
      expect(mockJwtCreate).toHaveBeenCalledTimes(0);
      expect(mockJwtUpdate).toHaveBeenCalledTimes(0);
      expect(response.text).toEqual(
        JSON.stringify({
          message: "User not found!",
        }),
      );
      expect(response.statusCode).toBe(404);
    });

    test("should return JSON response with message, if provided password is not valid, and 401 status code", async () => {
      const response = await request(server)
        .get("/api/v1/auth/signin")
        .set({ "Content-Type": "application/json" })
        .send({
          username: user.username,
          password: user.password.slice(0, 5) + "=<>!?",
        });

      expect(mockJwtFindOne).toHaveBeenCalledTimes(0);
      expect(mockJwtCreate).toHaveBeenCalledTimes(0);
      expect(mockJwtUpdate).toHaveBeenCalledTimes(0);
      expect(response.text).toEqual(
        JSON.stringify({
          message: "Wrong password!",
        }),
      );
      expect(response.statusCode).toBe(401);
    });
  });

  describe("- signout:", () => {});

  describe("- refresh token:", () => {});
});
