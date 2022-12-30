import type { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export function commonErrorHandler(
    error: Error,
    request: Request,
    response: Response,
    next: NextFunction,
): void {
    response
        .status(StatusCodes.BAD_REQUEST)
        .send(error.message);
}
