import type { Express } from 'express';
import { getUserRoutes } from '@routes/user.routes';
import { validatorErrorHandler } from '@common/errors-handlers/validator-error-handler';
import type { IDatabaseProvider } from '@database/models/database-provider.models';
import type { IValidatorProvider } from '@validators/models/validators-provider.models';
import { databaseErrorHandler } from '@common/errors-handlers/database-error-handler';
import { getGroupRoutes } from '@routes/group.routes';
import { serviceErrorHandler } from '@common/errors-handlers/service-error-handler';
import { unhandledErrorHandler } from '@common/errors-handlers/unhandled-error-handler';
import type { PassportAuthenticator } from '@authenticator/passport.authenticator';

enum Routes {
    Users = 'users',
    Groups = 'groups'
}

export function initRoutes(
    app: Express,
    databaseProvider: IDatabaseProvider,
    validatorProvider: IValidatorProvider,
    authenticator: PassportAuthenticator,
): void {
    app.use(
        `/${Routes.Users}`,
        getUserRoutes(databaseProvider, validatorProvider, authenticator),
    );
    app.use(`/${Routes.Groups}`, getGroupRoutes(databaseProvider, validatorProvider));

    app.use(
        validatorErrorHandler,
        databaseErrorHandler,
        serviceErrorHandler,
        unhandledErrorHandler,
    );
}
