import { ServiceError } from '@common/models/service.error';
import type { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export function serviceErrorHandler(
    error: unknown,
    request: Request,
    response: Response,
    next: NextFunction,
): void {
    if (error instanceof ServiceError) {
        response
            .status(StatusCodes.BAD_REQUEST)
            .json(error.message);
    }

    next(error);
}
