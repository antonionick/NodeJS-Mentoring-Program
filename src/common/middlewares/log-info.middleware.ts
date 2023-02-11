import type { NextFunction, Request, Response } from 'express';
import { AppLogger } from '@logger/app-logger';

export function logInfoMiddleware(
    request: Request,
    response: Response,
    next: NextFunction,
): void {
    const logInfo = response.locals.logInfo;
    const infoToLog = logInfo!.getInfoToLog!();
    AppLogger.info(infoToLog);

    next();
}
