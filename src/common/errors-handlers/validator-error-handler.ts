import { ValidationResult } from '@validators/models/validation-result';
import type { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes/build/cjs/status-codes';

export function validatorErrorHandler(
    error: unknown,
    request: Request,
    response: Response,
    next: NextFunction,
): void {
    if (error instanceof ValidationResult) {
        const { errors } = error as ValidationResult;
        response
            .status(StatusCodes.UNPROCESSABLE_ENTITY)
            .json(errors);
    }

    next(error);
}
