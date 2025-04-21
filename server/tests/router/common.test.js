import fs from "fs";
import request from "supertest";
import nunjucks from "nunjucks";
import { beforeEach, afterEach, expect, jest } from "@jest/globals";
import { expressOptions } from "#server/env.js";

describe("Common routes:", () => {
  describe("- test route to verify that server is running", () => {
    let server;

    beforeEach(async () => {
      server = (await import("#server/server.js")).default;
    });

    afterEach(async () => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    test("should return 200 OK and test message", async () => {
      const response = await request(server).get("/test").set({ "Content-Type": "application/json" });

      expect(response.text).toEqual(JSON.stringify({ message: "test" }));
      expect(response.statusCode).toBe(200);
    });
  });

  describe("- wrong/unknown route", () => {
    let server;

    beforeEach(async () => {
      server = (await import("#server/server.js")).default;
    });

    afterEach(async () => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    test("should return 404 Not Found", async () => {
      const response = await request(server).get("/unknownUrl").set({ "Content-Type": "application/json" });

      expect(response.text).toEqual(JSON.stringify({ message: "Resource is not Found" }));
      expect(response.statusCode).toBe(404);
    });
  });

  describe("- json swagger doc. route", () => {
    let server;

    beforeEach(async () => {
      server = (await import("#server/server.js")).default;
    });

    afterEach(async () => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    test("should return json swagger doc", async () => {
      const swaggerDocs = fs.readFileSync("./docs/swagger-output.json", "utf8");

      const response = await request(server)
        .get("/api/v1/docs/swagger-output.json")
        .set({ "Content-Type": "application/json" });

      expect(response.text).toEqual(JSON.stringify(JSON.parse(swaggerDocs)));
      expect(response.statusCode).toBe(200);
    });
  });

  describe("- redirect to root api route", () => {
    let server;

    beforeEach(async () => {
      server = (await import("#server/server.js")).default;
    });

    afterEach(async () => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    test("should redirect to api/v1/", async () => {
      const response = await request(server).get("/").set({ "Content-Type": "application/json" });

      expect(response.headers.location).toEqual(`/api/v1/`);
      expect(response.statusCode).toBe(302);
    });
  });

  describe("- greeting api page", () => {
    let server;

    beforeEach(async () => {
      server = (await import("#server/server.js")).default;
    });

    afterEach(async () => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    test("should return greeting HTML page", async () => {
      const response = await request(server).get("/api/v1/").set({ "Content-Type": "application/json" });

      expect(response.headers["content-type"]).toEqual("text/html; charset=utf-8");
      expect(response.text).toEqual(
        nunjucks.render("startPage/main.html", {
          host: expressOptions.host,
          port: expressOptions.port,
        }),
      );
      expect(response.statusCode).toBe(200);
    });
  });
});
