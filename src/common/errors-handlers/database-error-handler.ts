import type { ErrorHandlerData } from '@common/models/error-handler-data.models';
import { DatabaseError } from '@database/models/database-error';
import { AppLogger } from '@logger/app-logger';
import type { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export function databaseErrorHandler(
    errorHandlerData: ErrorHandlerData,
    request: Request,
    response: Response,
    next: NextFunction,
): void {
    if (errorHandlerData.error instanceof DatabaseError) {
        const { error, logInfo } = errorHandlerData;

        response
            .status(StatusCodes.BAD_REQUEST)
            .json(error.errorItems);

        AppLogger.error({
            error: error.errorItems,
            logInfo: logInfo?.getInfoToLog!(),
        });
        return;
    }

    next(errorHandlerData);
}
