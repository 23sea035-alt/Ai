import { describe, it, expect, vi } from "vitest";
import { sendSuccess, sendError, sendPaginated } from "../lib/response.js";

function mockRes() {
  let _status = 200;
  let _json: any = null;
  const jsonFn = (j: any) => { _json = j; };
  return {
    status: vi.fn((c: number) => { _status = c; return { json: jsonFn }; }),
    json: jsonFn,
    get statusCode() { return _status; },
    get jsonBody() { return _json; },
  };
}

describe("sendSuccess", () => {
  it("sends 200 with success=true and data", () => {
    const res = mockRes();
    sendSuccess(res as any, { id: 1, name: "test" });
    expect(res.statusCode).toBe(200);
    expect(res.jsonBody).toEqual({ success: true, data: { id: 1, name: "test" } });
  });

  it("sends custom status code", () => {
    const res = mockRes();
    sendSuccess(res as any, null, 201);
    expect(res.statusCode).toBe(201);
    expect(res.jsonBody).toEqual({ success: true, data: null });
  });

  it("sends array data", () => {
    const res = mockRes();
    sendSuccess(res as any, [1, 2, 3]);
    expect(res.jsonBody).toEqual({ success: true, data: [1, 2, 3] });
  });
});

describe("sendError", () => {
  it("sends 400 with error message", () => {
    const res = mockRes();
    sendError(res as any, "Something went wrong");
    expect(res.statusCode).toBe(400);
    expect(res.jsonBody).toEqual({ success: false, error: "Something went wrong" });
  });

  it("sends custom status code", () => {
    const res = mockRes();
    sendError(res as any, "Not found", 404);
    expect(res.statusCode).toBe(404);
  });

  it("includes code when provided", () => {
    const res = mockRes();
    sendError(res as any, "Rate limited", 429, "RATE_LIMITED");
    expect(res.jsonBody).toEqual({ success: false, error: "Rate limited", code: "RATE_LIMITED" });
  });
});

describe("sendPaginated", () => {
  it("sends paginated response", () => {
    const res = mockRes();
    sendPaginated(res as any, ["a", "b"], 1, 10);
    expect(res.statusCode).toBe(200);
    expect(res.jsonBody).toEqual({
      success: true,
      data: ["a", "b"],
      pagination: { page: 1, limit: 10 },
    });
  });
});
