import { transactionLogger } from "../middleware/transactionLogger.js";
import httpMocks from "node-mocks-http";
import { jest } from "@jest/globals";

describe("Transaction Logger Middleware", () => {
  test("logs transaction without error", async () => {
    const req = httpMocks.createRequest({
      method: "GET",
      url: "/api/test",
      user: { userId: 1, email: "user@example.com" },
    });
    const res = httpMocks.createResponse();
    res.json = jest.fn().mockImplementation((body) => {
      res.send(body);
    });
    const next = jest.fn();

    await transactionLogger(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
