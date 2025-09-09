import request from "supertest";
import app from "../server.js";

describe("Investment Controller", () => {
  let token = "";
  let productId = "";
  let investmentId = "";

  beforeAll(async () => {
    const loginRes = await request(app).post("/api/auth/login").send({
      email: "2004freelancer@gmail.com",
      password: "Atha@7138",
    });
    token = loginRes.body.data.token;

    const productRes = await request(app)
      .get("/api/products")
      .set("Authorization", `Bearer ${token}`);
    productId = productRes.body.data.products[0]?.id;
  });

  test("GET /api/investments returns user investments", async () => {
    const res = await request(app)
      .get("/api/investments")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.investments)).toBe(true);
  });
});
