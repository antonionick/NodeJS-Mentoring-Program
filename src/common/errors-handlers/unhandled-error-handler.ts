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

    const message = 'Internal server error';
    response
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message });

    const objectToLog = {
        message,
        details: (error as Error).message,
        stack: (error as Error).stack,
    };

    AppLogger.error({
        error: objectToLog,
        logInfo: logInfo?.getInfoToLog!(),
    });
}
