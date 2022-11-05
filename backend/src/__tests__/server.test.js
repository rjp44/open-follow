const supertest = require("supertest");
const server = require("../server");


test("Server returns hello world", () => {
  return supertest(server).get("/").expect(200, {
    message: "Hello world",
  });
});

test("Server returns error for missing route", () => {
  return supertest(server).get("/NOT-REAL").expect(404, {
    error: "Not Found",
    info: "Path '/NOT-REAL' does not exist",
  });
});

describe("Auth middleware protects authenticated routes", () => {
  test("Rejects requests with no authorization header", () => {
    return supertest(server).get("/api/verify").expect(400, {
      error: "Bad Request",
      info: "Authorization header is required",
    });
  });
});
