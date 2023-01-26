import { DatabaseError } from '@database/models/database-error';
import type { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export function databaseErrorHandler(
    error: DatabaseError,
    request: Request,
    response: Response,
    next: NextFunction,
): void {
    if (error instanceof DatabaseError) {
        const { errorItems } = error;
        response
            .status(StatusCodes.BAD_REQUEST)
            .json(errorItems);
    }

    next(error);
}
