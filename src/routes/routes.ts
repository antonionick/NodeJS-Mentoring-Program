import type { Express } from 'express';
import { getUserRoutes } from '@routes/user.routes';
import { commonErrorHandler } from '@common/errors/common-error-handler';
import { validatorErrorHandler } from '@common/errors/validator-error-handler';

// TODO: Check how to name by REST
enum Routes {
    User = 'user',
}

export function initRoutes(app: Express): void {
    app.use(`/${Routes.User}`, getUserRoutes());

    app.use(
        validatorErrorHandler,
        commonErrorHandler,
    );
}
