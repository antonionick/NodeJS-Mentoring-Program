import { AuthenticatorError } from '@authenticator/models/authenticator-error';
import type { ErrorHandlerData } from '@common/models/error-handler-data.models';
import { AppLogger } from '@logger/app-logger';
import type { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export function authenticatorErrorHandler(
    errorHandlerData: ErrorHandlerData,
    request: Request,
    response: Response,
    next: NextFunction,
): void {
    if (errorHandlerData.error instanceof AuthenticatorError) {
        const { error } = errorHandlerData;

        response
            .status(StatusCodes.FORBIDDEN)
            .json(error);

        AppLogger.error({ error });
        return;
    }

    next(errorHandlerData);
}
