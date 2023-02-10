import type { ErrorHandlerData } from '@common/models/error-handler-data.models';
import { AppLogger } from '@logger/app-logger';
import { ValidationResult } from '@validators/models/validation-result';
import type { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes/build/cjs/status-codes';

export function validatorErrorHandler(
    errorHandlerData: ErrorHandlerData,
    request: Request,
    response: Response,
    next: NextFunction,
): void {
    if (errorHandlerData.error instanceof ValidationResult) {
        const { error, logInfo } = errorHandlerData;

        response
            .status(StatusCodes.UNPROCESSABLE_ENTITY)
            .json(error.errors);

        AppLogger.error({
            error: error.errors,
            logInfo: logInfo?.getInfoToLog!(),
        });
    }

    next(errorHandlerData);
}
