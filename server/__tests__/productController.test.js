import request from "supertest";
import app from "../server.js";

describe("Product Controller", () => {
  let token = "";
  let createdProductId = "";

  beforeAll(async () => {
    // Login as admin or test user with admin role
    const loginRes = await request(app).post("/api/auth/login").send({
      email: "2004freelancer@gmail.com",
      password: "Atha@7138",
    });
    token = loginRes.body.data.token;
  });

  test("GET /api/products returns products list", async () => {
    const res = await request(app)
      .get("/api/products")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.products)).toBe(true);
  });

  test("POST /api/products creates a new product", async () => {
    const res = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Test Bond",
        investment_type: "bond",
        tenure_months: 12,
        annual_yield: 5.5,
        risk_level: "low",
        min_investment: 1000,
        max_investment: 10000,
        description: "A safe test bond product.",
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.product.name).toBe("Test Bond");
    createdProductId = res.body.data.product.id;
  });

  test("GET /api/products/:id returns a single product", async () => {
    const res = await request(app)
      .get(`/api/products/${createdProductId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.product.id).toBe(createdProductId);
  });
});
