import type { Express } from 'express';
import { getUserRoutes } from '@routes/user.routes';
import { commonErrorHandler } from '@common/errors/common-error-handler';
import { validatorErrorHandler } from '@common/errors/validator-error-handler';
import type { IDatabaseProvider } from '@database/models/database-provider.models';
import type { IValidatorProvider } from '@validators/models/validators-provider.models';

enum Routes {
    Users = 'users',
}

export function initRoutes(
    server: Express,
    databaseProvider: IDatabaseProvider,
    validatorProvider: IValidatorProvider,
): void {
    server.use(`/${Routes.Users}`, getUserRoutes(databaseProvider, validatorProvider));

    server.use(
        validatorErrorHandler,
        commonErrorHandler,
    );
}
