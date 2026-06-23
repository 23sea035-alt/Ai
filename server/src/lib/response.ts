import { Response } from "express";

export function sendSuccess<T>(res: Response, data: T, status = 200): void {
  res.status(status).json({ success: true, data });
}

export function sendError(res: Response, error: string, status = 400, code?: string): void {
  res.status(status).json({ success: false, error, code });
}

export function sendPaginated<T>(
  res: Response,
  items: T[],
  page: number,
  limit: number,
): void {
  res.json({
    success: true,
    data: items,
    pagination: { page, limit },
  });
}
