import { ValidationResult } from '@common/validation/validation-result';
import type { NextFunction, Request, Response } from 'express';

export function validatorErrorHandler(
    error: unknown,
    request: Request,
    response: Response,
    next: NextFunction,
): void {
    if (error instanceof ValidationResult) {
        const { errors } = error as ValidationResult;
        response
            .status(400)
            .json(errors);
    }

    next(error);
}
