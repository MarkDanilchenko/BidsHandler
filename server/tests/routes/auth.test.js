import fs from "fs";
import request from "supertest";
import server from "#server/server.js";
import crypto from "crypto";
import { afterAll, afterEach, beforeAll, beforeEach, expect, jest } from "@jest/globals";
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
    let mockForUserCreate;
    let mockForUserFindOne;

    beforeAll(() => {
      user = createFakeUser();

      mockForUserCreate = jest.spyOn(User, "create");
      mockForUserFindOne = jest.spyOn(User, "findOne");
    });

    afterAll(async () => {
      jest.restoreAllMocks();

      await User.destroy({ where: { username: user.username }, force: true });
    });

    beforeEach(() => {
      avatar = fs.createReadStream("./assets/IMG/avatar.png");
    });

    test("should create a new user in the system and return 201 status code", async () => {
      mockForUserFindOne.mockResolvedValue(null);

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

      expect(mockForUserFindOne).toHaveBeenCalledTimes(1);
      expect(mockForUserCreate).toHaveBeenCalledTimes(1);
      expect(response.statusCode).toBe(201);
    });

    test("should return JSON response with message, if request data (for this example: username) is invalid, and 400 status code", async () => {
      mockForUserFindOne.mockResolvedValue(null);

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

      expect(mockForUserFindOne).toHaveBeenCalledTimes(0);
      expect(mockForUserCreate).toHaveBeenCalledTimes(0);
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
      mockForUserFindOne.mockResolvedValue(true);

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

      expect(mockForUserFindOne).toHaveBeenCalledTimes(1);
      expect(mockForUserCreate).toHaveBeenCalledTimes(0);
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
    let mockForJwtFindOne;
    let mockForJwtCreate;
    let mockForJwtUpdate;

    beforeEach(async () => {
      mockForJwtFindOne = jest.spyOn(Jwt, "findOne");
      mockForJwtCreate = jest.spyOn(Jwt, "create");
      mockForJwtUpdate = jest.spyOn(Jwt, "update");

      // Create fake user without avatar;
      user = createFakeUser();
      const hashedPassword = crypto.createHash("sha256").update(user.password).digest("hex");

      await User.create({
        username: user.username,
        first_name: user.firstName,
        last_name: user.lastName,
        email: user.email,
        password: hashedPassword,
        gender: user.gender,
        isAdmin: user.isAdmin,
      });
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
      mockForJwtFindOne.mockResolvedValue(null);

      const response = await request(server)
        .get("/api/v1/auth/signin")
        .set({ "Content-Type": "application/json" })
        .send({
          username: user.username,
          password: user.password,
        });

      expect(mockForJwtFindOne).toHaveBeenCalledTimes(1);
      expect(mockForJwtCreate).toHaveBeenCalledTimes(1);
      expect(mockForJwtUpdate).toHaveBeenCalledTimes(0);
      expect(response.text).toEqual(expect.stringContaining('"accessToken":'));
      expect(response.statusCode).toBe(200);
    });

    test("should return access token and 200 status code if authentication succeed. Jwt refresh token should be updated", async () => {
      mockForJwtFindOne.mockResolvedValue(true);

      const response = await request(server)
        .get("/api/v1/auth/signin")
        .set({ "Content-Type": "application/json" })
        .send({
          username: user.username,
          password: user.password,
        });

      expect(mockForJwtFindOne).toHaveBeenCalledTimes(1);
      expect(mockForJwtCreate).toHaveBeenCalledTimes(0);
      expect(mockForJwtUpdate).toHaveBeenCalledTimes(1);
      expect(response.text).toEqual(expect.stringContaining('"accessToken":'));
      expect(response.statusCode).toBe(200);
    });

    test("should return JSON response with message, if user with provided username or email is not found, and 404 status code", async () => {
      const mockForUserFindOne = jest.spyOn(User, "findOne");
      mockForUserFindOne.mockResolvedValue(null);

      const response = await request(server)
        .get("/api/v1/auth/signin")
        .set({ "Content-Type": "application/json" })
        .send({
          username: user.username,
          password: user.password,
        });

      expect(mockForUserFindOne).toHaveBeenCalledTimes(1);
      expect(mockForJwtFindOne).toHaveBeenCalledTimes(0);
      expect(mockForJwtCreate).toHaveBeenCalledTimes(0);
      expect(mockForJwtUpdate).toHaveBeenCalledTimes(0);
      expect(response.text).toEqual(
        JSON.stringify({
          message: "User not found!",
        }),
      );
      expect(response.statusCode).toBe(404);
    });

    test("should return JSON response with message, if password is not valid, and 401 status code", async () => {
      const response = await request(server)
        .get("/api/v1/auth/signin")
        .set({ "Content-Type": "application/json" })
        .send({
          username: user.username,
          password: user.password.slice(0, 5) + "=<>!?",
        });

      expect(mockForJwtFindOne).toHaveBeenCalledTimes(0);
      expect(mockForJwtCreate).toHaveBeenCalledTimes(0);
      expect(mockForJwtUpdate).toHaveBeenCalledTimes(0);
      expect(response.text).toEqual(
        JSON.stringify({
          message: "Wrong password!",
        }),
      );
      expect(response.statusCode).toBe(401);
    });
  });
});
