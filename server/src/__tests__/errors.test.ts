import { describe, it, expect, vi } from "vitest";
import { AppError, errorHandler } from "../middleware/error-handler.js";

describe("AppError", () => {
  it("extends Error with statusCode default 400", () => {
    const err = new AppError("test error");
    expect(err).toBeInstanceOf(Error);
    expect(err.message).toBe("test error");
    expect(err.statusCode).toBe(400);
    expect(err.code).toBeUndefined();
  });

  it("accepts custom statusCode", () => {
    const err = new AppError("not found", 404);
    expect(err.statusCode).toBe(404);
  });

  it("accepts custom code", () => {
    const err = new AppError("validation error", 422, "VALIDATION_ERROR");
    expect(err.code).toBe("VALIDATION_ERROR");
  });

  it("has name AppError", () => {
    const err = new AppError("test");
    expect(err.name).toBe("AppError");
  });
});

describe("errorHandler", () => {
  function mockRes() {
    let _status = 200;
    let _json: any = null;
    return {
      status: vi.fn((c: number) => { _status = c; return { json: (j: any) => { _json = j; } }; }),
      get statusCode() { return _status; },
      get jsonBody() { return _json; },
    };
  }

  it("sends AppError with correct status and message", () => {
    const res = mockRes();
    const err = new AppError("Validation failed", 422, "VALIDATION_ERROR");
    errorHandler(err, {} as any, res as any, vi.fn());
    expect(res.statusCode).toBe(422);
    expect(res.jsonBody).toEqual({ success: false, error: "Validation failed", code: "VALIDATION_ERROR" });
  });

  it("sends 500 for non-AppError errors", () => {
    const res = mockRes();
    const err = new Error("Unexpected crash");
    errorHandler(err, {} as any, res as any, vi.fn());
    expect(res.statusCode).toBe(500);
    expect(res.jsonBody).toEqual({ success: false, error: "Internal server error" });
  });
});
