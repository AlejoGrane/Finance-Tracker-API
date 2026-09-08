const request = require("supertest");
const app = require("../app");
const pool = require("../src/config/db");

let token;
let expenseId;

beforeAll(async () => {
  await pool.query("DELETE FROM expenses");
  await pool.query("DELETE FROM users");

  await request(app)
    .post("/auth/signup")
    .send({ email: "expenses@test.com", password: "123456" });
  const loginRes = await request(app)
    .post("/auth/login")
    .send({ email: "expenses@test.com", password: "123456" });
  token = loginRes.body.tokenUser;
});

afterAll(async () => {
  await pool.end();
});

describe("POST /expenses", () => {
  it("must create a new expense and return 201", async () => {
    const response = await request(app)
      .post("/expenses")
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: "100",
        category: "Others",
        description: "test expense",
        date: "2026-05-10",
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("newExpenseId");
  });

  it("must create a new expense with an invalid category and return 400", async () => {
    const response = await request(app)
      .post("/expenses")
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: "100",
        category: "invalidCategory",
        description: "test expense",
        date: "2026-05-10",
      });

    expect(response.status).toBe(400);
  });

  it("must create a new expense without authorization and return 401", async () => {
    const response = await request(app).post("/expenses").send({
      amount: "100",
      category: "Others",
      description: "test expense",
      date: "2026-05-10",
    });

    expect(response.status).toBe(401);
  });
});

describe("GET /expenses", () => {
  it("must list all expenses and return 200", async () => {
    await request(app)
      .post("/expenses")
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: "500",
        category: "Others",
        description: "test expense",
        date: "2022-11-05",
      });

    const response = await request(app)
      .get("/expenses")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("userExpensesByUser");
  });
});

describe("GET /expenses/category", () => {
  it("must list all expenses by category and return 200", async () => {
    await request(app)
      .post("/expenses")
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: "1200",
        category: "Health",
        description: "category test expense",
        date: "2020-12-11",
      });

    const response = await request(app)
      .get("/expenses/category?category=Health")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("userExpensesByCategory");
  });

  it("must reject an invalid category and return 400", async () => {
    const response = await request(app)
      .get("/expenses/category?category=NotACategory")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
  });
});

describe("GET /expenses/date", () => {
  it("must list all expenses by date and return 200", async () => {
    await request(app)
      .post("/expenses")
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: "5000",
        category: "Clothing",
        description: "date test expense",
        date: "2022-05-07",
      });

    const response = await request(app)
      .get("/expenses/date?date=2022-05-07")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("userExpensesByDate");
  });

  it("must reject an invalid date and return 400", async () => {
    const response = await request(app)
      .get("/expenses/date?date=07/05/2022")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
  });
});

describe("PATCH /expenses/:id", () => {
  it("must update an expense and return 200", async () => {
    const idResponse = await request(app)
      .post("/expenses")
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: "1700",
        category: "Groceries",
        description: "patch test expense",
        date: "2018-07-09",
      });

    expenseId = idResponse.body.newExpenseId;

    const response = await request(app)
      .patch(`/expenses/${expenseId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: "2000",
        category: "Others",
        description: "patch test expense",
        date: "2026-11-10",
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message");
  });

  it("must update an expense without body and return 400", async () => {
    const idResponse = await request(app)
      .post("/expenses")
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: "200",
        category: "Health",
        description: "patch error test expense",
        date: "2022-11-11",
      });

    expenseId = idResponse.body.newExpenseId;

    const response = await request(app)
      .patch(`/expenses/${expenseId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message");
  });

  it("must update an expense with an invalid id and return 404", async () => {
    const response = await request(app)
      .patch(`/expenses/99999`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: "500",
        category: "Electronics",
        description: "patch id error test expense",
        date: "2011-07-22",
      });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message");
  });
});

describe("DELETE /expenses/:id", () => {
  it("must delete an expense and return 200", async () => {
    const idResponse = await request(app)
      .post("/expenses")
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: "800",
        category: "Electronics",
        description: "delete test expense",
        date: "2014-12-24",
      });

    expenseId = idResponse.body.newExpenseId;

    const response = await request(app)
      .delete(`/expenses/${expenseId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message");
  });

  it("must delete an expense without token and return 401", async () => {
    const idResponse = await request(app)
      .post("/expenses")
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: "750",
        category: "Leisure",
        description: "delete error test expense",
        date: "2017-11-11",
      });

    expenseId = idResponse.body.newExpenseId;

    const response = await request(app).delete(`/expenses/${expenseId}`);

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message");
  });

  it("must delete an expense with an invalid id and return 404", async () => {
    const response = await request(app)
      .delete(`/expenses/99999`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message");
  });
});
