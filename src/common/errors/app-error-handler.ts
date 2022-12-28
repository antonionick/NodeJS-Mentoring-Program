import type { NextFunction, Request, Response } from 'express';

export function appErrorHandler(
    error: Error,
    request: Request,
    response: Response,
    next: NextFunction,
): void {
    response
        .status(400)
        .send(error.message);
}
