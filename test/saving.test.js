const request = require("supertest");
const app = require("../app");
const pool = require("../src/config/db");

let token;
let savingId;

beforeAll(async () => {
  await pool.query("DELETE FROM expenses");
  await pool.query("DELETE FROM savings");
  await pool.query("DELETE FROM investments");
  await pool.query("DELETE FROM users");

  await request(app)
    .post("/auth/signup")
    .send({ email: "savings@test.com", password: "123456" });
  const loginRes = await request(app)
    .post("/auth/login")
    .send({ email: "savings@test.com", password: "123456" });
  token = loginRes.body.tokenUser;
});

afterAll(async () => {
  await pool.end();
});

describe("POST /savings", () => {
  it("must create a new saving and return 201", async () => {
    const response = await request(app)
      .post("/savings")
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: "100",
        category: "personal savings",
        description: "test saving",
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("newSavingId");
  });

  it("must create a new saving with an invalid category and return 400", async () => {
    const response = await request(app)
      .post("/savings")
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: "500",
        category: 123,
        description: "test saving error",
      });

    expect(response.status).toBe(400);
  });

  it("must create a new saving without token and return 401", async () => {
    const response = await request(app).post("/savings").send({
      amount: "700",
      category: "Others",
      description: "test saving token error",
    });

    expect(response.status).toBe(401);
  });
});

describe("GET /savings", () => {
  it("must list all savings and return 200", async () => {
    const response = await request(app)
      .get("/savings")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("userSavingByUser");
  });
});

describe("GET /savings/category", () => {
  it("must list all savings by category and return 200", async () => {
    await request(app)
      .post("/savings")
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: "550",
        category: "savings",
        description: "test saving category",
      });

    const response = await request(app)
      .get("/savings/category?category=savings")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("userSavingByCategory");
  });

  it("must try to list all savings by an invalid category and return 400", async () => {
    await request(app)
      .post("/savings")
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: "780",
        category: "savings",
        description: "test saving category error",
      });

    const response = await request(app)
      .get("/savings/category?category=")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message");
  });
});

describe("PATCH /savings/:id", () => {
  it("must update an saving and return 200", async () => {
    const idResponse = await request(app)
      .post("/savings")
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: "1700",
        category: "example",
        description: "patch test saving",
      });

    savingId = idResponse.body.newSavingId;

    const response = await request(app)
      .patch(`/savings/${savingId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: "8000",
        category: "others",
        description: "patch test saving",
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message");
  });

  it("must update an saving without body and return 400", async () => {
    const idResponse = await request(app)
      .post("/savings")
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: "2000",
        category: "clothes",
        description: "patch error test savings",
      });

    savingId = idResponse.body.newSavingId;

    const response = await request(app)
      .patch(`/savings/${savingId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message");
  });

  it("must update an saving with an invalid id and return 404", async () => {
    const response = await request(app)
      .patch(`/savings/99999`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: "700",
        category: "personal savings",
        description: "patch id error test savings",
      });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message");
  });
});

describe("DELETE /savings/:id", () => {
  it("must delete an saving and return 200", async () => {
    const idResponse = await request(app)
      .post("/savings")
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: "900",
        category: "electronics",
        description: "delete test saving",
      });

    savingId = idResponse.body.newSavingId;

    const response = await request(app)
      .delete(`/savings/${savingId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message");
  });

  it("must delete an saving without token and return 401", async () => {
    const idResponse = await request(app)
      .post("/savings")
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: "1050",
        category: "food",
        description: "delete error test saving",
      });

    savingId = idResponse.body.newSavingId;

    const response = await request(app).delete(`/savings/${savingId}`);

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message");
  });

  it("must delete an saving with an invalid id and return 404", async () => {
    const response = await request(app)
      .delete(`/savings/99999`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message");
  });
});
