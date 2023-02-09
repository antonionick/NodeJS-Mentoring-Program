import type { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

// TODO: Add service error handler with StatusCodes.BAD_REQUEST and rename this file to unhandled errors with 500 status
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
