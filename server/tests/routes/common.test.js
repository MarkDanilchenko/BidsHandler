import fs from "fs";
import request from "supertest";
import nunjucks from "nunjucks";
import { beforeEach, expect, jest } from "@jest/globals";
import { expressOptions } from "#server/env.js";

describe("Common routes:", () => {
  describe("- test route to verify that server is running", () => {
    let server;

    beforeEach(async () => {
      server = (await import("#server/server.js")).default;
    });

    afterEach(async () => {
      jest.resetModules();
    });

    test("should return 200 OK and test message", async () => {
      const response = await request(server).get("/test");

      expect(response.statusCode).toBe(200);
      expect(response.text).toEqual(JSON.stringify({ message: "test" }));
    });
  });

  describe("- unknown route", () => {
    let server;

    beforeEach(async () => {
      server = (await import("#server/server.js")).default;
    });

    afterEach(async () => {
      jest.resetModules();
    });

    test("should return 404 Not Found", async () => {
      const response = await request(server).get("/unknownUrl");

      expect(response.statusCode).toBe(404);
      expect(response.text).toEqual(JSON.stringify({ message: "Resource is not Found" }));
    });
  });

  describe("- json swagger doc route", () => {
    let server;

    beforeEach(async () => {
      server = (await import("#server/server.js")).default;
    });

    afterEach(async () => {
      jest.resetModules();
    });

    test("should return json swagger doc", async () => {
      const swaggerDocs = fs.readFileSync("./docs/swagger-output.json", "utf8");
      const response = await request(server).get("/api/v1/docs/swagger-output.json");

      expect(response.statusCode).toBe(200);
      expect(response.text).toEqual(JSON.stringify(JSON.parse(swaggerDocs)));
    });
  });

  describe("- redirect to root api route", () => {
    let server;

    beforeEach(async () => {
      server = (await import("#server/server.js")).default;
    });

    afterEach(async () => {
      jest.resetModules();
    });

    test("should redirect to api/v1/", async () => {
      const response = await request(server).get("/");

      expect(response.statusCode).toBe(302);
      expect(response.headers.location).toEqual(`/api/v1/`);
    });
  });

  describe("- greeting api page", () => {
    let server;

    beforeEach(async () => {
      server = (await import("#server/server.js")).default;
    });

    afterEach(async () => {
      jest.resetModules();
    });

    test("should return greeting HTML page", async () => {
      const response = await request(server).get("/api/v1/");

      expect(response.statusCode).toBe(200);
      expect(response.headers["content-type"]).toEqual("text/html; charset=utf-8");
      expect(response.text).toEqual(
        nunjucks.render("startPage/main.html", {
          host: expressOptions.host,
          port: expressOptions.port,
        }),
      );
    });
  });
});
