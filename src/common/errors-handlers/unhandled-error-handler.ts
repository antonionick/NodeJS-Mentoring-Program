import type { ErrorHandlerData } from '@common/models/error-handler-data.models';
import { AppLogger } from '@logger/app-logger';
import type { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export function unhandledErrorHandler(
    errorHandlerData: ErrorHandlerData,
    request: Request,
    response: Response,
    next: NextFunction,
): void {
    const { error, logInfo } = errorHandlerData;
    const responseError = {
        message: 'Internal server error',
        details: (error as Error).message,
    };

    response
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(responseError);

    AppLogger.error({
        error: responseError,
        logInfo: logInfo?.getInfoToLog!(),
    });
}
