import request from "supertest";
import app from "../server.js";

describe("Auth Controller", () => {
  let testEmail = `testuser${Date.now()}@example.com`;
  const testPassword = "TestPass123!";

  test("GET /health returns 200", async () => {
    const res = await request(app).get("/health");
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBeDefined();
  });

  test("POST /api/auth/register creates a new user", async () => {
    const res = await request(app).post("/api/auth/register").send({
      first_name: "Test",
      last_name: "User",
      email: testEmail,
      password: testPassword,
      risk_appetite: "moderate",
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testEmail);
    expect(res.body.data.token).toBeDefined();
  }, 10000);

  test("POST /api/auth/login authenticates a user", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: testEmail,
      password: testPassword,
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
  });

  test("POST /api/auth/login rejects wrong password", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: testEmail,
      password: "wrongpassword",
    });
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test("GET /api/auth/profile returns user data with auth token", async () => {
    const loginRes = await request(app).post("/api/auth/login").send({
      email: testEmail,
      password: testPassword,
    });
    const token = loginRes.body.data.token;

    const profileRes = await request(app)
      .get("/api/auth/profile")
      .set("Authorization", `Bearer ${token}`);
    expect(profileRes.statusCode).toBe(200);
    expect(profileRes.body.data.user.email).toBe(testEmail);
  });
});
