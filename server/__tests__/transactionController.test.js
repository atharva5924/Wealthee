import request from "supertest";
import app from "../server.js";

describe("Transaction Controller", () => {
  let token = "";

  beforeAll(async () => {
    const loginRes = await request(app).post("/api/auth/login").send({
      email: "2004freelancer@gmail.com",
      password: "Atha@7138",
    });
    token = loginRes.body.data.token;
  });

  test("GET /api/transaction-logs returns logs for authenticated user", async () => {
    const res = await request(app)
      .get("/api/transaction-logs")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.logs)).toBe(true);
  });

  test("GET /api/transaction-logs with filters works", async () => {
    const res = await request(app)
      .get("/api/transaction-logs")
      .query({ status_code: 200 })
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
