import type { Express } from 'express';
import { getUserRoutes } from '@routes/user.routes';
import { commonErrorHandler } from '@common/errors-handlers/common-error-handler';
import { validatorErrorHandler } from '@common/errors-handlers/validator-error-handler';
import type { IDatabaseProvider } from '@database/models/database-provider.models';
import type { IValidatorProvider } from '@validators/models/validators-provider.models';
import { databaseErrorHandler } from '@common/errors-handlers/database-error-handler';
import { getGroupRoutes } from '@routes/group.routes';

enum Routes {
    Users = 'users',
    Groups = 'groups'
}

export function initRoutes(
    app: Express,
    databaseProvider: IDatabaseProvider,
    validatorProvider: IValidatorProvider,
): void {
    app.use(`/${Routes.Users}`, getUserRoutes(databaseProvider, validatorProvider));
    app.use(`/${Routes.Groups}`, getGroupRoutes(databaseProvider, validatorProvider));

    app.use(
        validatorErrorHandler,
        databaseErrorHandler,
        commonErrorHandler,
    );
}
