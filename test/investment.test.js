const request = require("supertest");
const app = require("../app");
const pool = require("../src/config/db");

let token;
let investmentId;

beforeAll(async () => {
  await pool.query("DELETE FROM expenses");
  await pool.query("DELETE FROM savings");
  await pool.query("DELETE FROM investments");
  await pool.query("DELETE FROM users");

  await request(app)
    .post("/auth/signup")
    .send({ email: "investments@test.com", password: "123456" });
  const loginRes = await request(app)
    .post("/auth/login")
    .send({ email: "investments@test.com", password: "123456" });
  token = loginRes.body.tokenUser;
});

afterAll(async () => {
  await pool.end();
});

describe("POST /investments", () => {
  it("must create a new investment and return 201", async () => {
    const response = await request(app)
      .post("/investments")
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: "5000",
        category: "Stock",
        returnRate: "8.5",
        startDate: "2026-01-10",
        endDate: "2026-12-10",
        description: "test investment",
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("newInvestmentId");
  });
  it("must create a new investment without endDate and return 201", async () => {
    const response = await request(app)
      .post("/investments")
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: "3000",
        category: "Term Deposit",
        returnRate: "5.2",
        startDate: "2026-03-01",
        description: "test investment no end date",
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("newInvestmentId");
  });

  it("must create a new investment with an invalid category and return 400", async () => {
    const response = await request(app)
      .post("/investments")
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: "1000",
        category: "invalidCategory",
        returnRate: "4",
        startDate: "2026-01-01",
      });

    expect(response.status).toBe(400);
  });

  it("must create a new investment without token and return 401", async () => {
    const response = await request(app).post("/investments").send({
      amount: "1000",
      category: "Stock",
      returnRate: "4",
      startDate: "2026-01-01",
    });

    expect(response.status).toBe(401);
  });
});

describe("GET /investments", () => {
  it("must list all investments and return 200", async () => {
    const response = await request(app)
      .get("/investments")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("userInvestmentByUser");
  });
});

describe("GET /investments/category", () => {
  it("must list all investments by category and return 200", async () => {
    const response = await request(app)
      .get("/investments/category?category=Stock")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("userInvestmentByCategory");
  });

  it("must reject an invalid category and return 400", async () => {
    const response = await request(app)
      .get("/investments/category?category=NotACategory")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
  });
});

describe("GET /investments/date", () => {
  it("must list investments using a filter shortcut and return 200", async () => {
    const response = await request(app)
      .get("/investments/date?filter=month")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("userInvestmentByDate");
  });

  it("must list investments using a custom date range and return 200", async () => {
    const response = await request(app)
      .get("/investments/date?startDate=2026-01-01&endDate=2026-12-31")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("userInvestmentByDate");
  });

  it("must reject an invalid filter and return 400", async () => {
    const response = await request(app)
      .get("/investments/date?filter=invalidFilter")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
  });

  it("must reject a request without filter or date range and return 400", async () => {
    const response = await request(app)
      .get("/investments/date")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
  });
});

describe("PATCH /investments/:id", () => {
  it("must update an investment and return 200", async () => {
    const createRes = await request(app)
      .post("/investments")
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: "2000",
        category: "Bond",
        returnRate: "3.5",
        startDate: "2026-02-01",
        endDate: "2026-11-01",
        description: "patch test investment",
      });

    investmentId = createRes.body.newInvestmentId;

    const response = await request(app)
      .patch(`/investments/${investmentId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ returnRate: "6" });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message");
  });

  it("must reject an update with empty body and return 400", async () => {
    const createRes = await request(app)
      .post("/investments")
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: "1500",
        category: "ETF",
        returnRate: "4.1",
        startDate: "2026-04-01",
        endDate: "2026-10-01",
        description: "patch error test investment",
      });

    investmentId = createRes.body.newInvestmentId;

    const response = await request(app)
      .patch(`/investments/${investmentId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message");
  });

  it("must reject an update with an invalid id and return 404", async () => {
    const response = await request(app)
      .patch(`/investments/99999`)
      .set("Authorization", `Bearer ${token}`)
      .send({ returnRate: "5" });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message");
  });
});

describe("DELETE /investments/:id", () => {
  it("must delete an investment and return 200", async () => {
    const createRes = await request(app)
      .post("/investments")
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: "900",
        category: "Mutual Funds",
        returnRate: "2.8",
        startDate: "2026-05-01",
        endDate: "2026-09-01",
        description: "delete test investment",
      });

    investmentId = createRes.body.newInvestmentId;

    const response = await request(app)
      .delete(`/investments/${investmentId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message");
  });

  it("must reject a delete without token and return 401", async () => {
    const createRes = await request(app)
      .post("/investments")
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: "1100",
        category: "Real State",
        returnRate: "3.9",
        startDate: "2026-06-01",
        endDate: "2026-08-01",
        description: "delete error test investment",
      });

    investmentId = createRes.body.newInvestmentId;

    const response = await request(app).delete(`/investments/${investmentId}`);

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message");
  });

  it("must reject a delete with an invalid id and return 404", async () => {
    const response = await request(app)
      .delete(`/investments/99999`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message");
  });
});
