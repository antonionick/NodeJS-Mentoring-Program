import type { Express } from 'express';
import { getUserRoutes } from '@routes/user.routes';
import { commonErrorHandler } from '@common/errors/common-error-handler';
import { validatorErrorHandler } from '@common/errors/validator-error-handler';

enum Routes {
    Users = 'users',
}

export function initRoutes(app: Express): void {
    app.use(`/${Routes.Users}`, getUserRoutes());

    app.use(
        validatorErrorHandler,
        commonErrorHandler,
    );
}
