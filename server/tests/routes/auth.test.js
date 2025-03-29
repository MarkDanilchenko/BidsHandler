import fs from "fs";
import request from "supertest";
import server from "#server/server.js";
import { beforeEach, expect, jest } from "@jest/globals";
import { createFakeUser } from "#server/tests/fixtures/user.js";
import { sequelizeConnection, User } from "#server/models/index.js";

describe("Auth routes:", () => {
  beforeAll(async () => {
    await sequelizeConnection.authenticate();
  });

  afterAll(async () => {
    await sequelizeConnection.close();
  });

  describe("- signup:", () => {
    const user = createFakeUser();
    let avatar;

    beforeEach(() => {
      User.findOne = jest.fn();
      User.create = jest.fn();
      avatar = fs.createReadStream("./assets/IMG/avatar.png");
    });

    test("should create a new user in the system and return 201 status code", async () => {
      User.findOne.mockResolvedValue(null);

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

      expect(User.findOne).toHaveBeenCalledTimes(1);
      expect(User.create).toHaveBeenCalledTimes(1);
      expect(response.statusCode).toBe(201);
    });

    test("should return JSON response with message, if request data (for this example: username) is invalid, and 400 status code", async () => {
      User.findOne.mockResolvedValue(null);

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

      expect(User.findOne).toHaveBeenCalledTimes(0);
      expect(User.create).toHaveBeenCalledTimes(0);
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
      User.findOne.mockResolvedValue(true);

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

      expect(User.findOne).toHaveBeenCalledTimes(1);
      expect(User.create).toHaveBeenCalledTimes(0);
      expect(response.text).toEqual(
        JSON.stringify({
          message: "User already exists",
        }),
      );
      expect(response.statusCode).toBe(400);
    });
  });

  // describe("- signin:", () => {
  //   describe("", () => {});
  // });

  // describe("- signout:", () => {
  //   describe("", () => {});
  // });

  // describe("- refresh:", () => {
  //   describe("", () => {});
  // });
});
