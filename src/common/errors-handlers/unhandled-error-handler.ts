import type { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export function unhandledErrorHandler(
    error: Error,
    request: Request,
    response: Response,
    next: NextFunction,
): void {
    response
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({
            message: 'Internal server error',
            details: error.message,
        });
}
