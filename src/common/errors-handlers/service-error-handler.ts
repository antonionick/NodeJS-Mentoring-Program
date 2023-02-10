import type { ErrorHandlerData } from '@common/models/error-handler-data.models';
import { ServiceError } from '@common/models/service.error';
import { AppLogger } from '@logger/app-logger';
import type { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export function serviceErrorHandler(
    errorHandlerData: ErrorHandlerData,
    request: Request,
    response: Response,
    next: NextFunction,
): void {
    if (errorHandlerData.error instanceof ServiceError) {
        const { error, logInfo } = errorHandlerData;

        response
            .status(StatusCodes.BAD_REQUEST)
            .json(error.message);

        AppLogger.error({
            error: error.message,
            logInfo: logInfo?.getInfoToLog!(),
        });
    }

    next(errorHandlerData);
}
