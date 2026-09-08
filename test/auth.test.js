const request = require("supertest");
const app = require("../app");
const pool = require("../src/config/db");

beforeAll(async () => {
  await pool.query("DELETE FROM expenses");
  await pool.query("DELETE FROM users");
});

afterAll(async () => {
  await pool.end();
});

describe("POST /auth/signup", () => {
  it("must create a new user and return 201", async () => {
    const response = await request(app)
      .post("/auth/signup")
      .send({ email: "test@test.com", password: "123456" });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("newUserId");
  });
});

describe("POST /auth/signup", () => {
  it("must reject a duplicated email and return 409", async () => {
    await request(app)
      .post("/auth/signup")
      .send({ email: "duplicate@test.com", password: "123456" });

    const secondResponse = await request(app)
      .post("/auth/signup")
      .send({ email: "duplicate@test.com", password: "123456" });

    expect(secondResponse.status).toBe(409);
  });
});

describe("POST /auth/login", () => {
  it("must login successfully and return a token", async () => {
    await request(app)
      .post("/auth/signup")
      .send({ email: "login@test.com", password: "123456" });

    const response = await request(app)
      .post("/auth/login")
      .send({ email: "login@test.com", password: "123456" });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("tokenUser");
  });

  it("must login with wrong password and return 401", async () => {
    await request(app)
      .post("/auth/signup")
      .send({ email: "password@test.com", password: "123456" });

    const response = await request(app)
      .post("/auth/login")
      .send({ email: "password@test.com", password: "456789" });

    expect(response.status).toBe(401);
  });
});
